import React, { useEffect, useState } from 'react';
import { LiveGameState } from '../types';
import {
  Radio,
  Cpu,
  Database,
  Clock,
  Coins,
  Search,
  Wrench,
  Activity,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Terminal,
  Zap,
} from 'lucide-react';
import { sound } from '../utils/sound';

interface TrackerViewProps {
  gameState: LiveGameState;
  setGameState: React.Dispatch<React.SetStateAction<LiveGameState>>;
}

const hex = (n: number) => '0x' + (n >>> 0).toString(16).toUpperCase().padStart(8, '0');
const parseNum = (s: string) => {
  const t = s.trim();
  return t.toLowerCase().startsWith('0x') ? parseInt(t, 16) : parseInt(t, 10);
};

const MAP_FIELDS: { key: string; label: string }[] = [
  { key: 'gold', label: 'Créditos (endereço)' },
  { key: 'goldSize', label: 'Créditos (bytes: 1/2/4)' },
  { key: 'gameMode', label: 'GameMode (u8)' },
  { key: 'mapId', label: 'Map ID (u16)' },
  { key: 'playTime', label: 'PlayTime (h,m,s u8)' },
  { key: 'partyBase', label: 'Party slot 1 (base)' },
  { key: 'partyStride', label: 'Party stride' },
  { key: 'partyEnOffset', label: 'Offset EN' },
  { key: 'partyTpOffset', label: 'Offset TP' },
  { key: 'partyHpOffset', label: 'Offset HP' },
];

export const TrackerView: React.FC<TrackerViewProps> = ({ gameState }) => {
  const api = window.electronAPI;
  const [diag, setDiag] = useState<Record<string, string> | null>(null);
  const [memMap, setMemMap] = useState<Record<string, number>>({});
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [showAdvancedTools, setShowAdvancedTools] = useState<boolean>(false);

  // Scanner state
  const [scanValue, setScanValue] = useState('');
  const [scanSize, setScanSize] = useState<1 | 2 | 4>(4);
  const [scanResult, setScanResult] = useState<{ count: number; sample: number[] } | null>(null);
  const [scanBusy, setScanBusy] = useState(false);
  const [scanError, setScanError] = useState('');

  // Hex viewer
  const [hexAddr, setHexAddr] = useState('0x01FDDB80');
  const [hexDump, setHexDump] = useState('');

  useEffect(() => {
    api?.getMemoryMap().then(setMemMap);
  }, []);

  const runDiag = async () => {
    sound.play('click');
    try {
      const res = await api!.pineDiagnostics();
      setDiag(res);
      sound.play('success');
    } catch (e: any) {
      setDiag({ erro: e.message });
      sound.play('alert');
    }
  };

  const doScan = async (first: boolean) => {
    sound.play('click');
    const v = parseNum(scanValue);
    if (Number.isNaN(v)) return;
    setScanBusy(true);
    setScanError('');
    try {
      const res = first ? await api!.pineFirstScan(v, scanSize) : await api!.pineNextScan(v);
      setScanResult(res);
      sound.play('success');
    } catch (e: any) {
      setScanError(e.message);
      sound.play('alert');
    } finally {
      setScanBusy(false);
    }
  };

  const saveMap = async () => {
    sound.play('click');
    const patch: Record<string, number> = {};
    Object.entries(edits).forEach(([k, s]) => {
      const n = parseNum(s);
      if (!Number.isNaN(n)) patch[k] = n;
    });
    setMemMap(await api!.setMemoryMap(patch));
    setEdits({});
    sound.play('success');
  };

  const useAddrFor = async (key: string, addr: number) => {
    sound.play('click');
    const patch: Record<string, number> = { [key]: addr };
    if (key === 'gold') patch.goldSize = scanSize;
    setMemMap(await api!.setMemoryMap(patch));
  };

  const readHex = async () => {
    sound.play('click');
    try {
      const a = parseNum(hexAddr);
      const raw = await api!.pineReadHex(a, 256);
      const bytes = raw.split(' ');
      const lines: string[] = [];
      for (let i = 0; i < bytes.length; i += 16) {
        lines.push(`${hex(a + i)}  ${bytes.slice(i, i + 16).join(' ')}`);
      }
      setHexDump(lines.join('\n'));
    } catch (e: any) {
      setHexDump(`erro: ${e.message}`);
    }
  };

  if (!api) {
    return (
      <div className="p-8 text-center text-slate-300 space-y-3">
        <Radio className="w-12 h-12 mx-auto text-amber-400 opacity-60 animate-pulse" />
        <h2 className="text-base font-bold text-white">MODO WEB / NAVEGADOR DETECTADO</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          O Live Memory Tracker conecta-se diretamente à RAM do emulador PCSX2 através do protocolo oficial PINE IPC nativo no aplicativo desktop.
        </p>
        <p className="text-xs font-mono text-cyan-400">
          Para ativar o sincronismo em tempo real, execute o app via Electron: <code>npm.cmd run electron:dev</code>
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto space-y-6">
      {/* Top Header Card */}
      <div className="ps2-panel p-5 rounded-lg border-2 border-ps2-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center border shadow-lg ${
              gameState.connected
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-rose-950/80 border-rose-600 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
            }`}
          >
            <Radio className={`w-6 h-6 ${gameState.connected ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold uppercase tracking-wider text-white">
                CENTRO DE OPERAÇÕES & TELEMETRIA PINE
              </h1>
              {gameState.connected ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-900/60 border border-emerald-500 text-emerald-300 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 inline mr-1" /> ONLINE
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-900/60 border border-rose-500 text-rose-300 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 inline mr-1" /> DESCONECTADO
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              {gameState.connected
                ? `Enlace Ativo via ${gameState.pineEndpoint} • Taxa de Amostragem: 500ms • Slot 0`
                : gameState.pineError
                ? `Aguardando PCSX2: ${gameState.pineError}`
                : 'Aguardando inicialização do PCSX2 na porta TCP 28011...'}
            </p>
          </div>
        </div>

        <button
          onClick={runDiag}
          className="ps2-bevel-btn px-4 py-2.5 rounded text-xs font-bold flex items-center space-x-2 text-cyan-200 hover:text-white"
        >
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>DIAGNÓSTICO DO EMULADOR</span>
        </button>
      </div>

      {/* Diagnostics output if requested */}
      {diag && (
        <div className="ps2-panel p-4 rounded text-xs font-mono grid grid-cols-2 md:grid-cols-4 gap-3 border border-cyan-500/50 bg-[#050b1a]">
          {Object.entries(diag).map(([k, v]) => (
            <div key={k} className="bg-black/40 p-2 rounded border border-ps2-border">
              <span className="text-cyan-400 uppercase text-[10px] block font-bold">{k}</span>
              <span className="text-white font-semibold">{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Live Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Credits */}
        <div className="ps2-panel p-4 rounded-lg space-y-2 border-l-4 border-l-amber-400">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold uppercase">
            <span className="flex items-center space-x-1.5">
              <Coins className="w-4 h-4" />
              <span>Créditos (Gold)</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">RAM EE</span>
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono tracking-wide">
            {gameState.gold.toLocaleString()} <span className="text-xs text-amber-500">Ct</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            Endereço: {hex(memMap.gold || 0x01fdd000)}
          </p>
        </div>

        {/* Location & Game Mode */}
        <div className="ps2-panel p-4 rounded-lg space-y-2 border-l-4 border-l-cyan-400">
          <div className="flex items-center justify-between text-xs text-cyan-400 font-bold uppercase">
            <span className="flex items-center space-x-1.5">
              <Database className="w-4 h-4" />
              <span>Localização Atual</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">ID #{gameState.mapId}</span>
          </div>
          <div className="text-base font-bold text-white truncate" title={gameState.currentLocationName}>
            {gameState.currentLocationName}
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            Modo: <span className="text-cyan-300">{gameState.gameModeName}</span> (0x{gameState.gameMode.toString(16).padStart(2, '0')})
          </p>
        </div>

        {/* Play Time */}
        <div className="ps2-panel p-4 rounded-lg space-y-2 border-l-4 border-l-emerald-400">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold uppercase">
            <span className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4" />
              <span>Tempo de Jogo</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">Sessão</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-wider">
            {String(gameState.playTime.hours).padStart(2, '0')}:
            {String(gameState.playTime.minutes).padStart(2, '0')}:
            {String(gameState.playTime.seconds).padStart(2, '0')}
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            Horas / Minutos / Segundos
          </p>
        </div>

        {/* Emulator Status */}
        <div className="ps2-panel p-4 rounded-lg space-y-2 border-l-4 border-l-blue-400">
          <div className="flex items-center justify-between text-xs text-blue-400 font-bold uppercase">
            <span className="flex items-center space-x-1.5">
              <Cpu className="w-4 h-4" />
              <span>Estado da CPU EE</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">PINE IPC</span>
          </div>
          <div className="text-base font-bold text-white">
            {gameState.connected
              ? gameState.emulatorRunning
                ? 'Jogo em Execução'
                : 'PCSX2 Aberto (Pausado)'
              : 'Aguardando Conexão'}
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            CRC: <span className="text-cyan-300">9F18CBC5</span> (SLUS_212.70)
          </p>
        </div>
      </div>

      {/* Live Party Telemetry Grid */}
      <div className="ps2-panel p-5 rounded-lg space-y-4">
        <div className="flex items-center justify-between border-b border-ps2-border pb-2">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              TELEMETRIA DO ESQUADRÃO (RAM EM TEMPO REAL)
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Base: {hex(memMap.partyBase || 0x01fddb90)} • Stride: {hex(memMap.partyStride || 0x0c)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {gameState.party.map((slot) => {
            const hasData = slot.currentHp > 0 || slot.currentTp > 0 || slot.currentEn > 0;
            const hpRatio = slot.maxHp > 0 ? (slot.currentHp / slot.maxHp) * 100 : 0;
            return (
              <div
                key={slot.slot}
                className={`p-3 rounded border bg-black/40 space-y-2 ${
                  hasData ? 'border-cyan-500/40' : 'border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-cyan-300 font-mono font-bold">
                      SLOT {slot.slot}
                    </span>
                    <span className="text-xs font-bold text-white truncate max-w-[110px]">
                      {slot.pilotName}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase font-bold ${
                      slot.status === 'Ativo'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                        : slot.status === 'Abatido'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                        : 'bg-slate-900 text-slate-500'
                    }`}
                  >
                    {slot.status}
                  </span>
                </div>

                {/* HP bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-cyan-400 font-bold">HP</span>
                    <span className="text-white">
                      {slot.currentHp} / {slot.maxHp || '—'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-ps2-border">
                    <div
                      className={`h-full transition-all duration-300 ${
                        hpRatio > 50 ? 'bg-cyan-400' : hpRatio > 25 ? 'bg-amber-400' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(hpRatio, 100)}%` }}
                    />
                  </div>
                </div>

                {/* TP & EN */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 border-t border-ps2-border/60">
                  <div className="flex justify-between">
                    <span className="text-amber-400">TP:</span>
                    <span className="text-white font-bold">{slot.currentTp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-400">EN:</span>
                    <span className="text-white font-bold">{slot.currentEn}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Advanced Calibration & Memory Tools (COLLAPSIBLE / HIDDEN BY DEFAULT) */}
      <div className="ps2-panel rounded-lg overflow-hidden border border-ps2-border">
        <button
          onClick={() => {
            sound.play('toggle');
            setShowAdvancedTools((prev) => !prev);
          }}
          className="w-full px-5 py-3.5 bg-black/40 hover:bg-black/60 flex items-center justify-between text-xs font-bold text-slate-300 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="uppercase tracking-wider">
              Ferramentas Avançadas de Calibração & Engenharia Reversa
            </span>
            <span className="text-[10px] text-slate-500 font-normal">
              (Opcional: use apenas se jogar em outra versão ou patch do jogo)
            </span>
          </div>
          {showAdvancedTools ? (
            <ChevronUp className="w-4 h-4 text-cyan-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showAdvancedTools && (
          <div className="p-5 space-y-6 border-t border-ps2-border bg-[#050914]">
            {/* Raw party dump */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-white uppercase flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hex Dump Bruto da Party (Memória EE)</span>
              </h3>
              <pre className="text-[11px] font-mono text-emerald-300 bg-black/80 p-3 rounded border border-ps2-border overflow-x-auto">
                {(gameState.rawParty ?? []).map((r, i) => `Slot ${i + 1}: ${r}`).join('\n') || 'sem dados da memória'}
              </pre>
            </div>

            {/* Scanner */}
            <div className="space-y-3 pt-3 border-t border-ps2-border">
              <h3 className="text-xs font-bold text-white uppercase flex items-center space-x-2">
                <Search className="w-4 h-4 text-cyan-400" />
                <span>Scanner de Memória EE</span>
              </h3>
              <p className="text-xs text-slate-400">
                Digite um valor conhecido (ex: Créditos atuais), clique em "Nova Busca", gaste/ganhe créditos no jogo, e clique em "Refinar" até isolar o endereço exato.
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <input
                  value={scanValue}
                  onChange={(e) => setScanValue(e.target.value)}
                  placeholder="valor (ex: 204)"
                  className="px-3 py-1.5 bg-black/80 border border-ps2-border rounded text-white font-mono w-40 focus:outline-none focus:border-cyan-400"
                />
                <select
                  value={scanSize}
                  onChange={(e) => setScanSize(Number(e.target.value) as 1 | 2 | 4)}
                  className="px-3 py-1.5 bg-black/80 border border-ps2-border rounded text-white font-mono focus:outline-none"
                >
                  <option value={1}>1 byte (u8)</option>
                  <option value={2}>2 bytes (u16)</option>
                  <option value={4}>4 bytes (u32)</option>
                </select>
                <button
                  disabled={scanBusy || !gameState.connected}
                  onClick={() => doScan(true)}
                  className="ps2-bevel-btn px-4 py-1.5 rounded font-bold text-slate-200"
                >
                  Nova Busca
                </button>
                <button
                  disabled={scanBusy || !scanResult}
                  onClick={() => doScan(false)}
                  className="ps2-bevel-btn px-4 py-1.5 rounded font-bold text-slate-200"
                >
                  Refinar
                </button>
                {scanBusy && <span className="text-amber-300 font-mono text-xs">Varrendo 32 MB de RAM...</span>}
                {scanError && <span className="text-rose-400 font-mono text-xs">{scanError}</span>}
              </div>

              {scanResult && (
                <div className="text-xs font-mono space-y-1.5 bg-black/60 p-3 rounded border border-ps2-border">
                  <div className="text-cyan-300 font-bold">{scanResult.count} endereço(s) encontrados</div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {scanResult.sample.map((a) => (
                      <div key={a} className="flex items-center justify-between bg-black/40 px-3 py-1 rounded">
                        <span className="text-white font-bold">{hex(a)}</span>
                        <div className="space-x-2">
                          <button
                            onClick={() => useAddrFor('gold', a)}
                            className="text-amber-400 hover:text-amber-300 hover:underline"
                          >
                            Definir p/ Créditos
                          </button>
                          <button
                            onClick={() => {
                              setHexAddr(hex(a - 32));
                            }}
                            className="text-cyan-400 hover:text-cyan-300 hover:underline"
                          >
                            Ver no Hex
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Hex viewer */}
            <div className="space-y-2 pt-3 border-t border-ps2-border">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-white uppercase">Inspetor Hexadecimal</span>
                <input
                  value={hexAddr}
                  onChange={(e) => setHexAddr(e.target.value)}
                  className="px-2 py-1 bg-black/80 border border-ps2-border rounded text-white font-mono w-32 focus:outline-none"
                />
                <button
                  disabled={!gameState.connected}
                  onClick={readHex}
                  className="ps2-bevel-btn px-3 py-1 rounded font-bold text-slate-200"
                >
                  Ler 256 bytes
                </button>
              </div>
              {hexDump && (
                <pre className="text-[11px] font-mono text-slate-200 bg-black/80 p-3 rounded border border-ps2-border overflow-x-auto">
                  {hexDump}
                </pre>
              )}
            </div>

            {/* Memory map editor */}
            <div className="space-y-3 pt-3 border-t border-ps2-border">
              <h3 className="text-xs font-bold text-white uppercase flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Tabela de Mapeamento de Memória (Persistida)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {MAP_FIELDS.map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between gap-2 bg-black/40 px-3 py-1.5 rounded border border-ps2-border">
                    <span className="text-slate-300">{label}</span>
                    <input
                      value={
                        edits[key] ??
                        (memMap[key] !== undefined
                          ? memMap[key] > 0xffff
                            ? hex(memMap[key])
                            : String(memMap[key])
                          : '')
                      }
                      onChange={(e) => setEdits((p) => ({ ...p, [key]: e.target.value }))}
                      className="px-2 py-0.5 bg-black/80 border border-ps2-border rounded text-white font-mono w-32 focus:outline-none"
                    />
                  </label>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={saveMap} className="ps2-bevel-btn px-4 py-1.5 rounded text-xs font-bold text-slate-200">
                  Salvar Alterações
                </button>
                <button
                  onClick={async () => {
                    sound.play('click');
                    setMemMap(await api.resetMemoryMap());
                  }}
                  className="ps2-bevel-btn px-4 py-1.5 rounded text-xs font-bold text-slate-400 flex items-center gap-1 hover:text-white"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restaurar Padrões de Fábrica
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
