import { toNumber } from '../utils/utils';

/**
 * P&L color utility functions.
 * Separated from utils.ts for better modularity.
 */

export function pnlColor(value: string | number): string {
  const num = toNumber(value);
  if (num > 0) return 'text-[#BFFF00]';   // Neon Green
  if (num < 0) return 'text-[#FFD1DC]';   // Pastel Pink
  return 'text-[#c3caac]';                // Muted
}

export function pnlBorder(value: string | number): string {
  const num = toNumber(value);
  if (num > 0) return 'border-[#BFFF00]';
  if (num < 0) return 'border-[#FFD1DC]';
  return 'border-[rgba(255,255,255,0.1)]';
}

export function pnlBg(value: string | number): string {
  const num = toNumber(value);
  if (num > 0) return 'bg-[#BFFF00]/10 text-[#BFFF00]';
  if (num < 0) return 'bg-[#FFD1DC]/10 text-[#FFD1DC]';
  return 'bg-[#1f2a3c] text-[#c3caac]';
}

/**
 * Return border + background classes for a P&L card.
 */
export function pnlCardClass(value: string | number): string {
  const num = toNumber(value);
  if (num > 0) return 'border-[#BFFF00] bg-[#BFFF00]/10';
  if (num < 0) return 'border-[#FFD1DC] bg-[#FFD1DC]/10';
  return 'border-[rgba(255,255,255,0.1)] bg-[#1f2a3c]';
}

export function pnlBadgeBg(value: string | number): string {
  const num = toNumber(value);
  if (num > 0) return 'bg-[#BFFF00] text-[#081425]';
  if (num < 0) return 'bg-[#FFD1DC] text-[#081425]';
  return 'bg-[#1f2a3c] text-[#d7e3fb]';
}

export function winRateBadgeBg(winRate: string | number): string {
  const num = typeof winRate === 'string' ? parseFloat(winRate) : winRate;
  return num >= 50 ? 'bg-[#BFFF00] text-[#081425]' : 'bg-[#FFD1DC] text-[#081425]';
}

export function winRateColor(winRate: string | number): string {
  const num = typeof winRate === 'string' ? parseFloat(winRate) : winRate;
  return num >= 50 ? 'text-emerald-600' : 'text-red-600';
}
