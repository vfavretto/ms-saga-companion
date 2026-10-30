import React, { useState, useMemo } from 'react';
import { Enemy } from '../types';
import {
  Search,
  Skull,
  Shield,
  Zap,
  Flame,
  Droplets,
  AlertTriangle,
  Award,
  Sparkles,
  Swords,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { sound } from '../utils/sound';

interface BestiaryViewProps {
  enemies: Enemy[];
}

export const BestiaryView: React.FC<BestiaryViewProps> = ({ enemies }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [onlyMissableOrRare, setOnlyMissableOrRare] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    enemies.forEach((e) => set.add(e.category));
    return Array.from(set);
  }, [enemies]);

  const filteredEnemies = useMemo(() => {
    return enemies.filter((enemy) => {
      const matchesSearch =
        enemy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enemy.number.includes(searchTerm) ||
        enemy.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (enemy.aliases && enemy.aliases.some((a) => a.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        enemy.drops.some((d) => d.item.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' || enemy.category === selectedCategory;

      const matchesSpecial = !onlyMissableOrRare || enemy.is_missable || enemy.is_rare;

      return matchesSearch && matchesCat && matchesSpecial;
    });
  }, [enemies, searchTerm, selectedCategory, onlyMissableOrRare]);

  return (
    <div className="flex flex-col h-full p-4 overflow-hidden space-y-4">
      {/* Top Header & Search Bar */}
      <div className="ps2-panel rounded p-3 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div>
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
            ENCICLOPÉDIA TÁTICA COMPLETA ({enemies.length} ENTRADAS)
          </span>
          <h1 className="text-base font-bold text-white tracking-wide">
            BESTIÁRIO & TABELA DE DROPS
          </h1>
        </div>

        {/* Search Input */}
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, # número, região ou item drop..."
            className="w-full pl-9 pr-3 py-1.5 bg-black/60 border border-ps2-border rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              sound.play('toggle');
              setOnlyMissableOrRare((prev) => !prev);
            }}
            className={`px-3 py-1.5 rounded text-xs font-bold border transition-all flex items-center space-x-1.5 ${
              onlyMissableOrRare
                ? 'bg-rose-950/70 border-rose-500 text-rose-300 shadow-glow-danger'
                : 'bg-black/40 border-ps2-border text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Raros & Perdíveis</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 flex-shrink-0 text-xs font-bold">
        <button
          onClick={() => {
            sound.play('click');
            setSelectedCategory('all');
          }}
          className={`px-3 py-1 rounded transition-all flex-shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-cyan-500 text-black shadow-glow-cyan'
              : 'bg-ps2-panel border border-ps2-border text-slate-400 hover:text-white'
          }`}
        >
          Todos ({enemies.length})
        </button>

        {categories.map((cat) => {
          const count = enemies.filter((e) => e.category === cat).length;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                sound.play('click');
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1 rounded transition-all flex-shrink-0 ${
                isSelected
                  ? 'bg-cyan-500 text-black shadow-glow-cyan'
                  : 'bg-ps2-panel border border-ps2-border text-slate-400 hover:text-white'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Results Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredEnemies.map((enemy) => {
            const isBlackAssassin = enemy.number === '270';
            const isMetal = enemy.name.includes('Metal');
            const isBoss = enemy.is_boss;

            return (
              <div
                key={enemy.id}
                className={`p-3.5 rounded border transition-all flex flex-col justify-between space-y-3 ${
                  isBlackAssassin
                    ? 'bg-gradient-to-br from-rose-950/50 to-blue-950/70 border-rose-500 shadow-glow-danger'
                    : isMetal
                    ? 'bg-gradient-to-br from-amber-950/40 to-slate-900 border-amber-400 shadow-glow-amber'
                    : isBoss
                    ? 'bg-gradient-to-br from-red-950/30 to-blue-950/50 border-red-500/60'
                    : 'bg-ps2-panel/90 border-ps2-border hover:border-cyan-400'
                }`}
              >
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] font-bold text-cyan-400">
                      #{enemy.number}
                    </span>
                    <div className="flex items-center space-x-1">
                      {isBlackAssassin && (
                        <span className="text-[9px] bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded font-mono animate-pulse">
                          PERDÍVEL #270
                        </span>
                      )}
                      {isMetal && (
                        <span className="text-[9px] bg-amber-500 text-black font-bold px-1.5 py-0.2 rounded font-mono">
                          EXP OURO
                        </span>
                      )}
                      {isBoss && !isBlackAssassin && (
                        <span className="text-[9px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded font-mono">
                          CHEFE
                        </span>
                      )}
                      <span className="text-[9px] bg-black/60 text-slate-400 px-1.5 py-0.2 rounded border border-ps2-border/60">
                        {enemy.category}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white tracking-wide flex items-center space-x-1.5">
                    <span>{enemy.name}</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">
                    📍 {enemy.region}
                  </span>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-1.5 bg-black/50 p-2 rounded border border-ps2-border/60 text-center font-mono">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">HP</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {enemy.hp.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">EXP</span>
                    <span className="text-xs font-bold text-cyan-300">
                      {enemy.exp.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">CRÉDITOS</span>
                    <span className="text-xs font-bold text-amber-300">
                      {enemy.gold.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Weaknesses */}
                {enemy.weaknesses.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Vulnerabilidades:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {enemy.weaknesses.map((w, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 font-mono"
                        >
                          ⚡ {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Drops Table */}
                <div className="space-y-1 border-t border-ps2-border/50 pt-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center space-x-1">
                    <Award className="w-3 h-3 text-amber-400" />
                    <span>Espólios & Drops:</span>
                  </span>
                  <div className="space-y-1">
                    {enemy.drops.map((drop, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs bg-black/40 px-2 py-1 rounded border border-ps2-border/40 font-mono"
                      >
                        <span className="text-slate-200 truncate">{drop.item}</span>
                        <span className="text-amber-400 text-[11px] font-bold">
                          {drop.rate}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tactical Notes */}
                {enemy.notes && (
                  <p className="text-[11px] text-slate-300 italic bg-black/30 p-1.5 rounded border border-ps2-border/40 leading-snug">
                    {enemy.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {filteredEnemies.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500 space-y-2">
            <Search className="w-8 h-8 text-slate-600" />
            <span className="text-sm">Nenhum inimigo encontrado com esses filtros.</span>
          </div>
        )}
      </div>
    </div>
  );
};
