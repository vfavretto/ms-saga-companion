import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import net from 'net';

// ============================================================================
//  PINE client (PCSX2 IPC)
//  Request : [u32 total_size LE][u8 opcode][args...]  (multiple commands may be batched)
//  Reply   : [u32 total_size LE][u8 result 0=OK / 0xFF=FAIL][data...]
// ============================================================================
const OP = {
  READ8: 0x00,
  READ16: 0x01,
  READ32: 0x02,
  READ64: 0x03,
  VERSION: 0x08,
  TITLE: 0x0b,
  ID: 0x0c,
  STATUS: 0x0f,
};
const PINE_PORTS = [28011, 28012];
const MAX_BATCH_READ64 = 40000; // keeps reply < PCSX2's 450KB return buffer

class PineClient {
  private sock: net.Socket | null = null;
  private buf = Buffer.alloc(0);
  private waiters: { resolve: (b: Buffer) => void; reject: (e: Error) => void; timer: NodeJS.Timeout }[] = [];
  public endpoint = '';

  get connected() {
    return !!this.sock && !this.sock.destroyed;
  }

  connect(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const s = net.connect({ host: '127.0.0.1', port });
      const onErr = (e: Error) => {
        s.destroy();
        reject(e);
      };
      s.once('error', onErr);
      s.once('connect', () => {
        s.off('error', onErr);
        this.sock = s;
        this.endpoint = `TCP 127.0.0.1:${port}`;
        this.buf = Buffer.alloc(0);
        s.setNoDelay(true);
        s.on('data', (d) => this.onData(d));
        s.on('error', () => this.close());
        s.on('close', () => this.close());
        resolve();
      });
    });
  }

  close() {
    if (this.sock) {
      try {
        this.sock.destroy();
      } catch {}
    }
    this.sock = null;
    this.buf = Buffer.alloc(0);
    const pending = this.waiters.splice(0);
    pending.forEach((w) => {
      clearTimeout(w.timer);
      w.reject(new Error('PINE desconectado'));
    });
  }

  private onData(d: Buffer) {
    this.buf = Buffer.concat([this.buf, d]);
    while (this.buf.length >= 4) {
      const size = this.buf.readUInt32LE(0);
      if (size < 5 || this.buf.length < size) break;
      const pkt = this.buf.subarray(4, size);
      this.buf = this.buf.subarray(size);
      const w = this.waiters.shift();
      if (w) {
        clearTimeout(w.timer);
        w.resolve(Buffer.from(pkt));
      }
    }
  }

  /** Sends one (possibly batched) message; resolves with data after the result byte. */
  transact(body: Buffer, timeoutMs = 3000): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      if (!this.sock || this.sock.destroyed) return reject(new Error('PINE não conectado'));
      const header = Buffer.alloc(4);
      header.writeUInt32LE(body.length + 4, 0);
      const timer = setTimeout(() => {
        reject(new Error('Timeout aguardando resposta do PCSX2'));
        this.close();
      }, timeoutMs);
      this.waiters.push({
        resolve: (pkt) => {
          if (pkt[0] !== 0) reject(new Error(`PCSX2 retornou falha (0x${pkt[0].toString(16)})`));
          else resolve(pkt.subarray(1));
        },
        reject,
        timer,
      });
      this.sock.write(Buffer.concat([header, body]));
    });
  }

  async readString(op: number): Promise<string> {
    const data = await this.transact(Buffer.from([op]));
    const len = data.readUInt32LE(0);
    return data.subarray(4, 4 + len).toString('utf8').replace(/\0+$/, '');
  }

  async status(): Promise<number> {
    const data = await this.transact(Buffer.from([OP.STATUS]));
    return data.readUInt32LE(0);
  }

  /** Batch of scalar reads in one round-trip. */
  async readMany(reqs: { addr: number; size: 1 | 2 | 4 }[]): Promise<number[]> {
    const body = Buffer.alloc(reqs.length * 5);
    reqs.forEach((r, i) => {
      body.writeUInt8(r.size === 1 ? OP.READ8 : r.size === 2 ? OP.READ16 : OP.READ32, i * 5);
      body.writeUInt32LE(r.addr >>> 0, i * 5 + 1);
    });
    const data = await this.transact(body);
    const out: number[] = [];
    let off = 0;
    for (const r of reqs) {
      out.push(r.size === 1 ? data.readUInt8(off) : r.size === 2 ? data.readUInt16LE(off) : data.readUInt32LE(off));
      off += r.size;
    }
    return out;
  }

  /** Reads an arbitrary memory range (aligned to 8) using batched READ64. */
  async readRange(start: number, length: number): Promise<Buffer> {
    const aligned = start & ~7;
    const end = start + length;
    const chunks: Buffer[] = [];
    let addr = aligned;
    while (addr < end) {
      const n = Math.min(MAX_BATCH_READ64, Math.ceil((end - addr) / 8));
      const body = Buffer.alloc(n * 5);
      for (let i = 0; i < n; i++) {
        body.writeUInt8(OP.READ64, i * 5);
        body.writeUInt32LE((addr + i * 8) >>> 0, i * 5 + 1);
      }
      chunks.push(await this.transact(body, 10000));
      addr += n * 8;
    }
    const all = Buffer.concat(chunks);
    return all.subarray(start - aligned, start - aligned + length);
  }
}

const pine = new PineClient();

// ============================================================================
//  Memory map (editable from the UI, persisted in userData/memory-map.json)
// ============================================================================
interface MemoryMap {
  gold: number;
  goldSize: 1 | 2 | 4;
  gameMode: number;
  mapId: number;
  playTime: number; // u8 hours, u8 minutes, u8 seconds
  partyBase: number; // first byte of party slot 1 block
  partyStride: number;
  partyEnOffset: number;
  partyTpOffset: number;
  partyHpOffset: number;
}

const DEFAULT_MAP: MemoryMap = {
  gold: 0x01fdd000,
  goldSize: 4,
  gameMode: 0x01fff5ae,
  mapId: 0x01fff5b0,
  playTime: 0x01fff460,
  // From community CodeBreaker codes: Char1 EN 01FDDB91 (u8), TP 11FDDB92 (u16), HP 11FDDB94 (u16), stride 0x0C
  partyBase: 0x01fddb90,
  partyStride: 0x0c,
  partyEnOffset: 1,
  partyTpOffset: 2,
  partyHpOffset: 4,
};

let memMap: MemoryMap = { ...DEFAULT_MAP };
const mapFile = () => path.join(app.getPath('userData'), 'memory-map.json');

function loadMemMap() {
  try {
    memMap = { ...DEFAULT_MAP, ...JSON.parse(fs.readFileSync(mapFile(), 'utf8')) };
  } catch {
    memMap = { ...DEFAULT_MAP };
  }
}
function saveMemMap() {
  try {
    fs.writeFileSync(mapFile(), JSON.stringify(memMap, null, 2));
  } catch (e) {
    console.error('[MAP] Falha ao salvar', e);
  }
}

// ============================================================================
//  Game data tables
// ============================================================================
const TOWN_NAMES: Record<number, string> = {
  0: 'Angelia', 1: 'Port Marley', 2: 'Eisengrad', 3: 'El Dar Samnia', 4: 'Tohai',
  5: 'Sky Pirate Base', 6: 'Falldust', 7: 'Unicorn Headquarters', 8: 'Diggins Rock',
  9: 'Abandoned Village', 11: 'Mobile Coliseum', 12: "Marie's Place", 13: 'Crash Point',
};
const DUNGEON_NAMES: Record<number, string> = {
  0: 'Moon Ark', 1: 'Mining Base', 2: 'Wyvern Ravine', 3: 'Pirate Base', 4: 'Underground Tunnel',
  5: 'Dark Alliance Base', 6: 'Underground Tunnel', 7: 'Lost City', 8: 'Fort Verde', 9: 'Fort Arid',
  10: 'Fort Berg', 11: 'Fort Taiga', 12: 'Fortress Eisengrad', 13: 'Neo Zarth Secret Base',
  14: 'Moon Base', 15: 'Moon Base', 16: 'Moon Base', 17: 'G System 01', 18: 'Giant G System',
  19: 'Hory Forest', 20: 'Mt. Trial', 21: 'Lost City', 22: 'G System 02', 23: 'G System 03',
  24: 'G System 04', 25: 'G System 05', 26: 'Another G System',
};
const GAME_MODES: Record<number, string> = {
  0: 'Title Screen / Boot', 1: 'Staff Credits', 2: 'Field / Dungeon', 3: 'Town Map',
  4: 'World Map', 5: 'Combat', 6: 'Cutscene / FMV',
};

// ============================================================================
//  Live state
// ============================================================================
const emptySlot = (slot: number) => ({
  slot, pilotName: `Slot ${slot}`, activeMS: '—', currentHp: 0, maxHp: 0,
  currentEn: 0, maxEn: 0, currentTp: 0, maxTp: 0, status: 'Sem dados',
});

let lastGameState: any = {
  connected: false,
  emulatorRunning: false,
  pineEndpoint: '',
  pineError: '',
  gameMode: 0,
  gameModeName: 'Desconectado',
  mapId: 0,
  currentLocationName: 'Aguardando PCSX2...',
  gold: 0,
  playTime: { hours: 0, minutes: 0, seconds: 0 },
  party: [1, 2, 3, 4, 5, 6].map(emptySlot),
  rawParty: [] as string[],
};

let mainWindow: BrowserWindow | null = null;

function broadcastState() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('memory-update', { ...lastGameState });
  }
}

const DLL_NAMES: Record<number, string> = {
  0: 'Menu Principal',
  1: 'Créditos',
  2: 'Mapa-Múndi',
  3: 'Em Exploração (Dungeon)',
  4: 'Em Combate',
  5: 'Menu de Acampamento',
  6: 'Cidade / Local Seguro',
  7: 'Vídeo / FMV',
};

const PILOT_GUESS = ['Tristan', 'Fritz', 'Aeon', 'Tremmie', 'Gavane', 'Li Fang'];

// Previous tick values: used to infer max HP/TP
const maxSeen = { hp: [0, 0, 0, 0, 0, 0], tp: [0, 0, 0, 0, 0, 0] };

async function pollOnce() {
  const m = memMap;

  // Read Gold and PlayTime in batch
  const scalars = await pine.readMany([
    { addr: m.gold, size: m.goldSize },
    { addr: m.playTime, size: 1 },
    { addr: m.playTime + 1, size: 1 },
    { addr: m.playTime + 2, size: 1 },
    { addr: 0x003cab60, size: 4 }, // g_DllListHead (resident engine active module pointer)
  ]);
  const [gold, h, mi, se, dllHead] = scalars;

  // Inspect active gameplay module from engine's g_DllListHead
  let activeDllId = 0;
  if (dllHead && dllHead >= 0x00100000 && dllHead < 0x02000000) {
    try {
      const nodeBuf = await pine.readRange(dllHead, 16);
      if (nodeBuf.length >= 10) {
        activeDllId = nodeBuf.readUInt16LE(8);
        // If Camp Menu (sub_dll = 5) is open, inspect underlying map module if chained
        if (activeDllId === 5) {
          const nextNode = nodeBuf.readUInt32LE(0);
          if (nextNode && nextNode >= 0x00100000 && nextNode < 0x02000000) {
            const nextBuf = await pine.readRange(nextNode, 10);
            const parentId = nextBuf.readUInt16LE(8);
            if (parentId) {
              lastGameState.parentModule = DLL_NAMES[parentId] ?? `Módulo ${parentId}`;
            }
          }
        }
      }
    } catch {
      // Fallback gracefully
    }
  }

  const partyRaw = await pine.readRange(m.partyBase, m.partyStride * 6);

  lastGameState.gold = gold;
  lastGameState.gameMode = activeDllId;
  lastGameState.gameModeName = DLL_NAMES[activeDllId] ?? (activeDllId ? `Módulo ${activeDllId}` : 'Aguardando Jogo...');
  lastGameState.mapId = activeDllId;
  lastGameState.currentLocationName = DLL_NAMES[activeDllId] ?? 'Em Execução';
  lastGameState.playTime = { hours: h, minutes: mi, seconds: se };

  const raw: string[] = [];
  lastGameState.party = [0, 1, 2, 3, 4, 5].map((i) => {
    const blk = partyRaw.subarray(i * m.partyStride, (i + 1) * m.partyStride);
    raw.push([...blk].map((b) => b.toString(16).padStart(2, '0')).join(' '));
    const en = blk.readUInt8(m.partyEnOffset);
    const tp = blk.readUInt16LE(m.partyTpOffset);
    const hp = blk.readUInt16LE(m.partyHpOffset);
    const empty = hp === 0 && tp === 0 && en === 0;
    if (hp > maxSeen.hp[i] && hp < 10000) maxSeen.hp[i] = hp;
    if (tp > maxSeen.tp[i] && tp < 1000) maxSeen.tp[i] = tp;
    return {
      slot: i + 1,
      pilotName: empty ? `Slot ${i + 1}` : PILOT_GUESS[i],
      activeMS: '—',
      currentHp: hp,
      maxHp: maxSeen.hp[i],
      currentEn: en,
      maxEn: Math.max(en, 0),
      currentTp: tp,
      maxTp: maxSeen.tp[i],
      status: empty ? 'Vazio' : hp === 0 ? 'Abatido' : 'Ativo',
    };
  });
  lastGameState.rawParty = raw;
}

// Connection + polling loop (never overlaps)
let busy = false;
async function tick() {
  if (busy) return;
  busy = true;
  try {
    if (!pine.connected) {
      lastGameState.connected = false;
      for (const port of PINE_PORTS) {
        try {
          await pine.connect(port);
          // Handshake: only mark LIVE after PCSX2 actually answers a command
          const ver = await pine.readString(OP.VERSION);
          lastGameState.pineEndpoint = `${pine.endpoint} (${ver})`;
          lastGameState.pineError = '';
          console.log('[PINE] Conectado:', lastGameState.pineEndpoint);
          break;
        } catch (e: any) {
          pine.close();
          lastGameState.pineError = e?.message ?? String(e);
        }
      }
    }

    if (pine.connected) {
      const st = await pine.status(); // 0 running, 1 paused, 2 shutdown
      lastGameState.connected = true;
      lastGameState.emulatorRunning = st !== 2;
      if (st !== 2) await pollOnce();
      else lastGameState.currentLocationName = 'Nenhum jogo em execução';
    }
  } catch (e: any) {
    lastGameState.pineError = e?.message ?? String(e);
    pine.close();
    lastGameState.connected = false;
  } finally {
    busy = false;
    broadcastState();
  }
}

// ============================================================================
//  Memory scanner (for discovering/validating addresses from inside the app)
// ============================================================================
const EE_START = 0x00100000;
const EE_END = 0x02000000;
let scanCandidates: number[] = [];
let scanSize: 1 | 2 | 4 = 4;

function readVal(buf: Buffer, off: number, size: number) {
  return size === 1 ? buf.readUInt8(off) : size === 2 ? buf.readUInt16LE(off) : buf.readUInt32LE(off);
}

async function withPine<T>(fn: () => Promise<T>): Promise<T> {
  while (busy) await new Promise((r) => setTimeout(r, 20));
  busy = true;
  try {
    if (!pine.connected) throw new Error('PINE não conectado');
    return await fn();
  } finally {
    busy = false;
  }
}

ipcMain.handle('pine-first-scan', async (_e, value: number, size: 1 | 2 | 4) =>
  withPine(async () => {
    scanSize = size;
    scanCandidates = [];
    const CHUNK = 0x100000;
    for (let base = EE_START; base < EE_END; base += CHUNK) {
      const buf = await pine.readRange(base, CHUNK);
      for (let off = 0; off + size <= buf.length; off += size) {
        if (readVal(buf, off, size) === value) scanCandidates.push(base + off);
      }
    }
    return { count: scanCandidates.length, sample: scanCandidates.slice(0, 50) };
  })
);

ipcMain.handle('pine-next-scan', async (_e, value: number) =>
  withPine(async () => {
    const keep: number[] = [];
    for (let i = 0; i < scanCandidates.length; i += 20000) {
      const part = scanCandidates.slice(i, i + 20000);
      const vals = await pine.readMany(part.map((addr) => ({ addr, size: scanSize })));
      part.forEach((addr, k) => {
        if (vals[k] === value) keep.push(addr);
      });
    }
    scanCandidates = keep;
    return { count: keep.length, sample: keep.slice(0, 50) };
  })
);

ipcMain.handle('pine-read-hex', async (_e, addr: number, len: number) =>
  withPine(async () => {
    const buf = await pine.readRange(addr, Math.min(len, 4096));
    return [...buf].map((b) => b.toString(16).padStart(2, '0')).join(' ');
  })
);

ipcMain.handle('pine-diagnostics', async () =>
  withPine(async () => {
    const out: Record<string, string> = {};
    for (const [k, op] of [['version', OP.VERSION], ['title', OP.TITLE], ['gameId', OP.ID]] as const) {
      try {
        out[k] = await pine.readString(op);
      } catch (e: any) {
        out[k] = `erro: ${e.message}`;
      }
    }
    const st = await pine.status();
    out.status = ['Rodando', 'Pausado', 'Desligado'][st] ?? String(st);
    return out;
  })
);

ipcMain.handle('get-memory-map', () => ({ ...memMap }));
ipcMain.handle('set-memory-map', (_e, patch: Partial<MemoryMap>) => {
  memMap = { ...memMap, ...patch };
  saveMemMap();
  return { ...memMap };
});
ipcMain.handle('reset-memory-map', () => {
  memMap = { ...DEFAULT_MAP };
  saveMemMap();
  return { ...memMap };
});
ipcMain.handle('get-memory-state', async () => ({ ...lastGameState }));

// ============================================================================
//  Window
// ============================================================================
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 680,
    title: 'MS Saga Companion — Tactical Nav & Tracker',
    backgroundColor: '#080c18',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      mainWindow?.loadFile(path.join(__dirname, '../dist/index.html'));
    });
  }
}

app.whenReady().then(() => {
  loadMemMap();
  createWindow();
  setInterval(tick, 500);
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  pine.close();
  if (process.platform !== 'darwin') app.quit();
});
