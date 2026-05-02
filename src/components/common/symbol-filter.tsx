'use client';

import { useMemo } from 'react';
import type { Trade } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface SymbolFilterProps {
  trades: Trade[];
  selectedSymbol: string | null;
  onSymbolChange: (symbol: string | null) => void;
}

export function SymbolFilter({ trades, selectedSymbol, onSymbolChange }: SymbolFilterProps) {
  const uniqueSymbols = useMemo(() => {
    const symbols = new Set(trades.map((t) => t.symbol));
    return Array.from(symbols).sort();
  }, [trades]);

  const symbolCount = uniqueSymbols.length;

  return (
    <div className="flex items-center gap-3">
      <Select
        value={selectedSymbol ?? '__all__'}
        onValueChange={(value) => onSymbolChange(value === '__all__' ? null : value)}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue>
            {selectedSymbol ?? 'All Symbols'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Symbols</SelectItem>
          {uniqueSymbols.map((symbol) => (
            <SelectItem key={symbol} value={symbol}>
              {symbol}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Badge variant="secondary">
        {symbolCount} symbol{symbolCount !== 1 ? 's' : ''}
      </Badge>
    </div>
  );
}
