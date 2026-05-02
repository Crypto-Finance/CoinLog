import { NextRequest, NextResponse } from 'next/server';
import { runImportGuards, type ImportRequestBody } from '@/lib/bybit-import-guards';
import { fetchAllTrades } from '@/lib/bybit-api-client';
import { sanitizeExternalError } from '@/lib/api-errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface ImportResponseBody {
  trades: Awaited<ReturnType<typeof fetchAllTrades>>;
  totalFetched: number;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Run all guards sequentially
  const guardResult = await runImportGuards(request);
  if (guardResult instanceof NextResponse) return guardResult;

  // guardResult is ImportRequestBody | null, but null should not happen
  // since guards return NextResponse for all error cases
  if (!guardResult) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  return handleImport(guardResult);
}

async function handleImport(body: ImportRequestBody): Promise<NextResponse> {
  const { apiKey, apiSecret, symbol, startTime, endTime, latestOpenTime } = body;

  // Determine time range
  const now = Date.now();
  let start = startTime;
  if (start === undefined) {
    if (latestOpenTime) {
      start = new Date(latestOpenTime).getTime();
    } else {
      // Default: last 90 days
      start = now - 90 * 24 * 60 * 60 * 1000;
    }
  }
  const end = endTime ?? now;

  if (start >= end) {
    return NextResponse.json(
      { error: 'startTime must be before endTime' },
      { status: 400 },
    );
  }

  try {
    const allTrades = await fetchAllTrades(apiKey, apiSecret, symbol, start, end);

    const responseBody: ImportResponseBody = {
      trades: allTrades,
      totalFetched: allTrades.length,
    };

    return NextResponse.json(responseBody, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    // Sanitize external errors before exposing to client
    const message = sanitizeExternalError(err);
    return NextResponse.json(
      { error: message },
      { status: 502 },
    );
  }
}
