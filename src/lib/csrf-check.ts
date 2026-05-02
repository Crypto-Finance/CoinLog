import { NextRequest } from 'next/server';

/**
 * Validate Origin and Referer headers to prevent CSRF attacks.
 * 
 * @param request - The Next.js request object
 * @returns true if origin/referer is valid, false otherwise
 */
export function verifyOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  // If no origin/referer, fail closed (potential CSRF attack)
  if (!origin && !referer) return false;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const allowedOrigins = [siteUrl];

  if (origin && allowedOrigins.includes(origin)) return true;

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (allowedOrigins.includes(refererUrl.origin)) return true;
      if (host && refererUrl.host === host) return true;
    } catch { /* invalid URL */ }
  }

  return false;
}
