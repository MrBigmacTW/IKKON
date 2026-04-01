import { useState, useEffect, useRef } from 'react';
import { useStore } from '../hooks/useStore';
import * as store from '../store/gameStore';
import { BLADE_MASTERS } from '../data/blademasters';
import { RARITY_LABELS, CLASS_LABELS } from '../types';
import type { Rarity, BladeMaster } from '../types';
import { Coins, Target, Gift, Flame, Swords, Zap, ChevronLeft, ClassIcon, RarityDot } from './Icons';

/* ── Lazy video: only loads & plays when visible in viewport ── */
function CharVideo({ src, className }: { src: string; className: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { el.play().catch(() => {}); }
        else { el.pause(); }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <video ref={ref} src={src} preload="none" muted loop playsInline className={className} />;
}

/* ── Character video assets ── */
const CHARACTER_VIDEOS: Record<string, string> = {
  // 劍士系 A
  shiro:     '/assets/characters/A1.mp4',
  leila:     '/assets/characters/A2.mp4',
  guren:     '/assets/characters/A3.mp4',
  charlotte: '/assets/characters/A4.mp4',
  zero:      '/assets/characters/A5.mp4',
  jin:       '/assets/characters/A6.mp4',
  // 法師系 B
  mira:      '/assets/characters/B1.mp4',
  karl:      '/assets/characters/B2.mp4',
  lilith:    '/assets/characters/B3.mp4',
  frost:     '/assets/characters/B4.mp4',
  miko:      '/assets/characters/B5.mp4',
  astrea:    '/assets/characters/B6.mp4',
  // 弓手系 C
  robin:     '/assets/characters/C1.mp4',
  jade:      '/assets/characters/C2.mp4',
  hunter:    '/assets/characters/C3.mp4',
  serena:    '/assets/characters/C4.mp4',
  ashe:      '/assets/characters/C5.mp4',
  rein:      '/assets/characters/C6.mp4',
  // 重裝系 D
  gary:      '/assets/characters/D1.mp4',
  dora:      '/assets/characters/D2.mp4',
  leo:       '/assets/characters/D3.mp4',
  viola:     '/assets/characters/D4.mp4',
  titan:     '/assets/characters/D5.mp4',
  athena:    '/assets/characters/D6.mp4',
  // 輔助系 E
  hikari:    '/assets/characters/E1.mp4',
  silas:     '/assets/characters/E2.mp4',
  tsukuyo:   '/assets/characters/E3.mp4',
  luca:      '/assets/characters/E4.mp4',
  titania:   '/assets/characters/E5.mp4',
  isis:      '/assets/characters/E6.mp4',
};

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
          const video = CHARACTER_VIDEOS[bm.id];

          return (
            <div
              key={bm.id}
              className={`char-card ${!canSelect ? 'unavailable' : ''}`}
              data-rarity={bm.rarity}
              onClick={() => canSelect && setConfirmChar(bm)}
            >
              {/* Media area — video if available, icon placeholder otherwise */}
              <div className="char-media">
                {video ? (
                  <CharVideo src={video} className="char-media-video" />
                ) : (
                  <div className="char-media-placeholder">
                    <ClassIcon cls={bm.class} size={40} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="char-card-info">
                <div className="char-name">{bm.name}</div>
                <div className="char-meta">
                  <RarityDot rarity={bm.rarity} size={7} />
                  <span>{RARITY_LABELS[bm.rarity]}</span>
                  <span className="char-meta-sep">|</span>
                  <span>{CLASS_LABELS[bm.class]}</span>
                </div>
                <div className="char-desc">{bm.description}</div>
                {canSelect && <button className="btn btn-small char-select-btn">選擇</button>}
              </div>

              {!available && <div className="overlay">已被選滿</div>}
              {available && !slotsLeft && <div className="overlay">格數已滿</div>}
            </div>
          );
        })}
      </div>

      {/* Confirm modal */}
      {confirmChar && (
        <div className="modal-overlay" onClick={() => setConfirmChar(null)}>
          <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-char">
              {/* Large media preview */}
              <div className="confirm-media" data-rarity={confirmChar.rarity}>
                {CHARACTER_VIDEOS[confirmChar.id] ? (
                  <video
                    src={CHARACTER_VIDEOS[confirmChar.id]}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="confirm-media-video"
                  />
                ) : (
                  <div className="confirm-media-placeholder">
                    <ClassIcon cls={confirmChar.class} size={64} />
                  </div>
                )}
                <div className="confirm-media-badge" data-rarity={confirmChar.rarity}>
                  <RarityDot rarity={confirmChar.rarity} size={8} /> {confirmChar.name}
                </div>
              </div>

              <div className="confirm-details">
                <div><Coins size={14} className="icon-inline" /> {slotCfg.price} 元</div>
                <div><Gift size={14} className="icon-inline" /> {slotCfg.reward}</div>
                <div><Target size={14} className="icon-inline" /> 權重 {slotCfg.weight}×</div>
                <div><Flame size={14} className="icon-inline" /> 熔煉 {slotCfg.meltValue} 魂幣</div>
              </div>
              <div className="helper-text">
                <Zap size={13} className="icon-inline" /> 入魂後無法取消，掉落品確定獲得
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
