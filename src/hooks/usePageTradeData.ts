import { useTrades } from './useTrades';
import { useSymbolFilter } from './useSymbolFilter';

export function usePageTradeData() {
  const { trades, loading } = useTrades();
  const { selectedSymbol, setSelectedSymbol, filteredTrades } = useSymbolFilter(trades);
  return { trades, loading, selectedSymbol, setSelectedSymbol, filteredTrades };
}
