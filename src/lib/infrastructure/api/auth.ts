import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';

const API_SECRET = process.env.API_ROUTE_SECRET;

// Warn at startup if API_ROUTE_SECRET is not configured
if (!API_SECRET && process.env.NODE_ENV === 'production') {
  console.warn(
    'WARNING: API_ROUTE_SECRET is not set. External API access to /api/* routes will be disabled. ' +
    'Set API_ROUTE_SECRET environment variable to enable secure API access.'
  );
}

/**
 * Verify bearer token authentication for API routes.
 * Uses constant-time comparison to prevent timing attacks.
 * 
 * @param request - The Next.js request object
 * @returns true if authentication is valid, false otherwise
 */
export async function verifyApiAuth(request: NextRequest): Promise<boolean> {
  if (!API_SECRET) return false;

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const token = authHeader.slice(7);
  const expected = Buffer.from(API_SECRET);
  const provided = Buffer.from(token);

  // Constant-time comparison (throws on length mismatch — that's a failed auth)
  try {
    return timingSafeEqual(expected, provided);
  } catch {
    return false;
  }
}
