'use client';

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { Trade } from '@/lib';
import { Button } from '@/components/ui/button';
import { columns } from './trade-table-columns';

interface TradeTableProps {
  trades: Trade[];
}

const PAGE_SIZE = 20;

export function TradeTable({ trades }: TradeTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'openTime', desc: true }]);
  const [pageIndex, setPageIndex] = useState(0);

  const table = useReactTable({
    data: trades,
    columns,
    state: { sorting, pagination: { pageIndex, pageSize: PAGE_SIZE } },
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater({ pageIndex, pageSize: PAGE_SIZE }) : updater;
      setPageIndex(next.pageIndex);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-[#c3caac] font-medium">No trades yet</p>
        <p className="text-sm text-[#c3caac] mt-1">Import trades or add one manually to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-[rgba(255,255,255,0.1)] overflow-hidden bg-[#152031]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-[rgba(255,255,255,0.1)] bg-[#1f2a3c]">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="h-10 px-4 text-left font-bold text-[#d7e3fb]">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, index) => (
                <tr 
                  key={row.id} 
                  className={`border-b border-[rgba(255,255,255,0.1)] transition-colors ${
                    index % 2 === 0 ? 'bg-[#152031]' : 'bg-[#101c2d]'
                  } hover:bg-[#1f2a3c]`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#c3caac] font-medium">
          {table.getFilteredRowModel().rows.length} trade(s) total
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="neon-outline"
            size="sm"
            onClick={() => setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="neon-outline"
            size="sm"
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-[#c3caac] px-2 font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            variant="neon-outline"
            size="sm"
            onClick={() => setPageIndex((p) => p + 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="neon-outline"
            size="sm"
            onClick={() => setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
