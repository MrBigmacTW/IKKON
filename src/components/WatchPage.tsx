import { useStore } from '../hooks/useStore';
import * as store from '../store/gameStore';
import { RARITY_COLORS } from '../types';
import { Notifications } from './Notifications';

export function WatchPage() {
  useStore();

  const filled = store.raid.participants.length;
  const total = store.currentBeast.totalSlots;
  const beast = store.currentBeast;

  return (
    <div className="page">
      <div className="top-bar">
        <button className="btn-back" onClick={() => store.navigate('home')}>← 返回</button>
        <span className="page-title">👁️ 觀陣模式</span>
      </div>

      <div className="beast-status">
        <div className="hp-bar hp-bar-large">
          <div className="hp-fill" style={{ width: `${(filled / total) * 100}%` }} />
          <span className="hp-text">❤️ {filled}/{total}</span>
        </div>
        <div className="beast-meta">
          <span>⏱️ {store.formatTime(store.raid.timeRemaining)}</span>
          <span>🏆 {beast.prize}</span>
        </div>
      </div>

      <div className="beast-arena">
        <div className="beast-big-emoji">{beast.emoji}</div>
        <div className="participant-grid">
          {store.raid.participants.map((p) => (
            <span
              key={p.id}
              className="participant-emoji"
              title={`${p.blademaster.name}(${p.playerName})`}
            >
              {p.blademaster.emoji}
            </span>
          ))}
        </div>
      </div>

      <div className="recent-joins watch-joins">
        <h3>📢 最近入魂：</h3>
        {[...store.raid.participants]
          .sort((a, b) => b.joinedAt - a.joinedAt)
          .slice(0, 10)
          .map((p) => {
            const ago = Math.floor((Date.now() - p.joinedAt) / 1000);
            return (
              <div key={p.id} className="recent-item">
                <span style={{ color: RARITY_COLORS[p.rarity as keyof typeof RARITY_COLORS] }}>
                  {p.blademaster.emoji} {p.blademaster.name}
                </span>
                <span className="recent-name">({p.playerName})</span>
                <span className="recent-time">{ago < 60 ? `${ago}秒前` : `${Math.floor(ago / 60)}分前`}</span>
              </div>
            );
          })}
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={() => store.navigate('beast')}>
          🔥 加入討伐！
        </button>
      </div>

      <Notifications />
    </div>
  );
}
