import type { Beast } from '../types';

export const FLAME_DRAGON: Beast = {
  id: 'flame_dragon',
  name: '炎龍',
  emoji: '🐉',
  totalSlots: 50,
  minSlots: 25,
  timeLimit: 4 * 60 * 60,
  prize: 'Nintendo Switch 2',
  prizeValue: '~10,000 TWD',
  slots: [
    { rarity: 'common', price: 99,  count: 15, weight: 1.0,  reward: 'C賞：隨機小物', meltValue: 80 },
    { rarity: 'rare',   price: 109, count: 15, weight: 1.05, reward: 'C賞：精選小物', meltValue: 90 },
    { rarity: 'epic',   price: 119, count: 10, weight: 1.12, reward: 'B賞：中型公仔', meltValue: 100 },
    { rarity: 'legend', price: 129, count: 10, weight: 1.20, reward: 'B賞：精選公仔', meltValue: 115 },
  ],
};

export const NINE_TAIL_FOX: Beast = {
  id: 'nine_tail_fox',
  name: '九尾妖狐',
  emoji: '🦊',
  totalSlots: 30,
  minSlots: 15,
  timeLimit: 2 * 60 * 60,
  prize: 'AirPods Pro 3',
  prizeValue: '~7,500 TWD',
  slots: [
    { rarity: 'common', price: 79,  count: 10, weight: 1.0,  reward: 'C賞：狐火御守', meltValue: 65 },
    { rarity: 'rare',   price: 89,  count: 8,  weight: 1.05, reward: 'C賞：靈狐掛飾', meltValue: 75 },
    { rarity: 'epic',   price: 99,  count: 7,  weight: 1.12, reward: 'B賞：妖狐手辦', meltValue: 85 },
    { rarity: 'legend', price: 109, count: 5,  weight: 1.20, reward: 'B賞：九尾典藏', meltValue: 95 },
  ],
};

export const FROST_WOLF: Beast = {
  id: 'frost_wolf',
  name: '霜狼王',
  emoji: '🐺',
  totalSlots: 40,
  minSlots: 20,
  timeLimit: 3 * 60 * 60,
  prize: 'PS5 數位版',
  prizeValue: '~12,000 TWD',
  slots: [
    { rarity: 'common', price: 119, count: 12, weight: 1.0,  reward: 'C賞：冰牙墜飾', meltValue: 100 },
    { rarity: 'rare',   price: 129, count: 12, weight: 1.05, reward: 'C賞：狼王徽章', meltValue: 110 },
    { rarity: 'epic',   price: 139, count: 8,  weight: 1.12, reward: 'B賞：霜狼雕像', meltValue: 120 },
    { rarity: 'legend', price: 149, count: 8,  weight: 1.20, reward: 'B賞：狼王戰甲模型', meltValue: 135 },
  ],
};

export const THUNDER_EAGLE: Beast = {
  id: 'thunder_eagle',
  name: '雷鷹',
  emoji: '🦅',
  totalSlots: 20,
  minSlots: 10,
  timeLimit: 1 * 60 * 60,
  prize: '鐵三角 ATH-M50x 耳機',
  prizeValue: '~5,000 TWD',
  slots: [
    { rarity: 'common', price: 69, count: 6, weight: 1.0,  reward: 'C賞：雷羽書籤', meltValue: 55 },
    { rarity: 'rare',   price: 79, count: 6, weight: 1.05, reward: 'C賞：鷹眼護符', meltValue: 65 },
    { rarity: 'epic',   price: 85, count: 4, weight: 1.12, reward: 'B賞：雷鷹模型', meltValue: 72 },
    { rarity: 'legend', price: 95, count: 4, weight: 1.20, reward: 'B賞：風暴之翼典藏', meltValue: 82 },
  ],
};

export const SKELETON_GIANT: Beast = {
  id: 'skeleton_giant',
  name: '骸骨巨人',
  emoji: '💀',
  totalSlots: 80,
  minSlots: 40,
  timeLimit: 6 * 60 * 60,
  prize: 'iPad Air M3',
  prizeValue: '~18,000 TWD',
  slots: [
    { rarity: 'common', price: 149, count: 25, weight: 1.0,  reward: 'C賞：亡骨指環', meltValue: 130 },
    { rarity: 'rare',   price: 159, count: 25, weight: 1.05, reward: 'C賞：骸甲碎片', meltValue: 140 },
    { rarity: 'epic',   price: 169, count: 15, weight: 1.12, reward: 'B賞：巨人頭骨模型', meltValue: 150 },
    { rarity: 'legend', price: 179, count: 15, weight: 1.20, reward: 'B賞：死域結晶典藏', meltValue: 165 },
  ],
};

export const ALL_BEASTS: Beast[] = [FLAME_DRAGON, NINE_TAIL_FOX, FROST_WOLF, THUNDER_EAGLE, SKELETON_GIANT];

export const AI_NAMES = [
  '影武者', '月光旅人', '紅蓮騎士', '銀翼獵人', '暗夜行者',
  '雷霆戰神', '星塵漫步', '黑曜忍者', '蒼穹之鷹', '烈焰鳳凰',
  '冰霜領主', '幻影刺客', '聖光守衛', '深淵獵手', '風暴使者',
  '鐵血傭兵', '翠玉弓手', '暗影法師', '龍騎士X', '天命勇者',
];
