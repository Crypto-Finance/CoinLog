import { TIME } from '@/lib/constants';

/**
 * Validate time window constraints for trade imports.
 * Ensures the time range is valid and within allowed limits.
 * 
 * @param start - Start timestamp in milliseconds
 * @param end - End timestamp in milliseconds
 * @throws Error if validation fails
 */
export function validateTimeWindow(start: number, end: number): void {
  if (start >= end) {
    throw new Error('startTime must be before endTime');
  }

  const timeRange = end - start;
  if (timeRange > TIME.MAX_TIME_RANGE_MS) {
    const maxDays = TIME.MAX_TIME_RANGE_MS / TIME.ONE_DAY_MS;
    const requestedDays = Math.round(timeRange / TIME.ONE_DAY_MS);
    throw new Error(
      `Time range too large. Maximum allowed is ${maxDays} days (requested: ${requestedDays} days)`
    );
  }
}

/**
 * Calculate time window for trade import from parameters.
 * Handles default values and derives start/end timestamps.
 * 
 * @param params - Import parameters with optional time fields
 * @returns Object with validated start and end timestamps
 */
export function calculateTimeWindow(params: {
  startTime?: number;
  endTime?: number;
  latestOpenTime?: string;
}): { start: number; end: number } {
  const now = Date.now();
  let start = params.startTime;
  
  if (start === undefined) {
    if (params.latestOpenTime) {
      start = new Date(params.latestOpenTime).getTime();
    } else {
      // Default: last 90 days
      start = now - TIME.DEFAULT_FETCH_DAYS * TIME.ONE_DAY_MS;
    }
  }
  
  const end = params.endTime ?? now;
  return { start, end };
}
