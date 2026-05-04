import { describe, it, expect } from 'vitest';
import {
  directionFromSide,
  calculateFee,
  mapBybitToTrade,
  type BybitClosedPnlEntry,
} from '../infrastructure/bybit/mapper';

describe('Bybit Trade Mapping', () => {
  describe('directionFromSide', () => {
    it('returns "Long" for "Sell" side', () => {
      const result = directionFromSide('Sell');
      expect(result).toBe('Long');
    });

    it('returns "Short" for "Buy" side', () => {
      const result = directionFromSide('Buy');
      expect(result).toBe('Short');
    });

    it('throws error for invalid side', () => {
      expect(() => directionFromSide('Invalid')).toThrow(
        'Unknown Bybit side: "Invalid". Expected "Buy" or "Sell".'
      );
    });

    it('throws error for empty string', () => {
      expect(() => directionFromSide('')).toThrow(
        'Unknown Bybit side: ""'
      );
    });

    it('is case-sensitive', () => {
      expect(() => directionFromSide('sell')).toThrow();
      expect(() => directionFromSide('BUY')).toThrow();
    });
  });

  describe('calculateFee', () => {
    describe('Long position', () => {
      it('calculates fee correctly for Long', () => {
        // Long: Fee = cumExitValue - cumEntryValue - closedPnl
        // Example: Entry: 50000, Exit: 51000, PnL: 95
        // Fee = 51000 - 50000 - 95 = 905
        const fee = calculateFee('Long', '50000', '51000', '95');
        expect(fee).toBe('905.00000000');
      });

      it('returns 0 for negative calculated fee', () => {
        // If calculation results in negative, should return 0
        const fee = calculateFee('Long', '51000', '50000', '100');
        // Fee = 50000 - 51000 - 100 = -1100 → should return 0
        expect(fee).toBe('0');
      });
    });

    describe('Short position', () => {
      it('calculates fee correctly for Short', () => {
        // Short: Fee = cumEntryValue - cumExitValue - closedPnl
        // Example: Entry: 50000, Exit: 49000, PnL: 95
        // Fee = 50000 - 49000 - 95 = 905
        const fee = calculateFee('Short', '50000', '49000', '95');
        expect(fee).toBe('905.00000000');
      });

      it('returns 0 for negative calculated fee', () => {
        const fee = calculateFee('Short', '49000', '50000', '100');
        // Fee = 49000 - 50000 - 100 = -1100 → should return 0
        expect(fee).toBe('0');
      });
    });

    describe('Edge cases', () => {
      it('returns 0 for NaN values', () => {
        expect(calculateFee('Long', 'invalid', '51000', '95')).toBe('0');
        expect(calculateFee('Long', '50000', 'invalid', '95')).toBe('0');
        expect(calculateFee('Long', '50000', '51000', 'invalid')).toBe('0');
      });

      it('handles zero values', () => {
        const fee = calculateFee('Long', '0', '0', '0');
        expect(fee).toBe('0');
      });

      it('handles very small fee values', () => {
        const fee = calculateFee('Long', '10000', '10000.001', '0');
        // Fee = 10000.001 - 10000 - 0 = 0.001
        expect(fee).toBe('0.00100000');
      });

      it('formats fee to 8 decimal places', () => {
        const fee = calculateFee('Long', '10000', '10100', '50.123456789');
        // Fee = 10100 - 10000 - 50.123456789 = 49.876543211
        expect(fee).toBe('49.87654321');
      });
    });
  });

  describe('mapBybitToTrade', () => {
    it('maps complete Bybit response to Trade object', () => {
      const bybitEntry: BybitClosedPnlEntry = {
        symbol: 'BTCUSDT',
        orderId: '12345678',
        side: 'Sell', // Should map to Long
        qty: '0.5',
        cumEntryValue: '25000',
        cumExitValue: '25500',
        avgEntryPrice: '50000',
        avgExitPrice: '51000',
        closedPnl: '245',
        fillCount: '2',
        leverage: '10',
        createdTime: '1704067200000', // 2024-01-01T00:00:00.000Z
        updatedTime: '1704070800000', // 2024-01-01T01:00:00.000Z
      };

      const trade = mapBybitToTrade(bybitEntry);

      expect(trade.exchange).toBe('Bybit');
      expect(trade.exchangeOrderId).toBe('12345678');
      expect(trade.symbol).toBe('BTCUSDT');
      expect(trade.direction).toBe('Long'); // Sell → Long
      expect(trade.entryPrice).toBe('50000');
      expect(trade.exitPrice).toBe('51000');
      expect(trade.quantity).toBe('0.5');
      expect(trade.pnl).toBe('245');
      // Fee = 25500 - 25000 - 245 = 255
      expect(trade.fee).toBe('255.00000000');
      expect(trade.openTime).toBe('2024-01-01T00:00:00.000Z');
      expect(trade.closeTime).toBe('2024-01-01T01:00:00.000Z');
    });

    it('maps Buy side to Short direction', () => {
      const bybitEntry: BybitClosedPnlEntry = {
        symbol: 'ETHUSDT',
        orderId: '87654321',
        side: 'Buy', // Should map to Short
        qty: '2',
        cumEntryValue: '6000',
        cumExitValue: '5800',
        avgEntryPrice: '3000',
        avgExitPrice: '2900',
        closedPnl: '190',
        fillCount: '1',
        leverage: '5',
        createdTime: '1704067200000',
        updatedTime: '1704070800000',
      };

      const trade = mapBybitToTrade(bybitEntry);

      expect(trade.direction).toBe('Short'); // Buy → Short
      expect(trade.symbol).toBe('ETHUSDT');
      expect(trade.exchangeOrderId).toBe('87654321');
    });

    it('throws for invalid side', () => {
      const bybitEntry: BybitClosedPnlEntry = {
        symbol: 'BTCUSDT',
        orderId: 'invalid',
        side: 'Hold', // Invalid side
        qty: '1',
        cumEntryValue: '50000',
        cumExitValue: '51000',
        avgEntryPrice: '50000',
        avgExitPrice: '51000',
        closedPnl: '100',
        fillCount: '1',
        leverage: '1',
        createdTime: '1704067200000',
        updatedTime: '1704070800000',
      };

      expect(() => mapBybitToTrade(bybitEntry)).toThrow(
        'Unknown Bybit side: "Hold"'
      );
    });

    it('includes annotation fields with default empty values', () => {
      const bybitEntry: BybitClosedPnlEntry = {
        symbol: 'BTCUSDT',
        orderId: '12345',
        side: 'Sell',
        qty: '1',
        cumEntryValue: '50000',
        cumExitValue: '51000',
        avgEntryPrice: '50000',
        avgExitPrice: '51000',
        closedPnl: '100',
        fillCount: '1',
        leverage: '1',
        createdTime: '1704067200000',
        updatedTime: '1704070800000',
      };

      const trade = mapBybitToTrade(bybitEntry);

      expect(trade.setupType).toBe('');
      expect(trade.stopLoss).toBe('');
      expect(trade.takeProfit).toBe('');
      expect(trade.riskAmount).toBe('');
      expect(trade.rrPlanned).toBe('');
      expect(trade.rrActual).toBe('');
      expect(trade.exitType).toBe('');
      expect(trade.marketCondition).toBe('');
      expect(trade.notes).toBe('');
      expect(trade.isAnnotated).toBe(false);
    });

    it('does not include id field (ready for insertion)', () => {
      const bybitEntry: BybitClosedPnlEntry = {
        symbol: 'BTCUSDT',
        orderId: '12345',
        side: 'Sell',
        qty: '1',
        cumEntryValue: '50000',
        cumExitValue: '51000',
        avgEntryPrice: '50000',
        avgExitPrice: '51000',
        closedPnl: '100',
        fillCount: '1',
        leverage: '1',
        createdTime: '1704067200000',
        updatedTime: '1704070800000',
      };

      const trade = mapBybitToTrade(bybitEntry);

      expect('id' in trade).toBe(false);
    });
  });
});
