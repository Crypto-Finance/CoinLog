'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Trade } from '@/lib/domain/types';
import * as db from '@/lib/infrastructure/db';
import { getErrorMessage } from '@/lib/utils/errors';
import { useOptimisticState } from './useOptimisticState';

/**
 * Hook for managing trades with optimistic updates.
 * 
 * Uses optimistic updates with snapshot rollback to avoid unnecessary IndexedDB reads.
 * When a mutation succeeds, the state is updated optimistically.
 * When a mutation fails, the state is rolled back to the previous snapshot.
 */

export interface AddTradeResult {
  success: boolean;
  id?: number;
  error?: string;
}

export function useTrades() {
  const { state: trades, setState: setTrades, withOptimistic } = useOptimisticState<Trade[]>([]);
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
  }, [setTrades]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetchTrades manages its own loading/error state
    fetchTrades();
  }, [fetchTrades]);

  const addTrade = useCallback(async (trade: Omit<Trade, 'id'>): Promise<AddTradeResult> => {
    let id: number | undefined;
    try {
      await withOptimistic(
        async () => {
          id = await db.addTrade(trade);
          return id;
        },
        (prev) => [{ ...trade, id: id! } as unknown as Trade, ...prev],
      );
      // Fix up the optimistic item with the real ID (in case of any race conditions)
      setTrades(prev => prev.map((t, i) => i === 0 && id !== undefined ? { ...t, id } : t));
      return { success: true, id: id! };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [withOptimistic, setTrades, setError]);

  const updateTrade = useCallback(async (id: number, data: Partial<Trade>) => {
    try {
      await withOptimistic(
        () => db.updateTrade(id, data),
        (prev) => prev.map(t => t.id === id ? { ...t, ...data } : t),
      );
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    }
  }, [withOptimistic, setError]);

  const deleteTrade = useCallback(async (id: number) => {
    try {
      await withOptimistic(
        () => db.deleteTrade(id),
        (prev) => prev.filter(t => t.id !== id),
      );
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    }
  }, [withOptimistic, setError]);

  const bulkAddTrades = useCallback(async (newTrades: Omit<Trade, 'id'>[]) => {
    let ids: number[] = [];
    try {
      await withOptimistic(
        async () => {
          ids = await db.bulkAddTrades(newTrades);
          return ids;
        },
        (prev) => {
          const tradesWithIds: Trade[] = newTrades.map((t, i) => ({ ...t, id: ids[i] } as Trade));
          return [...tradesWithIds, ...prev];
        },
      );
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    }
  }, [withOptimistic, setError]);

  const clearAll = useCallback(async () => {
    try {
      await withOptimistic(
        () => db.clearAllTrades(),
        () => [],
      );
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw error;
    }
  }, [withOptimistic, setError]);

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
