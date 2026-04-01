import { useStore } from '../hooks/useStore';
import * as store from '../store/gameStore';
import { RARITY_LABELS } from '../types';
import type { Rarity } from '../types';
import { Gift, Coins, Trophy, Package, Flame, Clock, Home, RefreshCw, Share2, ClassIcon, RarityDot } from './Icons';

export function InventoryPage() {
  useStore();

  return (
    <div className="page">
      <div className="top-bar">
        <span className="page-title"><Gift size={18} className="icon-inline" /> 戰利品派發</span>
      </div>

      <div className="stats-bar">
        <span><Coins size={16} className="icon-inline" /> 魂幣：<span className="gold">{store.playerSoulCoins.toLocaleString()}</span></span>
      </div>

      {/* Grand prize */}
      {store.grandPrizeWon && (
        <div className="inv-card inv-grand">
          <div className="inv-card-icon"><Trophy size={32} /></div>
          <h3>魂級掉落！</h3>
          <div className="inv-prize-name">{store.currentBeast.prize}</div>
          <div className="inv-prize-value">{store.currentBeast.prizeValue}</div>
          <button className="btn btn-primary"><Package size={16} className="icon-inline" /> 領取大獎</button>
          <div className="inv-verified">此結果已上鏈驗證 ✓</div>
        </div>
      )}

      {/* Regular drops */}
      {store.inventory.map((item, i) => {
        const label = RARITY_LABELS[item.rarity as Rarity];

        return (
          <div key={item.id} className={`inv-card ${item.isMelted ? 'inv-melted' : ''}`} data-rarity={item.rarity}>
            <div className="inv-card-header">
              <span className="inv-card-icon"><Gift size={16} /></span>
              <span>掉落品 #{i + 1}</span>
              <span><RarityDot rarity={item.rarity} size={8} /> {label}</span>
            </div>
            <div className="inv-char">
              <span className="inv-char-icon">
                <ClassIcon cls={item.characterClass || 'sword'} size={20} />
              </span>
              <span>{item.characterName}</span>
            </div>
            <div className="inv-reward">{item.reward}</div>
            {!item.isMelted ? (
              <div className="inv-actions">
                <button className="btn btn-primary btn-small"><Package size={14} className="icon-inline" /> 領取實物</button>
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => store.meltItem(item.id)}
                >
                  <Flame size={14} className="icon-inline" /> 熔煉為 {item.meltValue} 魂幣
                </button>
              </div>
            ) : (
              <div className="inv-melted-badge"><Flame size={14} className="icon-inline" /> 已熔煉為 {item.meltValue} 魂幣</div>
            )}
            <div className="inv-timer"><Clock size={13} className="icon-inline" /> 24 小時內選擇</div>
          </div>
        );
      })}

      {store.inventory.length === 0 && !store.grandPrizeWon && (
        <div className="inv-empty">
          <div>本場未入魂</div>
          <div className="inv-empty-sub">加入下一場討伐吧！</div>
        </div>
      )}

      <div className="inv-bottom">
        <button className="btn btn-primary" onClick={() => store.navigate('home')}>
          <Home size={16} className="icon-inline" /> 回到首頁
        </button>
        <button className="btn btn-secondary" onClick={() => store.navigate('home')}>
          <RefreshCw size={16} className="icon-inline" /> 等待下一場
        </button>
        <button className="btn btn-ghost" disabled>
          <Share2 size={16} className="icon-inline" /> 分享戰果（即將開放）
        </button>
      </div>
    </div>
  );
}
