'use client';

import { usePageTradeData } from '@/hooks/usePageTradeData';
import { TradeTable } from '@/components/trades/trade-table';
import { SymbolFilter } from '@/components/common/symbol-filter';
import { LoadingState } from '@/components/common/loading-state';
import { exportToCSV } from '@/lib/csv';
import { pluralize } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export default function TradesPage() {
  const { trades, loading, selectedSymbol, setSelectedSymbol, filteredTrades } = usePageTradeData();

  function handleExport() {
    if (filteredTrades.length === 0) {
      toast.error('No trades to export');
      return;
    }

    const csv = exportToCSV(filteredTrades);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    const today = new Date().toISOString().slice(0, 10);
    const suffix = selectedSymbol ? `-${selectedSymbol}` : '';
    link.download = `CoinLog-trades${suffix}-${today}.csv`;
    link.click();

    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredTrades.length} trade(s)`);
  }

  if (loading) {
    return <LoadingState message="Loading trades..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trade Journal</h1>
          <p className="text-muted-foreground mt-1">
            {selectedSymbol
              ? `${filteredTrades.length} of ${trades.length} ${pluralize(filteredTrades.length, 'trade')} (${selectedSymbol})`
              : `${trades.length} ${pluralize(trades.length, 'trade')} recorded`}
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={filteredTrades.length === 0}>
          <Download className="h-4 w-4 mr-1" />
          Export CSV
        </Button>
      </div>
      <SymbolFilter
        trades={trades}
        selectedSymbol={selectedSymbol}
        onSymbolChange={setSelectedSymbol}
      />
      <TradeTable trades={filteredTrades} />
    </div>
  );
}
