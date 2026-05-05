'use server';

import 'server-only';

/**
 * Server Action for internal app use only.
 * Security provided by:
 * - Session verification (prevents unauthorized Server Action calls)
 * - Next.js built-in CSRF protection (action hashing, same-origin)
 * - Rate limiting (per-IP via Upstash/in-memory)
 * - Zod input validation
 *
 * For external API access, use /api/bybit/import (requires API_ROUTE_SECRET).
 */

import { headers } from 'next/headers';
import { importRequestSchema } from './guards';
import { fetchAllTrades } from './api-client';
import { sanitizeExternalError } from '@/lib/infrastructure/api/errors';
import { checkRateLimit, formatRateLimitError } from '../rate-limit';
import { verifySession } from '@/lib/auth/session';
import { calculateTimeWindow, validateTimeWindow } from '@/lib/validation/time-window';

export interface ImportResult {
  trades: Awaited<ReturnType<typeof fetchAllTrades>>;
  totalFetched: number;
}

/**
 * Validate import parameters using Zod schema.
 * @param params - Raw parameters from client
 * @returns Parsed parameters on success
 * @throws Error if validation fails
 */
function validateImportParams(params: unknown) {
  const result = importRequestSchema.safeParse(params);
  if (!result.success) {
    const fieldNames = result.error.errors.map((err) => err.path.join('.')).filter(Boolean);
    console.error('Validation failed for fields:', fieldNames.length > 0 ? fieldNames.join(', ') : 'unknown');
    throw new Error('Invalid request parameters');
  }
  return result.data;
}

/**
 * Execute the trade import by calling Bybit API.
 * @param params - API credentials and time window
 * @returns Import result with trades
 * @throws Error if API call fails
 */
async function executeImport(params: {
  apiKey: string;
  apiSecret: string;
  symbol?: string;
  start: number;
  end: number;
}): Promise<ImportResult> {
  try {
    const allTrades = await fetchAllTrades(
      params.apiKey,
      params.apiSecret,
      params.symbol,
      params.start,
      params.end,
    );
    return {
      trades: allTrades,
      totalFetched: allTrades.length,
    };
  } catch (err) {
    const message = sanitizeExternalError(err);
    throw new Error(message);
  }
}

export async function importBybitTradesAction(params: {
  apiKey: string;
  apiSecret: string;
  symbol?: string;
  startTime?: number;
  endTime?: number;
  latestOpenTime?: string;
  timestamp?: number;
}): Promise<ImportResult> {
  // 1. Session verification - ensures request originates from authenticated app session
  await verifySession();

  // 2. Rate limiting (get IP from headers directly, no fake Request needed)
  const headersList = await headers();
  const rateLimit = await checkRateLimit(headersList);
  if (!rateLimit.success) {
    throw new Error(formatRateLimitError(rateLimit.reset));
  }

  // 3. Validate parameters with Zod
  const validated = validateImportParams(params);

  // 4. Calculate time window
  const { start, end } = calculateTimeWindow(validated);

  // 5. Validate time window constraints
  validateTimeWindow(start, end);

  // 6. Execute import
  return executeImport({
    apiKey: validated.apiKey,
    apiSecret: validated.apiSecret,
    symbol: validated.symbol,
    start,
    end,
  });
}
