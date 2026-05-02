export interface Trade {
  id: number;
  exchange: string;
  exchangeOrderId: string;
  symbol: string;
  direction: 'Long' | 'Short';
  entryPrice: string;
  exitPrice: string;
  quantity: string;
  fee: string;
  pnl: string;
  openTime: string;
  closeTime?: string;
  // Annotation fields (9 manual fields)
  setupType: string;
  stopLoss: string;
  takeProfit: string;
  riskAmount: string;
  rrPlanned: string;
  rrActual: string;
  exitType: string;
  marketCondition: string;
  notes: string;
  isAnnotated: boolean;
}

export interface TradeStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: string; // percentage
  totalPnL: string;
  avgWin: string;
  avgLoss: string;
  expectancy: string;
  profitFactor: string;
  maxDrawdown: string;
  maxStreakWin: number;
  maxStreakLoss: number;
  avgRR: string;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: keyof Trade;
  direction: SortDirection;
}
