# 06 — Phase D (handoff & production)

## Why so many fields before?

You should **not** need many fields anymore.

### Create QR (simplified)

| Field | Required? |
|-------|-----------|
| **Name** | Yes — e.g. “Poster Mall Gate 2” |
| **Where is it?** (channel) | Yes — default `poster` |
| City / campaign / page | **Optional** — under “More options” |
| UTM tags | **Automatic** — you never type them |

Server fills:

- `utm_source` = channel  
- `utm_medium` = offline  
- `utm_campaign` = slug of campaign (if any)  
- `utm_content` = slug of location or name  
- destination = `/offers/summer` by default  

---

## Console error (Button + Link) — fixed

Base UI complained when `Button` used `render={<Link />}` with `nativeButton` true.

**Fix:** `src/components/ui/button.tsx` sets `nativeButton={false}` automatically when `render` is used.

Hard-refresh the browser after pull/restart.

---

## Middleware → Proxy (Next.js 16)

Next.js 16 renamed `middleware.ts` to **`proxy.ts`**.

- File: `src/proxy.ts`
- Export: `export function proxy(...)`
- Same job: optional admin lock when `ADMIN_PASSWORD` is set

If you see “Cannot find the middleware module”, delete any old `src/middleware.ts` and use `src/proxy.ts` only.

---

## Optional admin password

```env
ADMIN_PASSWORD="choose-a-secret"
```

- If **empty** → dashboard/create stay open (fine for local).  
- If **set** → `/dashboard` and `/qr/*` need `/login`.  
- Public **`/r/...` scans never need a password**.

Log out appears on the dashboard when lock is enabled.

---

## Rate limit

`/r/[token]` allows ~30 hits per IP per token per minute, then 429.

---

## Deploy checklist (handoff)

1. Neon project + `DATABASE_URL` + `DIRECT_URL`  
2. `npx prisma db push` (or migrate) on first deploy  
3. Host on Vercel (or similar)  
4. Env on host:

```env
DATABASE_URL=...pooler...
DIRECT_URL=...direct...
NEXT_PUBLIC_APP_URL=https://your-real-domain.com
ADMIN_PASSWORD=optional-secret
```

5. **Recreate QR codes** after production URL is set — old QRs still point to localhost.  
6. Print production QR images for hoardings/posters.

---

## What the next developer needs

- This repo  
- Neon credentials  
- `docs/` folder  
- `.env.example`  

No Better Auth. No complex multi-tenant setup.
