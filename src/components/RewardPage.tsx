import { useStore } from '../hooks/useStore';
import * as store from '../store/gameStore';
import { RARITY_COLORS } from '../types';
import type { Rarity } from '../types';

const EFFECT_EMOJIS = ['💥', '⚡', '🔥', '❄️', '✨', '💫', '🌟', '⭐'];

export function RewardPage() {
  useStore();

  const phase = store.rewardPhase;

  return (
    <div className="reward-page">
      {phase === 'assault' && <AssaultPhase />}
      {phase === 'slayer' && <SlayerPhase />}
      {phase === 'ranking' && <RankingPhase />}
      {(phase === 'roulette' || phase === 'reveal') && <RoulettePhase />}
    </div>
  );
}

function AssaultPhase() {
  const participants = store.raid.participants;
  return (
    <div className="phase-assault">
      <div className="assault-flash" />
      <div className="assault-beast">🐉</div>
      <div className="assault-effects">
        {EFFECT_EMOJIS.concat(EFFECT_EMOJIS).map((e, i) => (
          <span key={i} className="effect-emoji" style={{
            '--delay': `${Math.random() * 2}s`,
            '--x': `${-60 + Math.random() * 120}px`,
            '--y': `${-80 + Math.random() * 60}px`,
          } as React.CSSProperties}>
            {e}
          </span>
        ))}
      </div>
      <div className="assault-characters">
        {participants.map((p) => (
          <span key={p.id} className="assault-char" style={{
            '--delay': `${Math.random() * 1.5}s`,
          } as React.CSSProperties}>
            {p.blademaster.emoji}
          </span>
        ))}
      </div>
      <div className="assault-title">⚔️ 全員總攻！</div>
    </div>
  );
}

/** Slayer Phase — the winner's "hero moment" cinematic.
 *  Sub-phases: hpDrain → darken → strike → fall
 *  RNG already decided the winner; this is the narrative packaging. */
function SlayerPhase() {
  const winner = store.rewardWinner;
  const sub = store.slayerSubPhase;
  if (!winner) return null;

  const winnerColor = RARITY_COLORS[winner.rarity as Rarity];

  return (
    <div className={`phase-slayer slayer-${sub}`}>
      {/* Boss with HP draining */}
      <div className="slayer-boss-area">
        <div className={`slayer-beast ${sub === 'fall' ? 'beast-falling' : ''}`}>🐉</div>
        <div className="slayer-hp-bar">
          <div className={`slayer-hp-fill ${sub === 'hpDrain' ? 'hp-draining' : ''}`}
            style={{ width: sub === 'hpDrain' ? '5%' : '0%' }}
          />
          <span className="slayer-hp-text">
            {sub === 'hpDrain' ? '❤️ 5%' : sub === 'darken' ? '❤️ 5%' : '❤️ 0%'}
          </span>
        </div>
      </div>

      {/* Darken overlay */}
      {(sub === 'darken' || sub === 'strike' || sub === 'fall') && (
        <div className="slayer-darken-overlay" />
      )}

      {/* Hero flies in and strikes */}
      {(sub === 'strike' || sub === 'fall') && (
        <div className="slayer-hero-strike">
          <span className="slayer-hero-emoji" style={{ filter: `drop-shadow(0 0 20px ${winnerColor})` }}>
            {winner.blademaster.emoji}
          </span>
          <div className="slayer-slash-fx">⚔️</div>
        </div>
      )}

      {/* Boss falls + reveal text */}
      {sub === 'fall' && (
        <div className="slayer-reveal-text">
          <div className="slayer-title">⚔️ 斬魂！</div>
          <div className="slayer-winner-name" style={{ color: winnerColor }}>
            {winner.blademaster.name} — {winner.playerName}
          </div>
          {store.playerIsWinner && (
            <div className="slayer-you">就是你！最後一刀！</div>
          )}
        </div>
      )}

      {/* All participant emojis during hpDrain sub-phase */}
      {sub === 'hpDrain' && (
        <div className="slayer-crowd">
          {store.raid.participants.slice(0, 20).map((p) => (
            <span key={p.id} className="slayer-crowd-char">
              {p.blademaster.emoji}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RankingPhase() {
  const ranked = store.rewardRanking;

  return (
    <div className="phase-ranking">
      <h2 className="ranking-title">🏆 斬擊榜</h2>
      <div className="ranking-list">
        {ranked.map((p, i) => {
          const color = RARITY_COLORS[p.rarity as Rarity];
          const isLegend = p.rarity === 'legend';
          const isPlayer = !p.isAI;
          const isWinner = p.id === store.rewardWinner?.id;
          return (
            <div
              key={p.id}
              className={`ranking-row ${isLegend ? 'ranking-legend' : ''} ${isPlayer ? 'ranking-player' : ''} ${isWinner ? 'ranking-winner' : ''}`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span className="ranking-rank">#{i + 1}</span>
              <span className="ranking-emoji">{p.blademaster.emoji}</span>
              <span className="ranking-charname" style={{ color }}>
                {p.blademaster.name}
              </span>
              <span className="ranking-playername">({p.playerName})</span>
              <span className="ranking-damage">{p.damage.toLocaleString()}</span>
              {isWinner && i === 0 && <span className="ranking-mvp">MVP</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RoulettePhase() {
  const participants = store.raid.participants;
  const highlightIdx = store.rouletteHighlightIndex;
  const winner = store.rewardWinner;
  const isReveal = store.rewardPhase === 'reveal';

  if (isReveal && winner) {
    return (
      <div className="phase-reveal">
        <div className="reveal-particles">
          {Array.from({ length: 30 }).map((_, i) => (
            <span key={i} className="particle" style={{
              '--angle': `${(i / 30) * 360}deg`,
              '--dist': `${80 + Math.random() * 120}px`,
              '--delay': `${Math.random() * 0.5}s`,
              '--size': `${20 + Math.random() * 16}px`,
            } as React.CSSProperties}>
              {['🌟', '✨', '💫', '⭐'][i % 4]}
            </span>
          ))}
        </div>
        <div className="reveal-emoji">{winner.blademaster.emoji}</div>
        <div className="reveal-title">🏆 魂級掉落！</div>
        <div className="reveal-winner" style={{ color: RARITY_COLORS[winner.rarity as Rarity] }}>
          {winner.blademaster.name} — {winner.playerName}
        </div>
        <div className="reveal-prize">獲得 {store.currentBeast.prize}！</div>
        {store.playerIsWinner && (
          <div className="reveal-you">🎉 恭喜！你就是大獎得主！🎉</div>
        )}
      </div>
    );
  }

  // Roulette wheel
  const displayCount = Math.min(participants.length, 20);
  const step = Math.max(1, Math.floor(participants.length / displayCount));
  const displayed = participants.filter((_, i) => i % step === 0).slice(0, displayCount);
  const displayHighlight = highlightIdx >= 0 ? highlightIdx % displayed.length : -1;

  return (
    <div className="phase-roulette">
      <h2 className="roulette-title">🏆 魂級掉落抽選</h2>
      <div className="roulette-ring">
        {displayed.map((p, i) => {
          const angle = (i / displayed.length) * 360 - 90;
          const radius = 130;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;
          const isHighlighted = displayHighlight === i;
          const color = RARITY_COLORS[p.rarity as Rarity];

          return (
            <div
              key={p.id}
              className={`roulette-slot ${isHighlighted ? 'roulette-active' : ''}`}
              style={{
                transform: `translate(${x}px, ${y}px) scale(${isHighlighted ? 1.4 : 1})`,
                borderColor: isHighlighted ? '#ffd700' : color,
                boxShadow: isHighlighted ? `0 0 20px ${color}, 0 0 40px rgba(255,215,0,0.5)` : 'none',
              }}
            >
              {p.blademaster.emoji}
            </div>
          );
        })}
        <div className="roulette-center">
          <span>🐉</span>
          <span className="roulette-label">抽選中...</span>
        </div>
      </div>
    </div>
  );
}
