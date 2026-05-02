'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Trade } from '@/lib/types';
import * as db from '@/lib/db';
import { getErrorMessage } from '@/lib/errors';

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const data = await db.getAllTrades();
      setTrades(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch trades'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetchTrades is stable useCallback that manages its own loading state
    fetchTrades();
  }, [fetchTrades]);

  const addTrade = useCallback(async (trade: Omit<Trade, 'id'>) => {
    const id = await db.addTrade(trade);
    await fetchTrades();
    return id;
  }, [fetchTrades]);

  const updateTrade = useCallback(async (id: number, data: Partial<Trade>) => {
    await db.updateTrade(id, data);
    await fetchTrades();
  }, [fetchTrades]);

  const deleteTrade = useCallback(async (id: number) => {
    await db.deleteTrade(id);
    await fetchTrades();
  }, [fetchTrades]);

  const bulkAddTrades = useCallback(async (newTrades: Omit<Trade, 'id'>[]) => {
    await db.bulkAddTrades(newTrades);
    await fetchTrades();
  }, [fetchTrades]);

  const clearAll = useCallback(async () => {
    await db.clearAllTrades();
    await fetchTrades();
  }, [fetchTrades]);

  return {
    trades,
    loading,
    error,
    addTrade,
    updateTrade,
    deleteTrade,
    bulkAddTrades,
    clearAll,
    refresh: fetchTrades,
  };
}

export function useTrade(id: number) {
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    db.getTrade(id).then(
      (data) => { if (!ignore) { setTrade(data ?? null); setError(null); } },
      (err) => { if (!ignore) { setError(getErrorMessage(err, 'Failed to fetch trade')); } },
    ).finally(() => { if (!ignore) { setLoading(false); } });
    return () => { ignore = true; };
  }, [id]);

  return { trade, loading, error };
}
