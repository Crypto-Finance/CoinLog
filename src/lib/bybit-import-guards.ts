import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { verifyApiAuth } from '@/lib/api-auth';
import { verifyOrigin } from '@/lib/csrf-check';
import { z } from 'zod';

const MAX_BODY_SIZE = 10 * 1024; // 10KB
const FRESHNESS_WINDOW_MS = 30_000; // 30 seconds

// ---------------------------------------------------------------------------
// Zod Schema for request validation
// ---------------------------------------------------------------------------

export const importRequestSchema = z.object({
  apiKey: z.string().regex(/^[A-Za-z0-9]{10,64}$/, 'Invalid API key format'),
  apiSecret: z.string().regex(/^[A-Za-z0-9]{10,128}$/, 'Invalid API secret format'),
  symbol: z.string().optional(),
  startTime: z.number().optional(),
  endTime: z.number().optional(),
  latestOpenTime: z.string().optional(),
  timestamp: z.number().optional(),
});

export type ImportRequestBody = z.infer<typeof importRequestSchema>;

// ---------------------------------------------------------------------------
// Validation Guards
// ---------------------------------------------------------------------------

type GuardResult = NextResponse | null;

export async function guardRateLimit(request: NextRequest): Promise<GuardResult> {
  const limit = await checkRateLimit(request);
  if (!limit.success) {
    return NextResponse.json(
      { error: `Rate limited. Retry after ${Math.ceil((limit.reset - Date.now()) / 1000)}s` },
      { status: 429 },
    );
  }
  return null;
}

export function guardOrigin(request: NextRequest): GuardResult {
  if (!verifyOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

export function guardContentType(request: NextRequest): GuardResult {
  const contentType = request.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return NextResponse.json(
      { error: 'Content-Type must be application/json' },
      { status: 400 },
    );
  }
  return null;
}

export async function guardBodySize(request: NextRequest): Promise<NextResponse | ImportRequestBody> {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
  }

  const rawBody = await request.text();
  if (rawBody.length > MAX_BODY_SIZE) {
    return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = importRequestSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid request body', details: result.error.flatten() }, { status: 400 });
  }

  return result.data;
}

export function guardFreshness(body: ImportRequestBody): GuardResult {
  const requestTime = typeof body.timestamp === 'number' ? body.timestamp : 0;

  if (Math.abs(Date.now() - requestTime) > FRESHNESS_WINDOW_MS) {
    return NextResponse.json({ error: 'Request expired' }, { status: 400 });
  }
  return null;
}

/**
 * Run all import guards sequentially.
 * @returns NextResponse if any guard fails, null if all pass
 *
 * Security for Bybit import is provided by:
 * - Rate limiting (guardRateLimit)
 * - CSRF origin check (guardOrigin)
 * - API key format validation via Zod schema (importRequestSchema in guardBodySize)
 * - Request freshness check (guardFreshness)
 * User's Bybit credentials are passed in the request body (plaintext over HTTPS).
 * Keys are encrypted at rest in localStorage via AES-GCM with user passphrase.
 */
export async function runImportGuards(request: NextRequest): Promise<GuardResult | ImportRequestBody> {
  // Run guard checks in order
  for (const guard of [guardRateLimit, guardOrigin, guardContentType]) {
    const result = await guard(request);
    if (result) return result;
  }

  // Check body size and parse
  const bodyResult = await guardBodySize(request);
  if (bodyResult instanceof NextResponse) return bodyResult;
  const body = bodyResult;

  // Validate request freshness (replay attack protection)
  const freshnessError = guardFreshness(body);
  if (freshnessError) return freshnessError;

  return body;
}
