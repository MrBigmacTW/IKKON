import { FLAME_DRAGON, ALL_BEASTS, AI_NAMES } from '../data/beasts';
import { BLADE_MASTERS } from '../data/blademasters';
import type { Participant, Rarity, RaidState, Beast, BladeMaster } from '../types';

// Simple reactive store
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach((fn) => fn());
}

// ── State ──
export let currentBeast: Beast = FLAME_DRAGON;
export let raid: RaidState = createFreshRaid();
export let playerSoulCoins = 1250;
export let playerTotalJoins = 8;
export let playerJoinsThisRaid = 0;
export let notifications: { id: number; text: string; ts: number }[] = [];
let notifId = 0;
let aiTimerId: ReturnType<typeof setTimeout> | null = null;
let battleLogTimerId: ReturnType<typeof setTimeout> | null = null;

// ── Battle Log ──
export interface BattleLogEntry {
  id: number;
  text: string;
  color: string;
  isCrit: boolean;
  ts: number;
}
export let battleLog: BattleLogEntry[] = [];
let logId = 0;

// ── Beast hit state (for shake animation) ──
export let beastShaking = false;
// ── Attack animation state ──
export let attackingParticipantId: string | null = null;

// ── Reward Ceremony State ──
// slayer = the "final strike" cinematic phase (winner's hero moment)
export type RewardPhase = 'assault' | 'slayer' | 'ranking' | 'roulette' | 'reveal' | 'done';
export let rewardPhase: RewardPhase = 'assault';
export let rewardWinner: Participant | null = null;
export let rewardRanking: Participant[] = [];
export let rouletteHighlightIndex = -1;
export let rouletteFinished = false;
export let playerIsWinner = false;
// Slayer cinematic sub-phases: hpDrain → darken → strike → fall
export let slayerSubPhase: 'hpDrain' | 'darken' | 'strike' | 'fall' = 'hpDrain';

// ── Inventory ──
export interface InventoryItem {
  id: string;
  reward: string;
  rarity: string;
  meltValue: number;
  characterName: string;
  characterEmoji: string;
  characterClass: string;
  isMelted: boolean;
}
export let inventory: InventoryItem[] = [];
export let grandPrizeWon = false;

// ── Danmaku (Barrage) ──
export interface DanmakuItem {
  id: number;
  text: string;
  type: 'emoji' | 'shout' | 'warcry' | 'soulburst';
  y: number; // vertical position %
  ts: number;
}
export let danmakuList: DanmakuItem[] = [];
let danmakuId = 0;
let aiDanmakuTimerId: ReturnType<typeof setTimeout> | null = null;

const AI_DANMAKU_EMOJIS = ['😱', '🔥', '🎉', '😭', '💪', '🤣', '👏', '😍', '🫡', '💯', '🙏', '👀'];
const AI_DANMAKU_SHOUTS = ['加油！', '衝啊！', '太強了', '穩穩的', '我要中', '斬！', '讚讚讚', '好猛', '拜託了', '必中！'];

// ── Soul Burst effect ──
export let soulBurstActive = false;

// ── Soul Divination (魂占) ──
export let divinationBet: string | null = null; // blademaster id
export let divinationResult: 'pending' | 'correct' | 'wrong' | null = null;

// ── Guide ──
export let guideDismissed = false;
export function dismissGuide() { guideDismissed = true; notify(); }

// ── Debug ──
export let debugVisible = false;
export let aiPaused = false;
export let aiSpeedValue = 25; // 0-100 slider, default ~25 (8-15s range)
// Stored ceremony state for replay
let lastCeremonyState: {
  participants: Participant[];
  winner: Participant | null;
  ranking: Participant[];
} | null = null;

// Page routing
export type Page = 'home' | 'beast' | 'select' | 'watching' | 'reward' | 'inventory' | 'rules';
export let currentPage: Page = 'home';

export function navigate(page: Page) {
  currentPage = page;
  notify();
}

// ── Multi-beast pool state ──
export interface BeastPool {
  beast: Beast;
  raid: RaidState;
  battleLog: BattleLogEntry[];
  danmakuList: DanmakuItem[];
}

// Initialize all beast pools
function createFreshRaidForBeast(beast: Beast): RaidState {
  return {
    beastId: beast.id,
    raidNumber: 100 + Math.floor(Math.random() * 200),
    participants: [],
    status: 'recruiting',
    timeRemaining: beast.timeLimit,
    startedAt: Date.now(),
  };
}

const beastPools: Map<string, BeastPool> = new Map();

function initAllPools() {
  for (const beast of ALL_BEASTS) {
    beastPools.set(beast.id, {
      beast,
      raid: createFreshRaidForBeast(beast),
      battleLog: [],
      danmakuList: [],
    });
  }
}
initAllPools();

// Pre-populate each pool with some AI
function prePopulatePool(pool: BeastPool) {
  const saved = { beast: currentBeast, raid, battleLog, danmakuList };
  currentBeast = pool.beast;
  raid = pool.raid;
  battleLog = pool.battleLog;
  danmakuList = pool.danmakuList;

  const preCount = Math.floor(pool.beast.totalSlots * 0.3) + Math.floor(Math.random() * Math.floor(pool.beast.totalSlots * 0.1));
  for (let i = 0; i < preCount; i++) {
    spawnAI();
  }
  pool.raid = raid;
  pool.battleLog = battleLog;

  currentBeast = saved.beast;
  raid = saved.raid;
  battleLog = saved.battleLog;
  danmakuList = saved.danmakuList;
}

// Export list of all beasts for UI
export function getAllBeasts(): Beast[] {
  return ALL_BEASTS;
}

export function getBeastPool(beastId: string): BeastPool | undefined {
  return beastPools.get(beastId);
}

export function selectBeast(beastId: string) {
  const pool = beastPools.get(beastId);
  if (!pool) return;

  // Save current pool state
  const currentPool = beastPools.get(currentBeast.id);
  if (currentPool) {
    currentPool.raid = raid;
    currentPool.battleLog = battleLog;
    currentPool.danmakuList = danmakuList;
  }

  // Stop current timers
  stopAISimulation();
  stopBattleLog();
  stopTimer();
  stopAIDanmaku();

  // Switch to new beast
  currentBeast = pool.beast;
  raid = pool.raid;
  battleLog = pool.battleLog;
  danmakuList = pool.danmakuList;
  playerJoinsThisRaid = raid.participants.filter(p => !p.isAI).length;

  // Restart systems for new beast
  if (raid.status === 'recruiting') {
    startTimer();
    startAISimulation();
    startBattleLog();
    startAIDanmaku();
  }

  navigate('beast');
}

// ── Helpers ──
function createFreshRaid(): RaidState {
  return createFreshRaidForBeast(currentBeast);
}

function getSlotConfig(rarity: Rarity) {
  return currentBeast.slots.find((s) => s.rarity === rarity)!;
}

export function getRemainingSlots(rarity: Rarity): number {
  const cfg = getSlotConfig(rarity);
  const taken = raid.participants.filter((p) => p.rarity === rarity).length;
  return cfg.count - taken;
}

export function getTotalRemaining(): number {
  return currentBeast.totalSlots - raid.participants.length;
}

export function getCharacterUseCount(charId: string): number {
  return raid.participants.filter((p) => p.blademaster.id === charId).length;
}

export function isCharacterAvailable(charId: string): boolean {
  return getCharacterUseCount(charId) < 2;
}

export function getPlayerParticipants(): Participant[] {
  return raid.participants.filter((p) => !p.isAI);
}

export function getTotalWeight(): number {
  return raid.participants.reduce((sum, p) => {
    const config = currentBeast.slots.find(s => s.rarity === p.rarity);
    return sum + (config?.weight || 1);
  }, 0);
}

export function getAICount(): number {
  return raid.participants.filter(p => p.isAI).length;
}

// ── Actions ──
export function addNotification(text: string) {
  const id = ++notifId;
  notifications = [{ id, text, ts: Date.now() }, ...notifications].slice(0, 20);
  notify();
  setTimeout(() => {
    notifications = notifications.filter((n) => n.id !== id);
    notify();
  }, 5000);
}

export function joinRaid(blademaster: BladeMaster, rarity: Rarity, isAI: boolean, playerName?: string): boolean {
  if (getRemainingSlots(rarity) <= 0) return false;
  if (!isCharacterAvailable(blademaster.id)) return false;
  if (raid.status !== 'recruiting') return false;

  const cfg = getSlotConfig(rarity);
  const participant: Participant = {
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    playerName: playerName || (isAI ? AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)] : '你'),
    isAI,
    blademaster,
    rarity,
    pricePaid: cfg.price,
    slotIndex: raid.participants.length,
    damage: Math.floor(Math.random() * 9000) + 1000,
    joinedAt: Date.now(),
  };

  raid = { ...raid, participants: [...raid.participants, participant] };

  if (!isAI) {
    playerJoinsThisRaid++;
    playerTotalJoins++;
  }

  const name = isAI ? `${blademaster.name}(${participant.playerName})` : `${blademaster.name}(你)`;
  addNotification(`⚔️ ${name} 加入討伐！`);

  // Check if raid is full
  if (raid.participants.length >= currentBeast.totalSlots && raid.status !== 'killing') {
    raid = { ...raid, status: 'killing' };
    addNotification('🐉 災獸魂力歸零！進入擊殺階段！');
  }

  notify();
  return true;
}

// ── AI System ──
function spawnAI() {
  if (raid.status !== 'recruiting') return;
  if (raid.participants.length >= currentBeast.totalSlots) return;

  const roll = Math.random();
  let rarity: Rarity;
  if (roll < 0.6) rarity = 'common';
  else if (roll < 0.85) rarity = 'rare';
  else if (roll < 0.95) rarity = 'epic';
  else rarity = 'legend';

  if (getRemainingSlots(rarity) <= 0) {
    const fallback: Rarity[] = ['common', 'rare', 'epic', 'legend'];
    const available = fallback.find((r) => getRemainingSlots(r) > 0);
    if (!available) return;
    rarity = available;
  }

  const candidates = BLADE_MASTERS.filter(
    (bm) => bm.rarity === rarity && isCharacterAvailable(bm.id)
  );
  if (candidates.length === 0) {
    const any = BLADE_MASTERS.filter((bm) => isCharacterAvailable(bm.id) && getRemainingSlots(bm.rarity) > 0);
    if (any.length === 0) return;
    const pick = any[Math.floor(Math.random() * any.length)];
    joinRaid(pick, pick.rarity as Rarity, true);
    return;
  }

  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  joinRaid(pick, rarity, true);
}

function getAIDelayMs(): number {
  const base = 1000 + ((100 - aiSpeedValue) / 100) * 29000;
  const jitter = base * 0.2;
  return base - jitter + Math.random() * jitter * 2;
}

function scheduleNextAI() {
  if (aiTimerId) clearTimeout(aiTimerId);
  if (aiPaused) return;
  const delay = getAIDelayMs();
  aiTimerId = setTimeout(() => {
    spawnAI();
    scheduleNextAI();
  }, delay);
}

export function startAISimulation() {
  scheduleNextAI();
}

export function stopAISimulation() {
  if (aiTimerId) {
    clearTimeout(aiTimerId);
    aiTimerId = null;
  }
}

// ── Timer ──
let timerInterval: ReturnType<typeof setInterval> | null = null;

export function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (raid.timeRemaining > 0 && raid.status === 'recruiting') {
      raid = { ...raid, timeRemaining: raid.timeRemaining - 1 };
      if (raid.timeRemaining <= 0) {
        handleTimeExpired();
      }
      notify();
    }
  }, 1000);
}

export function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function handleTimeExpired() {
  if (raid.participants.length >= currentBeast.minSlots) {
    raid = { ...raid, status: 'killing' };
    addNotification('⏰ 時限到！災獸被強制擊殺！');
    notify();
    setTimeout(() => triggerRewardCeremony(), 1500);
  } else {
    raid = { ...raid, status: 'finished' };
    addNotification('💨 時限到！災獸遁逃了...參戰者獲得退款。');
    stopAISimulation();
    stopBattleLog();
    stopAIDanmaku();
    notify();
  }
}

// ── Init ──
export function initRaid() {
  // Re-init all pools
  initAllPools();

  // Pre-populate each pool
  for (const pool of beastPools.values()) {
    prePopulatePool(pool);
  }

  // Set current to flame dragon
  currentBeast = FLAME_DRAGON;
  const pool = beastPools.get(FLAME_DRAGON.id)!;
  raid = pool.raid;
  battleLog = pool.battleLog;
  danmakuList = pool.danmakuList;
  playerJoinsThisRaid = 0;
  notifications = [];

  divinationBet = null;
  divinationResult = null;

  startTimer();
  startAISimulation();
  startBattleLog();
  startAIDanmaku();
  notify();
}

// ── Battle Log System ──
const BEAST_ATTACKS_MAP: Record<string, string[]> = {
  flame_dragon: [
    '🐉 炎龍反擊！噴出烈焰吐息！',
    '🐉 炎龍怒吼！火焰風暴席捲戰場！',
    '🐉 炎龍拍擊地面！岩漿四濺！',
    '🐉 炎龍甩尾攻擊！衝擊波擴散！',
    '🐉 炎龍展開雙翼！灼熱氣流籠罩全場！',
  ],
  nine_tail_fox: [
    '🦊 妖狐施展幻術！鬼火四散！',
    '🦊 妖狐九尾齊振！靈壓爆發！',
    '🦊 妖狐化身千影！迷惑全場！',
    '🦊 妖狐放出妖火！灼燒大地！',
    '🦊 妖狐嘯月長嚎！精神衝擊！',
  ],
  frost_wolf: [
    '🐺 霜狼王撕咬反擊！冰霜迸裂！',
    '🐺 霜狼王冰嘯長嚎！暴風雪席捲！',
    '🐺 霜狼王凍息吐出！大地結冰！',
    '🐺 霜狼王召喚狼群！包圍攻擊！',
    '🐺 霜狼王躍起猛撲！冰爪連斬！',
  ],
  thunder_eagle: [
    '🦅 雷鷹俯衝攻擊！雷電劈落！',
    '🦅 雷鷹振翅引雷！電弧四射！',
    '🦅 雷鷹高空盤旋！落雷轟擊！',
    '🦅 雷鷹尖嘯破空！音波衝擊！',
    '🦅 雷鷹放出電球！連鎖閃電！',
  ],
  skeleton_giant: [
    '💀 骸骨巨人揮拳砸地！地面崩裂！',
    '💀 骸骨巨人吐出死氣！腐蝕全場！',
    '💀 骸骨巨人召喚骸兵！蜂擁而出！',
    '💀 骸骨巨人怒吼！死亡波動擴散！',
    '💀 骸骨巨人踐踏大地！骨刺突起！',
  ],
};

function getBeastAttacks(): string[] {
  return BEAST_ATTACKS_MAP[currentBeast.id] || BEAST_ATTACKS_MAP.flame_dragon;
}

const CLASS_TAGS: Record<string, string> = {
  sword: '⟐',
  mage: '◈',
  archer: '⟁',
  tank: '⬡',
  support: '✦',
};

const DAMAGE_RANGES: Record<string, [number, number]> = {
  common: [2000, 8000],
  rare: [5000, 12000],
  epic: [8000, 18000],
  legend: [12000, 30000],
};

function generateBattleLogEntry(): BattleLogEntry | null {
  if (raid.participants.length === 0) return null;

  if (Math.random() < 0.05) {
    const attacks = getBeastAttacks();
    const text = attacks[Math.floor(Math.random() * attacks.length)];
    return { id: ++logId, text, color: '#f87171', isCrit: false, ts: Date.now() };
  }

  const p = raid.participants[Math.floor(Math.random() * raid.participants.length)];
  const line = p.blademaster.attackLine[Math.floor(Math.random() * p.blademaster.attackLine.length)];
  const [min, max] = DAMAGE_RANGES[p.rarity] || DAMAGE_RANGES.common;
  let dmg = Math.floor(Math.random() * (max - min)) + min;
  const isCrit = Math.random() < 0.1;
  if (isCrit) dmg *= 2;

  const dmgText = dmg.toLocaleString();
  const critText = isCrit ? '（暴擊！）' : '';
  const classTag = CLASS_TAGS[p.blademaster.class] || '◆';
  const text = `${classTag} ${line}造成 ${dmgText} 傷害！${critText}`;

  let color = '#e0e0e0';
  if (isCrit) color = '#ffd700';
  else if (p.rarity === 'legend') color = '#FBBF24';
  else if (p.rarity === 'epic') color = '#A78BFA';

  return { id: ++logId, text, color, isCrit, ts: Date.now() };
}

function tickBattleLog() {
  const entry = generateBattleLogEntry();
  if (entry) {
    battleLog = [entry, ...battleLog].slice(0, 50);

    if (!entry.text.startsWith('🐉')) {
      beastShaking = true;
      setTimeout(() => {
        beastShaking = false;
        notify();
      }, 400);
    }

    if (raid.participants.length > 0 && !entry.text.startsWith('🐉')) {
      const attacker = raid.participants[Math.floor(Math.random() * raid.participants.length)];
      attackingParticipantId = attacker.id;
      setTimeout(() => {
        attackingParticipantId = null;
        notify();
      }, 600);
    }

    notify();
  }
}

function scheduleNextBattleLog() {
  const delay = 2000 + Math.random() * 1000;
  battleLogTimerId = setTimeout(() => {
    tickBattleLog();
    scheduleNextBattleLog();
  }, delay);
}

export function startBattleLog() {
  if (battleLogTimerId) return;
  scheduleNextBattleLog();
}

export function stopBattleLog() {
  if (battleLogTimerId) {
    clearTimeout(battleLogTimerId);
    battleLogTimerId = null;
  }
}

// ── Low HP helpers ──
export function isLowHP(): boolean {
  return getTotalRemaining() <= 10 && getTotalRemaining() > 1;
}

export function isLastSlot(): boolean {
  return getTotalRemaining() === 1;
}

// ── Reward Ceremony ──
const FINAL_DAMAGE_RANGES: Record<string, [number, number]> = {
  common: [10000, 20000],
  rare: [20000, 40000],
  epic: [40000, 80000],
  legend: [80000, 150000],
};

function drawWinner(participants: Participant[]): Participant {
  const totalWeight = participants.reduce((sum, p) => {
    const config = currentBeast.slots.find(s => s.rarity === p.rarity);
    return sum + (config?.weight || 1);
  }, 0);
  let random = Math.random() * totalWeight;
  for (const p of participants) {
    const config = currentBeast.slots.find(s => s.rarity === p.rarity);
    random -= (config?.weight || 1);
    if (random <= 0) return p;
  }
  return participants[participants.length - 1];
}

let ceremonyTimeouts: ReturnType<typeof setTimeout>[] = [];

function clearCeremonyTimeouts() {
  ceremonyTimeouts.forEach(t => clearTimeout(t));
  ceremonyTimeouts = [];
}

export function triggerRewardCeremony() {
  stopAISimulation();
  stopBattleLog();
  stopTimer();
  stopAIDanmaku();
  clearCeremonyTimeouts();

  raid = { ...raid, status: 'rewarding' };

  // 1. RNG determines winner FIRST
  rewardWinner = drawWinner(raid.participants);
  playerIsWinner = !rewardWinner.isAI;

  // 2. Generate damage ranking — force winner to #1 (1.5× the runner-up)
  const ranked = raid.participants.map(p => {
    const [min, max] = FINAL_DAMAGE_RANGES[p.rarity] || FINAL_DAMAGE_RANGES.common;
    return { ...p, damage: Math.floor(Math.random() * (max - min)) + min };
  }).sort((a, b) => b.damage - a.damage);

  // Force winner's damage to be 1.5× the current #1 (or at least very high)
  const winnerIdx = ranked.findIndex(p => p.id === rewardWinner!.id);
  const currentTop = ranked[0].damage;
  if (winnerIdx !== 0) {
    // Swap winner to top and set damage
    const winnerEntry = ranked.splice(winnerIdx, 1)[0];
    winnerEntry.damage = Math.floor(currentTop * 1.5);
    ranked.unshift(winnerEntry);
  } else {
    // Winner is already #1, ensure big gap with #2
    if (ranked.length > 1) {
      ranked[0].damage = Math.floor(ranked[1].damage * 1.5);
    }
  }
  rewardRanking = ranked;

  // Save for replay
  lastCeremonyState = {
    participants: [...raid.participants],
    winner: rewardWinner,
    ranking: [...rewardRanking],
  };

  // Build inventory for player
  const playerParts = raid.participants.filter(p => !p.isAI);
  inventory = playerParts.map(p => {
    const cfg = currentBeast.slots.find(s => s.rarity === p.rarity)!;
    return {
      id: p.id,
      reward: cfg.reward,
      rarity: p.rarity,
      meltValue: cfg.meltValue,
      characterName: p.blademaster.name,
      characterEmoji: p.blademaster.emoji,
      characterClass: p.blademaster.class,
      isMelted: false,
    };
  });

  grandPrizeWon = playerIsWinner;

  // Start the ceremony
  // Phase 1: Assault (0s) — everyone attacks
  rewardPhase = 'assault';
  rouletteHighlightIndex = -1;
  rouletteFinished = false;
  currentPage = 'reward';
  notify();

  // Phase 2: Slayer cinematic (5s) — winner's hero moment
  const t1 = setTimeout(() => {
    rewardPhase = 'slayer';
    slayerSubPhase = 'hpDrain';
    notify();
    // Sub-phase timeline within slayer
    const s1 = setTimeout(() => { slayerSubPhase = 'darken'; notify(); }, 2000);
    const s2 = setTimeout(() => { slayerSubPhase = 'strike'; notify(); }, 3500);
    const s3 = setTimeout(() => { slayerSubPhase = 'fall'; notify(); }, 5000);
    ceremonyTimeouts.push(s1, s2, s3);
  }, 5000);
  ceremonyTimeouts.push(t1);

  // Phase 3: Ranking (12s)
  const t2 = setTimeout(() => {
    rewardPhase = 'ranking';
    notify();
  }, 12000);
  ceremonyTimeouts.push(t2);

  // Phase 4: Roulette (20s)
  const t3 = setTimeout(() => {
    rewardPhase = 'roulette';
    notify();
    startRoulette();
  }, 20000);
  ceremonyTimeouts.push(t3);
}

// ── Roulette Animation ──
let rouletteTimerId: ReturnType<typeof setTimeout> | null = null;

export function stopRoulette() {
  if (rouletteTimerId) {
    clearTimeout(rouletteTimerId);
    rouletteTimerId = null;
  }
}

function startRoulette() {
  const totalParticipants = raid.participants.length;
  if (totalParticipants === 0) return;

  const winnerIndex = raid.participants.findIndex(p => p.id === rewardWinner!.id);

  let currentIndex = 0;
  let speed = 80;
  const startTime = Date.now();
  const fastDuration = 3000;
  const totalDuration = 11000;

  function tick() {
    const elapsed = Date.now() - startTime;

    if (elapsed > totalDuration) {
      rouletteHighlightIndex = winnerIndex;
      rouletteFinished = false;
      notify();

      setTimeout(() => {
        rouletteFinished = true;
        rewardPhase = 'reveal';
        checkDivination();
        notify();

        setTimeout(() => {
          rewardPhase = 'done';
          currentPage = 'inventory';
          notify();
        }, 5000);
      }, 500);
      return;
    }

    rouletteHighlightIndex = currentIndex % totalParticipants;
    notify();

    if (elapsed < fastDuration) {
      speed = 80;
    } else {
      const progress = (elapsed - fastDuration) / (totalDuration - fastDuration);
      const eased = progress * progress * progress;
      speed = 80 + eased * 500;

      if (progress > 0.85) {
        const stepsRemaining = Math.ceil((totalDuration - elapsed) / speed);
        const distToWinner = ((winnerIndex - (currentIndex % totalParticipants)) + totalParticipants) % totalParticipants;
        if (distToWinner <= stepsRemaining + 1) {
          // natural landing
        } else if (stepsRemaining > 0) {
          currentIndex = winnerIndex - stepsRemaining + totalParticipants * 10;
        }
      }
    }

    currentIndex++;
    rouletteTimerId = setTimeout(tick, speed);
  }

  tick();
}

export function meltItem(itemId: string) {
  const item = inventory.find(i => i.id === itemId);
  if (item && !item.isMelted) {
    item.isMelted = true;
    playerSoulCoins += item.meltValue;
    inventory = [...inventory];
    notify();
  }
}

// ── Demo helpers ──
export function demoFillRaid() {
  while (raid.participants.length < currentBeast.totalSlots) {
    if (raid.status === 'killing') {
      raid = { ...raid, status: 'recruiting' };
    }
    spawnAI();
    if (raid.participants.length >= currentBeast.totalSlots) break;
  }
  if (raid.participants.length >= currentBeast.totalSlots) {
    raid = { ...raid, status: 'killing' };
    notify();
    setTimeout(() => triggerRewardCeremony(), 1500);
  }
}

// ── Danmaku System ──
export function sendDanmaku(text: string, type: DanmakuItem['type']) {
  const cost = type === 'shout' ? 5 : type === 'warcry' ? 20 : type === 'soulburst' ? 50 : 0;
  if (cost > 0 && playerSoulCoins < cost) return;
  if (cost > 0) playerSoulCoins -= cost;

  const item: DanmakuItem = {
    id: ++danmakuId,
    text,
    type,
    y: 5 + Math.random() * 70,
    ts: Date.now(),
  };
  danmakuList = [...danmakuList, item];

  if (type === 'soulburst') {
    soulBurstActive = true;
    setTimeout(() => {
      soulBurstActive = false;
      notify();
    }, 1500);
  }

  notify();

  setTimeout(() => {
    danmakuList = danmakuList.filter(d => d.id !== item.id);
    notify();
  }, 8000);
}

function spawnAIDanmaku() {
  if (Math.random() < 0.6) {
    const emoji = AI_DANMAKU_EMOJIS[Math.floor(Math.random() * AI_DANMAKU_EMOJIS.length)];
    sendDanmaku(emoji, 'emoji');
  } else {
    const text = AI_DANMAKU_SHOUTS[Math.floor(Math.random() * AI_DANMAKU_SHOUTS.length)];
    const item: DanmakuItem = {
      id: ++danmakuId,
      text,
      type: 'shout',
      y: 5 + Math.random() * 70,
      ts: Date.now(),
    };
    danmakuList = [...danmakuList, item];
    notify();
    setTimeout(() => {
      danmakuList = danmakuList.filter(d => d.id !== item.id);
      notify();
    }, 8000);
  }
}

function scheduleAIDanmaku() {
  const delay = 5000 + Math.random() * 5000;
  aiDanmakuTimerId = setTimeout(() => {
    spawnAIDanmaku();
    scheduleAIDanmaku();
  }, delay);
}

export function startAIDanmaku() {
  if (aiDanmakuTimerId) return;
  scheduleAIDanmaku();
}

export function stopAIDanmaku() {
  if (aiDanmakuTimerId) {
    clearTimeout(aiDanmakuTimerId);
    aiDanmakuTimerId = null;
  }
}

// ── Soul Divination ──
export function placeDivination(blademasterId: string) {
  if (divinationBet) return;
  if (playerSoulCoins < 5) return;
  playerSoulCoins -= 5;
  divinationBet = blademasterId;
  divinationResult = 'pending';
  notify();
}

export function checkDivination() {
  if (!divinationBet || !rewardWinner) return;
  if (rewardWinner.blademaster.id === divinationBet) {
    divinationResult = 'correct';
    playerSoulCoins += 30;
    addNotification('🔮 預言成真！+30 魂幣！');
  } else {
    divinationResult = 'wrong';
    addNotification('🔮 預言未中...下次再來！');
  }
  notify();
}

// ── Debug ──
export function toggleDebug() {
  debugVisible = !debugVisible;
  notify();
}

export function debugAddAI(count: number) {
  for (let i = 0; i < count; i++) {
    if (raid.participants.length >= currentBeast.totalSlots) break;
    if (raid.status !== 'recruiting') break;
    spawnAI();
  }
  if (raid.participants.length >= currentBeast.totalSlots && raid.status === 'recruiting') {
    raid = { ...raid, status: 'killing' };
    addNotification('🐉 災獸魂力歸零！進入擊殺階段！');
    notify();
  }
}

export function debugFillToThreshold() {
  const needed = currentBeast.minSlots - raid.participants.length;
  if (needed > 0) debugAddAI(needed);
}

export function debugFillToLastOne() {
  const needed = currentBeast.totalSlots - raid.participants.length - 1;
  if (needed > 0) debugAddAI(needed);
}

export function debugFillComplete() {
  demoFillRaid();
}

export function debugSetAISpeed(value: number) {
  aiSpeedValue = Math.max(0, Math.min(100, value));
  if (!aiPaused && raid.status === 'recruiting') {
    stopAISimulation();
    startAISimulation();
  }
  notify();
}

export function debugToggleAIPause() {
  aiPaused = !aiPaused;
  if (aiPaused) {
    stopAISimulation();
  } else if (raid.status === 'recruiting') {
    startAISimulation();
  }
  notify();
}

export function debugTimeSubtract(seconds: number) {
  raid = { ...raid, timeRemaining: Math.max(0, raid.timeRemaining - seconds) };
  notify();
}

export function debugTimeSetRemaining(seconds: number) {
  raid = { ...raid, timeRemaining: Math.max(0, seconds) };
  notify();
}

export function debugTimeExpire() {
  raid = { ...raid, timeRemaining: 0 };
  handleTimeExpired();
}

export function debugFastForward() {
  debugTimeSetRemaining(60);
}

export function debugForceReward() {
  if (raid.participants.length === 0) {
    addNotification('沒有參戰者，無法開獎');
    return;
  }
  raid = { ...raid, status: 'killing' };
  notify();
  setTimeout(() => triggerRewardCeremony(), 500);
}

export function debugForceWin() {
  const playerParts = raid.participants.filter(p => !p.isAI);
  if (playerParts.length === 0) {
    addNotification('你還沒入魂，無法中獎');
    return;
  }

  if (raid.status === 'rewarding') {
    rewardWinner = playerParts[0];
    playerIsWinner = true;
    grandPrizeWon = true;
    notify();
    return;
  }

  raid = { ...raid, status: 'killing' };
  notify();
  setTimeout(() => {
    triggerRewardCeremony();
    // Override winner
    rewardWinner = playerParts[0];
    playerIsWinner = true;
    grandPrizeWon = true;
    // Fix ranking: force player to #1
    const idx = rewardRanking.findIndex(p => p.id === playerParts[0].id);
    if (idx > 0) {
      const entry = rewardRanking.splice(idx, 1)[0];
      entry.damage = Math.floor(rewardRanking[0].damage * 1.5);
      rewardRanking.unshift(entry);
      rewardRanking = [...rewardRanking];
    }
    inventory = playerParts.map(p => {
      const cfg = currentBeast.slots.find(s => s.rarity === p.rarity)!;
      return {
        id: p.id,
        reward: cfg.reward,
        rarity: p.rarity,
        meltValue: cfg.meltValue,
        characterName: p.blademaster.name,
        characterEmoji: p.blademaster.emoji,
        characterClass: p.blademaster.class,
        isMelted: false,
      };
    });
    notify();
  }, 500);
}

export function debugSkipCeremony() {
  clearCeremonyTimeouts();
  stopRoulette();
  rewardPhase = 'done';
  currentPage = 'inventory';
  notify();
}

export function debugReplayCeremony() {
  if (!lastCeremonyState) {
    addNotification('沒有可重播的開獎記錄');
    return;
  }
  clearCeremonyTimeouts();
  stopRoulette();

  raid = { ...raid, participants: lastCeremonyState.participants, status: 'rewarding' };
  rewardWinner = lastCeremonyState.winner;
  rewardRanking = lastCeremonyState.ranking;
  playerIsWinner = rewardWinner ? !rewardWinner.isAI : false;
  grandPrizeWon = playerIsWinner;
  rewardPhase = 'assault';
  rouletteHighlightIndex = -1;
  rouletteFinished = false;
  currentPage = 'reward';
  notify();

  const t1 = setTimeout(() => {
    rewardPhase = 'slayer';
    slayerSubPhase = 'hpDrain';
    notify();
    const s1 = setTimeout(() => { slayerSubPhase = 'darken'; notify(); }, 2000);
    const s2 = setTimeout(() => { slayerSubPhase = 'strike'; notify(); }, 3500);
    const s3 = setTimeout(() => { slayerSubPhase = 'fall'; notify(); }, 5000);
    ceremonyTimeouts.push(s1, s2, s3);
  }, 5000);
  ceremonyTimeouts.push(t1);

  const t2 = setTimeout(() => {
    rewardPhase = 'ranking';
    notify();
  }, 12000);
  ceremonyTimeouts.push(t2);

  const t3 = setTimeout(() => {
    rewardPhase = 'roulette';
    notify();
    startRoulette();
  }, 20000);
  ceremonyTimeouts.push(t3);
}

export function debugResetAll() {
  playerSoulCoins = 1250;
  playerTotalJoins = 8;
  playerJoinsThisRaid = 0;
  divinationBet = null;
  divinationResult = null;
  inventory = [];
  grandPrizeWon = false;
  lastCeremonyState = null;
  aiPaused = false;
  aiSpeedValue = 25;
  clearCeremonyTimeouts();
  stopRoulette();
  initRaid();
}

export function debugAddCoins(amount: number) {
  playerSoulCoins += amount;
  notify();
}

export function debugClearCoins() {
  playerSoulCoins = 0;
  notify();
}

// Format time
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
