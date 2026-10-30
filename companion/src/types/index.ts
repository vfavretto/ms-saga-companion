export interface PilotSkill {
  name: string;
  level: number;
  en_cost: number;
  effect: string;
}

export interface Pilot {
  id: string;
  name: string;
  role: string;
  description: string;
  skills: PilotSkill[];
  strengths: string[];
  join_chapter: string;
}

export interface MobileSuit {
  id: string;
  name: string;
  model_number: string;
  faction: string;
  type: string;
  base_hp: number;
  base_en: number;
  speed: string;
  grid_size: string;
  obtain: string;
  description: string;
  compatible_roles: string[];
}

export interface Weapon {
  id: string;
  name: string;
  category: string;
  damage: number;
  type: string;
  en_cost: number;
  grid: string;
  obtain: string;
  description: string;
}

export interface OptionPart {
  id: string;
  name: string;
  category: string;
  effect: string;
  grid: string;
  obtain: string;
}

export interface MissableAlert {
  id: string;
  title: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  location: string;
  window: string;
  cutoff_point: string;
  consequence: string;
  instructions: string;
}

export interface Chest {
  id: string;
  location: string;
  item: string;
  opened: boolean;
  type?: string;
  req?: string;
  is_missable?: boolean;
}

export interface EnemyDrop {
  item: string;
  rate: string;
}

export interface Enemy {
  id: number;
  number: string;
  name: string;
  aliases?: string[];
  category: string;
  region: string;
  hp: number;
  exp: number;
  gold: number;
  weaknesses: string[];
  drops: EnemyDrop[];
  is_boss: boolean;
  is_rare: boolean;
  is_missable: boolean;
  notes: string;
}

export interface PartyMember {
  slot: number;
  pilotName: string;
  activeMS: string;
  currentHp: number;
  maxHp: number;
  currentEn: number;
  maxEn: number;
  currentTp: number;
  maxTp: number;
  status: string;
}

export interface BossGuide {
  name: string;
  hp: number;
  weakness: string;
  danger_attacks: string[];
  strategy: string;
}

export interface Objective {
  id: string;
  text: string;
  hint?: string;
  highlight?: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  location: string;
  map_id?: number;
  summary: string;
  objectives: Objective[];
  missable_ids: string[];
  chests: Chest[];
  boss: BossGuide | null;
}

export interface Act {
  id: string;
  title: string;
  region: string;
  chapters: Chapter[];
}

export interface LiveGameState {
  connected: boolean;
  emulatorRunning: boolean;
  gameMode: number; // 0=Title, 2=Field/Dungeon, 3=Town, 4=World, 5=Battle
  gameModeName: string;
  mapId: number;
  currentLocationName: string;
  gold: number;
  playTime: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  party: PartyMember[];
  pineEndpoint?: string;
  pineError?: string;
  rawParty?: string[];
}
