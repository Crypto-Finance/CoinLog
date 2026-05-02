import type { TradeStats } from '@/lib/types';
import { formatCurrency, formatPnL, pnlColor, profitFactorColor, winRateColor } from '@/lib/utils';
import {
  TrendingDown,
  Target,
  BarChart3,
  Percent,
  DollarSign,
  Activity,
  Zap,
  Shield,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export interface StatCardConfig {
  title: string;
  getValue: (stats: TradeStats) => string | number;
  icon: React.ElementType;
  getColor?: (stats: TradeStats) => string;
  subtitle?: string | ((stats: TradeStats) => string);
}

export const coreMetrics: StatCardConfig[] = [
  {
    title: 'Total Trades',
    getValue: (s) => s.totalTrades,
    icon: BarChart3,
  },
  {
    title: 'Win Rate',
    getValue: (s) => `${s.winRate}%`,
    icon: Percent,
    getColor: (s) => winRateColor(s.winRate),
    subtitle: (s) => `${s.winningTrades}W / ${s.losingTrades}L`,
  },
  {
    title: 'Total P&L',
    getValue: (s) => formatPnL(s.totalPnL),
    icon: DollarSign,
    getColor: (s) => pnlColor(s.totalPnL),
  },
  {
    title: 'Expectancy',
    getValue: (s) => formatPnL(s.expectancy),
    icon: Target,
    getColor: (s) => pnlColor(s.expectancy),
    subtitle: 'Avg P&L per trade',
  },
];

export const riskReward: StatCardConfig[] = [
  {
    title: 'Avg Win',
    getValue: (s) => formatPnL(s.avgWin),
    icon: ArrowUpRight,
    getColor: () => 'text-emerald-600',
  },
  {
    title: 'Avg Loss',
    getValue: (s) => formatCurrency(s.avgLoss),
    icon: ArrowDownRight,
    getColor: () => 'text-red-600',
    subtitle: 'Stored as positive',
  },
  {
    title: 'Profit Factor',
    getValue: (s) => s.profitFactor,
    icon: Zap,
    getColor: (s) => profitFactorColor(s.profitFactor),
  },
  {
    title: 'Avg R:R',
    getValue: (s) => `${s.avgRR}R`,
    icon: Activity,
    getColor: (s) =>
      parseFloat(s.avgRR) >= 1 ? 'text-emerald-600' : 'text-red-600',
  },
];

export const drawdownStreaks: StatCardConfig[] = [
  {
    title: 'Max Drawdown',
    getValue: (s) => formatCurrency(s.maxDrawdown),
    icon: Shield,
    getColor: () => 'text-red-600',
    subtitle: 'Peak to trough',
  },
  {
    title: 'Max Win Streak',
    getValue: (s) => s.maxStreakWin,
    icon: Flame,
    getColor: () => 'text-emerald-600',
    subtitle: 'Consecutive wins',
  },
  {
    title: 'Max Loss Streak',
    getValue: (s) => s.maxStreakLoss,
    icon: TrendingDown,
    getColor: () => 'text-red-600',
    subtitle: 'Consecutive losses',
  },
];
