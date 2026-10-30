import React, { useState } from 'react';
import { MissableAlert } from '../types';
import { ShieldAlert, AlertOctagon, CheckCircle2, Circle, Search } from 'lucide-react';
import { sound } from '../utils/sound';

interface MissablesViewProps {
  missables: MissableAlert[];
}

export const MissablesView: React.FC<MissablesViewProps> = ({ missables }) => {
  const [search, setSearch] = useState('');
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('ms_saga_missables_completed');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleCompleted = (id: string) => {
    sound.play('toggle');
    setCompleted((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      localStorage.setItem('ms_saga_missables_completed', JSON.stringify(updated));
      return updated;
    });
  };

  const filtered = missables.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.location.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 h-full flex flex-col space-y-4 overflow-hidden">
      <div className="flex items-center justify-between border-b border-ps2-border pb-3">
        <div>
          <div className="flex items-center space-x-2 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <h1 className="text-lg font-bold uppercase tracking-wider text-white">
              Escudo de Missables — Itens e Eventos Irrecuperáveis
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Mantenha este painel em mente durante cada ato para nunca perder Mobile Suits secretos, entradas do Bestiário ou equipamentos raros.
          </p>
        </div>

        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar missables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-black/60 border border-ps2-border rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {filtered.map((item) => {
          const isDone = !!completed[item.id];
          return (
            <div
              key={item.id}
              className={`ps2-panel p-4 rounded border-2 transition-all space-y-3 ${
                isDone
                  ? 'border-emerald-600/60 bg-emerald-950/20 opacity-70'
                  : item.severity === 'CRITICAL'
                  ? 'border-rose-600 shadow-glow-danger bg-red-950/40'
                  : 'border-amber-600 shadow-glow-amber bg-amber-950/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${
                        item.severity === 'CRITICAL' ? 'bg-rose-600' : 'bg-amber-600'
                      }`}
                    >
                      {item.severity}
                    </span>
                    <span className="text-xs text-cyan-400 font-mono">[{item.category}]</span>
                    <h3 className="text-sm font-bold text-white tracking-wide">{item.title}</h3>
                  </div>
                  <div className="text-xs text-slate-300 flex items-center space-x-4">
                    <span>
                      Local: <strong className="text-white">{item.location}</strong>
                    </span>
                    <span>
                      Janela: <strong className="text-amber-300">{item.window}</strong>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleCompleted(item.id)}
                  className={`px-3 py-1 rounded text-xs font-bold flex items-center space-x-1.5 transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-black/60 border border-ps2-border text-slate-300 hover:text-white hover:border-emerald-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                  <span>{isDone ? 'GARANTIDO' : 'MARCAR OBTIDO'}</span>
                </button>
              </div>

              <div className="bg-black/60 p-3 rounded border border-ps2-border text-xs space-y-2">
                <div>
                  <span className="text-rose-400 font-bold block">Ponto Sem Retorno:</span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">{item.cutoff_point}</p>
                </div>

                <div>
                  <span className="text-amber-400 font-bold block">Consequência de Perder:</span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">{item.consequence}</p>
                </div>

                <div className="pt-1 border-t border-ps2-border/60">
                  <span className="text-cyan-400 font-bold block">Instruções para Coleta Segura:</span>
                  <p className="text-slate-200 mt-0.5 leading-relaxed">{item.instructions}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
