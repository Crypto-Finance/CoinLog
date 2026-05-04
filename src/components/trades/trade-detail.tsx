'use client';

import Link from 'next/link';
import type { Trade } from '@/lib';
import { formatCurrency, formatDate, formatPnL, formatPrice } from '@/lib';
import { pnlColor, pnlBorder } from '@/lib/ui/pnl-styles';
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
      <span className="text-xs font-bold text-[#c3caac] uppercase tracking-wide">{label}</span>
      <span className="text-sm font-bold text-[#d7e3fb]">{value || '—'}</span>
    </div>
  );
}

export function TradeDetail({ trade }: TradeDetailProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/trades">
            <Button variant="ghost" size="sm" className="text-[#d7e3fb] hover:text-[#BFFF00] hover:bg-[#1f2a3c]">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-[800] text-[#d7e3fb]">{trade.symbol}</h1>
            <p className="text-sm text-[#c3caac] font-medium">
              Trade #{trade.id} · {trade.exchange}
            </p>
          </div>
        </div>
        <Link href={`/trades/${trade.id}/annotate`}>
          <Button 
            variant={trade.isAnnotated ? 'neon-outline' : 'neon'}
          >
            <Pencil className="h-4 w-4 mr-1" />
            {trade.isAnnotated ? 'Edit Annotation' : 'Annotate Trade'}
          </Button>
        </Link>
      </div>

      {/* PnL Banner */}
      <Card className={`border-2 ${pnlBorder(trade.pnl)} shadow-none`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#c3caac]">P&L</p>
              <p className={`text-3xl font-[800] ${pnlColor(trade.pnl)}`}>
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
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-bold text-[#d7e3fb]">Exchange Data</CardTitle>
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
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-bold text-[#d7e3fb]">Trade Annotation</CardTitle>
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
              <Separator className="my-4 bg-[rgba(255,255,255,0.1)]" />
              <Field label="Notes" value={trade.notes} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
