import React, { useState } from 'react';
import { Pilot } from '../types';
import { User, Zap, Shield, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

interface PilotsViewProps {
  pilots: Pilot[];
}

export const PilotsView: React.FC<PilotsViewProps> = ({ pilots }) => {
  const [selectedPilotId, setSelectedPilotId] = useState<string>(pilots[0]?.id || '');
  const selectedPilot = pilots.find((p) => p.id === selectedPilotId) || pilots[0];

  return (
    <div className="flex h-full gap-4 p-6 overflow-hidden">
      {/* Pilot List */}
      <aside className="w-64 flex-shrink-0 ps2-panel rounded p-3 overflow-y-auto space-y-2">
        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block border-b border-ps2-border pb-1">
          ESQUADRÃO DE PILOTOS
        </span>

        {pilots.map((p) => {
          const isSelected = p.id === selectedPilotId;
          return (
            <button
              key={p.id}
              onClick={() => {
                sound.play('click');
                setSelectedPilotId(p.id);
              }}
              className={`w-full text-left p-2.5 rounded transition-all flex items-center space-x-3 ${
                isSelected
                  ? 'ps2-panel-active text-cyan-300'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <div className="w-8 h-8 rounded bg-blue-950 border border-ps2-border flex items-center justify-center font-bold text-xs text-white">
                <User className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                <p className="text-[10px] text-slate-400 truncate">{p.role}</p>
              </div>
            </button>
          );
        })}
      </aside>

      {/* Selected Pilot Details */}
      {selectedPilot && (
        <main className="flex-1 ps2-panel rounded p-6 overflow-y-auto space-y-6">
          <div className="flex items-start justify-between border-b border-ps2-border pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-white tracking-wider">
                  {selectedPilot.name}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500 text-cyan-300 font-mono">
                  {selectedPilot.role}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
                {selectedPilot.description}
              </p>
            </div>

            <div className="text-right text-xs text-slate-400 font-mono">
              Entrada no Time: <strong className="text-cyan-400">{selectedPilot.join_chapter}</strong>
            </div>
          </div>

          {/* Strengths Chips */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Destaques & Papel em Combate</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedPilot.strengths.map((str, idx) => (
                <span
                  key={idx}
                  className="bg-black/60 border border-ps2-border px-3 py-1 rounded text-xs text-slate-200"
                >
                  ✓ {str}
                </span>
              ))}
            </div>
          </div>

          {/* Skills & Boost Attacks Table */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Técnicas Especiais & Boost Attacks</span>
            </span>

            <div className="border border-ps2-border rounded overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/60 text-slate-400 border-b border-ps2-border uppercase font-mono">
                  <tr>
                    <th className="p-2.5">Habilidade</th>
                    <th className="p-2.5">Nível Requerido</th>
                    <th className="p-2.5">Custo EN</th>
                    <th className="p-2.5">Efeito em Batalha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ps2-border/60 bg-black/30">
                  {selectedPilot.skills.map((skill, idx) => (
                    <tr key={idx} className="hover:bg-blue-900/20">
                      <td className="p-2.5 font-bold text-white flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{skill.name}</span>
                      </td>
                      <td className="p-2.5 font-mono text-cyan-300">Lv. {skill.level}</td>
                      <td className="p-2.5 font-mono text-amber-400">{skill.en_cost} EN</td>
                      <td className="p-2.5 text-slate-300">{skill.effect}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};
