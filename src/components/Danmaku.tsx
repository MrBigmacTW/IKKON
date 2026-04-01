import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import * as store from '../store/gameStore';
import { MessageCircle, Zap, Bomb, Coins } from './Icons';

const FREE_REACTIONS = ['😱', '🔥', '🎉', '😭', '💪', '🤣'];

export function Danmaku() {
  useStore();
  const [showInput, setShowInput] = useState(false);
  const [inputText, setInputText] = useState('');
  const [inputType, setInputType] = useState<'shout' | 'warcry'>('shout');

  const handleSendEmoji = (emoji: string) => {
    store.sendDanmaku(emoji, 'emoji');
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    store.sendDanmaku(inputText.slice(0, 10), inputType);
    setInputText('');
    setShowInput(false);
  };

  const handleSoulBurst = () => {
    if (store.playerSoulCoins < 50) return;
    store.sendDanmaku('魂爆！', 'soulburst');
  };

  return (
    <>
      {/* Floating danmaku */}
      <div className="danmaku-layer">
        {store.danmakuList.map((d) => (
          <div
            key={d.id}
            className={`danmaku-item danmaku-${d.type}`}
            style={{ top: `${d.y}%` }}
          >
            {d.text}
          </div>
        ))}
      </div>

      {/* Soul burst overlay */}
      {store.soulBurstActive && (
        <div className="soulburst-overlay">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="soulburst-particle" style={{
              '--angle': `${(i / 20) * 360}deg`,
              '--dist': `${100 + Math.random() * 200}px`,
              '--delay': `${Math.random() * 0.3}s`,
            } as React.CSSProperties} />
          ))}
        </div>
      )}

      {/* Input controls */}
      <div className="danmaku-bar">
        <div className="danmaku-emojis">
          {FREE_REACTIONS.map((e) => (
            <button key={e} className="danmaku-emoji-btn" onClick={() => handleSendEmoji(e)}>
              {e}
            </button>
          ))}
        </div>
        <div className="danmaku-actions">
          <button className="danmaku-btn danmaku-shout" onClick={() => { setInputType('shout'); setShowInput(true); }}>
            <MessageCircle size={14} /> 喝聲 5<Coins size={12} />
          </button>
          <button className="danmaku-btn danmaku-warcry" onClick={() => { setInputType('warcry'); setShowInput(true); }}>
            <Zap size={14} /> 戰吼 20<Coins size={12} />
          </button>
          <button className="danmaku-btn danmaku-burst" onClick={handleSoulBurst}>
            <Bomb size={14} /> 魂爆 50<Coins size={12} />
          </button>
        </div>
      </div>

      {/* Input modal */}
      {showInput && (
        <div className="modal-overlay" onClick={() => setShowInput(false)}>
          <div className="modal danmaku-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{inputType === 'warcry' ? <><Zap size={16} className="icon-inline" /> 戰吼（金色大字）</> : <><MessageCircle size={16} className="icon-inline" /> 喝聲</>}</h3>
            <div className="danmaku-cost">
              費用：{inputType === 'warcry' ? 20 : 5} 魂幣（餘額：{store.playerSoulCoins}）
            </div>
            <input
              className="danmaku-input"
              type="text"
              maxLength={10}
              placeholder="限10字..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleSend}>發送</button>
              <button className="btn btn-secondary" onClick={() => setShowInput(false)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
