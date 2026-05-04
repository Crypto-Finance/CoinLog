/**
 * Sanitize external API errors before exposing them to clients.
 * Prevents leaking sensitive information from external services.
 * 
 * @param error - The error object from external API
 * @returns Sanitized error message safe for client display
 */
export function sanitizeExternalError(error: unknown): string {
  if (!(error instanceof Error)) return 'An unexpected error occurred';

  const message = error.message.toLowerCase();

  // Map common error patterns to user-friendly messages
  if (message.includes('rate limit') || message.includes('too many')) {
    return 'The exchange is rate limiting requests. Please try again later.';
  }
  if (message.includes('invalid api') || message.includes('api key')) {
    return 'Invalid API credentials. Please check your Bybit API key and secret.';
  }
  // 403 Forbidden - geographic restriction (check specific before broad)
  if (message.includes('403') || message.includes('forbidden')) {
    return 'The exchange rejected this request (HTTP 403). ' +
      'This may be due to geographic restrictions. ' +
      'Please check your API key settings or try a different API endpoint.';
  }
  if (message.includes('network') || message.includes('fetch') || message.includes('connect')) {
    return 'Unable to connect to the exchange. Please try again later.';
  }
  if (message.includes('timeout') || message.includes('abort')) {
    return 'The exchange request timed out. Please try again later.';
  }

  // Log the actual error for debugging (visible in Vercel logs)
  const sanitized = error.message
    .replace(/[A-Za-z0-9]{20,}/g, '[REDACTED]')
    .slice(0, 500);
  console.error('[Bybit API Error]', {
    message: sanitized,
    timestamp: new Date().toISOString(),
  });
  return 'The exchange returned an error. Please try again later.';
}
