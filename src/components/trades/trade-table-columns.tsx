import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { Trade } from '@/lib/domain/types';
import { formatPnL, formatDate, cn, formatPrice } from '@/lib/utils/utils';
import { pnlColor } from '@/lib/ui/pnl-styles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DirectionBadge } from './direction-badge';
import { AnnotatedBadge } from './annotated-badge';

function createSortableHeader(label: string) {
  return function SortableHeader({ column }: { column: Column<Trade, unknown> }) {
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="font-bold text-[#d7e3fb] hover:bg-[#1f2a3c] hover:text-[#BFFF00]"
      >
        {label} <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    );
  };
}

export const columns: ColumnDef<Trade>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <span className="text-[#c3caac] font-medium">#{row.getValue('id')}</span>
    ),
  },
  {
    accessorKey: 'openTime',
    header: createSortableHeader('Date'),
    cell: ({ row }) => (
      <span className="font-medium text-[#d7e3fb]">{formatDate(row.original.openTime)}</span>
    ),
  },
  {
    accessorKey: 'symbol',
    header: 'Symbol',
    cell: ({ row }) => (
      <span className="font-bold text-[#d7e3fb]">{row.getValue('symbol')}</span>
    ),
  },
  {
    accessorKey: 'direction',
    header: 'Side',
    cell: ({ row }) => {
      return <DirectionBadge direction={row.original.direction} />;
    },
  },
  {
    accessorKey: 'entryPrice',
    header: 'Entry',
    cell: ({ row }) => (
      <span className="font-medium text-[#d7e3fb]">{formatPrice(row.getValue('entryPrice'))}</span>
    ),
  },
  {
    accessorKey: 'exitPrice',
    header: 'Exit',
    cell: ({ row }) => (
      <span className="font-medium text-[#d7e3fb]">{formatPrice(row.getValue('exitPrice'))}</span>
    ),
  },
  {
    accessorKey: 'pnl',
    header: createSortableHeader('P&L'),
    cell: ({ row }) => {
      return (
        <span
          className={cn(
            'font-[800]',
            pnlColor(row.original.pnl),
          )}
        >
          {formatPnL(row.original.pnl)}
        </span>
      );
    },
  },
  {
    accessorKey: 'rrActual',
    header: 'R:R',
    cell: ({ row }) => {
      const rrActual = row.original.rrActual;
      return (
        <span className="font-medium text-[#d7e3fb]">
          {rrActual ? `${rrActual}R` : '—'}
        </span>
      );
    },
  },
  {
    accessorKey: 'setupType',
    header: 'Setup',
    cell: ({ row }) => {
      return <span className="font-medium text-[#d7e3fb]">{row.original.setupType || '—'}</span>;
    },
  },
  {
    accessorKey: 'isAnnotated',
    header: 'Status',
    cell: ({ row }) => {
      return row.original.isAnnotated ? (
        <AnnotatedBadge />
      ) : (
        <Badge variant="outline" className="text-[#c3caac] rounded-full border-[rgba(255,255,255,0.2)]">
          Pending
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Link href={`/trades/${row.original.id}`}>
        <Button variant="ghost" size="sm" className="text-[#d7e3fb] hover:text-[#BFFF00] hover:bg-[#1f2a3c]">
          View
        </Button>
      </Link>
    ),
  },
];
