// ---------------------------------------------------------------------------
// Import function
// ---------------------------------------------------------------------------

import type { ImportResult } from './import-action';
import { importBybitTradesAction } from './import-action';

interface ImportParams {
  apiKey: string;
  apiSecret: string;
  symbol?: string;
  startTime?: number;
  endTime?: number;
  latestOpenTime?: string;
  timestamp?: number;
}

export async function importBybitTrades(
  params: ImportParams,
): Promise<ImportResult> {
  // Direct Server Action call - no HTTP, no auth header needed
  // Respect caller-provided timestamp if present, otherwise use current time
  return importBybitTradesAction({ ...params, timestamp: params.timestamp ?? Date.now() });
}
