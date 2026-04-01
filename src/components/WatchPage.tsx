import { useStore } from '../hooks/useStore';
import * as store from '../store/gameStore';
import { Notifications } from './Notifications';
import { Heart, Clock, Trophy, Eye, Flame, Megaphone, ChevronLeft, ClassIcon } from './Icons';

const BEAST_IMAGES: Record<string, string> = {
  flame_dragon: '/assets/beasts/flame_dragon.png',
  nine_tail_fox: '/assets/beasts/nine_tail_fox.png',
  frost_wolf: '/assets/beasts/frost_wolf.png',
  thunder_eagle: '/assets/beasts/thunder_eagle.png',
  skeleton_giant: '/assets/beasts/skeleton_giant.png',
};

export function WatchPage() {
  useStore();

  const filled = store.raid.participants.length;
  const total = store.currentBeast.totalSlots;
  const beast = store.currentBeast;
  const beastImg = BEAST_IMAGES[beast.id];

  return (
    <div className="page">
      <div className="top-bar">
        <button className="btn-back" onClick={() => store.navigate('home')}><ChevronLeft size={18} /> 返回</button>
        <span className="page-title"><Eye size={18} className="icon-inline" /> 觀陣模式</span>
      </div>

      <div className="beast-status">
        <div className="hp-bar hp-bar-large">
          <div className="hp-fill" style={{ width: `${(filled / total) * 100}%` }} />
          <span className="hp-text"><Heart size={14} className="icon-inline" /> {filled}/{total}</span>
        </div>
        <div className="beast-meta">
          <span><Clock size={13} className="icon-inline" /> {store.formatTime(store.raid.timeRemaining)}</span>
          <span><Trophy size={13} className="icon-inline" /> {beast.prize}</span>
        </div>
      </div>

      <div className="beast-arena">
        <div className="beast-arena-overlay" />
        <img src={beastImg} alt={beast.name} className="beast-art" />
        <div className="participant-grid">
          {store.raid.participants.map((p) => (
            <span
              key={p.id}
              className="participant-icon"
              title={`${p.blademaster.name}(${p.playerName})`}
              data-rarity={p.rarity}
            >
              <ClassIcon cls={p.blademaster.class} size={18} />
            </span>
          ))}
        </div>
      </div>

      <div className="recent-joins watch-joins">
        <h3><Megaphone size={14} className="icon-inline" /> 最近入魂：</h3>
        {[...store.raid.participants]
          .sort((a, b) => b.joinedAt - a.joinedAt)
          .slice(0, 10)
          .map((p) => {
            const ago = Math.floor((Date.now() - p.joinedAt) / 1000);
            return (
              <div key={p.id} className="recent-item">
                <span data-rarity={p.rarity}>
                  <ClassIcon cls={p.blademaster.class} size={14} /> {p.blademaster.name}
                </span>
                <span className="recent-name">({p.playerName})</span>
                <span className="recent-time">{ago < 60 ? `${ago}秒前` : `${Math.floor(ago / 60)}分前`}</span>
              </div>
            );
          })}
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={() => store.navigate('beast')}>
          <Flame size={16} className="icon-inline" /> 加入討伐！
        </button>
      </div>

      <Notifications />
    </div>
  );
}
