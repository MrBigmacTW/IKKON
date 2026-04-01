import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import * as store from '../store/gameStore';
import { BLADE_MASTERS } from '../data/blademasters';
import { RARITY_LABELS } from '../types';
import type { Rarity } from '../types';
import { Sparkles, Check, ClassIcon, RarityDot } from './Icons';

export function Divination() {
  useStore();
  const [expanded, setExpanded] = useState(false);

  const hasBet = store.divinationBet !== null;
  const betChar = hasBet ? BLADE_MASTERS.find(b => b.id === store.divinationBet) : null;

  // Only show characters that are in the current raid
  const raidCharIds = new Set(store.raid.participants.map(p => p.blademaster.id));
  const availableChars = BLADE_MASTERS.filter(b => raidCharIds.has(b.id));

  if (store.raid.status !== 'recruiting') return null;

  return (
    <div className="divination">
      <button className="divination-toggle" onClick={() => setExpanded(!expanded)}>
        <Sparkles size={16} className="icon-inline" /> 魂占 {hasBet ? '（已下注）' : ''}
      </button>

      {expanded && (
        <div className="divination-panel">
          <h3><Sparkles size={16} className="icon-inline" /> 魂占</h3>
          <p className="div-desc">猜猜誰是天選之人？</p>
          <div className="div-info">
            <span>費用：5 魂幣</span>
            <span>猜對獲得：30 魂幣</span>
          </div>

          {hasBet && betChar ? (
            <div className="div-bet-result">
              <div className="div-bet-char" data-rarity={betChar.rarity}>
                <span className="div-bet-icon">
                  <ClassIcon cls={betChar.class} size={24} />
                </span>
                <span>{betChar.name}</span>
              </div>
              <div className="div-bet-status"><Check size={14} className="icon-inline" /> 已下注</div>
              {store.divinationResult === 'correct' && (
                <div className="div-win"><Sparkles size={14} className="icon-inline" /> 預言成真！+30 魂幣！</div>
              )}
              {store.divinationResult === 'wrong' && (
                <div className="div-lose">預言未中...下次再來</div>
              )}
            </div>
          ) : (
            <>
              <div className="div-subtitle">選擇你的預言對象：</div>
              <div className="div-char-list">
                {availableChars.map((bm) => (
                  <button
                    key={bm.id}
                    className="div-char-btn"
                    data-rarity={bm.rarity}
                    onClick={() => store.placeDivination(bm.id)}
                    disabled={store.playerSoulCoins < 5}
                  >
                    <span>
                      <ClassIcon cls={bm.class} size={18} />
                    </span>
                    <span>
                      <RarityDot rarity={bm.rarity as Rarity} size={6} /> {RARITY_LABELS[bm.rarity as Rarity]}
                    </span>
                    <span className="div-char-name">{bm.name}</span>
                  </button>
                ))}
              </div>
              {store.playerSoulCoins < 5 && (
                <div className="div-no-coins">魂幣不足</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
