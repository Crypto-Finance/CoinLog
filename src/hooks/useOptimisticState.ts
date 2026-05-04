'use client';
import { useState, useCallback, useRef } from 'react';

/**
 * Hook for managing optimistic state updates with automatic rollback on error.
 * 
 * This hook provides a pattern for optimistic UI updates:
 * 1. Take a snapshot of current state before mutation
 * 2. Apply optimistic update immediately
 * 3. If DB operation fails, rollback to snapshot
 * 
 * @template T - The type of state being managed
 * @param initial - Initial state value
 * @returns Object with state, setState, and optimistic update utilities
 */
export function useOptimisticState<T>(initial: T) {
  const [state, setState] = useState<T>(initial);
  const snapshotRef = useRef<T>(initial);

  const takeSnapshot = useCallback(() => {
    setState(prev => {
      snapshotRef.current = structuredClone ? structuredClone(prev) : JSON.parse(JSON.stringify(prev));
      return prev;
    });
  }, []);

  const rollback = useCallback(() => {
    setState(snapshotRef.current);
  }, []);

  const withOptimistic = useCallback(
    async <R>(
      dbOperation: () => Promise<R>,
      applyOptimistic: (prev: T) => T,
    ): Promise<R> => {
      takeSnapshot();
      try {
        const result = await dbOperation();
        setState(applyOptimistic);
        return result;
      } catch (error) {
        rollback();
        throw error;
      }
    },
    [takeSnapshot, rollback],
  );

  return { state, setState, withOptimistic, rollback, takeSnapshot };
}
