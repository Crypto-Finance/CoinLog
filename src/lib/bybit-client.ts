// ---------------------------------------------------------------------------
// Import function
// ---------------------------------------------------------------------------

interface ImportParams {
  apiKey: string;
  apiSecret: string;
  symbol?: string;
  startTime?: number;
  endTime?: number;
  latestOpenTime?: string;
  timestamp?: number;
}

interface ImportResult {
  trades: import('@/lib/types').Trade[];
  totalFetched: number;
}

export async function importBybitTrades(
  params: ImportParams,
): Promise<ImportResult> {
  const res = await fetch('/api/bybit/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, timestamp: Date.now() }),
  });

  if (!res.ok) {
    let errorMessage = 'Import failed';
    try {
      const error = (await res.json()) as { error?: string };
      if (error.error) errorMessage = error.error;
    } catch {
      // ignore — use default message
    }
    throw new Error(errorMessage);
  }

  return res.json() as Promise<ImportResult>;
}
