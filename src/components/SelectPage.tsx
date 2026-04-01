import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import * as store from '../store/gameStore';
import { BLADE_MASTERS } from '../data/blademasters';
import { RARITY_LABELS, CLASS_LABELS } from '../types';
import type { Rarity, BladeMaster } from '../types';
import { Coins, Target, Gift, Flame, Swords, Zap, ChevronLeft, ClassIcon, RarityDot } from './Icons';

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
        <button className="btn-back" onClick={() => store.navigate('beast')}><ChevronLeft size={18} /> 返回</button>
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
              data-rarity={r}
              style={activeTab === r ? { borderColor: 'var(--r-color)' } : { borderColor: 'transparent' }}
              onClick={() => setActiveTab(r)}
            >
              <RarityDot rarity={r} size={8} /> {RARITY_LABELS[r]}
              <span className="tab-count">剩{rem}</span>
            </button>
          );
        })}
      </div>

      {/* Slot info bar */}
      <div className="slot-info-bar" data-rarity={activeTab} style={{ borderLeftColor: 'var(--r-color)' }}>
        <span><Coins size={14} className="icon-inline" /> {slotCfg.price} 元</span>
        <span><Target size={14} className="icon-inline" /> 權重 {slotCfg.weight}×<span className="info-hint">(數字越高越容易中大獎)</span></span>
        <span><Gift size={14} className="icon-inline" /> {slotCfg.reward}</span>
        <span><Flame size={14} className="icon-inline" /> 熔煉 {slotCfg.meltValue} 魂幣</span>
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
              data-rarity={bm.rarity}
              onClick={() => canSelect && setConfirmChar(bm)}
            >
              <div className="char-icon-wrap">
                <ClassIcon cls={bm.class} size={36} />
              </div>
              <div className="char-name">{bm.name}</div>
              <div className="char-meta">
                <span>
                  <RarityDot rarity={bm.rarity} size={8} /> {RARITY_LABELS[bm.rarity]}
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
              <div className="confirm-icon" data-rarity={confirmChar.rarity}>
                <ClassIcon cls={confirmChar.class} size={48} />
              </div>
              <div className="confirm-name" data-rarity={confirmChar.rarity}>
                <RarityDot rarity={confirmChar.rarity} /> {confirmChar.name}
              </div>
              <div className="confirm-details">
                <div><Coins size={14} className="icon-inline" /> {slotCfg.price} 元</div>
                <div><Gift size={14} className="icon-inline" /> 確定掉落：{slotCfg.reward}</div>
                <div><Target size={14} className="icon-inline" /> 權重：{slotCfg.weight}×</div>
                <div><Flame size={14} className="icon-inline" /> 熔煉：{slotCfg.meltValue} 魂幣</div>
              </div>
              <div className="helper-text" style={{ marginTop: 8 }}>
                <Zap size={14} className="icon-inline" /> 入魂後無法取消，掉落品確定獲得
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleConfirm}><Swords size={16} className="icon-inline" /> 入魂！</button>
              <button className="btn btn-secondary" onClick={() => setConfirmChar(null)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
