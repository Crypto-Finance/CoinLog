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

  // Build allowed origins from environment variables
  // Use server-only NEXT_SITE_URL when available (more secure than NEXT_PUBLIC_)
  const siteUrl = process.env.NEXT_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const allowedOrigins = new Set<string>();
  
  if (siteUrl) {
    allowedOrigins.add(siteUrl);
  }
  
  // In development, allow localhost by default
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.add('http://localhost:3000');
    
    // Add additional dev origins from environment variable
    const devOrigins = process.env.ALLOWED_DEV_ORIGINS;
    if (devOrigins) {
      devOrigins.split(',').forEach((o) => allowedOrigins.add(o.trim()));
    }
  }

  if (origin && allowedOrigins.has(origin)) return true;

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (allowedOrigins.has(refererUrl.origin)) return true;
      if (host && refererUrl.host === host) return true;
    } catch { /* invalid URL */ }
  }

  return false;
}
