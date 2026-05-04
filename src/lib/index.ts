/**
 * Public API surface for CoinLog lib module.
 * Use barrel exports to simplify imports and define clear API boundaries.
 */

// Domain types
export type { Trade, TradeStats } from './domain/types';

// UI types
export type { SortConfig, SortDirection } from './ui/table-types';

// Core functions
export { calculateStats } from './domain/stats';
export { createTrade } from './domain/trade-factory';
export { parseCSV, sanitizeCSVField } from './csv/import';
export { exportToCSV } from './csv/export';

// Utility functions
export {
  cn,
  formatCurrency,
  formatDate,
  formatPnL,
  formatPrice,
  pluralize,
  toNumber,
  formatProfitFactor,
  profitFactorColor,
} from './utils/utils';

// P&L styling functions
export {
  pnlColor,
  pnlBorder,
  pnlBg,
  pnlCardClass,
  pnlBadgeBg,
  winRateBadgeBg,
  winRateColor,
} from './ui/pnl-styles';

// Stats config
export { coreMetrics, riskReward, drawdownStreaks } from './domain/stats-config';
export type { StatCardConfig } from './domain/stats-config';

// Error handling
export { sanitizeExternalError } from './infrastructure/api/errors';

// Database
export * as db from './infrastructure/db';

// Hooks
export { useTrades, useTrade } from '@/hooks/useTrades';
export { useUpdateTrade } from '@/hooks/use-update-trade';
export { useFilter } from '@/hooks/useFilter';
export { usePageTradeData } from '@/hooks/usePageTradeData';
