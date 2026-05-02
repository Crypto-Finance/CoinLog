# Deployment Guide

This guide covers deploying CoinLog to production environments.

## 📦 Deployment Options

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Vercel Environment Variables

After deploying to Vercel, configure the following environment variables in your Vercel project settings (**Settings → Environment Variables**):

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `API_ROUTE_SECRET` | Secret key for API route authentication | `openssl rand -hex 32` |
| `NEXT_PUBLIC_SITE_URL` | Your production domain for CSRF protection | `https://your-app.vercel.app` |

#### Optional Variables

| Variable | Description | When to Use |
|----------|-------------|-------------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL | Production rate limiting (distributed) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | Production rate limiting (distributed) |
| `BYBIT_API_URL` | Bybit API endpoint | **Use if you get 403 errors** (geographic restrictions) |

#### Fixing Bybit 403 Errors

If you're in a restricted region and getting **403 Forbidden** errors when importing trades from Bybit:

1. Go to Vercel → Settings → Environment Variables
2. Add a new variable: `BYBIT_API_URL`
3. Set the value to: `https://api.bytick.com`
4. Redeploy your application

```bash
# Alternative endpoints for restricted regions
BYBIT_API_URL=https://api.bytick.com        # Primary alternative
BYBIT_API_URL=https://api.bybit.com         # Default (most regions)
```

#### Vercel Region Configuration

**Why Region Matters:** Bybit blocks traffic from certain geographic regions (US, China). Vercel's default deployment regions are US-based, which can cause 403 errors when calling the Bybit API.

**Solution:** Configure Vercel to deploy to a non-US region (Singapore recommended for Bybit).

**Configuration:** The project includes a `vercel.json` file with the following settings:

```json
{
  "regions": ["sin1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

> **Note:** If you need to set `BYBIT_API_URL` (for geographic restrictions), configure it via **Vercel Dashboard → Settings → Environment Variables**, not in `vercel.json`.

**Available Non-US Regions:**

| Region Code | Location | Recommended For |
|-------------|----------|-----------------|
| `sin1` | Singapore | **Bybit / Asia-based APIs** ✅ |
| `fra1` | Frankfurt, Germany | EU-based APIs |
| `lhr1` | London, UK | EU-based APIs |

**US Regions to Avoid:**

| Region Code | Location | Issue |
|-------------|----------|-------|
| `iad1` | Washington DC, US | Blocked by Bybit ❌ |
| `sfo1` | San Francisco, US | Blocked by Bybit ❌ |
| `pdx1` | Portland, US | Blocked by Bybit ❌ |

**To Change Region:**

1. Edit `vercel.json` and update the `regions` array
2. Redeploy: `vercel --prod`

> **Note:** Region configuration requires Vercel Pro plan or higher. Hobby plan deployments use Vercel's default region selection.

### Self-Hosting

```bash
# Build
npm run build

# Start production server
npm run start
```

### Docker (Optional)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```
