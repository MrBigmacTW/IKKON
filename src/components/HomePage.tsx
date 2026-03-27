import { useStore } from '../hooks/useStore';
import * as store from '../store/gameStore';
import { RARITY_LABELS, RARITY_COLORS } from '../types';
import type { Rarity, Beast } from '../types';

export function HomePage() {
  useStore();

  const allBeasts = store.getAllBeasts();

  return (
    <div className="page">
      <header className="header">
        <h1>⚔️ 一刀入魂 IKKON</h1>
      </header>

      <div className="stats-bar">
        <span>🪙 魂幣：<span className="gold">{store.playerSoulCoins.toLocaleString()}</span></span>
        <span>總入魂次數：{store.playerTotalJoins} 次</span>
      </div>

      {/* Quick Guide for new users */}
      {!store.guideDismissed && (
        <div className="guide-card">
          <h3>📖 快速指南</h3>
          <ul className="guide-steps">
            <li className="guide-step">🎯 選擇災獸，入魂討伐</li>
            <li className="guide-step">⚔️ 每人最多 3 刀，選不同角色</li>
            <li className="guide-step">🎁 所有人保底掉落，額外抽大獎</li>
            <li className="guide-step">💰 不要的掉落品可熔煉成魂幣</li>
          </ul>
          <div className="guide-dismiss">
            <button className="btn btn-small btn-secondary" onClick={() => store.dismissGuide()}>了解</button>
          </div>
        </div>
      )}

      {/* Beast Pool List */}
      <div className="pool-section-title">🐲 選擇討伐池</div>

      <div className="pool-list">
        {allBeasts.map((beast) => (
          <BeastPoolCard key={beast.id} beast={beast} />
        ))}
      </div>

      <div className="bottom-links">
        <button className="btn btn-ghost">🏪 戰利品庫</button>
        <button className="btn btn-ghost" onClick={() => store.navigate('rules')}>📋 規則與機率</button>
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

  return (
    <div
      className={`pool-card ${isActive ? 'pool-card-active' : ''}`}
      onClick={() => store.selectBeast(beast.id)}
    >
      <div className="pool-card-top">
        <span className="pool-beast-emoji">{beast.emoji}</span>
        <div className="pool-card-info">
          <div className="pool-beast-name">{beast.name}</div>
          <div className="pool-prize">🏆 {beast.prize}</div>
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
        <div className="pool-hp-fill" style={{ width: `${pct}%` }} />
        <span className="pool-hp-text">{filled}/{total}</span>
      </div>

      <div className="pool-card-bottom">
        <div className="pool-slots">
          {beast.slots.map((slot) => {
            const rem = pool
              ? slot.count - pool.raid.participants.filter(p => p.rarity === slot.rarity).length
              : slot.count;
            return (
              <span key={slot.rarity} className="pool-slot-badge" style={{ color: RARITY_COLORS[slot.rarity as Rarity] }}>
                {RARITY_LABELS[slot.rarity as Rarity]} {slot.price}元
                <span className="pool-slot-rem">剩{rem}</span>
              </span>
            );
          })}
        </div>
        <div className="pool-timer">⏱️ {store.formatTime(remaining)}</div>
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
