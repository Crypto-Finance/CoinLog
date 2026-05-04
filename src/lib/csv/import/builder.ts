import type { Trade } from '../../domain/types';
import { createTrade } from '../../domain/trade-factory';
import type { FieldAccessor, HeaderMap } from './validator';
import { parseCSVLine } from './parser';

/**
 * Trade Builder
 * 
 * Handles construction of Trade objects from validated CSV data:
 * - Maps CSV fields to Trade properties
 * - Computes derived fields (isAnnotated)
 * - Returns properly typed trade objects
 */

// Annotation fields used to compute isAnnotated
const ANNOTATION_FIELDS: (keyof Trade)[] = [
  'setupType',
  'stopLoss',
  'takeProfit',
  'riskAmount',
  'rrPlanned',
  'rrActual',
  'exitType',
  'marketCondition',
  'notes',
];

/**
 * Compute isAnnotated from annotation fields.
 */
export function computeIsAnnotated(trade: Partial<Trade>): boolean {
  return ANNOTATION_FIELDS.some((field) => {
    const val = trade[field];
    return typeof val === 'string' && val.trim().length > 0;
  });
}

/**
 * Build a trade object from a CSV row using a field accessor.
 */
export function buildTrade(getField: FieldAccessor): Omit<Trade, 'id'> {
  const direction = getField('direction');
  const trade = createTrade({
    exchange: getField('exchange'),
    exchangeOrderId: getField('exchangeOrderId'),
    symbol: getField('symbol'),
    direction: direction as 'Long' | 'Short',
    entryPrice: getField('entryPrice'),
    exitPrice: getField('exitPrice'),
    quantity: getField('quantity'),
    fee: getField('fee'),
    pnl: getField('pnl'),
    openTime: getField('openTime'),
    closeTime: getField('closeTime') || undefined,
    setupType: getField('setupType'),
    stopLoss: getField('stopLoss'),
    takeProfit: getField('takeProfit'),
    riskAmount: getField('riskAmount'),
    rrPlanned: getField('rrPlanned'),
    rrActual: getField('rrActual'),
    exitType: getField('exitType'),
    marketCondition: getField('marketCondition'),
    notes: getField('notes'),
  });

  trade.isAnnotated = computeIsAnnotated(trade);
  return trade;
}

/**
 * Convert parsed CSV rows (excluding header) into trade objects.
 */
export function rowsToTrades(
  rows: string[],
  headerMap: HeaderMap,
  validateRow: (fields: string[], rowIdx: number, headerMap: HeaderMap) => void,
  createFieldAccessor: (fields: string[], headerMap: HeaderMap) => FieldAccessor,
): Omit<Trade, 'id'>[] {
  const trades: Omit<Trade, 'id'>[] = [];

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const fields = parseCSVLine(rows[rowIdx]);

    if (fields.length === 1 && fields[0].trim() === '') {
      continue;
    }

    if (fields.length < headerMap.fieldCount) {
      throw new Error(
        `Row ${rowIdx + 2}: expected ${headerMap.fieldCount} columns, got ${fields.length}`,
      );
    }

    validateRow(fields, rowIdx, headerMap);

    const getField = createFieldAccessor(fields, headerMap);

    trades.push(buildTrade(getField));
  }

  return trades;
}
