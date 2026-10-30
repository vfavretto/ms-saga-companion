import React, { useState } from 'react';
import { PartyMember } from '../types';
import { Shield, Zap, Activity, Users, ChevronUp, ChevronDown } from 'lucide-react';
import { sound } from '../utils/sound';

interface PartyHUDProps {
  party: PartyMember[];
  connected: boolean;
}

export const PartyHUD: React.FC<PartyHUDProps> = ({ party, connected }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!party || party.length === 0) return null;

  return (
    <div className="border-t border-ps2-border bg-ps2-panel/95 backdrop-blur-md shadow-2xl flex-shrink-0 z-30 transition-all">
      {/* HUD Header Bar */}
      <div
        onClick={() => {
          sound.play('toggle');
          setIsExpanded((prev) => !prev);
        }}
        className="px-4 py-1 bg-black/60 border-b border-ps2-border/60 flex items-center justify-between cursor-pointer select-none hover:bg-blue-950/40 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-bold text-white tracking-wider uppercase font-mono">
            STATUS DO ESQUADRÃO (6 PILOTOS ATIVOS)
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
            }`}
          />
          <span className="text-[10px] text-slate-400 font-mono">
            {connected ? 'LIVE RAM SYNC' : 'OFFLINE / CACHE'}
          </span>
        </div>

        <button className="text-slate-400 hover:text-white flex items-center space-x-1 text-xs">
          <span className="text-[10px] font-mono">{isExpanded ? 'RECOLHER' : 'EXPANDIR'}</span>
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Grid */}
      {isExpanded && (
        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {party.map((member) => {
            const hpRatio = member.maxHp > 0 ? (member.currentHp / member.maxHp) * 100 : 100;
            const isDanger = hpRatio <= 25;
            const isWarning = hpRatio <= 50 && hpRatio > 25;

            const hpBarColor = isDanger
              ? 'bg-rose-500 shadow-glow-danger'
              : isWarning
              ? 'bg-amber-400'
              : 'bg-emerald-400';

            return (
              <div
                key={member.slot}
                className={`p-2.5 rounded border transition-all flex flex-col justify-between space-y-2 bg-black/50 ${
                  isDanger
                    ? 'border-rose-500/80 bg-rose-950/30'
                    : 'border-ps2-border/80 hover:border-cyan-500/60'
                }`}
              >
                {/* Pilot & Mobile Suit Name */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-cyan-400">
                      SLOT {member.slot}
                    </span>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                        isDanger
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {isDanger ? 'PERIGO' : member.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate mt-0.5">
                    {member.pilotName}
                  </h4>
                  <span className="text-[10px] text-slate-300 font-semibold block truncate">
                    🤖 {member.activeMS}
                  </span>
                </div>

                {/* HP Gauge */}
                <div className="space-y-0.5 font-mono">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-bold">HP</span>
                    <span className={`font-bold ${isDanger ? 'text-rose-400' : 'text-slate-200'}`}>
                      {member.currentHp} / {member.maxHp}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-black/80 rounded-full overflow-hidden border border-ps2-border/40">
                    <div
                      className={`h-full transition-all duration-300 ${hpBarColor}`}
                      style={{ width: `${Math.max(0, Math.min(100, hpRatio))}%` }}
                    />
                  </div>
                </div>

                {/* EN & TP Indicators */}
                <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-ps2-border/40">
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span className="text-cyan-300 font-bold">
                      {member.currentEn}/{member.maxEn}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Activity className="w-3 h-3 text-amber-400" />
                    <span className="text-amber-300 font-bold">
                      {member.currentTp} TP
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
