'use client';

import type { TradeStats } from '@/lib/types';
import {
  formatCurrency,
  formatPnL,
  pnlColor,
  cn,
  formatProfitFactor,
  winRateColor,
} from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { coreMetrics, riskReward, drawdownStreaks, type StatCardConfig } from '@/lib/stats-config';

interface StatsDashboardProps {
  stats: TradeStats;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color = 'text-foreground',
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn('h-4 w-4', color)} />
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', color)}>{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

function StatCardFromConfig({
  config,
  stats,
}: {
  config: StatCardConfig;
  stats: TradeStats;
}) {
  const value = config.getValue(stats);
  const color = config.getColor?.(stats) ?? 'text-foreground';
  const subtitle =
    typeof config.subtitle === 'function'
      ? config.subtitle(stats)
      : config.subtitle;

  return (
    <StatCard
      title={config.title}
      value={value}
      icon={config.icon}
      color={color}
      subtitle={subtitle}
    />
  );
}

export function StatsDashboard({ stats }: StatsDashboardProps) {
  const profitFactorDisplay = formatProfitFactor(stats.profitFactor);

  return (
    <div className="space-y-6">
      {/* Core Metrics */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Core Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {coreMetrics.map((config) => (
            <StatCardFromConfig key={config.title} config={config} stats={stats} />
          ))}
        </div>
      </div>

      {/* Risk & Reward */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Risk & Reward</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {riskReward.map((config) => (
            <StatCardFromConfig key={config.title} config={config} stats={stats} />
          ))}
        </div>
      </div>

      {/* Drawdown & Streaks */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Drawdown & Streaks</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {drawdownStreaks.map((config) => (
            <StatCardFromConfig key={config.title} config={config} stats={stats} />
          ))}
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Win Rate</span>
              <Badge
                variant="outline"
                className={cn(
                  'ml-2',
                  winRateColor(stats.winRate) === 'text-emerald-600'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-red-200 bg-red-50 text-red-700',
                )}
              >
                {stats.winRate}%
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Profit Factor</span>
              <Badge variant="outline" className="ml-2">
                {profitFactorDisplay}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Expectancy</span>
              <Badge
                variant="outline"
                className={cn('ml-2', pnlColor(stats.expectancy))}
              >
                {formatPnL(stats.expectancy)}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Avg R:R</span>
              <Badge variant="outline" className="ml-2">
                {stats.avgRR}R
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Max DD</span>
              <Badge variant="outline" className="ml-2 text-red-600">
                {formatCurrency(stats.maxDrawdown)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
