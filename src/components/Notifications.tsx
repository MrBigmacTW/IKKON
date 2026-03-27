import { useStore } from '../hooks/useStore';
import * as store from '../store/gameStore';

export function Notifications() {
  useStore();

  if (store.notifications.length === 0) return null;

  return (
    <div className="notifications">
      {store.notifications.slice(0, 5).map((n) => (
        <div key={n.id} className="notif-item">
          {n.text}
        </div>
      ))}
    </div>
  );
}
