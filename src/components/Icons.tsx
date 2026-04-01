/**
 * Centralized icon system — replaces all emoji with Lucide icons.
 * Character class icons + UI icons.
 */
import {
  Sword, Wand2, Crosshair, Shield, HeartPulse,
  Heart, Clock, Trophy, Coins, Megaphone,
  Flame, Target, Gift, Package, Eye,
  Home, RefreshCw, Share2, FileText, Wrench,
  Sparkles, MessageCircle, Zap, Bomb,
  BookOpen, ChevronLeft, CircleDot, Scroll,
  AlertTriangle, Swords, Store, Check,
  type LucideProps,
} from 'lucide-react';
import type { FC } from 'react';

/* ── Class icons for blademasters ── */
const CLASS_ICON_MAP: Record<string, FC<LucideProps>> = {
  sword: Sword,
  mage: Wand2,
  archer: Crosshair,
  tank: Shield,
  support: HeartPulse,
};

export function ClassIcon({ cls, size = 20, ...props }: { cls: string; size?: number } & LucideProps) {
  const Icon = CLASS_ICON_MAP[cls] || Sword;
  return <Icon size={size} {...props} />;
}

/* ── Rarity dot (replaces ⚪🔵🟣🟡) ── */
export function RarityDot({ rarity, size = 10 }: { rarity: string; size?: number }) {
  return (
    <span
      className="rarity-dot"
      data-rarity={rarity}
      style={size !== 10 ? { width: size, height: size } : undefined}
    />
  );
}

/* ── Re-export commonly used icons with standard sizes ── */
export {
  Heart, Clock, Trophy, Coins, Megaphone,
  Flame, Target, Gift, Package, Eye,
  Home, RefreshCw, Share2, FileText, Wrench,
  Sparkles, MessageCircle, Zap, Bomb,
  BookOpen, ChevronLeft, CircleDot, Scroll,
  AlertTriangle, Swords, Store, Check, Shield,
  Sword, Wand2, Crosshair, HeartPulse,
};
