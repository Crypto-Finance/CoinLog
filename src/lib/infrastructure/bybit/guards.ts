import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, formatRateLimitError } from '../rate-limit';
import { verifyApiAuth } from '../api/auth';
import { verifyOrigin } from '../../security/csrf-check';
import { errorResponse } from '../api/errors';
import { z } from 'zod';
import { VALIDATION, TIME } from '@/lib/constants';

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
    return errorResponse(429, formatRateLimitError(limit.reset));
  }
  return null;
}

export function guardOrigin(request: NextRequest): GuardResult {
  if (!verifyOrigin(request)) {
    return errorResponse(403, 'Forbidden');
  }
  return null;
}

export function guardContentType(request: NextRequest): GuardResult {
  const contentType = request.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return errorResponse(400, 'Content-Type must be application/json');
  }
  return null;
}

/**
 * Check request body size limit via Content-Length header (early check).
 * @returns NextResponse with 413 error if body is too large, null otherwise
 */
export function guardContentLengthHeader(request: NextRequest): GuardResult {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > VALIDATION.MAX_BODY_SIZE) {
    return errorResponse(413, 'Request body too large');
  }
  return null;
}

/**
 * Read and validate request body size.
 * @returns Raw body text on success, or NextResponse with error
 */
async function readBody(request: NextRequest): Promise<string | NextResponse> {
  const rawBody = await request.text();
  
  if (rawBody.length > VALIDATION.MAX_BODY_SIZE) {
    return errorResponse(413, 'Request body too large');
  }
  
  return rawBody;
}

/**
 * Parse JSON and validate against Zod schema.
 * @returns Parsed and validated body on success, or NextResponse with error
 */
function validateBody(rawBody: string): ImportRequestBody | NextResponse {
  let body: unknown;
  
  try {
    body = JSON.parse(rawBody);
  } catch {
    return errorResponse(400, 'Invalid JSON body');
  }

  const result = importRequestSchema.safeParse(body);
  if (!result.success) {
    console.error('Request validation failed:', result.error.flatten());
    return errorResponse(400, 'Invalid request body');
  }

  return result.data;
}

/**
 * Parse and validate request body.
 * @returns Parsed and validated body on success, or NextResponse with error
 */
export async function parseAndValidateBody(request: NextRequest): Promise<NextResponse | ImportRequestBody> {
  const rawBodyResult = await readBody(request);
  if (rawBodyResult instanceof NextResponse) return rawBodyResult;
  
  return validateBody(rawBodyResult);
}

export function guardFreshness(body: ImportRequestBody): GuardResult {
  const requestTime = typeof body.timestamp === 'number' ? body.timestamp : 0;

  if (Math.abs(Date.now() - requestTime) > TIME.FRESHNESS_WINDOW_MS) {
    return errorResponse(400, 'Request expired');
  }
  return null;
}

export async function guardApiAuth(request: NextRequest): Promise<GuardResult> {
  const isValid = await verifyApiAuth(request);
  if (!isValid) {
    if (!process.env.API_ROUTE_SECRET) {
      console.error(
        'API_ROUTE_SECRET is not configured. ' +
        'External API access is disabled. Set API_ROUTE_SECRET in your environment variables.'
      );
      return errorResponse(500, 'Server configuration error. Please contact support.');
    }
    return errorResponse(401, 'Unauthorized');
  }
  return null;
}

/**
 * Run all pre-flight guards for import request (excludes body validation).
 * @returns NextResponse if any guard fails, null if all pass
 */
export async function runPreFlightGuards(request: NextRequest): Promise<GuardResult> {
  const guards = [guardRateLimit, guardOrigin, guardContentType, guardApiAuth] as const;
  
  for (const guard of guards) {
    const result = await guard(request);
    if (result) return result;
  }

  // Check body size via Content-Length header
  const sizeError = guardContentLengthHeader(request);
  if (sizeError) return sizeError;

  return null;
}

/**
 * Run all import guards including body validation.
 * @returns NextResponse if any guard fails, validated body if all pass
 *
 * Security for Bybit import is provided by:
 * - Rate limiting (guardRateLimit)
 * - CSRF origin check (guardOrigin)
 * - API key format validation via Zod schema (importRequestSchema in parseAndValidateBody)
 * - Request freshness check (guardFreshness)
 * User's Bybit credentials are passed in the request body (plaintext over HTTPS).
 * Keys are encrypted at rest in localStorage via AES-GCM with user passphrase.
 */
export async function runImportGuards(request: NextRequest): Promise<GuardResult | ImportRequestBody> {
  // Run pre-flight guards (rate limit, origin, content-type, auth)
  const preFlightError = await runPreFlightGuards(request);
  if (preFlightError) return preFlightError;

  // Parse and validate body
  const bodyResult = await parseAndValidateBody(request);
  if (bodyResult instanceof NextResponse) return bodyResult;
  const body = bodyResult;

  // Validate request freshness (replay attack protection)
  const freshnessError = guardFreshness(body);
  if (freshnessError) return freshnessError;

  return body;
}
