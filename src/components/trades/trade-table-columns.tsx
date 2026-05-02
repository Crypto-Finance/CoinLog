import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { Trade } from '@/lib/types';
import { formatPnL, formatDate, pnlColor, cn, formatPrice } from '@/lib/utils';
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
      <span className="text-muted-foreground">#{row.getValue('id')}</span>
    ),
  },
  {
    accessorKey: 'openTime',
    header: createSortableHeader('Date'),
    cell: ({ row }) => formatDate(row.getValue('openTime') as string),
  },
  {
    accessorKey: 'symbol',
    header: 'Symbol',
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('symbol')}</span>
    ),
  },
  {
    accessorKey: 'direction',
    header: 'Side',
    cell: ({ row }) => {
      const dir = row.getValue('direction') as string;
      return <DirectionBadge direction={dir as 'Long' | 'Short'} />;
    },
  },
  {
    accessorKey: 'entryPrice',
    header: 'Entry',
    cell: ({ row }) => formatPrice(row.getValue('entryPrice')),
  },
  {
    accessorKey: 'exitPrice',
    header: 'Exit',
    cell: ({ row }) => formatPrice(row.getValue('exitPrice')),
  },
  {
    accessorKey: 'pnl',
    header: createSortableHeader('P&L'),
    cell: ({ row }) => (
      <span
        className={cn(
          'font-semibold',
          pnlColor(row.getValue('pnl') as string),
        )}
      >
        {formatPnL(row.getValue('pnl') as string)}
      </span>
    ),
  },
  {
    accessorKey: 'rrActual',
    header: 'R:R',
    cell: ({ row }) => {
      const rr = row.getValue('rrActual') as string;
      return <span>{rr ? `${rr}R` : '—'}</span>;
    },
  },
  {
    accessorKey: 'setupType',
    header: 'Setup',
    cell: ({ row }) => {
      const setup = row.getValue('setupType') as string;
      return <span>{setup || '—'}</span>;
    },
  },
  {
    accessorKey: 'isAnnotated',
    header: 'Status',
    cell: ({ row }) => {
      const annotated = row.getValue('isAnnotated') as boolean;
      return annotated ? (
        <AnnotatedBadge />
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          Pending
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Link href={`/trades/${row.original.id}`}>
        <Button variant="ghost" size="sm">
          View
        </Button>
      </Link>
    ),
  },
];
