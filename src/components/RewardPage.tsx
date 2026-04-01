import { useStore } from '../hooks/useStore';
import * as store from '../store/gameStore';
import { Swords, Trophy, Sparkles, ClassIcon } from './Icons';

const BEAST_IMAGES: Record<string, string> = {
  flame_dragon: '/assets/beasts/flame_dragon.png',
  nine_tail_fox: '/assets/beasts/nine_tail_fox.png',
  frost_wolf: '/assets/beasts/frost_wolf.png',
  thunder_eagle: '/assets/beasts/thunder_eagle.png',
  skeleton_giant: '/assets/beasts/skeleton_giant.png',
};

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
      <img className="assault-beast-art" src={BEAST_IMAGES[store.currentBeast.id]} alt={store.currentBeast.name} />
      <div className="assault-effects">
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} className="effect-particle" style={{
            '--delay': `${Math.random() * 2}s`,
            '--x': `${-60 + Math.random() * 120}px`,
            '--y': `${-80 + Math.random() * 60}px`,
          } as React.CSSProperties} />
        ))}
      </div>
      <div className="assault-characters">
        {participants.map((p) => (
          <span key={p.id} className="assault-char" data-rarity={p.rarity} style={{
            '--delay': `${Math.random() * 1.5}s`,
          } as React.CSSProperties}>
            <ClassIcon cls={p.blademaster.class} size={22} />
          </span>
        ))}
      </div>
      <div className="assault-title"><Swords size={28} className="icon-inline" /> 全員總攻！</div>
    </div>
  );
}

function SlayerPhase() {
  const winner = store.rewardWinner;
  const sub = store.slayerSubPhase;
  if (!winner) return null;

  return (
    <div className={`phase-slayer slayer-${sub}`}>
      {/* Boss with HP draining */}
      <div className="slayer-boss-area">
        <img
          className={`slayer-beast-art ${sub === 'fall' ? 'beast-falling' : ''}`}
          src={BEAST_IMAGES[store.currentBeast.id]}
          alt={store.currentBeast.name}
        />
        <div className="slayer-hp-bar">
          <div className={`slayer-hp-fill ${sub === 'hpDrain' ? 'hp-draining' : ''}`}
            style={{ width: sub === 'hpDrain' ? '5%' : '0%' }}
          />
          <span className="slayer-hp-text">
            {sub === 'hpDrain' || sub === 'darken' ? '5%' : '0%'}
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
          <span className="slayer-hero-icon" data-rarity={winner.rarity} style={{ filter: 'drop-shadow(0 0 20px var(--r-color))' }}>
            <ClassIcon cls={winner.blademaster.class} size={48} />
          </span>
          <div className="slayer-slash-fx"><Swords size={32} /></div>
        </div>
      )}

      {/* Boss falls + reveal text */}
      {sub === 'fall' && (
        <div className="slayer-reveal-text">
          <div className="slayer-title"><Swords size={24} className="icon-inline" /> 斬魂！</div>
          <div className="slayer-winner-name" data-rarity={winner.rarity}>
            {winner.blademaster.name} — {winner.playerName}
          </div>
          {store.playerIsWinner && (
            <div className="slayer-you">就是你！最後一刀！</div>
          )}
        </div>
      )}

      {/* All participant icons during hpDrain sub-phase */}
      {sub === 'hpDrain' && (
        <div className="slayer-crowd">
          {store.raid.participants.slice(0, 20).map((p) => (
            <span key={p.id} className="slayer-crowd-char" data-rarity={p.rarity}>
              <ClassIcon cls={p.blademaster.class} size={18} />
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
      <h2 className="ranking-title"><Trophy size={22} className="icon-inline" /> 斬擊榜</h2>
      <div className="ranking-list">
        {ranked.map((p, i) => {
          const isLegend = p.rarity === 'legend';
          const isPlayer = !p.isAI;
          const isWinner = p.id === store.rewardWinner?.id;
          return (
            <div
              key={p.id}
              className={`ranking-row ${isLegend ? 'ranking-legend' : ''} ${isPlayer ? 'ranking-player' : ''} ${isWinner ? 'ranking-winner' : ''}`}
              data-rarity={p.rarity}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span className="ranking-rank">#{i + 1}</span>
              <span className="ranking-icon">
                <ClassIcon cls={p.blademaster.class} size={18} />
              </span>
              <span className="ranking-charname">
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
            <span key={i} className="reveal-particle" style={{
              '--angle': `${(i / 30) * 360}deg`,
              '--dist': `${80 + Math.random() * 120}px`,
              '--delay': `${Math.random() * 0.5}s`,
              '--size': `${20 + Math.random() * 16}px`,
            } as React.CSSProperties}>
              <Sparkles size={16} />
            </span>
          ))}
        </div>
        <div className="reveal-icon" data-rarity={winner.rarity}>
          <ClassIcon cls={winner.blademaster.class} size={64} />
        </div>
        <div className="reveal-title"><Trophy size={24} className="icon-inline" /> 魂級掉落！</div>
        <div className="reveal-winner" data-rarity={winner.rarity}>
          {winner.blademaster.name} — {winner.playerName}
        </div>
        <div className="reveal-prize">獲得 {store.currentBeast.prize}！</div>
        {store.playerIsWinner && (
          <div className="reveal-you">恭喜！你就是大獎得主！</div>
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
      <h2 className="roulette-title"><Trophy size={22} className="icon-inline" /> 魂級掉落抽選</h2>
      <div className="roulette-ring">
        {displayed.map((p, i) => {
          const angle = (i / displayed.length) * 360 - 90;
          const radius = 130;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;
          const isHighlighted = displayHighlight === i;

          return (
            <div
              key={p.id}
              className={`roulette-slot ${isHighlighted ? 'roulette-active' : ''}`}
              data-rarity={p.rarity}
              style={{
                transform: `translate(${x}px, ${y}px) scale(${isHighlighted ? 1.4 : 1})`,
                borderColor: isHighlighted ? 'var(--gold)' : 'var(--r-color)',
                boxShadow: isHighlighted ? '0 0 20px var(--r-color), 0 0 40px rgba(255,215,0,0.5)' : 'none',
              }}
            >
              <ClassIcon cls={p.blademaster.class} size={20} />
            </div>
          );
        })}
        <div className="roulette-center">
          <Sparkles size={24} />
          <span className="roulette-label">抽選中...</span>
        </div>
      </div>
    </div>
  );
}
