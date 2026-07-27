# Phase A — Database (Neon + Prisma)

## Goal

Store every QR and every scan in PostgreSQL on Neon.

## Files

| File | Role |
|------|------|
| `prisma/schema.prisma` | Models `QrCode`, `QrScan` |
| `prisma.config.ts` | CLI uses `DIRECT_URL` |
| `src/lib/db/prisma.ts` | App uses `DATABASE_URL` + Neon adapter |
| `.env` | Real connection strings |

## Why two URLs?

| Env | Use |
|-----|-----|
| `DATABASE_URL` | Pooled (`-pooler` in host) — app queries |
| `DIRECT_URL` | Direct host — migrations / `db push` |

If Neon shows **one** link: copy it for `DATABASE_URL`; for `DIRECT_URL` remove `-pooler` from the hostname.

## Models (simplified)

### `qr_codes`

- `token` — secret in `/r/{token}`  
- `label`, `channel`, `location`, `campaign`  
- `destinationPath` — full `https://…` or `/path`  
- `utmSource`, `utmMedium`, `utmCampaign`, `utmContent`  
- `scanCount`, `isActive`, `lastScannedAt`  

### `qr_scans`

- `qrCodeId`, `scannedAt`, `userAgent`, `referer`  

## Commands

```bash
npm run db:generate   # regenerate client
npm run db:push       # apply schema to Neon
npm run db:studio     # browse tables in browser
```

## SQL: all QRs

```sql
SELECT label, channel, "scanCount", "destinationPath", "lastScannedAt", "createdAt"
FROM qr_codes
ORDER BY "createdAt" DESC;
```

## Prisma 7 notes

- No `url` inside `schema.prisma` datasource.  
- Runtime needs `@prisma/adapter-neon`.  
- Client output: `src/generated/prisma`.

→ Next: [04-phase-b-qr-core.md](./04-phase-b-qr-core.md)
