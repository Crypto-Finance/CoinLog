import { z } from 'zod';
import { emptyableString, nonNegativeNumber, positiveNumber, optionalNumber } from './schema-utils';

/**
 * Zod schema for the manual trade import form.
 * All 22 fields with validation rules.
 */
export const tradeSchema = z.object({
  exchange: z.string().min(1, 'Exchange is required'),
  exchangeOrderId: z.string().min(1, 'Order ID is required'),
  symbol: z.string().min(1, 'Symbol is required'),
  direction: z.enum(['Long', 'Short']),
  entryPrice: nonNegativeNumber,
  exitPrice: nonNegativeNumber,
  quantity: positiveNumber,
  fee: nonNegativeNumber,
  pnl: optionalNumber,
  openTime: z.string().min(1, 'Open time is required'),
  closeTime: emptyableString,
  // Annotation fields (optional for import)
  setupType: emptyableString,
  stopLoss: emptyableString,
  takeProfit: emptyableString,
  riskAmount: emptyableString,
  rrPlanned: emptyableString,
  rrActual: emptyableString,
  exitType: emptyableString,
  marketCondition: emptyableString,
  notes: emptyableString,
});

export type TradeFormValues = z.infer<typeof tradeSchema>;
