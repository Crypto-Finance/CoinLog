import { describe, it, expect } from 'vitest';
import { calculateStats } from '../domain/stats';
import type { Trade } from '../domain/types';

// Helper to create a test trade
function createTrade(overrides: Partial<Trade> = {}): Trade {
  const baseTime = Date.now();
  return {
    id: 0,
    exchange: 'Bybit',
    exchangeOrderId: `order-${Math.random()}`,
    symbol: 'BTCUSDT',
    direction: 'Long',
    entryPrice: '50000',
    exitPrice: '50000',
    quantity: '1',
    fee: '0',
    pnl: '0',
    openTime: new Date(baseTime).toISOString(),
    closeTime: new Date(baseTime + 1000).toISOString(),
    setupType: '',
    stopLoss: '',
    takeProfit: '',
    riskAmount: '',
    rrPlanned: '',
    rrActual: '1',
    exitType: '',
    marketCondition: '',
    notes: '',
    isAnnotated: false,
    ...overrides,
  };
}

describe('calculateStats', () => {
  describe('Empty trades array', () => {
    it('returns zero stats with defaults', () => {
      const stats = calculateStats([]);
      
      expect(stats.totalTrades).toBe(0);
      expect(stats.winningTrades).toBe(0);
      expect(stats.losingTrades).toBe(0);
      expect(stats.winRate).toBe('0.00');
      expect(stats.totalPnL).toBe('0.00');
      expect(stats.avgWin).toBe('0.00');
      expect(stats.avgLoss).toBe('0.00');
      expect(stats.expectancy).toBe('0.00');
      expect(stats.profitFactor).toBe('-1');
      expect(stats.maxDrawdown).toBe('0.00');
      expect(stats.maxStreakWin).toBe(0);
      expect(stats.maxStreakLoss).toBe(0);
      expect(stats.avgRR).toBe('0.00');
    });
  });

  describe('Single winning trade', () => {
    it('correct winRate (100) and totalPnL', () => {
      const trades = [
        createTrade({
          pnl: '100',
          rrActual: '2',
        }),
      ];
      
      const stats = calculateStats(trades);
      
      expect(stats.totalTrades).toBe(1);
      expect(stats.winningTrades).toBe(1);
      expect(stats.losingTrades).toBe(0);
      expect(stats.winRate).toBe('100');
      expect(stats.totalPnL).toBe('100');
      expect(stats.avgWin).toBe('100');
      expect(stats.avgLoss).toBe('0.00'); // Empty losses array returns '0.00'
      expect(stats.expectancy).toBe('100');
      expect(stats.profitFactor).toBe('-1'); // No losses, so -1
      expect(stats.maxDrawdown).toBe('0');
      expect(stats.maxStreakWin).toBe(1);
      expect(stats.maxStreakLoss).toBe(0);
      expect(stats.avgRR).toBe('2');
    });
  });

  describe('Single losing trade', () => {
    it('correct winRate (0)', () => {
      const trades = [
        createTrade({
          pnl: '-50',
          rrActual: '0.5',
        }),
      ];
      
      const stats = calculateStats(trades);
      
      expect(stats.totalTrades).toBe(1);
      expect(stats.winningTrades).toBe(0);
      expect(stats.losingTrades).toBe(1);
      expect(stats.winRate).toBe('0');
      expect(stats.totalPnL).toBe('-50');
      expect(stats.avgWin).toBe('0.00'); // Empty wins array returns '0.00'
      expect(stats.avgLoss).toBe('50');
      expect(stats.expectancy).toBe('-50');
      expect(stats.profitFactor).toBe('0'); // No wins, grossProfit/grossLoss = 0
      expect(stats.maxStreakWin).toBe(0);
      expect(stats.maxStreakLoss).toBe(1);
    });
  });

  describe('Mixed trades', () => {
    it('correct winRate percentage', () => {
      const trades = [
        createTrade({ pnl: '100', openTime: new Date(1000).toISOString() }),
        createTrade({ pnl: '-50', openTime: new Date(2000).toISOString() }),
        createTrade({ pnl: '200', openTime: new Date(3000).toISOString() }),
        createTrade({ pnl: '-100', openTime: new Date(4000).toISOString() }),
        createTrade({ pnl: '50', openTime: new Date(5000).toISOString() }),
      ];
      
      const stats = calculateStats(trades);
      
      // 3 wins out of 5 = 60%
      expect(stats.winningTrades).toBe(3);
      expect(stats.losingTrades).toBe(2);
      expect(stats.winRate).toBe('60');
    });

    it('correct profitFactor calculation', () => {
      const trades = [
        createTrade({ pnl: '100', openTime: new Date(1000).toISOString() }),
        createTrade({ pnl: '-50', openTime: new Date(2000).toISOString() }),
        createTrade({ pnl: '200', openTime: new Date(3000).toISOString() }),
        createTrade({ pnl: '-100', openTime: new Date(4000).toISOString() }),
      ];
      
      const stats = calculateStats(trades);
      
      // Gross profit: 100 + 200 = 300
      // Gross loss: 50 + 100 = 150
      // Profit factor: 300 / 150 = 2
      expect('grossProfit' in stats).toBe(false); // Not in stats
      expect(stats.profitFactor).toBe('2');
    });

    it('correct totalPnL', () => {
      const trades = [
        createTrade({ pnl: '100', openTime: new Date(1000).toISOString() }),
        createTrade({ pnl: '-50', openTime: new Date(2000).toISOString() }),
        createTrade({ pnl: '75', openTime: new Date(3000).toISOString() }),
      ];
      
      const stats = calculateStats(trades);
      
      // 100 - 50 + 75 = 125
      expect(stats.totalPnL).toBe('125');
      expect(stats.expectancy).toBe('41.67'); // 125 / 3 = 41.67
    });
  });

  describe('Drawdown tracking', () => {
    it('peak-to-trough calculation', () => {
      const trades = [
        createTrade({ pnl: '100', openTime: new Date(1000).toISOString() }), // equity: 100, peak: 100
        createTrade({ pnl: '200', openTime: new Date(2000).toISOString() }), // equity: 300, peak: 300
        createTrade({ pnl: '-150', openTime: new Date(3000).toISOString() }), // equity: 150, DD: 150
        createTrade({ pnl: '50', openTime: new Date(4000).toISOString() }), // equity: 200, DD: 100
      ];
      
      const stats = calculateStats(trades);
      
      // Max drawdown: 300 - 150 = 150
      expect(stats.maxDrawdown).toBe('150');
    });

    it('tracks drawdown correctly with multiple peaks', () => {
      const trades = [
        createTrade({ pnl: '100', openTime: new Date(1000).toISOString() }), // equity: 100, peak: 100
        createTrade({ pnl: '-50', openTime: new Date(2000).toISOString() }), // equity: 50, DD: 50
        createTrade({ pnl: '200', openTime: new Date(3000).toISOString() }), // equity: 250, peak: 250
        createTrade({ pnl: '-100', openTime: new Date(4000).toISOString() }), // equity: 150, DD: 100
      ];
      
      const stats = calculateStats(trades);
      
      // Max drawdown: 250 - 150 = 100
      expect(stats.maxDrawdown).toBe('100');
    });
  });

  describe('Streak tracking', () => {
    it('maxWinStreak and maxLossStreak', () => {
      const trades = [
        createTrade({ pnl: '100', openTime: new Date(1000).toISOString() }), // win streak: 1
        createTrade({ pnl: '50', openTime: new Date(2000).toISOString() }), // win streak: 2
        createTrade({ pnl: '-30', openTime: new Date(3000).toISOString() }), // loss streak: 1
        createTrade({ pnl: '75', openTime: new Date(4000).toISOString() }), // win streak: 1
        createTrade({ pnl: '-20', openTime: new Date(5000).toISOString() }), // loss streak: 1
        createTrade({ pnl: '-40', openTime: new Date(6000).toISOString() }), // loss streak: 2
        createTrade({ pnl: '100', openTime: new Date(7000).toISOString() }), // win streak: 1
      ];
      
      const stats = calculateStats(trades);
      
      expect(stats.maxStreakWin).toBe(2);
      expect(stats.maxStreakLoss).toBe(2);
    });

    it('streak resets on breakeven', () => {
      const trades = [
        createTrade({ pnl: '100', openTime: new Date(1000).toISOString() }), // win streak: 1
        createTrade({ pnl: '0', openTime: new Date(2000).toISOString() }), // streaks reset
        createTrade({ pnl: '-50', openTime: new Date(3000).toISOString() }), // loss streak: 1
      ];
      
      const stats = calculateStats(trades);
      
      expect(stats.maxStreakWin).toBe(1);
      expect(stats.maxStreakLoss).toBe(1);
    });
  });

  describe('Input array mutation', () => {
    it('does not mutate input array', () => {
      const originalTrades = [
        createTrade({ pnl: '100', openTime: new Date(3000).toISOString() }),
        createTrade({ pnl: '-50', openTime: new Date(1000).toISOString() }),
        createTrade({ pnl: '75', openTime: new Date(2000).toISOString() }),
      ];
      
      const tradesCopy = [...originalTrades];
      calculateStats(originalTrades);
      
      // Verify original order is preserved
      expect(originalTrades).toEqual(tradesCopy);
      expect(originalTrades[0].pnl).toBe('100');
      expect(originalTrades[1].pnl).toBe('-50');
      expect(originalTrades[2].pnl).toBe('75');
    });
  });

  describe('Decimal precision', () => {
    it('all values formatted consistently', () => {
      const trades = [
        createTrade({ pnl: '100.123', openTime: new Date(1000).toISOString() }),
        createTrade({ pnl: '-50.456', openTime: new Date(2000).toISOString() }),
        createTrade({ pnl: '33.333', openTime: new Date(3000).toISOString() }),
      ];
      
      const stats = calculateStats(trades);
      
      // Check all string values are valid numbers (may or may not have decimals)
      expect(stats.winRate).toMatch(/^\d+(\.\d+)?$/);
      expect(stats.totalPnL).toMatch(/^-?\d+(\.\d+)?$/);
      expect(stats.avgWin).toMatch(/^\d+(\.\d+)?$/);
      expect(stats.avgLoss).toMatch(/^\d+(\.\d+)?$/);
      expect(stats.expectancy).toMatch(/^-?\d+(\.\d+)?$/);
      expect(stats.profitFactor).toMatch(/^-?\d+(\.\d+)?$/);
      expect(stats.maxDrawdown).toMatch(/^\d+(\.\d+)?$/);
      expect(stats.avgRR).toMatch(/^\d+(\.\d+)?$/);
    });

    it('handles very small values correctly', () => {
      const trades = [
        createTrade({ pnl: '0.001', openTime: new Date(1000).toISOString() }),
        createTrade({ pnl: '0.002', openTime: new Date(2000).toISOString() }),
      ];
      
      const stats = calculateStats(trades);
      
      expect(stats.totalPnL).toBe('0'); // 0.001 + 0.002 = 0.003, rounds to 0
      expect(stats.avgWin).toBe('0'); // avg of 0.001 and 0.002 = 0.0015, rounds to 0
    });

    it('handles large values correctly', () => {
      const trades = [
        createTrade({ pnl: '10000.50', openTime: new Date(1000).toISOString() }),
        createTrade({ pnl: '-5000.25', openTime: new Date(2000).toISOString() }),
      ];
      
      const stats = calculateStats(trades);
      
      expect(stats.totalPnL).toBe('5000.25');
      expect(stats.avgWin).toBe('10000.5');
      expect(stats.avgLoss).toBe('5000.25');
    });
  });

  describe('Average R:R calculation', () => {
    it('calculates average R:R from trades with rrActual', () => {
      const trades = [
        createTrade({ pnl: '100', rrActual: '2', openTime: new Date(1000).toISOString() }),
        createTrade({ pnl: '-50', rrActual: '1', openTime: new Date(2000).toISOString() }),
        createTrade({ pnl: '150', rrActual: '3', openTime: new Date(3000).toISOString() }),
      ];
      
      const stats = calculateStats(trades);
      
      // Average R:R: (2 + 1 + 3) / 3 = 2
      expect(stats.avgRR).toBe('2');
    });

    it('excludes trades with rrActual of 0', () => {
      const trades = [
        createTrade({ pnl: '100', rrActual: '2', openTime: new Date(1000).toISOString() }),
        createTrade({ pnl: '50', rrActual: '0', openTime: new Date(2000).toISOString() }),
        createTrade({ pnl: '150', rrActual: '4', openTime: new Date(3000).toISOString() }),
      ];
      
      const stats = calculateStats(trades);
      
      // Average R:R: (2 + 4) / 2 = 3 (excludes the 0)
      expect(stats.avgRR).toBe('3');
    });
  });
});
