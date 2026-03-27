import { useState, useEffect } from 'react';
import { subscribe } from '../store/gameStore';

export function useStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = subscribe(() => {
      setTick(t => t + 1);
    });
    return () => { unsub(); };
  }, []);
}
