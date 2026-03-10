# Shopify App Template — Remix + Cloudflare Workers + D1

Shopify embedded app template running on Cloudflare Workers with D1 as the session database.

## Stack

- [Remix](https://remix.run/) v2 + Vite 6
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite)
- [@shopify/shopify-app-remix](https://www.npmjs.com/package/@shopify/shopify-app-remix) v4
- [@shopify/polaris](https://polaris.shopify.com/)

## Setup

### 1. Create Shopify App

Create your app in the [Shopify Partner Dashboard](https://partners.shopify.com/) and get your API key and secret.

### 2. Create D1 Database

```bash
wrangler d1 create your-database-name
```

Copy the `database_id` from the output.

### 3. Configure

Update these files with your values:

**`wrangler.jsonc`**
- `name` — your worker name
- `d1_databases[0].database_name` — your D1 database name
- `d1_databases[0].database_id` — your D1 database ID
- `vars.SCOPES` — your required Shopify scopes

**`shopify.app.toml`**
- `client_id` — your Shopify API key
- `application_url` — your Workers URL
- `name` / `handle` — your app name
- `auth.redirect_urls` — your auth callback URL
- `access_scopes.scopes` — your required scopes

**`.dev.vars`** (copy from `.dev.vars.example`)
```bash
cp .dev.vars.example .dev.vars
```
Fill in `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_APP_URL`, `SCOPES`.

### 4. Install & Build

```bash
npm install
npm run typegen
npm run build
```

### 5. Production Secrets

For production, set secrets via Cloudflare Dashboard or CLI instead of `vars`:

```bash
wrangler secret put SHOPIFY_API_KEY
wrangler secret put SHOPIFY_API_SECRET
wrangler secret put SHOPIFY_APP_URL
```

## Development

```bash
# Vite dev server (HMR, uses cloudflare dev proxy)
npm run dev

# Or build + wrangler dev (closer to production)
npm run preview
```

Use [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) to expose local dev to Shopify.

## Deploy

```bash
npm run deploy
```

## Scripts

| Script | Description |
|--------|-------------|
| `dev` | Remix Vite dev server |
| `build` | Clean + build |
| `preview` | Build + wrangler dev |
| `deploy` | Build + wrangler deploy |
| `check` | Typecheck + build + dry-run deploy |
| `typegen` | Regenerate `worker-configuration.d.ts` from `wrangler.jsonc` |
| `migrate:d1` | Add refresh token columns to remote D1 |
| `migrate:d1:local` | Add refresh token columns to local D1 |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DB` | D1 database binding (auto from wrangler) |
| `SHOPIFY_API_KEY` | Shopify app API key |
| `SHOPIFY_API_SECRET` | Shopify app API secret |
| `SHOPIFY_APP_URL` | Your app's public URL |
| `SCOPES` | Comma-separated Shopify access scopes |
| `SHOP_CUSTOM_DOMAIN` | Optional custom shop domain |
