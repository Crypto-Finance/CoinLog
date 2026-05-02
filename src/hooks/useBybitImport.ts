'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredKeys } from '@/lib/bybit-keychain';
import { importBybitTrades } from '@/lib/bybit-client';
import * as db from '@/lib/db';
import { showImportSuccess } from '@/lib/import-toast';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';

interface UseBybitImportOptions {
  hasKeys: boolean;
  onSuccess?: () => void;
}

export function useBybitImport({ hasKeys, onSuccess }: UseBybitImportOptions) {
  const router = useRouter();
  const [importing, setImporting] = useState(false);

  async function executeImport(passphrase: string, symbol: string, days: string) {
    if (!hasKeys) {
      toast.error('Configure API keys first');
      return;
    }
    if (!passphrase) {
      toast.error('Enter your encryption passphrase');
      return;
    }

    const daysNum = parseInt(days, 10);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
      toast.error('Days must be between 1 and 365');
      return;
    }

    setImporting(true);
    try {
      const result = await performImport(passphrase, symbol, daysNum);
      if (result) {
        showImportSuccess(result.inserted, result.skipped);
        router.refresh();
        onSuccess?.();
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Import failed'));
    } finally {
      setImporting(false);
    }
  }

  return { importing, executeImport };
}

async function performImport(passphrase: string, symbol: string, daysNum: number) {
  const keys = await getStoredKeys(passphrase);
  if (!keys) {
    toast.error('Wrong passphrase — could not decrypt API keys');
    return null;
  }

  const endTime = Date.now();
  const startTime = endTime - daysNum * 24 * 60 * 60 * 1000;

  const { trades, totalFetched } = await importBybitTrades({
    apiKey: keys.apiKey,
    apiSecret: keys.apiSecret,
    symbol: symbol.trim() || undefined,
    startTime,
    endTime,
  });

  if (totalFetched === 0) {
    toast.info('No trades found for the selected period');
    return null;
  }

  return await db.addTradesWithDedup(trades);
}
