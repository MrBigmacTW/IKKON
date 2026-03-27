import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import * as store from '../store/gameStore';
import { BLADE_MASTERS } from '../data/blademasters';
import { RARITY_LABELS, RARITY_ICONS, RARITY_COLORS, CLASS_LABELS } from '../types';
import type { Rarity, BladeMaster } from '../types';

export function SelectPage() {
  useStore();

  const [activeTab, setActiveTab] = useState<Rarity>('common');
  const [confirmChar, setConfirmChar] = useState<BladeMaster | null>(null);

  const beast = store.currentBeast;
  const slotCfg = beast.slots.find((s) => s.rarity === activeTab)!;
  const remaining = store.getRemainingSlots(activeTab);

  const characters = BLADE_MASTERS.filter((bm) => bm.rarity === activeTab);

  const handleConfirm = () => {
    if (!confirmChar) return;
    const success = store.joinRaid(confirmChar, confirmChar.rarity as Rarity, false);
    if (success) {
      setConfirmChar(null);
      store.navigate('beast');
    }
  };

  const tabs: Rarity[] = ['common', 'rare', 'epic', 'legend'];

  return (
    <div className="page">
      <div className="top-bar">
        <button className="btn-back" onClick={() => store.navigate('beast')}>← 返回</button>
        <span className="page-title">選擇刀客</span>
      </div>

      <div className="helper-text" style={{ marginTop: 0 }}>
        選擇一位刀客加入討伐，不同稀有度有不同中獎權重
      </div>

      {/* Rarity tabs */}
      <div className="rarity-tabs">
        {tabs.map((r) => {
          const rem = store.getRemainingSlots(r);
          return (
            <button
              key={r}
              className={`tab ${activeTab === r ? 'active' : ''}`}
              style={{ borderColor: activeTab === r ? RARITY_COLORS[r] : 'transparent', color: RARITY_COLORS[r] }}
              onClick={() => setActiveTab(r)}
            >
              {RARITY_ICONS[r]} {RARITY_LABELS[r]}
              <span className="tab-count">剩{rem}</span>
            </button>
          );
        })}
      </div>

      {/* Slot info bar */}
      <div className="slot-info-bar" style={{ borderLeftColor: RARITY_COLORS[activeTab] }}>
        <span>💰 {slotCfg.price} 元</span>
        <span>🎯 權重 {slotCfg.weight}×<span className="info-hint">(數字越高越容易中大獎)</span></span>
        <span>📦 {slotCfg.reward}</span>
        <span>🔥 熔煉 {slotCfg.meltValue} 🪙</span>
        <span className={remaining === 0 ? 'sold-out' : ''}>剩 {remaining} 格</span>
      </div>

      {/* Character grid */}
      <div className="char-grid">
        {characters.map((bm) => {
          const available = store.isCharacterAvailable(bm.id);
          const slotsLeft = remaining > 0;
          const canSelect = available && slotsLeft;

          return (
            <div
              key={bm.id}
              className={`char-card ${!canSelect ? 'unavailable' : ''}`}
              style={{ borderColor: RARITY_COLORS[bm.rarity] }}
              onClick={() => canSelect && setConfirmChar(bm)}
            >
              <div className="char-emoji">{bm.emoji}</div>
              <div className="char-name">{bm.name}</div>
              <div className="char-meta">
                <span style={{ color: RARITY_COLORS[bm.rarity] }}>
                  {RARITY_ICONS[bm.rarity]} {RARITY_LABELS[bm.rarity]}
                </span>
                <span> | {CLASS_LABELS[bm.class]}</span>
              </div>
              <div className="char-desc">{bm.description}</div>
              {!available && <div className="overlay">已被選滿</div>}
              {available && !slotsLeft && <div className="overlay">格數已滿</div>}
              {canSelect && <button className="btn btn-small">選擇</button>}
            </div>
          );
        })}
      </div>

      {/* Confirm modal */}
      {confirmChar && (
        <div className="modal-overlay" onClick={() => setConfirmChar(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>確認入魂？</h2>
            <div className="confirm-char">
              <div className="confirm-emoji">{confirmChar.emoji}</div>
              <div className="confirm-name" style={{ color: RARITY_COLORS[confirmChar.rarity] }}>
                {RARITY_ICONS[confirmChar.rarity]} {confirmChar.name}
              </div>
              <div className="confirm-details">
                <div>💰 {slotCfg.price} 元</div>
                <div>🎁 確定掉落：{slotCfg.reward}</div>
                <div>🎯 權重：{slotCfg.weight}×</div>
                <div>🔥 熔煉：{slotCfg.meltValue} 🪙</div>
              </div>
              <div className="helper-text" style={{ marginTop: 8 }}>
                ⚡ 入魂後無法取消，掉落品確定獲得
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleConfirm}>⚔️ 入魂！</button>
              <button className="btn btn-secondary" onClick={() => setConfirmChar(null)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
