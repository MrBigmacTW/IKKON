export interface BladeMaster {
  id: string;
  name: string;
  nameEn: string;
  class: 'sword' | 'mage' | 'archer' | 'tank' | 'support';
  rarity: 'common' | 'rare' | 'epic' | 'legend';
  emoji: string;
  attackLine: string[];
  description: string;
}

export interface Beast {
  id: string;
  name: string;
  emoji: string;
  totalSlots: number;
  minSlots: number;
  timeLimit: number;
  prize: string;
  prizeValue: string;
  slots: SlotConfig[];
}

export interface SlotConfig {
  rarity: 'common' | 'rare' | 'epic' | 'legend';
  price: number;
  count: number;
  weight: number;
  reward: string;
  meltValue: number;
}

export interface RaidState {
  beastId: string;
  raidNumber: number;
  participants: Participant[];
  status: 'recruiting' | 'killing' | 'rewarding' | 'finished';
  timeRemaining: number;
  startedAt: number;
}

export interface Participant {
  id: string;
  playerName: string;
  isAI: boolean;
  blademaster: BladeMaster;
  rarity: string;
  pricePaid: number;
  slotIndex: number;
  damage: number;
  joinedAt: number;
}

export type Rarity = 'common' | 'rare' | 'epic' | 'legend';

export const RARITY_LABELS: Record<Rarity, string> = {
  common: '凡',
  rare: '銳',
  epic: '魂',
  legend: '神',
};

export const RARITY_ICONS: Record<Rarity, string> = {
  common: '⚪',
  rare: '🔵',
  epic: '🟣',
  legend: '🟡',
};

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#8B8B8B',
  rare: '#60A5FA',
  epic: '#A78BFA',
  legend: '#FBBF24',
};

export const CLASS_LABELS: Record<string, string> = {
  sword: '劍士',
  mage: '法師',
  archer: '弓手',
  tank: '重裝',
  support: '輔助',
};
