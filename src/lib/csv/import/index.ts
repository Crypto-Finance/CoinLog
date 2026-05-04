/**
 * CSV Import Utilities
 * 
 * This module has 3 concerns:
 * 1. CSV parsing (parser.ts) — generic, could be reused elsewhere
 * 2. Validation (validator.ts) — domain-specific to trades
 * 3. Trade building (builder.ts) — domain-specific
 * 
 * Pipeline: parseCSVRows → buildHeaderMap → validateRow → buildTrade
 */

import type { Trade } from '../../domain/types';
import { parseCSVRows } from './parser';
import { buildHeaderMap, validateRow, createFieldAccessor } from './validator';
import { rowsToTrades } from './builder';

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

// Re-export types and utilities for external use
export type { FieldAccessor } from './validator';
export { parseCSVLine, parseCSVRows } from './parser';
export { buildHeaderMap, validateRow, createFieldAccessor, sanitizeCSVField } from './validator';
export { buildTrade, rowsToTrades, computeIsAnnotated } from './builder';

// Re-export export utilities
export { exportToCSV } from '../export';
