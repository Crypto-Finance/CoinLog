import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  addTrade,
  getTrade,
  updateTrade,
  deleteTrade,
  getAllTrades,
  bulkAddTrades,
  addTradesWithDedup,
  clearAllTrades,
  resetDb,
} from '../db';
import type { Trade } from '../types';

// Helper to create a test trade
function createTestTrade(overrides: Partial<Omit<Trade, 'id'>> = {}): Omit<Trade, 'id'> {
  return {
    exchange: 'Bybit',
    exchangeOrderId: `order-${Date.now()}-${Math.random()}`,
    symbol: 'BTCUSDT',
    direction: 'Long',
    entryPrice: '50000',
    exitPrice: '51000',
    quantity: '1',
    fee: '5',
    pnl: '95',
    openTime: new Date().toISOString(),
    closeTime: new Date().toISOString(),
    setupType: '',
    stopLoss: '',
    takeProfit: '',
    riskAmount: '',
    rrPlanned: '',
    rrActual: '',
    exitType: '',
    marketCondition: '',
    notes: '',
    isAnnotated: false,
    ...overrides,
  };
}

describe('IndexedDB Operations', () => {
  beforeEach(async () => {
    // Reset database connection and clear all data for clean state
    resetDb();
    await clearAllTrades();
    // Wait for any pending operations
    await new Promise(resolve => setTimeout(resolve, 10));
  });

  describe('addTrade', () => {
    it('returns an id when adding a trade', async () => {
      const trade = createTestTrade();
      const id = await addTrade(trade);
      
      expect(id).toBeDefined();
      expect(typeof id).toBe('number');
      expect(id).toBeGreaterThan(0);
    });

    it('creates trade with correct data', async () => {
      const trade = createTestTrade({
        exchangeOrderId: 'test-order-123',
        symbol: 'ETHUSDT',
        direction: 'Short',
        pnl: '-50',
      });
      
      const id = await addTrade(trade);
      const retrieved = await getTrade(id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved!.exchangeOrderId).toBe('test-order-123');
      expect(retrieved!.symbol).toBe('ETHUSDT');
      expect(retrieved!.direction).toBe('Short');
      expect(retrieved!.pnl).toBe('-50');
    });
  });

  describe('getTrade', () => {
    it('retrieves trade by id', async () => {
      const trade = createTestTrade();
      const id = await addTrade(trade);
      
      const retrieved = await getTrade(id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe(id);
      expect(retrieved!.exchangeOrderId).toBe(trade.exchangeOrderId);
    });

    it('returns undefined for non-existent id', async () => {
      const retrieved = await getTrade(99999);
      expect(retrieved).toBeUndefined();
    });
  });

  describe('updateTrade', () => {
    it('updates existing trade', async () => {
      const trade = createTestTrade();
      const id = await addTrade(trade);
      
      await updateTrade(id, {
        pnl: '200',
        notes: 'Updated notes',
        setupType: 'Breakout',
      });
      
      const updated = await getTrade(id);
      
      expect(updated).toBeDefined();
      expect(updated!.pnl).toBe('200');
      expect(updated!.notes).toBe('Updated notes');
      expect(updated!.setupType).toBe('Breakout');
      // Unchanged fields remain
      expect(updated!.symbol).toBe('BTCUSDT');
    });

    it('throws error when updating non-existent trade', async () => {
      await expect(updateTrade(99999, { pnl: '100' })).rejects.toThrow(
        'Trade 99999 not found'
      );
    });
  });

  describe('deleteTrade', () => {
    it('removes trade', async () => {
      const trade = createTestTrade();
      const id = await addTrade(trade);
      
      await deleteTrade(id);
      
      const retrieved = await getTrade(id);
      expect(retrieved).toBeUndefined();
    });

    it('does not throw for non-existent id', async () => {
      await expect(deleteTrade(99999)).resolves.not.toThrow();
    });
  });

  describe('getAllTrades', () => {
    it('returns trades sorted by openTime descending', async () => {
      const now = Date.now();
      await addTrade(createTestTrade({
        exchangeOrderId: 'order-1',
        openTime: new Date(now - 3000).toISOString(),
      }));
      await addTrade(createTestTrade({
        exchangeOrderId: 'order-2',
        openTime: new Date(now - 1000).toISOString(),
      }));
      await addTrade(createTestTrade({
        exchangeOrderId: 'order-3',
        openTime: new Date(now - 2000).toISOString(),
      }));
      
      const trades = await getAllTrades();
      
      expect(trades).toHaveLength(3);
      // Should be sorted descending (newest first)
      expect(trades[0].exchangeOrderId).toBe('order-2');
      expect(trades[1].exchangeOrderId).toBe('order-3');
      expect(trades[2].exchangeOrderId).toBe('order-1');
    });

    it('returns empty array when no trades exist', async () => {
      const trades = await getAllTrades();
      expect(trades).toEqual([]);
    });
  });

  describe('bulkAddTrades', () => {
    it('inserts multiple trades', async () => {
      const trades = [
        createTestTrade({ exchangeOrderId: 'bulk-1' }),
        createTestTrade({ exchangeOrderId: 'bulk-2' }),
        createTestTrade({ exchangeOrderId: 'bulk-3' }),
      ];
      
      const ids = await bulkAddTrades(trades);
      
      expect(ids).toHaveLength(3);
      ids.forEach(id => {
        expect(typeof id).toBe('number');
        expect(id).toBeGreaterThan(0);
      });
      
      // Verify all trades were added
      const allTrades = await getAllTrades();
      expect(allTrades).toHaveLength(3);
    });

    it('returns ids for all inserted trades', async () => {
      const trades = [
        createTestTrade({ exchangeOrderId: 'bulk-a' }),
        createTestTrade({ exchangeOrderId: 'bulk-b' }),
      ];
      
      const ids = await bulkAddTrades(trades);
      
      const retrieved = await Promise.all(ids.map(id => getTrade(id)));
      expect(retrieved.every(t => t !== undefined)).toBe(true);
    });
  });

  describe('addTradesWithDedup', () => {
    it('inserts new trades and skips duplicates', async () => {
      const initialTrade = createTestTrade({ exchangeOrderId: 'dup-1' });
      await addTrade(initialTrade);
      
      const trades = [
        createTestTrade({ exchangeOrderId: 'dup-1' }), // duplicate
        createTestTrade({ exchangeOrderId: 'dup-2' }), // new
        createTestTrade({ exchangeOrderId: 'dup-3' }), // new
      ];
      
      const result = await addTradesWithDedup(trades);
      
      expect(result.inserted).toBe(2);
      expect(result.skipped).toBe(1);
      
      const allTrades = await getAllTrades();
      expect(allTrades).toHaveLength(3); // 1 initial + 2 new
    });

    it('returns correct counts for all new trades', async () => {
      const trades = [
        createTestTrade({ exchangeOrderId: 'new-1' }),
        createTestTrade({ exchangeOrderId: 'new-2' }),
      ];
      
      const result = await addTradesWithDedup(trades);
      
      expect(result.inserted).toBe(2);
      expect(result.skipped).toBe(0);
    });

    it('returns correct counts for all duplicates', async () => {
      const existing1 = createTestTrade({ exchangeOrderId: 'existing-1' });
      const existing2 = createTestTrade({ exchangeOrderId: 'existing-2' });
      await addTrade(existing1);
      await addTrade(existing2);
      
      const trades = [
        createTestTrade({ exchangeOrderId: 'existing-1' }),
        createTestTrade({ exchangeOrderId: 'existing-2' }),
      ];
      
      const result = await addTradesWithDedup(trades);
      
      expect(result.inserted).toBe(0);
      expect(result.skipped).toBe(2);
    });
  });

  describe('clearAllTrades', () => {
    it('removes all trades', async () => {
      await addTrade(createTestTrade({ exchangeOrderId: 'clear-1' }));
      await addTrade(createTestTrade({ exchangeOrderId: 'clear-2' }));
      await addTrade(createTestTrade({ exchangeOrderId: 'clear-3' }));
      
      await clearAllTrades();
      
      const trades = await getAllTrades();
      expect(trades).toHaveLength(0);
    });

    it('does not throw on empty database', async () => {
      await expect(clearAllTrades()).resolves.not.toThrow();
    });
  });

  describe('Empty state handling', () => {
    it('getAllTrades returns empty array', async () => {
      const trades = await getAllTrades();
      expect(trades).toEqual([]);
    });

    it('getTrade returns undefined for any id', async () => {
      const trade = await getTrade(1);
      expect(trade).toBeUndefined();
    });

    it('updateTrade throws for any id', async () => {
      await expect(updateTrade(1, { pnl: '100' })).rejects.toThrow();
    });

    it('deleteTrade succeeds silently', async () => {
      await expect(deleteTrade(1)).resolves.not.toThrow();
    });
  });
});
