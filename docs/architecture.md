# Architecture

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 (strict mode) |
| **Styling** | Tailwind CSS v4 + shadcn/ui components |
| **Forms** | React Hook Form + Zod validation |
| **Database** | IndexedDB (via idb library) |
| **Tables** | TanStack Table |
| **Testing** | Vitest (unit) + Playwright (E2E) |
| **Optional** | Upstash Redis (rate limiting in production) |

## Security Architecture

1. **API Key Encryption:** AES-GCM with PBKDF2-derived keys (600k iterations)
2. **Rate Limiting:** In-memory (default) or Upstash Redis (production)
3. **API Authentication:** Bearer token validation with constant-time comparison
4. **CSRF Protection:** Origin/Referer header validation
5. **Input Validation:** Zod schemas for all user inputs
6. **CSP Headers:** Content-Security-Policy with 'unsafe-inline' for Next.js/Tailwind compatibility
7. **CSV Sanitization:** Formula injection protection

## Security Considerations

### For Production Deployment

1. **Set `API_ROUTE_SECRET`** — Generate with `openssl rand -hex 32`
2. **Set `NEXT_PUBLIC_SITE_URL`** — Your production domain
3. **Enable HTTPS** — Required for CSP `upgrade-insecure-requests`
4. **Configure Upstash** — For distributed rate limiting (optional)
5. **Review CSP** — Adjust if adding new external resources

### What's Protected

| Protection | Status |
|------------|--------|
| API keys encrypted before storage | ✅ |
| Rate limiting on import endpoint | ✅ |
| CSRF protection on state-changing APIs | ✅ |
| Input validation on all user inputs | ✅ |
| CSV formula injection prevented | ✅ |
| No data leaves the browser (local IndexedDB) | ✅ |

### What's NOT Protected

| Limitation | Note |
|------------|------|
| Client-side data is not encrypted | IndexedDB is accessible via DevTools |
| No server-side authentication | Local-first design |
| No backup/recovery | Export your data regularly |
