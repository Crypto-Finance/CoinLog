'use server';

import 'server-only';

import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { SECURITY, TIME } from '@/lib/constants';

/**
 * Session data structure stored in iron-session.
 */
export interface SessionData {
  isAuthenticated: boolean;
  userId?: string;
}

/**
 * Session configuration for iron-session.
 * Requires SESSION_SECRET environment variable (min 32 characters).
 */
const sessionOptions = {
  cookieName: SECURITY.SESSION_COOKIE_NAME,
  password: process.env.SESSION_SECRET!,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: TIME.SESSION_MAX_AGE,
  },
};

// Validate SESSION_SECRET at module load time in production
if (process.env.NODE_ENV === 'production') {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    console.error(
      'CRITICAL: SESSION_SECRET environment variable is not set. ' +
      'Generate a secure secret (min 32 chars) using: openssl rand -hex 32'
    );
  } else if (secret.length < 32) {
    console.error(
      `CRITICAL: SESSION_SECRET must be at least 32 characters long. ` +
      `Current length: ${secret.length}. Use: openssl rand -hex 32`
    );
  }
}

/**
 * Validate SESSION_SECRET is properly configured.
 * @throws Error if SESSION_SECRET is missing or too short
 */
function validateSessionSecret(): void {
  const secret = process.env.SESSION_SECRET;
  
  if (!secret) {
    throw new Error(
      'SESSION_SECRET environment variable is not set. ' +
      'Generate a secure secret (min 32 chars) and add it to your .env file.'
    );
  }
  
  if (secret.length < 32) {
    throw new Error(
      `SESSION_SECRET must be at least 32 characters long. ` +
      `Current length: ${secret.length}. Use a cryptographically secure random string.`
    );
  }
}

/**
 * Get the current iron-session instance.
 * Validates SESSION_SECRET before accessing session.
 */
async function getSession() {
  validateSessionSecret();
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/**
 * Initialize a new session for the current user.
 * Should be called after successful authentication.
 * 
 * @param userId - Optional user identifier to store in session
 * @returns The session data
 */
export async function initializeSession(userId?: string): Promise<SessionData> {
  const session = await getSession();
  
  session.isAuthenticated = true;
  if (userId) {
    session.userId = userId;
  }
  await session.save();
  
  return { isAuthenticated: true, userId };
}

/**
 * Verify that the current request has a valid authenticated session.
 * 
 * This provides protection against unauthorized Server Action calls.
 * The session is cryptographically signed and validated using iron-session.
 * 
 * @throws Error if session is invalid or user is not authenticated
 */
export async function verifySession(): Promise<SessionData> {
  const session = await getSession();
  
  if (!session.isAuthenticated) {
    throw new Error('Invalid session. Please log in and try again.');
  }
  
  return { isAuthenticated: true, userId: session.userId };
}

/**
 * Get the current session data without requiring authentication.
 * Returns session data even if not authenticated (for checking login status).
 */
export const getSessionData = cache(async (): Promise<SessionData> => {
  const session = await getSession();
  return {
    isAuthenticated: session.isAuthenticated ?? false,
    userId: session.userId,
  };
});

/**
 * Destroy the current session (logout).
 * Clears all session data and removes the session cookie.
 */
export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}
