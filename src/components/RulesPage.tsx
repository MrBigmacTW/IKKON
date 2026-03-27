import * as store from '../store/gameStore';

export function RulesPage() {
  return (
    <div className="page rules-page">
      <div className="top-bar">
        <button className="btn-back" onClick={() => store.navigate('home')}>← 返回</button>
        <span className="page-title">📋 規則與機率</span>
      </div>

      <div className="rules-content">
        <h2>⚔️ 一刀入魂 — 遊戲規則</h2>

        <section className="rules-section">
          <h3>【基本規則】</h3>
          <ul>
            <li>選擇刀客（英雄角色）加入討伐。</li>
            <li>所有位置填滿後災獸被擊殺，開始結算。</li>
            <li>每位參與者確定獲得一件掉落品（實物或魂幣）。</li>
            <li>額外抽選一人獲得魂級掉落（大獎）。</li>
          </ul>
        </section>

        <section className="rules-section">
          <h3>【稀有度與權重】</h3>
          <div className="rules-table">
            <div className="rules-row">
              <span style={{ color: '#8B8B8B' }}>⚪ 凡（99元）</span>
              <span>權重 1.0×</span>
            </div>
            <div className="rules-row">
              <span style={{ color: '#60A5FA' }}>🔵 銳（129元）</span>
              <span>權重 1.1×</span>
            </div>
            <div className="rules-row">
              <span style={{ color: '#A78BFA' }}>🟣 魂（149元）</span>
              <span>權重 1.2×</span>
            </div>
            <div className="rules-row">
              <span style={{ color: '#FBBF24' }}>🟡 神（179元）</span>
              <span>權重 1.35×</span>
            </div>
          </div>
          <p className="rules-note">你的中獎機率 = 你的權重 ÷ 全場總權重</p>
        </section>

        <section className="rules-section">
          <h3>【入魂限制】</h3>
          <ul>
            <li>每人每場最多 3 刀，每刀必須選不同角色。</li>
            <li>買 3 刀 = 3 個位置 = 3 倍機率。</li>
          </ul>
        </section>

        <section className="rules-section">
          <h3>【掉落品處理】</h3>
          <ul>
            <li>📦 領取實物：填寫收件地址。</li>
            <li>🔥 熔煉為魂幣：立即入帳。</li>
            <li>⏱️ 24 小時內未選擇自動熔煉。</li>
          </ul>
        </section>

        <section className="rules-section">
          <h3>【公平性】</h3>
          <ul>
            <li>所有結果由鏈上隨機數（VRF）決定。</li>
            <li>權重表寫入智能合約，不可修改。</li>
            <li>所有歷史結果公開可查。</li>
          </ul>
        </section>

        <div className="rules-disclaimer">
          所有結果由鏈上隨機數決定，傷害數字與斬擊演出為視覺效果，不影響實際中獎機率。
        </div>
      </div>
    </div>
  );
}
