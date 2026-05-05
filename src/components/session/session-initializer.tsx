'use client';

import { useEffect, useState } from 'react';
import { initializeSession } from '@/lib/auth/session';
import { toast } from 'sonner';

/**
 * Session initializer component.
 * Ensures a valid session token is set when the app loads.
 * Must be used in a client component context.
 */
export function SessionInitializer() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await initializeSession();
        setInitialized(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize session';
        setError(message);
        toast.error('Session initialization failed. Please refresh the page.');
      }
    }

    init();
  }, []);

  // Don't render anything - this is a silent initializer
  return null;
}

/**
 * Hook to check if session is initialized.
 * Returns initialization status and any error that occurred.
 */
export function useSessionInitialized(): { isReady: boolean; error: string | null } {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      try {
        await initializeSession();
        setIsReady(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize session';
        setError(message);
        setIsReady(false);
      }
    }

    check();
  }, []);

  return { isReady, error };
}
