import React, { useState } from 'react';
import {
  ShieldAlert,
  BookOpen,
  Users,
  Radio,
  Tv,
  Database,
  Skull,
  Coins,
  MapPin,
  Search,
  Volume2,
  VolumeX,
  Swords,
} from 'lucide-react';
import { LiveGameState } from '../types';
import { sound } from '../utils/sound';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  gameState: LiveGameState;
  scanlines: boolean;
  setScanlines: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  gameState,
  scanlines,
  setScanlines,
  onOpenSearch,
}) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => sound.isEnabled());

  const toggleSound = () => {
    const newState = sound.toggle();
    setSoundEnabled(newState);
  };

  const tabs = [
    { id: 'walkthrough', label: 'DETONADO & BAÚS', icon: BookOpen, key: '1' },
    { id: 'bestiary', label: 'BESTIÁRIO (270)', icon: Skull, key: '2' },
    { id: 'missables', label: 'MISSABLES', icon: ShieldAlert, alert: true, key: '3' },
    { id: 'database', label: 'ENCICLOPÉDIA MS', icon: Database, key: '4' },
    { id: 'pilots', label: 'PILOTOS & SKILLS', icon: Users, key: '5' },
    { id: 'tracker', label: 'LINK TÁTICO PINE', icon: Radio, key: '6' },
  ];

  return (
    <header className="ps2-header-strip flex flex-col border-b-2 border-ps2-glow text-white shadow-xl select-none flex-shrink-0">
      {/* TIER 1: Branding, Telemetry HUD & Controls */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-ps2-border/60 bg-[#060a16]/90 backdrop-blur-sm">
        {/* Brand logo & title */}
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded bg-gradient-to-br from-cyan-400 to-blue-700 flex items-center justify-center font-bold text-black border border-white/80 shadow-glow-cyan text-xs">
            MS
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold tracking-wider text-cyan-300 drop-shadow">
                MS SAGA: A NEW DAWN
              </h1>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950/80 border border-ps2-border text-cyan-400 font-mono hidden sm:inline">
                TACTICAL COMPANION
              </span>
            </div>
          </div>
        </div>

        {/* Live Status & Quick Action Widgets */}
        <div className="flex items-center space-x-2 text-xs">
          {/* Location / Mode Widget */}
          <div className="flex items-center space-x-1.5 bg-black/60 px-2.5 py-1 rounded border border-ps2-border font-mono text-[11px]">
            {gameState.gameMode === 4 || gameState.currentLocationName.includes('Combate') ? (
              <Swords className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            ) : (
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="text-slate-200 font-semibold truncate max-w-[150px]">
              {gameState.currentLocationName}
            </span>
          </div>

          {/* Credits HUD */}
          <div className="flex items-center space-x-1.5 bg-black/60 px-2.5 py-1 rounded border border-ps2-border font-mono text-[11px]">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 font-bold">{gameState.gold.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">Ct</span>
          </div>

          {/* Global Search Button */}
          <button
            onClick={() => {
              sound.play('click');
              onOpenSearch();
            }}
            title="Busca Global (Ctrl + K)"
            className="ps2-bevel-btn px-2 py-1 rounded flex items-center space-x-1.5 text-cyan-300 hover:text-white"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline text-[10px] font-mono">Ctrl+K</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={`Efeitos Sonoros PS2: ${soundEnabled ? 'Ativados (Atalho: M)' : 'Silenciado (Atalho: M)'}`}
            className={`ps2-bevel-btn p-1 rounded flex items-center ${
              soundEnabled ? 'text-cyan-400 border-cyan-400' : 'text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          {/* CRT Scanlines Toggle */}
          <button
            onClick={() => {
              sound.play('toggle');
              setScanlines((prev) => !prev);
            }}
            title="Alternar filtro CRT Scanlines (Atalho: C)"
            className={`ps2-bevel-btn px-1.5 py-1 rounded text-[10px] flex items-center space-x-1 ${
              scanlines ? 'text-cyan-400 border-cyan-400' : 'text-slate-400'
            }`}
          >
            <Tv className="w-3 h-3" />
            <span className="hidden sm:inline">CRT</span>
          </button>

          {/* PCSX2 Connection Health Pill */}
          <div
            title={
              gameState.connected
                ? `PCSX2 Online: ${gameState.pineEndpoint}`
                : 'PCSX2 Offline: Abra o emulador e ative PINE'
            }
            className="flex items-center space-x-1.5 bg-black/60 px-2.5 py-1 rounded border border-ps2-border"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                gameState.connected
                  ? 'bg-emerald-400 shadow-[0_0_8px_#00f59b]'
                  : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
              }`}
            />
            <span className="text-[10px] font-bold text-slate-300 font-mono uppercase">
              {gameState.connected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* TIER 2: Generous, Responsive Tab Bar */}
      <nav className="px-2 py-1 bg-[#040812] grid grid-cols-3 sm:grid-cols-6 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.play('switch');
                setCurrentTab(tab.id);
              }}
              title={`Atalho: Tecla [${tab.key}]`}
              className={`py-1.5 px-2 rounded text-xs font-bold flex items-center justify-center space-x-1.5 transition-all truncate border ${
                isActive
                  ? 'bg-blue-900/80 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'bg-black/30 border-ps2-border/60 text-slate-400 hover:text-white hover:bg-blue-950/40 hover:border-ps2-border'
              }`}
            >
              <span className="text-[9px] font-mono opacity-50">[{tab.key}]</span>
              <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${tab.alert ? 'text-amber-400' : ''}`} />
              <span className="truncate">{tab.label}</span>
              {tab.alert && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
