import type { Trade } from '../../domain/types';
import { createTrade } from '../../domain/trade-factory';

// ---------------------------------------------------------------------------
// Bybit API response types
// ---------------------------------------------------------------------------

export interface BybitClosedPnlEntry {
  symbol: string;
  orderId: string;
  side: string; // "Buy" or "Sell"
  qty: string;
  cumEntryValue: string;
  avgEntryPrice: string;
  cumExitValue: string;
  avgExitPrice: string;
  closedPnl: string;
  fillCount: string;
  leverage: string;
  createdTime: string; // unix ms
  updatedTime: string; // unix ms
}

// ---------------------------------------------------------------------------
// Direction mapping
// ---------------------------------------------------------------------------

/**
 * Bybit "side" is the closing side:
 *   "Sell" = sold to close → was a Long position
 *   "Buy"  = bought to cover → was a Short position
 */
export function directionFromSide(side: string): 'Long' | 'Short' {
  if (side === 'Sell') return 'Long';
  if (side === 'Buy') return 'Short';
  throw new Error(`Unknown Bybit side: "${side}". Expected "Buy" or "Sell".`);
}

// ---------------------------------------------------------------------------
// Fee reverse-engineering
// ---------------------------------------------------------------------------

/**
 * Bybit doesn't return fee directly. We reverse-engineer it:
 *   Long:  Fee = cumExitValue - cumEntryValue - closedPnl
 *   Short: Fee = cumEntryValue - cumExitValue - closedPnl
 * Clamp to zero if negative (shouldn't happen, but safety first).
 */
export function calculateFee(
  direction: 'Long' | 'Short',
  cumEntryValue: string,
  cumExitValue: string,
  closedPnl: string,
): string {
  const entry = parseFloat(cumEntryValue);
  const exit = parseFloat(cumExitValue);
  const pnl = parseFloat(closedPnl);

  if (isNaN(entry) || isNaN(exit) || isNaN(pnl)) return '0';

  const rawFee =
    direction === 'Long'
      ? exit - entry - pnl
      : entry - exit - pnl;

  return rawFee > 0 ? rawFee.toFixed(8) : '0';
}

// ---------------------------------------------------------------------------
// Trade mapper
// ---------------------------------------------------------------------------

export function mapBybitToTrade(entry: BybitClosedPnlEntry): Omit<Trade, 'id'> {
  const direction = directionFromSide(entry.side);
  const fee = calculateFee(
    direction,
    entry.cumEntryValue,
    entry.cumExitValue,
    entry.closedPnl,
  );

  const openTime = new Date(parseInt(entry.createdTime, 10)).toISOString();
  const closeTime = new Date(parseInt(entry.updatedTime, 10)).toISOString();

  return createTrade({
    exchange: 'Bybit',
    exchangeOrderId: entry.orderId,
    symbol: entry.symbol,
    direction,
    entryPrice: entry.avgEntryPrice,
    exitPrice: entry.avgExitPrice,
    quantity: entry.qty,
    fee,
    pnl: entry.closedPnl,
    openTime,
    closeTime,
    // Annotation fields — left blank for API-imported trades
  });
}
