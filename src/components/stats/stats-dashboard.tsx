'use client';

import type { TradeStats, StatCardConfig } from '@/lib';
import { formatPnL, formatCurrency, cn, formatProfitFactor } from '@/lib';
import { pnlBadgeBg, winRateBadgeBg } from '@/lib/ui/pnl-styles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { coreMetrics, riskReward, drawdownStreaks } from '@/lib/domain/stats-config';
import { StatCard } from './stat-card';

interface StatsDashboardProps {
  stats: TradeStats;
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
    <div className="space-y-4">
      {/* Core Metrics */}
      <div>
        <h2 className="text-lg font-bold text-[#d7e3fb] mb-3">Core Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {coreMetrics.map((config) => (
            <StatCardFromConfig key={config.title} config={config} stats={stats} />
          ))}
        </div>
      </div>

      {/* Risk & Reward */}
      <div>
        <h2 className="text-lg font-bold text-[#d7e3fb] mb-3">Risk & Reward</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {riskReward.map((config) => (
            <StatCardFromConfig key={config.title} config={config} stats={stats} />
          ))}
        </div>
      </div>

      {/* Drawdown & Streaks */}
      <div>
        <h2 className="text-lg font-bold text-[#d7e3fb] mb-3">Drawdown & Streaks</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {drawdownStreaks.map((config) => (
            <StatCardFromConfig key={config.title} config={config} stats={stats} />
          ))}
        </div>
      </div>

      {/* Summary */}
    <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-bold text-[#d7e3fb]">Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-[#c3caac] font-bold">Win Rate</span>
              <Badge
                className={cn(
                  'ml-2 rounded-full font-bold border-0',
                  winRateBadgeBg(stats.winRate),
                )}
              >
                {stats.winRate}%
              </Badge>
            </div>
            <div>
              <span className="text-[#c3caac] font-bold">Profit Factor</span>
              <Badge
                variant="neon-outline"
                className="ml-2 rounded-full font-bold"
              >
                {profitFactorDisplay}
              </Badge>
            </div>
            <div>
              <span className="text-[#c3caac] font-bold">Expectancy</span>
              <Badge
                className={cn('ml-2 rounded-full font-bold border-0', pnlBadgeBg(stats.expectancy))}
              >
                {formatPnL(stats.expectancy)}
              </Badge>
            </div>
            <div>
              <span className="text-[#c3caac] font-bold">Avg R:R</span>
              <Badge
                variant="neon-outline"
                className="ml-2 rounded-full font-bold"
              >
                {stats.avgRR}R
              </Badge>
            </div>
            <div>
              <span className="text-[#c3caac] font-bold">Max DD</span>
              <Badge variant="outline" className="ml-2 rounded-full font-bold border-[#ffb4ab]/30 text-[#ffb4ab]">
                {formatCurrency(stats.maxDrawdown)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
