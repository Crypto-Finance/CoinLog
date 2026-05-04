import { Trade } from './types';

/**
 * Factory function to create a trade object with default values.
 * Pass overrides to customize specific fields.
 *
 * @param overrides - Partial trade object to override defaults
 * @returns A trade object without id (ready to be saved)
 */
export function createTrade(
  overrides: Partial<Omit<Trade, 'id'>> = {},
): Omit<Trade, 'id'> {
  return {
    exchange: '',
    exchangeOrderId: '',
    symbol: '',
    direction: 'Long',
    entryPrice: '0',
    exitPrice: '0',
    quantity: '0',
    fee: '0',
    pnl: '0',
    openTime: new Date().toISOString(),
    closeTime: undefined,
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
