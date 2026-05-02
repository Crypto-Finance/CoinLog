'use client';

import Link from 'next/link';
import type { Trade } from '@/lib/types';
import {
  formatCurrency,
  formatDate,
  formatPnL,
  pnlColor,
  pnlCardClass,
  cn,
  formatPrice,
} from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Pencil } from 'lucide-react';
import { DirectionBadge } from './direction-badge';
import { AnnotatedBadge } from './annotated-badge';

interface TradeDetailProps {
  trade: Trade;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium">{value || '—'}</span>
    </div>
  );
}

export function TradeDetail({ trade }: TradeDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/trades">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{trade.symbol}</h1>
            <p className="text-sm text-muted-foreground">
              Trade #{trade.id} · {trade.exchange}
            </p>
          </div>
        </div>
        <Link href={`/trades/${trade.id}/annotate`}>
          <Button variant={trade.isAnnotated ? 'outline' : 'default'}>
            <Pencil className="h-4 w-4 mr-1" />
            {trade.isAnnotated ? 'Edit Annotation' : 'Annotate Trade'}
          </Button>
        </Link>
      </div>

      {/* PnL Banner */}
      <Card className={cn('border-2', pnlCardClass(trade.pnl))}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">P&L</p>
              <p className={cn('text-3xl font-bold', pnlColor(trade.pnl))}>
                {formatPnL(trade.pnl)}
              </p>
            </div>
            <div className="flex gap-2">
              <DirectionBadge direction={trade.direction} className="text-sm px-3 py-1" />
              {trade.isAnnotated && (
                <AnnotatedBadge className="text-sm px-3 py-1" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exchange Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exchange Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Order ID" value={trade.exchangeOrderId} />
            <Field label="Symbol" value={trade.symbol} />
            <Field label="Direction" value={trade.direction} />
            <Field label="Exchange" value={trade.exchange} />
            <Field label="Entry Price" value={formatPrice(trade.entryPrice)} />
            <Field label="Exit Price" value={formatPrice(trade.exitPrice)} />
            <Field label="Quantity" value={trade.quantity} />
            <Field label="Fee" value={formatCurrency(trade.fee)} />
            <Field label="Open Time" value={formatDate(trade.openTime)} />
            <Field label="Close Time" value={trade.closeTime ? formatDate(trade.closeTime) : 'Open'} />
          </div>
        </CardContent>
      </Card>

      {/* Annotation Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trade Annotation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Setup Type" value={trade.setupType} />
            <Field label="Stop Loss" value={trade.stopLoss ? formatPrice(trade.stopLoss) : undefined} />
            <Field label="Take Profit" value={trade.takeProfit ? formatPrice(trade.takeProfit) : undefined} />
            <Field label="Risk Amount" value={trade.riskAmount ? formatCurrency(trade.riskAmount) : undefined} />
            <Field label="R:R Planned" value={trade.rrPlanned ? `${trade.rrPlanned}R` : undefined} />
            <Field label="R:R Actual" value={trade.rrActual ? `${trade.rrActual}R` : undefined} />
            <Field label="Exit Type" value={trade.exitType} />
            <Field label="Market Condition" value={trade.marketCondition} />
          </div>
          {trade.notes && (
            <>
              <Separator className="my-4" />
              <Field label="Notes" value={trade.notes} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
