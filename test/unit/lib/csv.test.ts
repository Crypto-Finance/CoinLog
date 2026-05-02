import { describe, it, expect } from 'vitest';
import { parseCSV, exportToCSV, computeIsAnnotated } from '@/lib/csv';
import type { Trade } from '@/lib/types';

describe('parseCSV', () => {
  const validCSV = `exchange,exchangeOrderId,symbol,direction,entryPrice,exitPrice,quantity,fee,pnl,openTime,closeTime,setupType,stopLoss,takeProfit,riskAmount,rrPlanned,rrActual,exitType,marketCondition,notes,isAnnotated
Bybit,12345,BTCUSDT,Long,50000,51000,0.1,5,95,2024-01-01T10:00:00Z,2024-01-01T12:00:00Z,Breakout,49000,52000,100,2,1.5,Target,Trending,Bought the dip,true`;

  it('should parse valid CSV with all fields', () => {
    const trades = parseCSV(validCSV);
    
    expect(trades).toHaveLength(1);
    expect(trades[0]).toMatchObject({
      exchange: 'Bybit',
      exchangeOrderId: '12345',
      symbol: 'BTCUSDT',
      direction: 'Long',
      entryPrice: '50000',
      exitPrice: '51000',
      quantity: '0.1',
      fee: '5',
      pnl: '95',
      openTime: '2024-01-01T10:00:00Z',
      closeTime: '2024-01-01T12:00:00Z',
      setupType: 'Breakout',
    });
  });

  it('should handle empty lines', () => {
    const csvWithEmptyLines = `exchange,exchangeOrderId,symbol,direction,entryPrice,exitPrice,quantity,fee,pnl,openTime,closeTime
Bybit,12345,BTCUSDT,Long,50000,51000,0.1,5,95,2024-01-01T10:00:00Z,2024-01-01T12:00:00Z

Bybit,67890,ETHUSDT,Short,3000,2900,1,3,97,2024-01-02T10:00:00Z,2024-01-02T12:00:00Z
`;
    const trades = parseCSV(csvWithEmptyLines);
    expect(trades).toHaveLength(2);
  });

  it('should handle quoted fields with commas', () => {
    const csvWithQuotes = `exchange,exchangeOrderId,symbol,direction,entryPrice,exitPrice,quantity,fee,pnl,openTime,closeTime,notes
Bybit,12345,BTCUSDT,Long,50000,51000,0.1,5,95,2024-01-01T10:00:00Z,2024-01-01T12:00:00Z,"Note with, comma"
`;
    const trades = parseCSV(csvWithQuotes);
    expect(trades[0].notes).toBe('Note with, comma');
  });

  it('should handle quoted fields with escaped quotes', () => {
    const csvWithEscapedQuotes = `exchange,exchangeOrderId,symbol,direction,entryPrice,exitPrice,quantity,fee,pnl,openTime,closeTime,notes
Bybit,12345,BTCUSDT,Long,50000,51000,0.1,5,95,2024-01-01T10:00:00Z,2024-01-01T12:00:00Z,"Note with ""quotes"""
`;
    const trades = parseCSV(csvWithEscapedQuotes);
    expect(trades[0].notes).toBe('Note with "quotes"');
  });

  it('should strip UTF-8 BOM', () => {
    const csvWithBOM = '\uFEFF' + validCSV;
    const trades = parseCSV(csvWithBOM);
    expect(trades).toHaveLength(1);
    expect(trades[0].exchange).toBe('Bybit');
  });

  it('should throw on empty CSV', () => {
    expect(() => parseCSV('')).toThrow('CSV file is empty');
    expect(() => parseCSV('   ')).toThrow('CSV file is empty');
  });

  it('should throw on missing required headers', () => {
    const invalidCSV = `exchange,symbol,direction
Bybit,BTCUSDT,Long`;
    expect(() => parseCSV(invalidCSV)).toThrow('Missing required column');
  });

  it('should throw on invalid direction', () => {
    const invalidCSV = `exchange,exchangeOrderId,symbol,direction,entryPrice,exitPrice,quantity,fee,pnl,openTime,closeTime
Bybit,12345,BTCUSDT,Invalid,50000,51000,0.1,5,95,2024-01-01T10:00:00Z,2024-01-01T12:00:00Z`;
    expect(() => parseCSV(invalidCSV)).toThrow('invalid direction');
  });

  it('should sanitize formula injection characters', () => {
    const csvWithFormula = `exchange,exchangeOrderId,symbol,direction,entryPrice,exitPrice,quantity,fee,pnl,openTime,closeTime,notes
Bybit,12345,BTCUSDT,Long,50000,51000,0.1,5,95,2024-01-01T10:00:00Z,2024-01-01T12:00:00Z,=SUM(A1:A10)`;
    const trades = parseCSV(csvWithFormula);
    expect(trades[0].notes).toBe('SUM(A1:A10)');
  });
});

describe('exportToCSV', () => {
  const sampleTrade: Omit<Trade, 'id'> = {
    exchange: 'Bybit',
    exchangeOrderId: '12345',
    symbol: 'BTCUSDT',
    direction: 'Long',
    entryPrice: '50000',
    exitPrice: '51000',
    quantity: '0.1',
    fee: '5',
    pnl: '95',
    openTime: '2024-01-01T10:00:00Z',
    closeTime: '2024-01-01T12:00:00Z',
    setupType: 'Breakout',
    stopLoss: '49000',
    takeProfit: '52000',
    riskAmount: '100',
    rrPlanned: '2',
    rrActual: '1.5',
    exitType: 'Target',
    marketCondition: 'Trending',
    notes: 'Bought the dip',
    isAnnotated: true,
  };

  it('should export trade to CSV with all fields', () => {
    const csv = exportToCSV([sampleTrade as Trade]);
    const lines = csv.split('\n');
    
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('exchange,exchangeOrderId,symbol');
    expect(lines[1]).toContain('Bybit,12345,BTCUSDT,Long');
  });

  it('should escape values with commas', () => {
    const tradeWithComma: Omit<Trade, 'id'> = {
      ...sampleTrade,
      notes: 'Note with, comma',
    };
    const csv = exportToCSV([tradeWithComma as Trade]);
    expect(csv).toContain('"Note with, comma"');
  });

  it('should escape values with quotes', () => {
    const tradeWithQuotes: Omit<Trade, 'id'> = {
      ...sampleTrade,
      notes: 'Note with "quotes"',
    };
    const csv = exportToCSV([tradeWithQuotes as Trade]);
    expect(csv).toContain('"Note with ""quotes"""');
  });

  it('should protect against formula injection', () => {
    const tradeWithFormula: Omit<Trade, 'id'> = {
      ...sampleTrade,
      notes: '=SUM(A1:A10)',
    };
    const csv = exportToCSV([tradeWithFormula as Trade]);
    expect(csv).toContain('"\t=SUM(A1:A10)"');
  });

  it('should handle round-trip: export then parse', () => {
    const csv = exportToCSV([sampleTrade as Trade]);
    const parsed = parseCSV(csv);
    
    expect(parsed).toHaveLength(1);
    expect(parsed[0].exchange).toBe(sampleTrade.exchange);
    expect(parsed[0].symbol).toBe(sampleTrade.symbol);
    expect(parsed[0].direction).toBe(sampleTrade.direction);
    expect(parsed[0].pnl).toBe(sampleTrade.pnl);
  });
});

describe('computeIsAnnotated', () => {
  it('should return true when annotation fields are present', () => {
    const trade = { setupType: 'Breakout', notes: 'Good trade' };
    expect(computeIsAnnotated(trade)).toBe(true);
  });

  it('should return false when all annotation fields are empty', () => {
    const trade = { setupType: '', notes: '', stopLoss: '', takeProfit: '' };
    expect(computeIsAnnotated(trade)).toBe(false);
  });

  it('should return false for undefined annotation fields', () => {
    const trade = {};
    expect(computeIsAnnotated(trade)).toBe(false);
  });

  it('should return true when at least one annotation field has value', () => {
    const trade = { setupType: '', notes: '', stopLoss: '49000', takeProfit: '' };
    expect(computeIsAnnotated(trade)).toBe(true);
  });
});
