import { useStore } from '../hooks/useStore';
import * as store from '../store/gameStore';
import { RARITY_COLORS, RARITY_LABELS, RARITY_ICONS } from '../types';
import type { Rarity } from '../types';

export function InventoryPage() {
  useStore();

  return (
    <div className="page">
      <div className="top-bar">
        <span className="page-title">🎁 戰利品派發</span>
      </div>

      <div className="stats-bar">
        <span>🪙 魂幣：<span className="gold">{store.playerSoulCoins.toLocaleString()}</span></span>
      </div>

      {/* Grand prize */}
      {store.grandPrizeWon && (
        <div className="inv-card inv-grand">
          <div className="inv-card-icon">🏆</div>
          <h3>魂級掉落！</h3>
          <div className="inv-prize-name">{store.currentBeast.prize}</div>
          <div className="inv-prize-value">{store.currentBeast.prizeValue}</div>
          <button className="btn btn-primary">📦 領取大獎</button>
          <div className="inv-verified">此結果已上鏈驗證 ✓</div>
        </div>
      )}

      {/* Regular drops */}
      {store.inventory.map((item, i) => {
        const color = RARITY_COLORS[item.rarity as Rarity];
        const label = RARITY_LABELS[item.rarity as Rarity];
        const icon = RARITY_ICONS[item.rarity as Rarity];

        return (
          <div key={item.id} className={`inv-card ${item.isMelted ? 'inv-melted' : ''}`} style={{ borderColor: color }}>
            <div className="inv-card-header">
              <span className="inv-card-icon">🎁</span>
              <span>掉落品 #{i + 1}</span>
              <span style={{ color }}>{icon} {label}</span>
            </div>
            <div className="inv-char">
              <span className="inv-char-emoji">{item.characterEmoji}</span>
              <span>{item.characterName}</span>
            </div>
            <div className="inv-reward">{item.reward}</div>
            {!item.isMelted ? (
              <div className="inv-actions">
                <button className="btn btn-primary btn-small">📦 領取實物</button>
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => store.meltItem(item.id)}
                >
                  🔥 熔煉為 {item.meltValue} 🪙
                </button>
              </div>
            ) : (
              <div className="inv-melted-badge">🔥 已熔煉為 {item.meltValue} 魂幣</div>
            )}
            <div className="inv-timer">⏱️ 24 小時內選擇</div>
          </div>
        );
      })}

      {store.inventory.length === 0 && !store.grandPrizeWon && (
        <div className="inv-empty">
          <div>😔 本場未入魂</div>
          <div className="inv-empty-sub">加入下一場討伐吧！</div>
        </div>
      )}

      <div className="inv-bottom">
        <button className="btn btn-primary" onClick={() => store.navigate('home')}>
          🏠 回到首頁
        </button>
        <button className="btn btn-secondary" onClick={() => store.navigate('home')}>
          🔁 等待下一場
        </button>
        <button className="btn btn-ghost" disabled>
          📤 分享戰果（即將開放）
        </button>
      </div>
    </div>
  );
}
