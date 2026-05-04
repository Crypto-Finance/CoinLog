import Decimal from 'decimal.js';
import type { Trade, TradeStats } from './types';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

const DECIMAL_PLACES = 2;
const fmt = (d: Decimal) => d.toDecimalPlaces(DECIMAL_PLACES).toString();
const pct = (num: Decimal, den: number) =>
  den > 0 ? fmt(num.div(den).mul(100)) : '0.00';
const avg = (values: Decimal[]) =>
  values.length > 0
    ? fmt(values.reduce((s, v) => s.plus(v), new Decimal(0)).div(values.length))
    : '0.00';

// ---------------------------------------------------------------------------
// Phase 1: Sort trades by time
// ---------------------------------------------------------------------------

/**
 * Sort trades by openTime ascending (mutates a copy, not the original).
 */
function sortByTime(trades: Trade[]): Trade[] {
  return [...trades].sort(
    (a, b) => new Date(a.openTime).getTime() - new Date(b.openTime).getTime(),
  );
}

// ---------------------------------------------------------------------------
// Phase 2: Single-pass accumulation
// ---------------------------------------------------------------------------

interface TradeAccumulator {
  winningTrades: number;
  losingTrades: number;
  totalPnL: Decimal;
  grossProfit: Decimal;
  grossLoss: Decimal;
  wins: Decimal[];
  losses: Decimal[];
  rrValues: Decimal[];
  currentWinStreak: number;
  currentLossStreak: number;
  maxStreakWin: number;
  maxStreakLoss: number;
  peakEquity: Decimal;
  currentEquity: Decimal;
  maxDrawdown: Decimal;
}

function createAccumulator(): TradeAccumulator {
  return {
    winningTrades: 0,
    losingTrades: 0,
    totalPnL: new Decimal(0),
    grossProfit: new Decimal(0),
    grossLoss: new Decimal(0),
    wins: [],
    losses: [],
    rrValues: [],
    currentWinStreak: 0,
    currentLossStreak: 0,
    maxStreakWin: 0,
    maxStreakLoss: 0,
    peakEquity: new Decimal(0),
    currentEquity: new Decimal(0),
    maxDrawdown: new Decimal(0),
  };
}

/**
 * Accumulate trade stats in a single pass over sorted trades.
 */
function accumulateTrades(sorted: Trade[]): TradeAccumulator {
  const acc = createAccumulator();

  for (const trade of sorted) {
    const pnl = new Decimal(trade.pnl);
    acc.totalPnL = acc.totalPnL.plus(pnl);
    acc.currentEquity = acc.currentEquity.plus(pnl);

    if (acc.currentEquity.greaterThan(acc.peakEquity)) {
      acc.peakEquity = acc.currentEquity;
    }

    const drawdown = acc.peakEquity.minus(acc.currentEquity);
    if (drawdown.greaterThan(acc.maxDrawdown)) {
      acc.maxDrawdown = drawdown;
    }

    const rr = new Decimal(trade.rrActual || '0');
    if (rr.greaterThan(0)) {
      acc.rrValues.push(rr);
    }

    if (pnl.greaterThan(0)) {
      acc.winningTrades++;
      acc.grossProfit = acc.grossProfit.plus(pnl);
      acc.wins.push(pnl);
      acc.currentWinStreak++;
      acc.currentLossStreak = 0;
      if (acc.currentWinStreak > acc.maxStreakWin) {
        acc.maxStreakWin = acc.currentWinStreak;
      }
    } else if (pnl.lessThan(0)) {
      acc.losingTrades++;
      acc.grossLoss = acc.grossLoss.plus(pnl.abs());
      acc.losses.push(pnl.abs());
      acc.currentLossStreak++;
      acc.currentWinStreak = 0;
      if (acc.currentLossStreak > acc.maxStreakLoss) {
        acc.maxStreakLoss = acc.currentLossStreak;
      }
    } else {
      acc.currentWinStreak = 0;
      acc.currentLossStreak = 0;
    }
  }

  return acc;
}

// ---------------------------------------------------------------------------
// Phase 3: Post-loop calculations
// ---------------------------------------------------------------------------

/**
 * Compute final TradeStats from accumulator and total trade count.
 */
function computeStats(acc: TradeAccumulator, totalTrades: number): TradeStats {
  return {
    totalTrades,
    winningTrades: acc.winningTrades,
    losingTrades: acc.losingTrades,
    winRate: pct(new Decimal(acc.winningTrades), totalTrades),
    totalPnL: fmt(acc.totalPnL),
    avgWin: avg(acc.wins),
    avgLoss: avg(acc.losses),
    expectancy: totalTrades > 0 ? fmt(acc.totalPnL.div(totalTrades)) : '0.00',
    profitFactor: acc.grossLoss.greaterThan(0)
      ? fmt(acc.grossProfit.div(acc.grossLoss))
      : '-1',
    maxDrawdown: fmt(acc.maxDrawdown),
    maxStreakWin: acc.maxStreakWin,
    maxStreakLoss: acc.maxStreakLoss,
    avgRR: avg(acc.rrValues),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function calculateStats(trades: Trade[]): TradeStats {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: '0.00',
      totalPnL: '0.00',
      avgWin: '0.00',
      avgLoss: '0.00',
      expectancy: '0.00',
      profitFactor: '-1',
      maxDrawdown: '0.00',
      maxStreakWin: 0,
      maxStreakLoss: 0,
      avgRR: '0.00',
    };
  }

  const sorted = sortByTime(trades);
  const acc = accumulateTrades(sorted);
  return computeStats(acc, sorted.length);
}
