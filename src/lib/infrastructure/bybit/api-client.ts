import { createHmac } from 'crypto';
import { mapBybitToTrade, type BybitClosedPnlEntry } from './mapper';

const BYBIT_API_URL = process.env.BYBIT_API_URL || 'https://api.bybit.com';
const MAX_DAY_WINDOW = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
const LIMIT = 50;

interface SignedGetResult {
  data: Record<string, unknown> | null;
  nextCursor: string | null;
  headers: Headers;
}

/**
 * Make a signed GET request to Bybit API using HMAC-SHA256.
 */
async function signedGet(
  apiKey: string,
  apiSecret: string,
  path: string,
): Promise<SignedGetResult> {
  const timestamp = Date.now().toString();
  const recvWindow = '5000';

  // Extract query string for signing
  const [urlPath, queryString] = path.split('?');
  const paramStr = queryString ?? '';
  const signStr = timestamp + apiKey + recvWindow + paramStr;

  const signature = createHmac('sha256', apiSecret).update(signStr).digest('hex');

  const url = queryString ? `${BYBIT_API_URL}${urlPath}?${queryString}` : `${BYBIT_API_URL}${urlPath}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-BAPI-API-KEY': apiKey,
        'X-BAPI-SIGN': signature,
        'X-BAPI-SIGN-TYPE': '2',
        'X-BAPI-TIMESTAMP': timestamp,
        'X-BAPI-RECV-WINDOW': recvWindow,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `Bybit HTTP ${res.status}: ${text || res.statusText}`,
      );
    }

    const json = await res.json() as unknown;

    // Narrow unknown type safely
    if (typeof json !== 'object' || json === null) {
      throw new Error('Invalid response');
    }

    const retCode = (json as Record<string, unknown>).retCode;
    const retMsg = (json as Record<string, unknown>).retMsg;

    if (retCode !== 0) {
      throw new Error(
        `Bybit API error: ${typeof retMsg === 'string' ? retMsg : 'Unknown'} (code: ${retCode})`,
      );
    }

    const result = (json as Record<string, unknown>).result;
    return {
      data: (result as Record<string, unknown> | null) ?? null,
      nextCursor:
        ((result as Record<string, unknown> | undefined)?.nextPageCursor as string | undefined) ?? null,
      headers: res.headers,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
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
      limit: String(LIMIT),
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
      if (waitMs > 0) await new Promise(r => setTimeout(r, waitMs));
    } else {
      await new Promise(r => setTimeout(r, 200));
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
    const windowStart = Math.max(windowEnd - MAX_DAY_WINDOW, startTime);

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
