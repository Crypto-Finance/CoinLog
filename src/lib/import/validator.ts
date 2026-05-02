import type { Trade } from '../types';
import { parseCSVLine } from './parser';

/**
 * CSV Validator
 * 
 * Handles domain-specific validation for trade CSV imports:
 * - Header validation (required columns)
 * - Row validation (direction, numeric fields)
 * - Error collection and reporting
 */

export interface HeaderMap {
  map: Map<string, number>;
  fieldCount: number;
}

/**
 * Field accessor function type for reading CSV fields by name.
 */
export type FieldAccessor = (name: string) => string;

// Required headers for a valid CSV import
const REQUIRED_HEADERS = [
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
];

/**
 * Build a header map from the first row.
 * @throws if required headers are missing
 */
export function buildHeaderMap(headerLine: string): HeaderMap {
  const headerFields = parseCSVLine(headerLine);
  const map = new Map<string, number>();
  for (let i = 0; i < headerFields.length; i++) {
    map.set(headerFields[i].trim(), i);
  }

  for (const header of REQUIRED_HEADERS) {
    if (!map.has(header)) {
      throw new Error(`Missing required column: "${header}"`);
    }
  }

  return { map, fieldCount: headerFields.length };
}

/**
 * Create a field accessor function for CSV rows.
 */
export function createFieldAccessor(
  fields: string[],
  headerMap: HeaderMap,
): (name: string) => string {
  return (name: string): string => {
    const idx = headerMap.map.get(name);
    if (idx === undefined || idx >= fields.length) return '';
    return sanitizeCSVField(fields[idx].trim());
  };
}

/**
 * Sanitize a string field imported from CSV.
 * Strips leading formula-injection characters (=, +, -, @).
 */
function sanitizeCSVField(value: string): string {
  return value.replace(/^[=+\-@]+/, '');
}

/**
 * Validate a single CSV row.
 * @throws if direction is invalid or numeric fields fail validation
 */
export function validateRow(
  fields: string[],
  rowIdx: number,
  headerMap: HeaderMap,
): void {
  const getField = createFieldAccessor(fields, headerMap);

  const direction = getField('direction');
  if (direction !== 'Long' && direction !== 'Short') {
    throw new Error(
      `Row ${rowIdx + 2}: invalid direction "${direction}" (must be Long or Short)`,
    );
  }

  const numericFields: { name: string; min?: number; positive?: boolean }[] = [
    { name: 'entryPrice', min: 0 },
    { name: 'exitPrice', min: 0 },
    { name: 'quantity', positive: true },
    { name: 'fee', min: 0 },
    { name: 'pnl' },
  ];

  for (const { name, min, positive } of numericFields) {
    const raw = getField(name);
    if (!raw) continue;
    const num = parseFloat(raw);
    if (isNaN(num)) {
      throw new Error(
        `Row ${rowIdx + 2}: "${name}" must be a valid number, got "${raw}"`,
      );
    }
    if (min !== undefined && num < min) {
      throw new Error(
        `Row ${rowIdx + 2}: "${name}" must be >= ${min}, got ${num}`,
      );
    }
    if (positive && num <= 0) {
      throw new Error(
        `Row ${rowIdx + 2}: "${name}" must be positive, got ${num}`,
      );
    }
  }

  const optionalNumericFields = [
    'stopLoss',
    'takeProfit',
    'riskAmount',
    'rrPlanned',
    'rrActual',
  ];
  for (const name of optionalNumericFields) {
    const raw = getField(name);
    if (raw && isNaN(parseFloat(raw))) {
      throw new Error(
        `Row ${rowIdx + 2}: "${name}" must be a valid number or empty, got "${raw}"`,
      );
    }
  }
}
