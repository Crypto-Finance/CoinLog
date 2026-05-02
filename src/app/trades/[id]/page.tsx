'use client';

import { useParams } from 'next/navigation';
import { useTrade } from '@/hooks/useTrades';
import { TradeDetail } from '@/components/trades/trade-detail';
import { LoadingState } from '@/components/common/loading-state';

export default function TradeDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { trade, loading, error } = useTrade(id);

  if (loading) {
    return <LoadingState message="Loading trade..." />;
  }

  if (error || !trade) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-muted-foreground">Trade not found</p>
      </div>
    );
  }

  return <TradeDetail trade={trade} />;
}
