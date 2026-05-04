'use client';

import { usePageTradeData } from '@/hooks/usePageTradeData';
import { calculateStats } from '@/lib/domain/stats';
import { pluralize } from '@/lib/utils/utils';
import { StatsDashboard } from '@/components/stats/stats-dashboard';
import { SymbolFilter } from '@/components/common/symbol-filter';
import { LoadingState } from '@/components/common/loading-state';
import Link from 'next/link';

export default function StatsPage() {
  const { trades, loading, selectedSymbol, setSelectedSymbol, filteredTrades } = usePageTradeData();
  const stats = calculateStats(filteredTrades);

  if (loading) {
    return <LoadingState message="Loading statistics..." />;
  }

  if (stats.totalTrades === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
          <p className="text-muted-foreground mt-1">
            {selectedSymbol
              ? `Performance metrics for ${selectedSymbol}`
              : 'Performance metrics for your trades'}
          </p>
        </div>
        <SymbolFilter
          trades={trades}
          selectedSymbol={selectedSymbol}
          onSymbolChange={setSelectedSymbol}
        />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg text-muted-foreground">
            {selectedSymbol
              ? `No trades found for ${selectedSymbol}`
              : 'No data yet — import some trades first'}
          </p>
          <Link href="/import" className="text-sm text-primary hover:underline mt-2">
            Go to Import →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
        <p className="text-muted-foreground mt-1">
          {selectedSymbol
            ? `Performance metrics for ${selectedSymbol} (${stats.totalTrades} ${pluralize(stats.totalTrades, 'trade')})`
            : `Performance metrics across ${stats.totalTrades} ${pluralize(stats.totalTrades, 'trade')}`}
        </p>
      </div>
      <SymbolFilter
        trades={trades}
        selectedSymbol={selectedSymbol}
        onSymbolChange={setSelectedSymbol}
      />
      <StatsDashboard stats={stats} />
    </div>
  );
}
