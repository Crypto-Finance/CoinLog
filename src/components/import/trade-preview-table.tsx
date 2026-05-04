import type { Trade } from '@/lib/domain/types';
import { Badge } from '@/components/ui/badge';
import { DirectionBadge } from '@/components/trades/direction-badge';
import { CheckCircle2 } from 'lucide-react';
import { formatPnL, cn } from '@/lib/utils/utils';
import { pnlColor } from '@/lib/ui/pnl-styles';

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
          <CheckCircle2 className="h-4 w-4 text-[#BFFF00]" />
          <span className="text-sm font-bold text-[#d7e3fb]">
            {trades.length} trade(s) ready to import
          </span>
        </div>
        <Badge variant="neon-outline" className="rounded-full font-bold">
          {trades.length} rows
        </Badge>
      </div>

      <div className="rounded-[24px] border border-[rgba(255,255,255,0.1)] overflow-hidden bg-[#152031]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[#1f2a3c]">
                <th className="h-9 px-3 text-left font-bold text-[#c3caac]">
                  #
                </th>
                {PREVIEW_FIELDS.map((field) => (
                  <th
                    key={field.key}
                    className="h-9 px-3 text-left font-bold text-[#d7e3fb]"
                  >
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewTrades.map((trade, idx) => (
                <tr
                  key={`${idx}-${trade.exchangeOrderId}`}
                  className={`border-b border-[rgba(255,255,255,0.1)] transition-colors ${
                    idx % 2 === 0 ? 'bg-[#152031]' : 'bg-[#101c2d]'
                  } hover:bg-[#1f2a3c]`}
                >
                  <td className="px-3 py-2 text-[#c3caac] font-medium">{idx + 1}</td>
                  {PREVIEW_FIELDS.map((field) => {
                    const value = trade[field.key];
                    const fieldKey = field.key;
                    
                    if (fieldKey === 'pnl') {
                      const pnlValue = typeof value === 'number' ? value : Number(value) || 0;
                      return (
                        <td key={field.key} className="px-3 py-2">
                          <span className={cn('font-[800]', pnlColor(pnlValue))}>
                            {formatPnL(pnlValue)}
                          </span>
                        </td>
                      );
                    }
                    
                    if (fieldKey === 'direction') {
                      const direction = trade.direction;
                      return (
                        <td key={field.key} className="px-3 py-2">
                          <DirectionBadge direction={direction} className="px-2 py-0.5 text-xs" />
                        </td>
                      );
                    }
                    
                    return (
                      <td key={field.key} className="px-3 py-2">
                        <span className="font-medium text-[#d7e3fb]">
                          {String(value || '—')}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {trades.length > PREVIEW_COUNT && (
        <p className="text-xs text-[#c3caac] font-medium">
          Showing first {PREVIEW_COUNT} of {trades.length} rows
        </p>
      )}
    </div>
  );
}
