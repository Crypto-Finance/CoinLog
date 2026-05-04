import { useFilter } from '@/hooks/useFilter';
import type { Trade } from '@/lib/domain/types';

export function useSymbolFilter(trades: Trade[]) {
  const { filterValue, setFilterValue, filtered } = useFilter(trades, 'symbol');
  const selectedSymbol = filterValue || null;
  const setSelectedSymbol = (s: string | null) => setFilterValue(s ?? '');
  return { selectedSymbol, setSelectedSymbol, filteredTrades: filtered };
}
