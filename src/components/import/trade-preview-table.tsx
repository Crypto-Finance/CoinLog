import type { Trade } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

// Fields shown in the preview table
const PREVIEW_FIELDS: { key: keyof Omit<Trade, 'id'>; label: string }[] = [
  { key: 'symbol', label: 'Symbol' },
  { key: 'direction', label: 'Side' },
  { key: 'entryPrice', label: 'Entry' },
  { key: 'exitPrice', label: 'Exit' },
  { key: 'pnl', label: 'P&L' },
  { key: 'openTime', label: 'Open Time' },
  { key: 'setupType', label: 'Setup' },
];

const PREVIEW_COUNT = 5;

interface TradePreviewTableProps {
  trades: Omit<Trade, 'id'>[];
}

/**
 * Preview table showing the first N trades from a parsed import.
 */
export function TradePreviewTable({ trades }: TradePreviewTableProps) {
  const previewTrades = trades.slice(0, PREVIEW_COUNT);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-medium">
            {trades.length} trade(s) ready to import
          </span>
        </div>
        <Badge variant="secondary">{trades.length} rows</Badge>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-9 px-3 text-left font-medium text-muted-foreground">
                  #
                </th>
                {PREVIEW_FIELDS.map((field) => (
                  <th
                    key={field.key}
                    className="h-9 px-3 text-left font-medium"
                  >
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewTrades.map((trade, idx) => (
                <tr
                  key={trade.exchangeOrderId}
                  className="border-b hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                  {PREVIEW_FIELDS.map((field) => (
                    <td key={field.key} className="px-3 py-2">
                      {String(trade[field.key] || '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {trades.length > PREVIEW_COUNT && (
        <p className="text-xs text-muted-foreground">
          Showing first {PREVIEW_COUNT} of {trades.length} rows
        </p>
      )}
    </div>
  );
}
