# IKKON 一刀入魂 — 設計軍規

## 視覺方向（不可妥協）
- 主題：武俠刀劍 × 格鬥遊戲 HUD
- 色彩系統：
  --color-bg: #0a0a0a
  --color-primary: #c8102e     /* 熱血硃紅 */
  --color-accent: #e8d5a3      /* 刀鋒金 */
  --color-surface: #1a1a1a
  --color-text: #f0ece0
- 字體：Noto Serif TC（中文）+ Bebas Neue（數字/英文 HUD）
- 動畫：重擊感，不輕飄。用 CSS keyframes 或 Framer Motion
- 記憶點：出刀瞬間畫面震動 + 紅光閃爍

## 禁止事項
- 不用 Inter / system-ui / Roboto
- 不用圓角超過 8px 的軟 UI
- 不用紫色漸層
- 不做沒有動畫的靜態卡片
- 不做置中對齊的無聊 layout

## Tech Stack
- React + TypeScript + Vite
- CSS 架構：tokens.css / base.css / components.css
- 字體：Bebas Neue（HUD 數字）+ Noto Serif TC（中文標題）
- 稀有度色系由 [data-rarity] CSS 屬性選擇器控制，不用 JS inline style

## 角色影片
- public/assets/characters/ 底下，命名規則：A1–A6（劍士）、B1–B6（法師）、C1–C6（弓手）、D1–D6（重裝）、E1–E6（輔助）
- 順序：凡×2 → 銳×2 → 魂×1 → 神×1，對應 blademasters.ts 的排列順序

## 工作規則
- 用繁體中文溝通
- 每次改動後截圖確認再繼續
