'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { usePageTradeData } from '@/hooks/usePageTradeData';
import { calculateStats, formatPnL, formatDate, cn, formatProfitFactor, profitFactorColor, pnlColor, winRateColor } from '@/lib';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SymbolFilter } from '@/components/common/symbol-filter';
import { LoadingState } from '@/components/common/loading-state';
import { StatCard } from '@/components/stats/stat-card';
import { ArrowRight, BarChart3, Percent, DollarSign, TrendingUp } from 'lucide-react';
import { DirectionBadge } from '@/components/trades/direction-badge';
import { AnnotatedBadge } from '@/components/trades/annotated-badge';

export default function DashboardPage() {
  const { trades, loading, selectedSymbol, setSelectedSymbol, filteredTrades } = usePageTradeData();

  const stats = calculateStats(filteredTrades);
  const recentTrades = useMemo(() => [...filteredTrades]
    .sort((a, b) => new Date(b.openTime).getTime() - new Date(a.openTime).getTime())
    .slice(0, 5), [filteredTrades]);

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {selectedSymbol
                ? `Overview for ${selectedSymbol}`
                : 'Trading journal overview'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/import">
              <Button>Add Trade</Button>
            </Link>
          </div>
        </div>
        <div className="mt-4">
          <SymbolFilter
            trades={trades}
            selectedSymbol={selectedSymbol || null}
            onSymbolChange={setSelectedSymbol}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Trades"
          value={stats.totalTrades}
          icon={BarChart3}
        />
        <StatCard
          title="Win Rate"
          value={`${stats.winRate}%`}
          icon={Percent}
          color={winRateColor(stats.winRate)}
        />
        <StatCard
          title="Total P&L"
          value={formatPnL(stats.totalPnL)}
          icon={DollarSign}
          color={pnlColor(stats.totalPnL)}
        />
        <StatCard
          title="Profit Factor"
          value={formatProfitFactor(stats.profitFactor)}
          icon={TrendingUp}
          color={profitFactorColor(stats.profitFactor)}
        />
      </div>

      {/* Recent Trades */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Trades</CardTitle>
          <Link href="/trades">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentTrades.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No trades yet. Add your first trade to get started.</p>
              <Link href="/import">
                <Button className="mt-3">Add Trade</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <Link key={trade.id} href={`/trades/${trade.id}`}>
                  <div className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    'hover:bg-muted/50 transition-colors'
                  )}>
                    <div className="flex items-center gap-4">
                      <DirectionBadge direction={trade.direction} />
                      <div>
                        <p className="font-medium">{trade.symbol}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(trade.openTime)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn('font-semibold', pnlColor(trade.pnl))}>
                        {formatPnL(trade.pnl)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {trade.isAnnotated ? <AnnotatedBadge className="inline" /> : '○ Pending'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
