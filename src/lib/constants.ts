/**
 * Centralized constants for the application.
 * Using `as const` for type safety and better IDE support.
 */

// ---------------------------------------------------------------------------
// Time Configuration
// ---------------------------------------------------------------------------

export const TIME = {
  ONE_DAY_MS: 24 * 60 * 60 * 1000, // 24 hours
  FRESHNESS_WINDOW_MS: 30_000, // 30 seconds
  MAX_TIME_RANGE_MS: 365 * 24 * 60 * 60 * 1000, // 1 year
  DEFAULT_FETCH_DAYS: 90,
  SESSION_MAX_AGE: 60 * 60 * 24 * 7, // 7 days
} as const;

// ---------------------------------------------------------------------------
// Bybit API Configuration
// ---------------------------------------------------------------------------

export const BYBIT = {
  API_URL: process.env.BYBIT_API_URL || 'https://api.bybit.com',
  MAX_DAY_WINDOW: 7 * TIME.ONE_DAY_MS, // 7 days in ms
  LIMIT: 50,
  RECV_WINDOW: '5000',
  REQUEST_TIMEOUT: 8000, // 8 seconds
} as const;

// ---------------------------------------------------------------------------
// Rate Limiting Configuration
// ---------------------------------------------------------------------------

export const RATE_LIMIT = {
  MAX_REQUESTS: 10,
  WINDOW_MS: 60_000, // 1 minute
  CLEANUP_INTERVAL_MS: 60_000, // 1 minute
} as const;

// ---------------------------------------------------------------------------
// Validation Configuration
// ---------------------------------------------------------------------------

export const VALIDATION = {
  MAX_BODY_SIZE: 10 * 1024, // 10KB
  API_KEY_MIN_LENGTH: 10,
  API_KEY_MAX_LENGTH: 64,
  API_SECRET_MIN_LENGTH: 10,
  API_SECRET_MAX_LENGTH: 128,
} as const;

// ---------------------------------------------------------------------------
// Security Configuration
// ---------------------------------------------------------------------------

export const SECURITY = {
  SESSION_TOKEN_LENGTH: 32, // bytes
  SESSION_COOKIE_NAME: 'coinlog_session',
} as const;
