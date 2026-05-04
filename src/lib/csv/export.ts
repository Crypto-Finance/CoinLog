import type { Trade } from '../domain/types';

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
