import React, { useState, useEffect, useRef } from 'react';
import { Act, Chapter, MissableAlert, LiveGameState } from '../types';
import {
  CheckSquare,
  Square,
  AlertTriangle,
  Skull,
  Shield,
  MapPin,
  ChevronRight,
  PackageCheck,
  Lock,
  Key,
  EyeOff,
  Filter,
  Radio,
  Compass,
} from 'lucide-react';
import { sound } from '../utils/sound';

interface WalkthroughViewProps {
  acts: Act[];
  missables: MissableAlert[];
  gameState?: LiveGameState;
}

export const WalkthroughView: React.FC<WalkthroughViewProps> = ({ acts, missables, gameState }) => {
  const [selectedActId, setSelectedActId] = useState<string>(() => {
    try {
      return localStorage.getItem('ms_saga_active_act') || acts[0]?.id || '';
    } catch {
      return acts[0]?.id || '';
    }
  });

  const [selectedChapterId, setSelectedChapterId] = useState<string>(() => {
    try {
      return localStorage.getItem('ms_saga_active_chapter') || acts[0]?.chapters[0]?.id || '';
    } catch {
      return acts[0]?.chapters[0]?.id || '';
    }
  });

  const [chestFilter, setChestFilter] = useState<'all' | 'pending' | 'locked' | 'missable'>('all');
  const [autoTrack, setAutoTrack] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ms_saga_autotrack') === 'true'; // Manual by default
    } catch {
      return false;
    }
  });
  const lastAlertedLocation = useRef<string>('');

  useEffect(() => {
    try {
      localStorage.setItem('ms_saga_active_act', selectedActId);
      localStorage.setItem('ms_saga_active_chapter', selectedChapterId);
    } catch {}
  }, [selectedActId, selectedChapterId]);

  useEffect(() => {
    try {
      localStorage.setItem('ms_saga_autotrack', String(autoTrack));
    } catch {}
  }, [autoTrack]);

  // Persistent user checklist state
  const [checkedObjectives, setCheckedObjectives] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('ms_saga_obj_checklist');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [checkedChests, setCheckedChests] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('ms_saga_chests_checklist');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('ms_saga_obj_checklist', JSON.stringify(checkedObjectives));
  }, [checkedObjectives]);

  useEffect(() => {
    localStorage.setItem('ms_saga_chests_checklist', JSON.stringify(checkedChests));
  }, [checkedChests]);

  // Find which chapter matches the live emulator location
  const detectedLive = React.useMemo(() => {
    if (!gameState?.connected) return null;
    const locName = (gameState.currentLocationName || '').toLowerCase();
    
    // Ignore generic states like combat, camp menu, world map, or title
    if (!locName || locName.includes('combate') || locName.includes('acampamento') || locName.includes('principal') || locName.includes('mundo')) {
      return null;
    }

    // First, try matching within the currently active Act to prevent jumping ahead in story
    const currentActObj = acts.find((a) => a.id === selectedActId);
    if (currentActObj) {
      for (const ch of currentActObj.chapters) {
        if (ch.location && (ch.location.toLowerCase().includes(locName) || locName.includes(ch.location.toLowerCase()))) {
          return { actId: currentActObj.id, chapterId: ch.id, title: ch.title, location: ch.location };
        }
      }
    }

    // Only if not found in current Act, check other acts
    for (const act of acts) {
      for (const ch of act.chapters) {
        if (ch.location && (ch.location.toLowerCase().includes(locName) || locName.includes(ch.location.toLowerCase()))) {
          return { actId: act.id, chapterId: ch.id, title: ch.title, location: ch.location };
        }
      }
    }
    return null;
  }, [gameState?.connected, gameState?.currentLocationName, selectedActId, acts]);

  // Auto-sync when emulator map changes
  useEffect(() => {
    if (autoTrack && detectedLive) {
      if (detectedLive.actId !== selectedActId || detectedLive.chapterId !== selectedChapterId) {
        setSelectedActId(detectedLive.actId);
        setSelectedChapterId(detectedLive.chapterId);

        // Check if new location has missables and warn the user
        const targetAct = acts.find((a) => a.id === detectedLive.actId);
        const targetCh = targetAct?.chapters.find((c) => c.id === detectedLive.chapterId);
        if (targetCh && targetCh.missable_ids && targetCh.missable_ids.length > 0) {
          if (lastAlertedLocation.current !== detectedLive.chapterId) {
            sound.play('alert');
            lastAlertedLocation.current = detectedLive.chapterId;
          }
        }
      }
    }
  }, [autoTrack, detectedLive, selectedActId, selectedChapterId, acts]);

  const toggleObjective = (id: string) => {
    sound.play('toggle');
    setCheckedObjectives((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleChest = (id: string) => {
    sound.play('toggle');
    setCheckedChests((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const currentAct = acts.find((a) => a.id === selectedActId) || acts[0];
  const currentChapter: Chapter | undefined =
    currentAct?.chapters.find((c) => c.id === selectedChapterId) || currentAct?.chapters[0];

  const chapterMissables = missables.filter((m) =>
    currentChapter?.missable_ids?.includes(m.id)
  );

  const chapterChests = currentChapter?.chests || [];
  const openedChapterChests = chapterChests.filter((c) => checkedChests[c.id]).length;

  const filteredChests = chapterChests.filter((chest) => {
    const isOpened = !!checkedChests[chest.id];
    if (chestFilter === 'pending') return !isOpened;
    if (chestFilter === 'locked') return chest.type === 'locked' || chest.type === 'lockpick';
    if (chestFilter === 'missable') return chest.is_missable || chest.type === 'missable' || chest.type === 'hidden';
    return true;
  });

  return (
    <div className="flex h-full gap-4 p-4 overflow-hidden">
      {/* Sidebar: Navigation Acts & Chapters */}
      <aside className="w-80 flex-shrink-0 flex flex-col ps2-panel rounded p-3 overflow-y-auto space-y-4">
        {/* Header & Auto-Track Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
              CAMPANHA PRINCIPAL
            </span>
            {gameState?.connected && (
              <button
                onClick={() => {
                  sound.play('click');
                  setAutoTrack((prev) => !prev);
                }}
                title="Sincronizar automaticamente com a área atual do jogo"
                className={`text-[9px] font-mono px-2 py-0.5 rounded border flex items-center space-x-1 ${
                  autoTrack
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                    : 'bg-black/40 text-slate-400 border-ps2-border'
                }`}
              >
                <Compass className={`w-3 h-3 ${autoTrack ? 'animate-spin' : ''}`} />
                <span>AUTO-GPS: {autoTrack ? 'ON' : 'OFF'}</span>
              </button>
            )}
          </div>
          <h2 className="text-sm font-bold text-white border-b border-ps2-border pb-1">
            ROTEIRO & CAPÍTULOS
          </h2>
        </div>

        {/* Live Detected Jump Pill */}
        {detectedLive && (detectedLive.actId !== selectedActId || detectedLive.chapterId !== selectedChapterId) && (
          <button
            onClick={() => {
              sound.play('click');
              setSelectedActId(detectedLive.actId);
              setSelectedChapterId(detectedLive.chapterId);
            }}
            className="w-full p-2 bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-500/80 rounded text-left text-xs text-cyan-200 flex items-center justify-between shadow-glow-cyan animate-pulse"
          >
            <div className="flex items-center space-x-2 truncate">
              <Radio className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span className="truncate font-semibold">Ir para: {detectedLive.title}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          </button>
        )}

        <div className="space-y-3">
          {acts.map((act) => {
            const isActSelected = act.id === selectedActId;
            return (
              <div key={act.id} className="space-y-1">
                <button
                  onClick={() => {
                    sound.play('click');
                    setSelectedActId(act.id);
                    if (act.chapters[0]) setSelectedChapterId(act.chapters[0].id);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs font-bold transition-all flex items-center justify-between ${
                    isActSelected
                      ? 'bg-blue-900/60 text-cyan-300 border-l-2 border-cyan-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span className="truncate">{act.title}</span>
                  <span className="text-[10px] px-1 py-0.5 rounded bg-black/40 text-cyan-500 font-mono">
                    {act.region}
                  </span>
                </button>

                {isActSelected && (
                  <div className="pl-3 space-y-1 border-l border-ps2-border/60 ml-2">
                    {act.chapters.map((ch) => {
                      const isChSelected = ch.id === selectedChapterId;
                      const isLiveMatch = detectedLive?.chapterId === ch.id;
                      const hasMissable = ch.missable_ids && ch.missable_ids.length > 0;
                      const totalC = ch.chests.length;
                      const openedC = ch.chests.filter((c) => checkedChests[c.id]).length;

                      return (
                        <button
                          key={ch.id}
                          onClick={() => {
                            sound.play('click');
                            setSelectedChapterId(ch.id);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded text-xs transition-all flex items-center justify-between group ${
                            isChSelected
                              ? 'bg-cyan-950/70 text-cyan-300 font-semibold border border-cyan-500/50 shadow-glow-cyan'
                              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/30'
                          }`}
                        >
                          <div className="flex items-center space-x-1.5 truncate">
                            {isLiveMatch ? (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1" />
                            ) : hasMissable ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 animate-pulse" />
                            ) : null}
                            <span className="truncate">{ch.title}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {isLiveMatch && (
                              <span className="text-[8px] bg-emerald-950 text-emerald-300 border border-emerald-500 px-1 rounded font-mono">
                                LIVE
                              </span>
                            )}
                            <span className={`text-[10px] font-mono ${openedC === totalC && totalC > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                              {openedC}/{totalC}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col ps2-panel rounded p-4 overflow-y-auto space-y-5">
        {currentChapter ? (
          <>
            {/* Chapter Header */}
            <div className="border-b border-ps2-border pb-3 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{currentChapter.location}</span>
                  {detectedLive?.chapterId === currentChapter.id && (
                    <span className="ml-2 text-[9px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500 font-mono font-bold animate-pulse">
                      📍 LOCALIZAÇÃO ATUAL DO JOGADOR
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-white tracking-wide">
                  {currentChapter.title}
                </h1>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {currentChapter.summary}
                </p>
              </div>

              {/* Stats Badge */}
              <div className="flex flex-col items-end space-y-1">
                <span className="text-[10px] uppercase font-bold text-cyan-400">Progresso de Baús</span>
                <div className="flex items-center space-x-2 bg-black/60 border border-ps2-border px-3 py-1 rounded">
                  <PackageCheck className="w-4 h-4 text-amber-400" />
                  <span className="font-mono text-xs font-bold text-white">
                    {openedChapterChests} / {chapterChests.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Missables Warnings */}
            {chapterMissables.length > 0 && (
              <div className="space-y-3">
                {chapterMissables.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded bg-rose-950/40 border border-rose-500/80 shadow-glow-danger text-rose-200"
                  >
                    <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wider text-rose-400">
                      <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                      <span>ALERTA DE ITEM / EVENTO PERDÍVEL: {alert.title}</span>
                    </div>
                    <p className="text-xs mt-1.5 text-slate-200 font-semibold leading-relaxed">
                      {alert.instructions}
                    </p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[10px] text-rose-300 font-mono bg-black/40 p-2 rounded border border-rose-900/60">
                      <span>PONTO DE CORTE: {alert.cutoff_point}</span>
                      <span>•</span>
                      <span>CONSEQUÊNCIA: {alert.consequence}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Objectives Checklist */}
            <section className="space-y-3">
              <div className="flex items-center justify-between border-b border-ps2-border/60 pb-1">
                <div className="flex items-center space-x-2 text-cyan-400">
                  <CheckSquare className="w-4 h-4" />
                  <h2 className="text-sm font-bold uppercase tracking-wider">
                    Checklist de Objetivos & Roteiro Canônico
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {currentChapter.objectives.filter((o) => checkedObjectives[o.id]).length} de {currentChapter.objectives.length} concluídos
                </span>
              </div>

              <div className="space-y-2.5">
                {currentChapter.objectives.map((obj, idx) => {
                  const isChecked = !!checkedObjectives[obj.id];
                  return (
                    <div
                      key={obj.id}
                      onClick={() => toggleObjective(obj.id)}
                      className={`cursor-pointer p-3 rounded border transition-all flex items-start space-x-3 ${
                        isChecked
                          ? 'bg-black/40 border-slate-800 text-slate-500 opacity-60'
                          : obj.highlight
                          ? 'bg-amber-950/20 border-amber-500/70 text-slate-100 hover:border-amber-400 shadow-sm'
                          : 'bg-blue-950/30 border-ps2-border text-slate-200 hover:border-cyan-400'
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-cyan-500" />
                        ) : (
                          <Square className={`w-4 h-4 ${obj.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className={`text-xs font-bold ${isChecked ? 'line-through text-slate-500' : 'text-white'}`}>
                            Passo {idx + 1}: {obj.text}
                          </span>
                          {obj.highlight && !isChecked && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/50 px-1.5 py-0.2 rounded font-mono font-bold">
                              PRIORIDADE
                            </span>
                          )}
                        </div>
                        {obj.hint && (
                          <p className={`text-[11px] leading-relaxed ${isChecked ? 'text-slate-600 line-through' : 'text-slate-300'}`}>
                            {obj.hint}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Chests & Items Checklist */}
            <section className="space-y-3">
              <div className="flex items-center justify-between border-b border-ps2-border/60 pb-1 flex-wrap gap-2">
                <div className="flex items-center space-x-2 text-amber-400">
                  <PackageCheck className="w-4 h-4" />
                  <h2 className="text-sm font-bold uppercase tracking-wider">
                    Baús e Itens Ocultos da Localidade ({chapterChests.length})
                  </h2>
                </div>

                {/* Filter pills */}
                <div className="flex items-center space-x-1 text-xs">
                  <button
                    onClick={() => {
                      sound.play('click');
                      setChestFilter('all');
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      chestFilter === 'all'
                        ? 'bg-amber-500 text-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Todos ({chapterChests.length})
                  </button>
                  <button
                    onClick={() => {
                      sound.play('click');
                      setChestFilter('pending');
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      chestFilter === 'pending'
                        ? 'bg-amber-500 text-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Pendentes ({chapterChests.length - openedChapterChests})
                  </button>
                  <button
                    onClick={() => {
                      sound.play('click');
                      setChestFilter('locked');
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      chestFilter === 'locked'
                        ? 'bg-amber-500 text-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Trancados
                  </button>
                  <button
                    onClick={() => {
                      sound.play('click');
                      setChestFilter('missable');
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      chestFilter === 'missable'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Perdíveis / Ocultos
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredChests.map((chest) => {
                  const isOpened = !!checkedChests[chest.id];
                  const isLocked = chest.type === 'locked';
                  const isLockpick = chest.type === 'lockpick';
                  const isHidden = chest.type === 'hidden';
                  const isKeyItem = chest.type === 'key_item';

                  return (
                    <div
                      key={chest.id}
                      onClick={() => toggleChest(chest.id)}
                      className={`cursor-pointer p-3 rounded border transition-all flex items-start justify-between ${
                        isOpened
                          ? 'bg-black/40 border-slate-700 text-slate-500'
                          : chest.is_missable
                          ? 'bg-rose-950/50 border-rose-500 text-rose-200 shadow-glow-danger'
                          : isLocked
                          ? 'bg-amber-950/30 border-amber-500/70 text-slate-200 hover:border-amber-400'
                          : isLockpick
                          ? 'bg-violet-950/30 border-violet-500/70 text-slate-200 hover:border-violet-400'
                          : 'bg-blue-950/40 border-ps2-border text-slate-200 hover:border-cyan-400'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-bold flex items-center space-x-1.5 flex-wrap">
                          <span>{chest.item}</span>
                          {chest.is_missable && (
                            <span className="text-[9px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-mono font-bold animate-pulse">
                              PERDÍVEL
                            </span>
                          )}
                          {isLocked && (
                            <span className="text-[9px] bg-amber-500/30 text-amber-300 border border-amber-500/50 px-1 py-0.2 rounded flex items-center space-x-1 font-mono">
                              <Lock className="w-2.5 h-2.5 inline" />
                              <span>HACK TOOL</span>
                            </span>
                          )}
                          {isLockpick && (
                            <span className="text-[9px] bg-violet-500/30 text-violet-300 border border-violet-500/50 px-1 py-0.2 rounded flex items-center space-x-1 font-mono">
                              <Key className="w-2.5 h-2.5 inline" />
                              <span>LOCKPICK</span>
                            </span>
                          )}
                          {isHidden && (
                            <span className="text-[9px] bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 px-1 py-0.2 rounded flex items-center space-x-1 font-mono">
                              <EyeOff className="w-2.5 h-2.5 inline" />
                              <span>OCULTO</span>
                            </span>
                          )}
                          {isKeyItem && (
                            <span className="text-[9px] bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 px-1 py-0.2 rounded font-mono">
                              ITEM CHAVE
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                          <span>{chest.location}</span>
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        checked={isOpened}
                        onChange={() => {}}
                        className="mt-1 rounded border-ps2-border text-cyan-500 focus:ring-0 cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Boss Guide Dossier */}
            {currentChapter.boss && (
              <section className="p-4 rounded bg-gradient-to-br from-red-950/30 to-blue-950/40 border border-red-500/50 space-y-3">
                <div className="flex items-center space-x-2 text-rose-400 border-b border-red-500/40 pb-2">
                  <Skull className="w-5 h-5 text-rose-500" />
                  <div>
                    <span className="text-[10px] text-rose-400/80 uppercase font-mono font-bold">
                      Dossiê de Combate Tático
                    </span>
                    <h2 className="text-base font-bold text-white uppercase tracking-wider">
                      {currentChapter.boss.name}
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-black/50 p-2.5 rounded border border-ps2-border space-y-1">
                    <span className="text-slate-400 font-semibold">Pontos de Vida (HP):</span>
                    <div className="text-emerald-400 font-mono font-bold text-sm">
                      {currentChapter.boss.hp.toLocaleString()} HP
                    </div>
                  </div>

                  <div className="bg-black/50 p-2.5 rounded border border-ps2-border space-y-1">
                    <span className="text-slate-400 font-semibold">Fraquezas Elementais:</span>
                    <div className="text-cyan-300 font-semibold">
                      {currentChapter.boss.weakness}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-300 uppercase">
                    Ataques Críticos e Perigos:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentChapter.boss.danger_attacks.map((atk, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-red-950/80 border border-red-500/40 text-red-200 px-2 py-0.5 rounded font-mono"
                      >
                        ⚠️ {atk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-black/60 p-3 rounded border border-ps2-border/60">
                  <span className="text-xs font-bold text-cyan-400 uppercase block mb-1">
                    Estratégia Recomendada:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentChapter.boss.strategy}
                  </p>
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Selecione um capítulo na barra lateral
          </div>
        )}
      </main>
    </div>
  );
};
