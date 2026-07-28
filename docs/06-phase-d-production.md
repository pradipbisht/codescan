# Phase D — Production (deploy + custom domain + lock)

## Goal

Real phones and printed posters work — scanner shows **your domain**, not `*.vercel.app`.

## Required env (Vercel → Settings → Environment Variables)

```env
DATABASE_URL=...neon...-pooler...
DIRECT_URL=...neon...   # no -pooler
NEXT_PUBLIC_APP_URL=https://go.goalkeepers.org.in
ADMIN_PASSWORD=          # optional; empty = open admin
```

**Always use a custom domain** in `NEXT_PUBLIC_APP_URL` for production print QRs.

After changing `NEXT_PUBLIC_*`, **redeploy**, then **re-download** QR PNGs.

## Custom domain setup

1. Vercel → Project → **Settings → Domains** → add e.g. `go.goalkeepers.org.in`
2. DNS (at your domain registrar): CNAME `go` → value Vercel shows (often `cname.vercel-dns.com`)
3. Wait until domain is **Valid**
4. Set `NEXT_PUBLIC_APP_URL=https://go.goalkeepers.org.in` (Production)
5. Redeploy
6. Create/download QRs again — scan URL should be `https://go.goalkeepers.org.in/r/...`

Optional later: route the main site so scans are `https://goalkeepers.org.in/r/...` (needs path proxy on the main app).

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
2. Custom domain attached + DNS OK  
3. `NEXT_PUBLIC_APP_URL` = that HTTPS domain  
4. Deploy  
5. Create **new** QRs on live domain  
6. Download PNG — confirm scan URL host is **not** `vercel.app`  
7. Phone scan test → count + redirect  
8. Old localhost / old Vercel PNGs: re-print  

## Local `.env`

Fine for coding:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For testing “what phones will see”, point `NEXT_PUBLIC_APP_URL` at the real custom domain (DNS must resolve to this app).

→ Next: [07-phase-e-live-ui.md](./07-phase-e-live-ui.md)
