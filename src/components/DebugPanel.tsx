import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import * as store from '../store/gameStore';
import { RARITY_LABELS } from '../types';
import type { Rarity } from '../types';
import { Wrench } from './Icons';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="debug-section">
      <div className="debug-section-toggle" onClick={() => setOpen(!open)}>
        <span>{open ? '▼' : '▶'} {title}</span>
      </div>
      {open && <div className="debug-section-body">{children}</div>}
    </div>
  );
}

export function DebugPanel() {
  useStore();

  if (!store.debugVisible) return null;

  const remaining = store.getTotalRemaining();
  const total = store.currentBeast.totalSlots;
  const filled = store.raid.participants.length;
  const playerParts = store.getPlayerParticipants();
  const aiCount = store.getAICount();
  const totalWeight = store.getTotalWeight();
  const speedLabel = store.aiSpeedValue === 0
    ? '30秒/人'
    : store.aiSpeedValue >= 100
      ? '1秒/人'
      : `${Math.round((1 + (100 - store.aiSpeedValue) / 100 * 29))}秒/人`;

  return (
    <div className="debug-panel">
      <div className="debug-header">
        <span><Wrench size={14} className="icon-inline" /> Debug Panel</span>
        <button className="debug-close" onClick={store.toggleDebug}>×</button>
      </div>

      {/* Player Simulation */}
      <Section title="玩家模擬">
        <div className="debug-buttons">
          <button onClick={() => store.debugAddAI(1)}>+1 路人</button>
          <button onClick={() => store.debugAddAI(5)}>+5 路人</button>
          <button onClick={() => store.debugAddAI(10)}>+10 路人</button>
        </div>
        <div className="debug-buttons" style={{ marginTop: 4 }}>
          <button onClick={store.debugFillToThreshold}>填至門檻</button>
          <button onClick={store.debugFillToLastOne}>填至剩1</button>
          <button onClick={store.debugFillComplete}>填滿</button>
        </div>
        <div className="debug-slider-row">
          <span className="debug-slider-label">AI速度</span>
          <input
            type="range"
            min="0"
            max="100"
            value={store.aiSpeedValue}
            onChange={(e) => store.debugSetAISpeed(Number(e.target.value))}
            className="debug-slider"
          />
          <span className="debug-slider-value">{speedLabel}</span>
        </div>
        <div className="debug-toggle-row">
          <span>暫停AI</span>
          <button
            className={`debug-toggle-btn ${store.aiPaused ? 'active' : ''}`}
            onClick={store.debugToggleAIPause}
          >
            {store.aiPaused ? '● 已暫停' : '○ 運行中'}
          </button>
        </div>
      </Section>

      {/* Time Controls */}
      <Section title="時間控制">
        <div className="debug-buttons">
          <button onClick={() => store.debugTimeSubtract(60)}>-1分鐘</button>
          <button onClick={() => store.debugTimeSubtract(600)}>-10分鐘</button>
        </div>
        <div className="debug-buttons" style={{ marginTop: 4 }}>
          <button onClick={() => store.debugTimeSetRemaining(60)}>剩1分鐘</button>
          <button onClick={() => store.debugTimeSetRemaining(10)}>剩10秒</button>
          <button onClick={store.debugTimeExpire}>時間到</button>
        </div>
      </Section>

      {/* Reward Controls */}
      <Section title="開獎控制">
        <div className="debug-buttons">
          <button onClick={store.debugForceReward}>強制開獎</button>
          <button onClick={store.debugForceWin}>我中大獎</button>
        </div>
        <div className="debug-buttons" style={{ marginTop: 4 }}>
          <button onClick={store.debugSkipCeremony}>跳過演出</button>
          <button onClick={store.debugReplayCeremony}>重播演出</button>
        </div>
      </Section>

      {/* Status */}
      <Section title="狀態">
        <div className="debug-status-grid">
          <div className="debug-stat-row">
            <span>魂力</span>
            <span className="debug-stat-val">{filled} / {total}</span>
          </div>
          {store.currentBeast.slots.map(s => (
            <div key={s.rarity} className="debug-stat-row">
              <span>{RARITY_LABELS[s.rarity as Rarity]}</span>
              <span className="debug-stat-val">
                {store.getRemainingSlots(s.rarity as Rarity)} / {s.count}
              </span>
            </div>
          ))}
          <div className="debug-stat-row">
            <span>總權重</span>
            <span className="debug-stat-val">{totalWeight.toFixed(2)}</span>
          </div>
          <div className="debug-stat-row">
            <span>玩家位</span>
            <span className="debug-stat-val">
              {playerParts.length} / 3
              {playerParts.length > 0 && ` (${playerParts.map(p => RARITY_LABELS[p.rarity as Rarity]).join('+')})`}
            </span>
          </div>
          <div className="debug-stat-row">
            <span>AI數</span>
            <span className="debug-stat-val">{aiCount}</span>
          </div>
          <div className="debug-stat-row">
            <span>倒計時</span>
            <span className="debug-stat-val">{store.formatTime(store.raid.timeRemaining)}</span>
          </div>
          <div className="debug-stat-row">
            <span>狀態</span>
            <span className="debug-stat-val">{store.raid.status}</span>
          </div>
          <div className="debug-stat-row">
            <span>頁面</span>
            <span className="debug-stat-val">{store.currentPage}</span>
          </div>
          <div className="debug-stat-row">
            <span>剩餘格</span>
            <span className="debug-stat-val">{remaining}</span>
          </div>
        </div>
      </Section>

      {/* UI Toggles */}
      <Section title="UI 開關">
        <div className="debug-buttons">
          <button onClick={store.toggleDanmaku}>
            {store.danmakuVisible ? '● 彈幕ON' : '○ 彈幕OFF'}
          </button>
        </div>
      </Section>

      {/* Data Controls */}
      <Section title="資料">
        <div className="debug-buttons">
          <button onClick={store.debugResetAll}>重置全部</button>
          <button onClick={() => store.debugAddCoins(1000)}>+1000魂幣</button>
          <button onClick={store.debugClearCoins}>清空魂幣</button>
        </div>
        <div className="debug-stat-row" style={{ marginTop: 6 }}>
          <span>魂幣</span>
          <span className="debug-stat-val">{store.playerSoulCoins.toLocaleString()}</span>
        </div>
      </Section>
    </div>
  );
}
