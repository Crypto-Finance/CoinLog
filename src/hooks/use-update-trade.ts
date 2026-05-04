'use client';

import { useCallback, useState } from 'react';
import * as db from '@/lib/infrastructure/db';
import { getErrorMessage } from '@/lib/utils/errors';
import type { Trade } from '@/lib/domain/types';

/**
 * Focused hook for updating a single trade by ID.
 * Avoids fetching the full trade list when only one trade needs updating.
 */
export function useUpdateTrade(id: number) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTrade = useCallback(async (data: Partial<Trade>) => {
    setIsUpdating(true);
    setError(null);
    try {
      await db.updateTrade(id, data);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to update trade');
      setError(message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [id]);

  return {
    updateTrade,
    isUpdating,
    error,
  };
}
