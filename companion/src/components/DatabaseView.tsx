import React, { useState } from 'react';
import { MobileSuit, Weapon, OptionPart } from '../types';
import { Bot, Swords, Wrench, Search, Zap, Shield, Sparkles, Filter } from 'lucide-react';
import { sound } from '../utils/sound';

interface DatabaseViewProps {
  mobilesuits: MobileSuit[];
  weapons: Weapon[];
  options: OptionPart[];
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({ mobilesuits, weapons, options }) => {
  const [subTab, setSubTab] = useState<'ms' | 'weapons' | 'options'>('ms');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const filteredMS = mobilesuits.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.model_number.toLowerCase().includes(search.toLowerCase()) ||
      m.faction.toLowerCase().includes(search.toLowerCase())
  );

  const filteredWeapons = weapons.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.category.toLowerCase().includes(search.toLowerCase()) ||
      w.type.toLowerCase().includes(search.toLowerCase())
  );

  const filteredOptions = options.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.category.toLowerCase().includes(search.toLowerCase()) ||
      o.effect.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full gap-4 p-6 overflow-hidden">
      {/* Main List */}
      <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
        {/* Header and Sub-Tabs */}
        <div className="flex items-center justify-between border-b border-ps2-border pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                sound.play('click');
                setSubTab('ms');
                setSelectedItem(null);
              }}
              className={`ps2-bevel-btn px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1.5 ${
                subTab === 'ms' ? 'ps2-bevel-btn-active' : 'text-slate-400'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>MOBILE SUITS ({mobilesuits.length})</span>
            </button>

            <button
              onClick={() => {
                sound.play('click');
                setSubTab('weapons');
                setSelectedItem(null);
              }}
              className={`ps2-bevel-btn px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1.5 ${
                subTab === 'weapons' ? 'ps2-bevel-btn-active' : 'text-slate-400'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>ARMAMENTOS ({weapons.length})</span>
            </button>

            <button
              onClick={() => {
                sound.play('click');
                setSubTab('options');
                setSelectedItem(null);
              }}
              className={`ps2-bevel-btn px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1.5 ${
                subTab === 'options' ? 'ps2-bevel-btn-active' : 'text-slate-400'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>PEÇAS DE OPÇÃO ({options.length})</span>
            </button>
          </div>

          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, facção ou tipo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-black/60 border border-ps2-border rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {/* Mobile Suits Tab */}
          {subTab === 'ms' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredMS.map((ms) => {
                const isSelected = selectedItem?.id === ms.id;
                return (
                  <div
                    key={ms.id}
                    onClick={() => setSelectedItem(ms)}
                    className={`cursor-pointer ps2-panel p-4 rounded border transition-all space-y-2 ${
                      isSelected
                        ? 'ps2-panel-active border-cyan-400'
                        : 'border-ps2-border hover:border-cyan-500/70'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-cyan-400 font-mono">{ms.model_number}</span>
                        <h3 className="text-sm font-bold text-white tracking-wide">{ms.name}</h3>
                      </div>
                      <span className="text-[10px] bg-blue-950 px-2 py-0.5 rounded text-slate-300 border border-ps2-border">
                        {ms.faction}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {ms.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-ps2-border/60">
                      <span>HP: <strong className="text-emerald-400">{ms.base_hp}</strong></span>
                      <span>EN: <strong className="text-amber-400">{ms.base_en}</strong></span>
                      <span>Grade: <strong className="text-cyan-300">{ms.grid_size}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Weapons Tab */}
          {subTab === 'weapons' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredWeapons.map((w) => {
                const isSelected = selectedItem?.id === w.id;
                return (
                  <div
                    key={w.id}
                    onClick={() => setSelectedItem(w)}
                    className={`cursor-pointer ps2-panel p-4 rounded border transition-all space-y-2 ${
                      isSelected
                        ? 'ps2-panel-active border-cyan-400'
                        : 'border-ps2-border hover:border-cyan-500/70'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-amber-400 font-mono">[{w.category}]</span>
                        <h3 className="text-sm font-bold text-white tracking-wide">{w.name}</h3>
                      </div>
                      <span className="text-[10px] bg-cyan-950 px-2 py-0.5 rounded text-cyan-300 border border-cyan-800">
                        {w.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {w.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-ps2-border/60">
                      <span>Poder: <strong className="text-rose-400">{w.damage} ATK</strong></span>
                      <span>Custo: <strong className="text-amber-400">{w.en_cost} EN</strong></span>
                      <span>Espaço: <strong className="text-cyan-300">{w.grid}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Options Tab */}
          {subTab === 'options' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredOptions.map((opt) => {
                const isSelected = selectedItem?.id === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedItem(opt)}
                    className={`cursor-pointer ps2-panel p-4 rounded border transition-all space-y-2 ${
                      isSelected
                        ? 'ps2-panel-active border-cyan-400'
                        : 'border-ps2-border hover:border-cyan-500/70'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-emerald-400 font-mono">[{opt.category}]</span>
                        <h3 className="text-sm font-bold text-white tracking-wide">{opt.name}</h3>
                      </div>
                      <span className="text-[10px] bg-black/60 px-2 py-0.5 rounded text-slate-300 border border-ps2-border font-mono">
                        Grade {opt.grid}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed">
                      {opt.effect}
                    </p>

                    <div className="text-[11px] text-slate-400 pt-1 border-t border-ps2-border/60">
                      Onde Obter: <strong className="text-cyan-300">{opt.obtain}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Side Details Inspector */}
      {selectedItem ? (
        <aside className="w-80 flex-shrink-0 ps2-panel rounded p-5 overflow-y-auto space-y-4">
          <div className="border-b border-ps2-border pb-3">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
              FICHA TÉCNICA
            </span>
            <h2 className="text-base font-bold text-white mt-1">{selectedItem.name}</h2>
            {selectedItem.model_number && (
              <span className="text-xs text-slate-400 font-mono">{selectedItem.model_number}</span>
            )}
          </div>

          <div className="text-xs text-slate-300 leading-relaxed bg-black/40 p-3 rounded border border-ps2-border">
            {selectedItem.description || selectedItem.effect}
          </div>

          <div className="space-y-2 text-xs">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Especificações
            </span>
            {selectedItem.base_hp && (
              <div className="flex justify-between py-1 border-b border-ps2-border/60">
                <span className="text-slate-400">Pontos de Vida (HP):</span>
                <span className="text-emerald-400 font-bold">{selectedItem.base_hp}</span>
              </div>
            )}
            {selectedItem.base_en && (
              <div className="flex justify-between py-1 border-b border-ps2-border/60">
                <span className="text-slate-400">Capacidade de Energia:</span>
                <span className="text-amber-400 font-bold">{selectedItem.base_en} EN</span>
              </div>
            )}
            {selectedItem.damage && (
              <div className="flex justify-between py-1 border-b border-ps2-border/60">
                <span className="text-slate-400">Poder de Dano Base:</span>
                <span className="text-rose-400 font-bold">{selectedItem.damage} ATK</span>
              </div>
            )}
            {selectedItem.en_cost && (
              <div className="flex justify-between py-1 border-b border-ps2-border/60">
                <span className="text-slate-400">Consumo de EN:</span>
                <span className="text-amber-400 font-bold">{selectedItem.en_cost} EN</span>
              </div>
            )}
            {(selectedItem.grid || selectedItem.grid_size) && (
              <div className="flex justify-between py-1 border-b border-ps2-border/60">
                <span className="text-slate-400">Dimensões da Grade:</span>
                <span className="text-cyan-300 font-bold">{selectedItem.grid || selectedItem.grid_size}</span>
              </div>
            )}
            {selectedItem.speed && (
              <div className="flex justify-between py-1 border-b border-ps2-border/60">
                <span className="text-slate-400">Velocidade de Deslocamento:</span>
                <span className="text-white font-bold">{selectedItem.speed}</span>
              </div>
            )}
          </div>

          <div className="bg-blue-950/40 p-3 rounded border border-ps2-border text-xs space-y-1">
            <span className="text-cyan-400 font-bold block">Localização / Onde Obter:</span>
            <p className="text-slate-200 leading-relaxed">{selectedItem.obtain}</p>
          </div>
        </aside>
      ) : (
        <aside className="w-80 flex-shrink-0 ps2-panel rounded p-6 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
          <Filter className="w-8 h-8 text-slate-600" />
          <span className="text-xs">Selecione qualquer item ou Mobile Suit para inspecionar a ficha técnica detalhada.</span>
        </aside>
      )}
    </div>
  );
};
