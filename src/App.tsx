import { useEffect } from 'react';
import { useStore } from './hooks/useStore';
import * as store from './store/gameStore';
import { HomePage } from './components/HomePage';
import { BeastPage } from './components/BeastPage';
import { SelectPage } from './components/SelectPage';
import { WatchPage } from './components/WatchPage';
import { RewardPage } from './components/RewardPage';
import { InventoryPage } from './components/InventoryPage';
import { RulesPage } from './components/RulesPage';
import { DebugPanel } from './components/DebugPanel';

// Expose for demo testing
(window as unknown as Record<string, unknown>).__demoFill = () => store.demoFillRaid();

export default function App() {
  useStore();

  useEffect(() => {
    store.initRaid();
    return () => {
      store.stopTimer();
      store.stopAISimulation();
      store.stopBattleLog();
      store.stopAIDanmaku();
    };
  }, []);

  // Debug keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'd': case 'D': store.toggleDebug(); break;
        case '1': store.debugAddAI(1); break;
        case '5': store.debugAddAI(5); break;
        case 'f': case 'F': store.debugFillComplete(); break;
        case 'w': case 'W': store.debugForceWin(); break;
        case 't': case 'T': store.debugFastForward(); break;
        case 'r': case 'R': store.debugResetAll(); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const renderPage = () => {
    switch (store.currentPage) {
      case 'home': return <HomePage />;
      case 'beast': return <BeastPage />;
      case 'select': return <SelectPage />;
      case 'watching': return <WatchPage />;
      case 'reward': return <RewardPage />;
      case 'inventory': return <InventoryPage />;
      case 'rules': return <RulesPage />;
      default: return <HomePage />;
    }
  };

  return (
    <>
      {renderPage()}
      <DebugPanel />
    </>
  );
}
