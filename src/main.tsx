import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './tokens.css'
import './base.css'
import './components.css'
import App from './App.tsx'

const root = createRoot(document.getElementById('root')!)
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Fade out loading splash after React paints
requestAnimationFrame(() => {
  const splash = document.getElementById('app-loading')
  if (splash) {
    splash.classList.add('fade-out')
    setTimeout(() => splash.remove(), 420)
  }
})
