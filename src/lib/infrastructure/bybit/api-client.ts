import { createHmac } from 'crypto';
import { mapBybitToTrade, type BybitClosedPnlEntry } from './mapper';
import { BYBIT } from '@/lib/constants';

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Sleep for a specified duration.
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

interface SignedGetResult {
  data: Record<string, unknown> | null;
  nextCursor: string | null;
  headers: Headers;
}

interface BybitApiResponse<T = unknown> {
  retCode: number;
  retMsg: string;
  result: T | null;
}

// ---------------------------------------------------------------------------
// Request Building & Signing
// ---------------------------------------------------------------------------

/**
 * Build signed request headers for Bybit API.
 */
function buildSignedRequest(apiKey: string, apiSecret: string, path: string): {
  url: string;
  headers: Record<string, string>;
} {
  const timestamp = Date.now().toString();
  const recvWindow = BYBIT.RECV_WINDOW;

  const [urlPath, queryString] = path.split('?');
  const paramStr = queryString ?? '';
  const signStr = timestamp + apiKey + recvWindow + paramStr;
  const signature = createHmac('sha256', apiSecret).update(signStr).digest('hex');

  const url = queryString
    ? `${BYBIT.API_URL}${urlPath}?${queryString}`
    : `${BYBIT.API_URL}${urlPath}`;

  return {
    url,
    headers: {
      'X-BAPI-API-KEY': apiKey,
      'X-BAPI-SIGN': signature,
      'X-BAPI-SIGN-TYPE': '2',
      'X-BAPI-TIMESTAMP': timestamp,
      'X-BAPI-RECV-WINDOW': recvWindow,
    },
  };
}

// ---------------------------------------------------------------------------
// HTTP Execution
// ---------------------------------------------------------------------------

/**
 * Execute fetch request with timeout handling.
 */
async function executeRequest(url: string, headers: Record<string, string>): Promise<Response> {
  const res = await fetch(url, {
    method: 'GET',
    headers,
    signal: AbortSignal.timeout(BYBIT.REQUEST_TIMEOUT),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bybit HTTP ${res.status}: ${text || res.statusText}`);
  }

  return res;
}

// ---------------------------------------------------------------------------
// Response Parsing
// ---------------------------------------------------------------------------

/**
 * Parse and validate Bybit API response.
 */
async function parseBybitResponse<T>(res: Response): Promise<{ data: T | null; nextCursor: string | null }> {
  const json = await res.json();

  if (typeof json !== 'object' || json === null) {
    throw new Error('Invalid response');
  }

  const response = json as BybitApiResponse<T>;

  if (response.retCode !== 0) {
    throw new Error(
      `Bybit API error: ${response.retMsg || 'Unknown'} (code: ${response.retCode})`,
    );
  }

  const result = response.result;
  const nextCursor =
    (result as Record<string, unknown> | undefined)?.nextPageCursor as string | undefined;

  return {
    data: result ?? null,
    nextCursor: nextCursor ?? null,
  };
}

// ---------------------------------------------------------------------------
// Main Entry Point
// ---------------------------------------------------------------------------

/**
 * Make a signed GET request to Bybit API using HMAC-SHA256.
 */
async function signedGet(
  apiKey: string,
  apiSecret: string,
  path: string,
): Promise<SignedGetResult> {
  const { url, headers } = buildSignedRequest(apiKey, apiSecret, path);
  const res = await executeRequest(url, headers);
  const { data, nextCursor } = await parseBybitResponse<Record<string, unknown>>(res);

  return { data, nextCursor, headers: res.headers };
}

/**
 * Fetch all trades from a single 7-day window with pagination.
 */
export async function fetchWindow(
  apiKey: string,
  apiSecret: string,
  symbol: string | undefined,
  startTime: number,
  endTime: number,
): Promise<ReturnType<typeof mapBybitToTrade>[]> {
  const allEntries: ReturnType<typeof mapBybitToTrade>[] = [];
  let cursor = '';

  while (true) {
    const params = new URLSearchParams({
      category: 'linear',
      limit: String(BYBIT.LIMIT),
      startTime: String(startTime),
      endTime: String(endTime),
    });

    if (symbol) params.set('symbol', symbol);
    if (cursor) params.set('cursor', cursor);

    const queryString = params.toString();
    const path = `/v5/position/closed-pnl?${queryString}`;

    const { data, nextCursor, headers } = await signedGet(apiKey, apiSecret, path);

    if (data?.list && Array.isArray(data.list)) {
      for (const entry of data.list as BybitClosedPnlEntry[]) {
        allEntries.push(mapBybitToTrade(entry));
      }
    }

    if (!nextCursor) break;
    
    // Rate limiting backoff between paginated requests
    const remaining = headers.get('X-Bapi-Limit-Status');
    if (remaining !== null && parseInt(remaining) < 5) {
      const resetTs = headers.get('X-Bapi-Limit-Reset-Timestamp');
      const waitMs = resetTs ? parseInt(resetTs) - Date.now() + 100 : 200;
      if (waitMs > 0) await sleep(waitMs);
    } else {
      await sleep(200);
    }
    
    cursor = nextCursor;
  }

  return allEntries;
}

/**
 * Fetch all trades across multiple 7-day windows from start to end time.
 * Returns trades in chunks of 7-day windows (newest first).
 */
export async function fetchAllTrades(
  apiKey: string,
  apiSecret: string,
  symbol: string | undefined,
  startTime: number,
  endTime: number,
): Promise<ReturnType<typeof mapBybitToTrade>[]> {
  const allTrades: ReturnType<typeof mapBybitToTrade>[] = [];

  // Chunk into 7-day windows (newest first)
  for (let windowEnd = endTime; windowEnd > startTime; ) {
    const windowStart = Math.max(windowEnd - BYBIT.MAX_DAY_WINDOW, startTime);

    const windowTrades = await fetchWindow(
      apiKey,
      apiSecret,
      symbol,
      windowStart,
      windowEnd,
    );

    allTrades.push(...windowTrades);

    // Move to next window
    windowEnd = windowStart;
  }

  return allTrades;
}
