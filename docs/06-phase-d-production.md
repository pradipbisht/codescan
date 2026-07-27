# Phase D — Production (Vercel + env + lock)

## Goal

Real phones and printed posters work.

## Required env (Vercel → Settings → Environment Variables)

```env
DATABASE_URL=...neon...-pooler...
DIRECT_URL=...neon...   # no -pooler
NEXT_PUBLIC_APP_URL=https://codescan-inky.vercel.app
ADMIN_PASSWORD=          # optional; empty = open admin
```

After changing `NEXT_PUBLIC_*`, **redeploy**.

## Next.js 16 proxy (not middleware)

File: `src/proxy.ts`

- If `ADMIN_PASSWORD` is set → protect `/dashboard` and `/qr/*`.  
- Public `/r/*` always open.  
- Login page: `/login`.

Do **not** keep both `middleware.ts` and `proxy.ts`.

## Rate limit

`src/lib/rate-limit.ts` — ~30 scans per IP per token per minute on `/r/[token]`.

## Deploy checklist

1. Neon project + env on Vercel  
2. Deploy  
3. Create **new** QRs on live domain  
4. Download PNG  
5. Phone scan test  
6. Old localhost PNGs: throw away  

## Local `.env`

Fine for coding:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Production must use the real `https://…vercel.app` (or custom domain).

→ Next: [07-phase-e-live-ui.md](./07-phase-e-live-ui.md)
