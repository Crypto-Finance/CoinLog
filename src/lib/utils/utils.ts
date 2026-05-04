import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import Decimal from 'decimal.js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: string | number, decimals = 2): string {
  let num: Decimal;
  try {
    num = typeof value === 'string' ? new Decimal(value) : new Decimal(value);
  } catch {
    return '$0.00';
  }
  if (num.isNaN()) return '$0.00';
  const sign = num.isNegative() ? '-' : '';
  const abs = num.abs().toFixed(decimals);
  return `${sign}$${abs}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    return format(new Date(dateStr), 'MMM dd, yyyy HH:mm');
  } catch {
    return dateStr;
  }
}

export function formatPnL(value: string | number): string {
  const num = toNumber(value);
  if (isNaN(num)) return '$0.00';
  const sign = num >= 0 ? '+' : '';
  return `${sign}${formatCurrency(num)}`;
}

export function formatPrice(value: string | number, maxDecimals = 5): string {
  if (typeof value === 'string') {
    const num = parseFloat(value);
    if (isNaN(num)) return '$0.00';
    const parts = value.split('.');
    if (parts.length === 2 && parts[1].length > maxDecimals) {
      return `$${num.toFixed(maxDecimals)}`;
    }
    return `$${value}`;
  }
  if (isNaN(value)) return '$0.00';
  return `$${value.toFixed(maxDecimals)}`;
}

export function pluralize(n: number, singular: string, plural?: string): string {
  return n === 1 ? singular : (plural ?? `${singular}s`);
}

export function toNumber(value: string | number): number {
  return typeof value === 'string' ? parseFloat(value) : value;
}

export function formatProfitFactor(value: string): string {
  return value === '-1' ? '\u221E' : value;
}

export function profitFactorColor(value: string): string {
  return value === '-1' || parseFloat(value) >= 1
    ? 'text-emerald-600'
    : 'text-red-600';
}

/**
 * Check if a file is a CSV file by extension.
 * @param file - File to check
 * @returns true if file name ends with .csv
 */
export function isCsvFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.csv');
}
