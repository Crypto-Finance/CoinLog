'use client';

import { useEffect } from 'react';

/**
 * Global error boundary for Next.js App Router.
 *
 * Catches errors during rendering that crash the entire application,
 * including errors in the root layout. Unlike `error.tsx`, this
 * component can re-render the root layout on retry.
 *
 * Uses inline styles instead of Tailwind classes because globals.css
 * (which provides Tailwind utilities) is imported in layout.tsx and
 * will not be available when the root layout crashes.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/global-error
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service (replace with your actual logger)
    console.error('[Global Error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: '#0a0a0a',
          color: '#fff',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: '1rem',
            padding: '2rem',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            Application Error
          </h2>
          <p
            style={{
              color: '#a1a1aa',
              textAlign: 'center',
              maxWidth: '28rem',
            }}
          >
            A critical error occurred. Please try reloading the application.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: '0.75rem',
                color: '#a1a1aa',
                fontFamily: 'monospace',
              }}
            >
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={() => reset()}
            style={{
              padding: '0.5rem 1rem',
              background: '#fff',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
          >
            Reload application
          </button>
        </div>
      </body>
    </html>
  );
}
