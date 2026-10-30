import { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { WalkthroughView } from './components/WalkthroughView';
import { MissablesView } from './components/MissablesView';
import { DatabaseView } from './components/DatabaseView';
import { PilotsView } from './components/PilotsView';
import { TrackerView } from './components/TrackerView';
import { BestiaryView } from './components/BestiaryView';
import { PartyHUD } from './components/PartyHUD';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { sound } from './utils/sound';
import {
  LiveGameState,
  Act,
  MissableAlert,
  Pilot,
  MobileSuit,
  Weapon,
  OptionPart,
  Enemy,
} from './types';

// Import datasets
import walkthroughData from './data/walkthrough.json';
import missablesData from './data/missables.json';
import pilotsData from './data/pilots.json';
import mobilesuitsData from './data/mobilesuits.json';
import weaponsData from './data/weapons.json';
import optionsData from './data/options.json';
import bestiaryData from './data/bestiary.json';

// Global declaration for Electron IPC bridge
declare global {
  interface Window {
    electronAPI?: {
      getMemoryState: () => Promise<any>;
      onMemoryUpdate: (callback: (state: any) => void) => void;
      pineDiagnostics: () => Promise<Record<string, string>>;
      pineFirstScan: (value: number, size: 1 | 2 | 4) => Promise<{ count: number; sample: number[] }>;
      pineNextScan: (value: number) => Promise<{ count: number; sample: number[] }>;
      pineReadHex: (addr: number, len: number) => Promise<string>;
      getMemoryMap: () => Promise<Record<string, number>>;
      setMemoryMap: (patch: Record<string, number>) => Promise<Record<string, number>>;
      resetMemoryMap: () => Promise<Record<string, number>>;
    };
  }
}

const TAB_KEYS: Record<string, string> = {
  '1': 'walkthrough',
  '2': 'bestiary',
  '3': 'missables',
  '4': 'database',
  '5': 'pilots',
  '6': 'tracker',
};

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('walkthrough');
  const [scanlines, setScanlines] = useState<boolean>(true);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const wasConnected = useRef<boolean>(false);

  const [gameState, setGameState] = useState<LiveGameState>({
    connected: false,
    emulatorRunning: false,
    gameMode: 0,
    gameModeName: 'Desconectado',
    mapId: 0,
    currentLocationName: 'Aguardando PCSX2...',
    gold: 0,
    playTime: { hours: 0, minutes: 0, seconds: 0 },
    party: [1, 2, 3, 4, 5, 6].map((slot) => ({
      slot,
      pilotName: `Slot ${slot}`,
      activeMS: '—',
      currentHp: 0,
      maxHp: 0,
      currentEn: 0,
      maxEn: 0,
      currentTp: 0,
      maxTp: 0,
      status: 'Sem dados',
    })),
  });

  const acts: Act[] = walkthroughData as Act[];
  const missables: MissableAlert[] = missablesData as MissableAlert[];
  const pilots: Pilot[] = pilotsData as Pilot[];
  const mobilesuits: MobileSuit[] = mobilesuitsData as MobileSuit[];
  const weapons: Weapon[] = weaponsData as Weapon[];
  const options: OptionPart[] = optionsData as OptionPart[];
  const enemies: Enemy[] = bestiaryData as Enemy[];

  // Global hotkeys listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      // Ctrl + K or Ctrl + F: open global search
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K' || e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
        return;
      }

      if (isInput) return;

      // 1 - 6 for quick tab navigation
      if (TAB_KEYS[e.key]) {
        e.preventDefault();
        sound.play('switch');
        setCurrentTab(TAB_KEYS[e.key]);
        return;
      }

      // C: toggle CRT scanlines
      if (e.key === 'c' || e.key === 'C') {
        sound.play('toggle');
        setScanlines((prev) => !prev);
        return;
      }

      // M: toggle audio
      if (e.key === 'm' || e.key === 'M') {
        sound.toggle();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen to Electron IPC if running inside Electron desktop shell
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onMemoryUpdate((update) => {
        if (!wasConnected.current && update.connected) {
          sound.play('success');
        }
        wasConnected.current = !!update.connected;

        setGameState((prev) => ({
          ...prev,
          ...update,
        }));
      });
    }
  }, []);

  return (
    <div
      className={`w-screen h-screen flex flex-col bg-[#080c18] text-[#e2edff] ${
        scanlines ? 'crt-scanlines' : ''
      }`}
    >
      {/* Top Header / Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        gameState={gameState}
        scanlines={scanlines}
        setScanlines={setScanlines}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* Main Tab View */}
      <div className="flex-1 overflow-hidden relative">
        {currentTab === 'walkthrough' && (
          <WalkthroughView acts={acts} missables={missables} gameState={gameState} />
        )}

        {currentTab === 'bestiary' && (
          <BestiaryView enemies={enemies} />
        )}

        {currentTab === 'missables' && (
          <MissablesView missables={missables} />
        )}

        {currentTab === 'database' && (
          <DatabaseView
            mobilesuits={mobilesuits}
            weapons={weapons}
            options={options}
          />
        )}

        {currentTab === 'pilots' && (
          <PilotsView pilots={pilots} />
        )}

        {currentTab === 'tracker' && (
          <TrackerView gameState={gameState} setGameState={setGameState} />
        )}
      </div>

      {/* Real-time Party Overview HUD */}
      <PartyHUD party={gameState.party} connected={gameState.connected} />

      {/* Bottom Status Ticker */}
      <footer className="h-6 bg-[#04060c] border-t border-ps2-border px-4 flex items-center justify-between text-[10px] text-slate-400 font-mono select-none">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <span className="text-cyan-400 font-bold">STATUS:</span>
            <span>{gameState.connected ? 'SYNCING MEMORY (500ms)' : 'STANDALONE MODE'}</span>
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline">
            <span className="text-amber-400 font-bold">ÁREA:</span> {gameState.currentLocationName}
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline">
            <span className="text-cyan-400 font-bold">CRÉDITOS:</span> {gameState.gold.toLocaleString()} Ct
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="hidden lg:inline text-slate-500">
            Atalhos: [1-6] Abas &nbsp;|&nbsp; [Ctrl+K] Busca &nbsp;|&nbsp; [M] Som &nbsp;|&nbsp; [C] CRT
          </span>
          <span className="hidden lg:inline text-slate-600">|</span>
          <span>
            <span className="text-cyan-400 font-bold">GAME CRC:</span> 9F18CBC5
          </span>
          <span className="text-slate-600">|</span>
          <span>
            <span className="text-cyan-400 font-bold">ELF:</span> SLUS_212.70
          </span>
        </div>
      </footer>

      {/* Global Command Palette / Search Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(tab) => setCurrentTab(tab)}
        walkthroughData={acts}
        bestiaryData={enemies}
        missablesData={missables}
        mobilesuitsData={mobilesuits}
        weaponsData={weapons}
        pilotsData={pilots}
      />
    </div>
  );
}

export default App;
