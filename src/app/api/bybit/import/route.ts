import { NextRequest, NextResponse } from 'next/server';
import { runImportGuards, type ImportRequestBody } from '@/lib/infrastructure/bybit/guards';
import { fetchAllTrades } from '@/lib/infrastructure/bybit/api-client';
import { errorResponse, sanitizeExternalError } from '@/lib/infrastructure/api/errors';
import { calculateTimeWindow, validateTimeWindow } from '@/lib/validation/time-window';

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
    return errorResponse(400, 'Invalid request');
  }

  return handleImport(guardResult);
}

async function handleImport(body: ImportRequestBody): Promise<NextResponse> {
  const { apiKey, apiSecret, symbol, startTime, endTime, latestOpenTime } = body;

  // Calculate and validate time window
  const { start, end } = calculateTimeWindow({ startTime, endTime, latestOpenTime });
  
  try {
    validateTimeWindow(start, end);
  } catch (error) {
    return errorResponse(400, (error as Error).message);
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
    return errorResponse(502, message);
  }
}
