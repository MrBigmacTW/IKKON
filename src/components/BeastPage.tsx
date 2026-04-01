import { useEffect, useRef } from 'react';
import { useStore } from '../hooks/useStore';
import * as store from '../store/gameStore';
import { RARITY_LABELS } from '../types';
import { Notifications } from './Notifications';
import { Danmaku } from './Danmaku';
import { Divination } from './Divination';
import { Heart, Clock, Trophy, Swords, Megaphone, Flame, ChevronLeft, ClassIcon, RarityDot } from './Icons';

const BEAST_IMAGES: Record<string, string> = {
  flame_dragon: '/assets/beasts/flame_dragon.png',
  nine_tail_fox: '/assets/beasts/nine_tail_fox.png',
  frost_wolf: '/assets/beasts/frost_wolf.png',
  thunder_eagle: '/assets/beasts/thunder_eagle.png',
  skeleton_giant: '/assets/beasts/skeleton_giant.png',
};

export function BeastPage() {
  useStore();
  const logRef = useRef<HTMLDivElement>(null);

  const filled = store.raid.participants.length;
  const total = store.currentBeast.totalSlots;
  const remaining = store.getTotalRemaining();
  const beast = store.currentBeast;
  const canJoin = store.playerJoinsThisRaid < 3 && store.raid.status === 'recruiting';
  const lowHP = store.isLowHP();
  const lastSlot = store.isLastSlot();

  const beastImg = BEAST_IMAGES[beast.id];

  // Recent joins (last 8, sorted by time)
  const recentJoins = [...store.raid.participants]
    .sort((a, b) => b.joinedAt - a.joinedAt)
    .slice(0, 8);

  // Auto-scroll battle log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = 0;
    }
  }, [store.battleLog.length]);

  // HP bar classes
  const hpBarClass = `hp-bar hp-bar-large${lowHP ? ' hp-low' : ''}${lastSlot ? ' hp-critical' : ''}`;

  return (
    <div className={`page beast-page${lastSlot ? ' page-critical' : ''}`} data-beast={beast.id}>
      <div className="top-bar">
        <button className="btn-back" onClick={() => store.navigate('home')}><ChevronLeft size={18} /> 返回</button>
        <span className="page-title">災獸・{beast.name} #{store.raid.raidNumber}</span>
      </div>

      {/* HP Bar */}
      <div className="beast-status">
        <div className={hpBarClass}>
          <div className="hp-fill" style={{ width: `${(filled / total) * 100}%` }} />
          <span className="hp-text"><Heart size={14} className="icon-inline" /> {filled}/{total}</span>
        </div>
        <div className="beast-meta">
          <span><Heart size={13} className="icon-inline" /> 魂力 {filled}/{total}<span className="info-hint">(填滿即開獎)</span></span>
          <span><Clock size={13} className="icon-inline" /> {store.formatTime(store.raid.timeRemaining)}<span className="info-hint">(時限內未滿可退款)</span></span>
          <span><Trophy size={13} className="icon-inline" /> {beast.prize}</span>
        </div>
      </div>

      {/* Low HP warnings */}
      {lowHP && !lastSlot && (
        <div className="warning-banner">
          <Flame size={16} className="icon-inline" /> 災獸即將倒下！最後 {remaining} 格！
        </div>
      )}
      {lastSlot && (
        <div className="warning-banner critical-banner">
          <Swords size={18} className="icon-inline" /> 最後 1 格！即將開獎！
        </div>
      )}

      {/* Beast visual area */}
      <div className="beast-arena">
        <div className="beast-arena-overlay" />
        <img
          src={beastImg}
          alt={beast.name}
          className={`beast-art${store.beastShaking ? ' beast-shake' : ''}`}
        />
        <div className="participant-grid">
          {store.raid.participants.map((p) => {
            const isLegend = p.rarity === 'legend';
            const isAttacking = store.attackingParticipantId === p.id;
            const isPlayer = !p.isAI;
            const classes = [
              'participant-icon',
              isPlayer ? 'player-self' : '',
              isLegend ? 'legend-glow' : '',
              isAttacking ? 'attacking' : '',
            ].filter(Boolean).join(' ');

            return (
              <span
                key={p.id}
                className={classes}
                title={`${p.blademaster.name}(${p.playerName})`}
                data-rarity={p.rarity}
                style={{ animationDelay: `${Math.random() * 3}s` }}
              >
                <ClassIcon cls={p.blademaster.class} size={18} />
              </span>
            );
          })}
        </div>
      </div>

      {/* Battle Log */}
      <div className="battle-log" ref={logRef}>
        <div className="battle-log-header"><Swords size={14} className="icon-inline" /> 戰錄</div>
        <div className="battle-log-entries">
          {store.battleLog.slice(0, 15).map((entry) => (
            <div
              key={entry.id}
              className={`log-entry${entry.isCrit ? ' log-crit' : ''}`}
              style={{ color: entry.color }}
            >
              {entry.text}
            </div>
          ))}
        </div>
      </div>

      {/* Slot info */}
      <div className="slot-list">
        {beast.slots.map((slot) => {
          const rem = store.getRemainingSlots(slot.rarity);
          return (
            <div key={slot.rarity} className="slot-row" data-rarity={slot.rarity}>
              <span className="slot-icon">
                <RarityDot rarity={slot.rarity} />
              </span>
              <span className="slot-label">
                {RARITY_LABELS[slot.rarity]}
              </span>
              <span className="slot-price">{slot.price}元</span>
              <span className={`slot-remaining ${rem === 0 ? 'sold-out' : ''}`}>
                剩 {rem} 格
              </span>
              <span className="slot-weight">·權重 {slot.weight}×</span>
            </div>
          );
        })}
      </div>

      {/* Join button */}
      <div className="actions">
        {canJoin ? (
          <button
            className={`btn btn-primary btn-large${lastSlot ? ' btn-pulse' : ''}`}
            onClick={() => store.navigate('select')}
          >
            <Swords size={18} className="icon-inline" /> {store.playerJoinsThisRaid === 0 ? '選擇刀客，入魂！' : `再入魂一刀！（${store.playerJoinsThisRaid}/3）`}
          </button>
        ) : (
          <button className="btn btn-disabled btn-large" disabled>
            {store.playerJoinsThisRaid >= 3 ? '已入魂 3 刀（上限）' : '無法加入'}
          </button>
        )}
      </div>
      {canJoin && store.playerJoinsThisRaid === 0 && (
        <div className="helper-text">選擇稀有度越高，中大獎機率越高</div>
      )}

      {/* Recent joins */}
      <div className="recent-joins">
        <h3><Megaphone size={14} className="icon-inline" /> 最近入魂：</h3>
        {recentJoins.map((p) => {
          const ago = Math.floor((Date.now() - p.joinedAt) / 1000);
          return (
            <div key={p.id} className="recent-item">
              <span className="recent-char" data-rarity={p.rarity}>
                <ClassIcon cls={p.blademaster.class} size={14} /> {p.blademaster.name}
              </span>
              <span className="recent-name">({p.playerName})</span>
              <span className="recent-time">{ago < 60 ? `${ago}秒前` : `${Math.floor(ago / 60)}分前`}</span>
            </div>
          );
        })}
      </div>

      {/* Divination */}
      <Divination />

      {/* Danmaku */}
      <Danmaku />

      <Notifications />
    </div>
  );
}
