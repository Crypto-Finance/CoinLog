/**
 * CSV Import/Export Utilities
 * 
 * This module has 3 concerns:
 * 1. CSV parsing (parser.ts) — generic, could be reused elsewhere
 * 2. Validation (validator.ts) — domain-specific to trades
 * 3. Trade building (builder.ts) — domain-specific
 * 
 * Pipeline: parseCSVRows → buildHeaderMap → validateRow → buildTrade
 */

import type { Trade } from '../types';
import { parseCSVRows } from './parser';
import { buildHeaderMap, validateRow, createFieldAccessor } from './validator';
import { rowsToTrades } from './builder';

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
 * Parse a CSV string into an array of trades (without id).
 *
 * @param csv - Raw CSV string with header row
 * @returns Array of Omit<Trade, 'id'>
 * @throws Error if CSV is empty, missing headers, or has invalid data
 */
export function parseCSV(csv: string): Omit<Trade, 'id'>[] {
  // Strip UTF-8 BOM (Excel on Windows prepends \uFEFF)
  const cleaned = csv.replace(/^\uFEFF/, '').trim();
  if (!cleaned) {
    throw new Error('CSV file is empty');
  }

  const lines = parseCSVRows(cleaned);
  if (lines.length < 1) {
    throw new Error('CSV file is empty');
  }

  const headerMap = buildHeaderMap(lines[0]);
  return rowsToTrades(lines.slice(1), headerMap, validateRow, createFieldAccessor);
}

/**
 * Escape a value for CSV output.
 *
 * Protects against:
 * - CSV injection (formula injection): cells starting with =, +, -, @
 *   are prefixed with a tab inside quotes to neutralize formulas.
 * - Standard CSV escaping: commas, double-quotes, newlines.
 */
function csvEscape(value: string): string {
  const needsInjectionProtection = /^[=+\-@]/.test(value.trim());

  if (needsInjectionProtection) {
    return `"\t${value.replace(/"/g, '""')}"`;
  }

  if (
    value.includes(',') ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// CSV column definitions (all 23 fields, camelCase)
const CSV_HEADERS: (keyof Trade)[] = [
  'id',
  'exchange',
  'exchangeOrderId',
  'symbol',
  'direction',
  'entryPrice',
  'exitPrice',
  'quantity',
  'fee',
  'pnl',
  'openTime',
  'closeTime',
  'setupType',
  'stopLoss',
  'takeProfit',
  'riskAmount',
  'rrPlanned',
  'rrActual',
  'exitType',
  'marketCondition',
  'notes',
  'isAnnotated',
];

/**
 * Export an array of trades to a CSV string.
 *
 * @param trades - Array of Trade objects
 * @returns CSV string with header row
 */
export function exportToCSV(trades: Trade[]): string {
  const lines: string[] = [];

  // Header row
  lines.push(CSV_HEADERS.join(','));

  // Data rows
  for (const trade of trades) {
    const row = CSV_HEADERS.map((header) => {
      const value = trade[header];
      if (value === undefined || value === null) return '';
      return csvEscape(String(value));
    });
    lines.push(row.join(','));
  }

  return lines.join('\n');
}

// Re-export types and utilities for external use
export type { FieldAccessor } from './validator';
export { parseCSVLine, parseCSVRows } from './parser';
export { buildHeaderMap, validateRow, createFieldAccessor } from './validator';
export { buildTrade, rowsToTrades } from './builder';
