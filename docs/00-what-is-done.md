# 00 — What is already done (Phase A)

You do **not** need to redo this. Database setup is complete.

## Stack

| Piece | Version / notes |
|-------|-----------------|
| Next.js | 16 (App Router under `src/app`) |
| Prisma | 7.9 + Neon adapter |
| Postgres | Neon (`neondb`) |
| UI bits | shadcn: `button`, `card`, `input`, `label`, `accordion` |

## Files that matter

```
codescan/
├── .env                      ← your real Neon URLs (secret, not committed)
├── .env.example              ← template for others
├── prisma.config.ts          ← Prisma CLI uses DIRECT_URL
├── prisma/
│   └── schema.prisma         ← QrCode + QrScan models
├── src/
│   ├── generated/prisma/     ← auto-generated client (don’t edit by hand)
│   └── lib/
│       └── prisma.ts         ← import { prisma } from "@/lib/prisma"
└── package.json              ← db:push, db:studio, etc.
```

## Database tables (already on Neon)

### `qr_codes`

One row = one physical QR (hoarding / poster / pamphlet…).

Important fields:

- `token` — secret in URL `/r/{token}`
- `label`, `channel`, `location`, `campaign`
- `destinationPath` — where user goes after scan
- `utmSource`, `utmMedium`, `utmCampaign`, `utmContent`
- `scanCount`, `isActive`, `lastScannedAt`

### `qr_scans`

One row = one scan event (history for marketing).

- `qrCodeId`, `scannedAt`, `userAgent`, `referer`

## Env reminder

```env
DATABASE_URL=...-pooler...   # app
DIRECT_URL=...no pooler...   # prisma migrate / push
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

If Neon only shows **one** link: use it as `DATABASE_URL`; for `DIRECT_URL` remove `-pooler` from the hostname.

## What is NOT done yet

- Create QR form  
- Show QR image  
- Dashboard list  
- Public scan route `/r/[token]` that +1 count and redirects  

→ That is **Phase B** (next docs).
