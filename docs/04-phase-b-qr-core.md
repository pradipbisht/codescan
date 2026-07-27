# Phase B — QR core (create, scan, list)

## Goal

Working loop: create → show PNG → scan → count +1 → dashboard.

## Key routes

| URL | File | Purpose |
|-----|------|---------|
| `/qr/new` | `app/qr/new/*` | Create form |
| `/qr/[id]` | `app/qr/[id]/page.tsx` | Detail + PNG |
| `/r/[token]` | `app/r/[token]/route.ts` | Public track + redirect |
| `/dashboard` | `app/dashboard/page.tsx` | List all QRs |

## Create (`actions.ts`)

1. Read form fields.  
2. `normalizeDestination` + `isSafeDestination`.  
3. `resolveUtmDefaults` for UTMs.  
4. `createQrToken()` → save row.  
5. Redirect to detail.

## Scan (`route.ts`)

1. Lookup by `token`.  
2. Increment `scanCount`, insert `QrScan`.  
3. `buildRedirectUrl` → absolute URL with UTMs.  
4. HTTP redirect.

## Token helper

`src/lib/qr/tokens.ts` — `nanoid(24)` so tokens cannot be guessed.

## App URL helper

`src/lib/qr/url.ts` — `getAppUrl()`:

1. Request host (best on Vercel)  
2. `NEXT_PUBLIC_APP_URL`  
3. Vercel env  
4. localhost only for local dev  

`buildScanUrl(token)` → `{appUrl}/r/{token}` baked into PNG.

## Localhost trap

If you create QR while browsing `localhost:3000`, the PNG encodes localhost.  
Phones cannot open it. **Always create print QRs on the live Vercel site.**

→ Next: [05-phase-c-marketing.md](./05-phase-c-marketing.md)
