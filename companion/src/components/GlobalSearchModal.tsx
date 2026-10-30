import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, BookOpen, Skull, ShieldAlert, Database, Users, ChevronRight, Package } from 'lucide-react';
import { sound } from '../utils/sound';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, meta?: any) => void;
  walkthroughData: any[];
  bestiaryData: any[];
  missablesData: any[];
  mobilesuitsData: any[];
  weaponsData: any[];
  pilotsData: any[];
}

interface SearchResultItem {
  id: string;
  category: 'walkthrough' | 'bestiary' | 'missables' | 'database' | 'pilots';
  categoryLabel: string;
  title: string;
  subtitle: string;
  badge?: string;
  raw: any;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  walkthroughData,
  bestiaryData,
  missablesData,
  mobilesuitsData,
  weaponsData,
  pilotsData,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const results: SearchResultItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const items: SearchResultItem[] = [];

    // Search Bestiary
    bestiaryData.forEach((enemy) => {
      const matchName = enemy.name.toLowerCase().includes(q) ||
        (enemy.aliases && enemy.aliases.some((a: string) => a.toLowerCase().includes(q)));
      const matchNum = String(enemy.number).includes(q) || `#${enemy.number}`.includes(q);
      const matchDrop = (enemy.drops || []).some((d: string) => d.toLowerCase().includes(q));
      if (matchName || matchNum || matchDrop) {
        items.push({
          id: `enemy-${enemy.number}`,
          category: 'bestiary',
          categoryLabel: 'Bestiário',
          title: `#${String(enemy.number).padStart(3, '0')} ${enemy.name}`,
          subtitle: `HP: ${enemy.hp} | EXP: ${enemy.exp} | Drops: ${(enemy.drops || []).join(', ') || 'Nenhum'}`,
          badge: enemy.is_boss ? 'CHEFE' : 'INIMIGO',
          raw: enemy,
        });
      }
    });

    // Search Missables
    missablesData.forEach((miss) => {
      if (
        miss.title.toLowerCase().includes(q) ||
        miss.location.toLowerCase().includes(q) ||
        miss.item.toLowerCase().includes(q)
      ) {
        items.push({
          id: `missable-${miss.id}`,
          category: 'missables',
          categoryLabel: 'Perdível',
          title: `⚠️ ${miss.title}`,
          subtitle: `Local: ${miss.location} | Item: ${miss.item}`,
          badge: 'MISSABLE',
          raw: miss,
        });
      }
    });

    // Search Mobile Suits
    mobilesuitsData.forEach((ms) => {
      if (ms.name.toLowerCase().includes(q) || (ms.origin && ms.origin.toLowerCase().includes(q))) {
        items.push({
          id: `ms-${ms.id || ms.name}`,
          category: 'database',
          categoryLabel: 'Mobile Suit',
          title: ms.name,
          subtitle: `Tipo: ${ms.type || 'Standard'} | HP Base: ${ms.baseHp || ms.hp || '—'}`,
          badge: 'MECHA',
          raw: ms,
        });
      }
    });

    // Search Weapons
    weaponsData.forEach((w) => {
      if (w.name.toLowerCase().includes(q) || (w.type && w.type.toLowerCase().includes(q))) {
        items.push({
          id: `weapon-${w.id || w.name}`,
          category: 'database',
          categoryLabel: 'Armamento',
          title: w.name,
          subtitle: `Ataque: ${w.attack || '—'} | Tipo: ${w.type || 'Arma'}`,
          badge: 'ARMA',
          raw: w,
        });
      }
    });

    // Search Pilots
    pilotsData.forEach((p) => {
      if (p.name.toLowerCase().includes(q) || (p.boostAttack && p.boostAttack.toLowerCase().includes(q))) {
        items.push({
          id: `pilot-${p.id || p.name}`,
          category: 'pilots',
          categoryLabel: 'Piloto',
          title: p.name,
          subtitle: `Boost Attack: ${p.boostAttack || '—'} | Mecha Padrão: ${p.defaultMS || '—'}`,
          badge: 'PILOTO',
          raw: p,
        });
      }
    });

    // Search Walkthrough (Chapters and Chests)
    walkthroughData.forEach((act) => {
      (act.chapters || []).forEach((chap: any) => {
        if (chap.title.toLowerCase().includes(q) || (chap.location && chap.location.toLowerCase().includes(q))) {
          items.push({
            id: `chap-${chap.id}`,
            category: 'walkthrough',
            categoryLabel: 'Detonado',
            title: chap.title,
            subtitle: `${act.title} — ${chap.location || act.region}`,
            badge: 'CAPÍTULO',
            raw: chap,
          });
        }
        (chap.chests || []).forEach((chest: any) => {
          if (chest.item.toLowerCase().includes(q) || chest.location.toLowerCase().includes(q)) {
            items.push({
              id: `chest-${chest.id}`,
              category: 'walkthrough',
              categoryLabel: 'Baú / Item',
              title: `Baú: ${chest.item}`,
              subtitle: `${chap.title} (${chest.location})`,
              badge: chest.type.toUpperCase(),
              raw: chest,
            });
          }
        });
      });
    });

    return items.slice(0, 30);
  }, [query, bestiaryData, missablesData, mobilesuitsData, weaponsData, pilotsData, walkthroughData]);

  const handleSelect = (item: SearchResultItem) => {
    sound.play('click');
    onNavigate(item.category, item.raw);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < results.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#090f20] border-2 border-ps2-glow rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search header input */}
        <div className="flex items-center px-4 py-3 border-b border-ps2-border bg-[#050812]">
          <Search className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Buscar inimigos, drops, mobile suits, armas, baús, missables... (ex: Black Assassin)"
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white p-1 text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="ml-3 px-1.5 py-0.5 rounded bg-blue-950 border border-ps2-border text-[10px] text-cyan-400 font-mono">
            ESC
          </span>
        </div>

        {/* Results container */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30 text-cyan-400" />
              <p>Digite para pesquisar em toda a enciclopédia, bestiário e detonado.</p>
              <p className="mt-1 font-mono text-[10px] text-slate-600">
                Atalhos: [↑] [↓] Navegar &nbsp;|&nbsp; [ENTER] Selecionar &nbsp;|&nbsp; [ESC] Fechar
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono">
              Nenhum resultado encontrado para &quot;{query}&quot;.
            </div>
          ) : (
            results.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-3 py-2 rounded flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-900/60 border-l-4 border-cyan-400 text-white'
                      : 'hover:bg-blue-950/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="p-1.5 rounded bg-black/40 text-cyan-400 flex-shrink-0">
                      {item.category === 'bestiary' && <Skull className="w-4 h-4 text-rose-400" />}
                      {item.category === 'missables' && <ShieldAlert className="w-4 h-4 text-amber-400" />}
                      {item.category === 'walkthrough' && <BookOpen className="w-4 h-4 text-cyan-400" />}
                      {item.category === 'database' && <Database className="w-4 h-4 text-indigo-400" />}
                      {item.category === 'pilots' && <Users className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs truncate text-white">{item.title}</span>
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/60 font-mono text-cyan-300 border border-ps2-border">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate font-mono mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0 ml-2" />
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-ps2-border bg-[#050812] flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>{results.length} resultados encontrados</span>
          <span className="text-cyan-500">Pressione 1-6 para trocar de aba a qualquer momento</span>
        </div>
      </div>
    </div>
  );
};
