/**
 * Safely extract an error message from an unknown error value.
 * TypeScript strict mode types catch clauses as `unknown`.
 */
export function getErrorMessage(err: unknown, fallback = 'An unexpected error occurred'): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
}
