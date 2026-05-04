import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPnL, formatDate, toNumber } from '@/lib/utils/utils';
import { pnlColor, pnlBg } from '@/lib/ui/pnl-styles';

describe('formatCurrency', () => {
  it('should format positive numbers', () => {
    expect(formatCurrency(100)).toBe('$100.00');
    expect(formatCurrency('100')).toBe('$100.00');
  });

  it('should format negative numbers', () => {
    expect(formatCurrency(-50)).toBe('-$50.00');
    expect(formatCurrency('-50')).toBe('-$50.00');
  });

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency('0')).toBe('$0.00');
  });

  it('should handle decimal places', () => {
    expect(formatCurrency(100.5)).toBe('$100.50');
    expect(formatCurrency(100.123, 3)).toBe('$100.123');
  });

  it('should return $0.00 for invalid input', () => {
    expect(formatCurrency('invalid')).toBe('$0.00');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- testing edge case
    expect(formatCurrency(NaN as any)).toBe('$0.00');
  });

  it('should handle large numbers', () => {
    expect(formatCurrency(1000000)).toBe('$1000000.00');
  });
});

describe('formatPnL', () => {
  it('should format positive PnL with + sign', () => {
    expect(formatPnL(100)).toBe('+$100.00');
    expect(formatPnL('100')).toBe('+$100.00');
  });

  it('should format negative PnL', () => {
    expect(formatPnL(-50)).toBe('-$50.00');
    expect(formatPnL('-50')).toBe('-$50.00');
  });

  it('should format zero PnL', () => {
    expect(formatPnL(0)).toBe('+$0.00');
  });

  it('should return $0.00 for invalid input', () => {
    expect(formatPnL('invalid')).toBe('$0.00');
  });
});

describe('pnlColor', () => {
  it('should return green for positive PnL', () => {
    expect(pnlColor(100)).toBe('text-[#BFFF00]');
    expect(pnlColor('100')).toBe('text-[#BFFF00]');
  });

  it('should return red for negative PnL', () => {
    expect(pnlColor(-50)).toBe('text-[#FFD1DC]');
    expect(pnlColor('-50')).toBe('text-[#FFD1DC]');
  });

  it('should return muted for zero PnL', () => {
    expect(pnlColor(0)).toBe('text-[#c3caac]');
    expect(pnlColor('0')).toBe('text-[#c3caac]');
  });
});

describe('pnlBg', () => {
  it('should return green background for positive PnL', () => {
    expect(pnlBg(100)).toBe('bg-[#BFFF00]/10 text-[#BFFF00]');
  });

  it('should return red background for negative PnL', () => {
    expect(pnlBg(-50)).toBe('bg-[#FFD1DC]/10 text-[#FFD1DC]');
  });

  it('should return muted background for zero PnL', () => {
    expect(pnlBg(0)).toBe('bg-[#1f2a3c] text-[#c3caac]');
  });
});

describe('formatDate', () => {
  it('should format valid date string', () => {
    const result = formatDate('2024-01-15T10:30:00Z');
    expect(result).toMatch(/\w{3} \d{2}, \d{4} \d{2}:\d{2}/);
  });

  it('should return em dash for empty string', () => {
    expect(formatDate('')).toBe('—');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- testing edge case
    expect(formatDate(null as any)).toBe('—');
  });

  it('should return original string for invalid date', () => {
    expect(formatDate('invalid-date')).toBe('invalid-date');
  });
});

describe('toNumber', () => {
  it('should convert string to number', () => {
    expect(toNumber('100')).toBe(100);
    expect(toNumber('-50.5')).toBe(-50.5);
  });

  it('should return number as-is', () => {
    expect(toNumber(100)).toBe(100);
    expect(toNumber(-50.5)).toBe(-50.5);
  });

  it('should return NaN for invalid string', () => {
    expect(toNumber('invalid')).toBeNaN();
  });
});
