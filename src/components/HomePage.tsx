import { useStore } from '../hooks/useStore';
import * as store from '../store/gameStore';
import { RARITY_LABELS } from '../types';
import type { Beast } from '../types';
import { Swords, Coins, Trophy, Clock, BookOpen, Scroll, Target, Gift, Flame, Store } from './Icons';
import { RarityDot } from './Icons';

const BEAST_IMAGES: Record<string, string> = {
  flame_dragon: '/assets/beasts/flame_dragon.png',
  nine_tail_fox: '/assets/beasts/nine_tail_fox.png',
  frost_wolf: '/assets/beasts/frost_wolf.png',
  thunder_eagle: '/assets/beasts/thunder_eagle.png',
  skeleton_giant: '/assets/beasts/skeleton_giant.png',
};


export function HomePage() {
  useStore();

  const allBeasts = store.getAllBeasts();

  return (
    <div className="page home-page">
      <header className="header">
        <h1><Swords size={28} className="icon-inline" /> 一刀入魂 IKKON</h1>
      </header>

      <div className="stats-bar">
        <span><Coins size={16} className="icon-inline" /> 魂幣：<span className="gold">{store.playerSoulCoins.toLocaleString()}</span></span>
        <span>總入魂次數：{store.playerTotalJoins} 次</span>
      </div>

      {/* Quick Guide for new users */}
      {!store.guideDismissed && (
        <div className="guide-card">
          <h3><BookOpen size={16} className="icon-inline" /> 快速指南</h3>
          <ul className="guide-steps">
            <li className="guide-step"><Target size={14} className="icon-inline" /> 選擇災獸，入魂討伐</li>
            <li className="guide-step"><Swords size={14} className="icon-inline" /> 每人最多 3 刀，選不同角色</li>
            <li className="guide-step"><Gift size={14} className="icon-inline" /> 所有人保底掉落，額外抽大獎</li>
            <li className="guide-step"><Flame size={14} className="icon-inline" /> 不要的掉落品可熔煉成魂幣</li>
          </ul>
          <div className="guide-dismiss">
            <button className="btn btn-small btn-secondary" onClick={() => store.dismissGuide()}>了解</button>
          </div>
        </div>
      )}

      {/* Beast Pool List */}
      <div className="pool-section-title"><Scroll size={18} className="icon-inline" /> 選擇討伐池</div>

      <div className="pool-list">
        {allBeasts.map((beast) => (
          <BeastPoolCard key={beast.id} beast={beast} />
        ))}
      </div>

      <div className="bottom-links">
        <button className="btn btn-ghost"><Store size={16} className="icon-inline" /> 戰利品庫</button>
        <button className="btn btn-ghost" onClick={() => store.navigate('rules')}><Scroll size={16} className="icon-inline" /> 規則與機率</button>
      </div>
    </div>
  );
}

function BeastPoolCard({ beast }: { beast: Beast }) {
  const pool = store.getBeastPool(beast.id);
  const filled = pool ? pool.raid.participants.length : 0;
  const total = beast.totalSlots;
  const pct = (filled / total) * 100;
  const isActive = store.currentBeast.id === beast.id;
  const minPrice = Math.min(...beast.slots.map(s => s.price));
  const maxPrice = Math.max(...beast.slots.map(s => s.price));
  const timeStr = formatDuration(beast.timeLimit);
  const remaining = pool ? pool.raid.timeRemaining : beast.timeLimit;
  const img = BEAST_IMAGES[beast.id];

  return (
    <div
      className={`pool-card ${isActive ? 'pool-card-active' : ''}`}
      data-beast={beast.id}
      onClick={() => store.selectBeast(beast.id)}
    >
      {/* Beast art background */}
      <div className="pool-card-art">
        <img src={img} alt={beast.name} />
      </div>
      <div className="pool-card-content">
        <div className="pool-card-top">
          <div className="pool-card-info">
            <div className="pool-beast-name">{beast.name}</div>
            <div className="pool-prize"><Trophy size={14} className="icon-inline" /> {beast.prize}</div>
            <div className="pool-meta">
              <span>{beast.totalSlots}人</span>
              <span>·</span>
              <span>{timeStr}</span>
              <span>·</span>
              <span>{minPrice}~{maxPrice}元</span>
            </div>
          </div>
        </div>

        <div className="pool-hp-bar">
          <div className="pool-hp-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--beast-accent, var(--primary)), var(--primary))' }} />
          <span className="pool-hp-text">{filled}/{total}</span>
        </div>

        <div className="pool-card-bottom">
          <div className="pool-slots">
            {beast.slots.map((slot) => {
              const rem = pool
                ? slot.count - pool.raid.participants.filter(p => p.rarity === slot.rarity).length
                : slot.count;
              return (
                <span key={slot.rarity} className="pool-slot-badge" data-rarity={slot.rarity}>
                  <RarityDot rarity={slot.rarity} size={8} /> {RARITY_LABELS[slot.rarity as keyof typeof RARITY_LABELS]} {slot.price}元
                  <span className="pool-slot-rem">剩{rem}</span>
                </span>
              );
            })}
          </div>
          <div className="pool-timer"><Clock size={14} className="icon-inline" /> {store.formatTime(remaining)}</div>
        </div>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  if (h >= 1) return `${h}小時`;
  const m = Math.floor(seconds / 60);
  return `${m}分鐘`;
}
