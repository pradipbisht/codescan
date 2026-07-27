# Phase 0b — Folder structure (study map)

```
codescan/
├── README.md                 # Short start only
├── docs/                     # ← YOU ARE HERE (full study material)
├── prisma/
│   └── schema.prisma         # DB models: QrCode, QrScan
├── prisma.config.ts          # Prisma CLI → DIRECT_URL (Neon direct)
├── package.json
├── next.config.ts
├── .env                      # Secrets (not in git)
├── .env.example              # Template for others
│
└── src/
    ├── proxy.ts              # Optional ADMIN_PASSWORD lock (Next 16 “proxy”)
    ├── generated/prisma/     # Auto-generated Prisma client (do not edit)
    │
    ├── lib/                  # Shared logic (no UI)
    │   ├── utils.ts          # cn() class helper
    │   ├── rate-limit.ts     # Spam protection on scan route
    │   ├── db/
    │   │   └── prisma.ts     # Neon DB client
    │   ├── qr/
    │   │   ├── index.ts      # Barrel re-export
    │   │   ├── channels.ts   # newspaper, poster, …
    │   │   ├── tokens.ts     # nanoid for /r/{token}
    │   │   ├── url.ts        # App URL + safe destination + redirect
    │   │   └── utm.ts        # newspaper_print / print defaults
    │   └── auth/
    │       ├── admin.ts      # Cookie admin lock helpers
    │       └── index.ts
    │
    ├── components/
    │   ├── site-header.tsx   # Shared top nav
    │   └── ui/               # shadcn: button, card, input, label, …
    │
    └── app/                  # Next.js routes (URL = folder)
        ├── layout.tsx        # Root HTML, fonts
        ├── globals.css       # Theme + page-shell styles
        ├── page.tsx          # / home
        ├── dashboard/
        │   ├── page.tsx      # /dashboard list + filters
        │   └── live-counts.tsx  # Polls scan counts every 4s
        ├── login/            # Optional admin password
        ├── offers/summer/    # Sample landing if destination is path
        ├── api/qr/
        │   ├── live-all/     # GET all counts (dashboard)
        │   └── [id]/live/    # GET one QR live stats
        ├── qr/
        │   ├── new/          # Create form + server action
        │   └── [id]/         # Detail, edit, delete, share, live stats
        └── r/[token]/
            └── route.ts      # PUBLIC scan: +1 then redirect
```

## How to read the code

| Goal | Open first |
|------|------------|
| Database shape | `prisma/schema.prisma` |
| Scan logic | `src/app/r/[token]/route.ts` |
| Create QR | `src/app/qr/new/actions.ts` |
| Redirect + UTMs | `src/lib/qr/url.ts` + `src/lib/qr/utm.ts` |
| Live numbers | `src/app/api/qr/...` + `live-stats.tsx` / `live-counts.tsx` |
| UI shell | `src/components/site-header.tsx` + `globals.css` |

## Import style

```ts
import { prisma } from "@/lib/db/prisma";
import { buildScanUrl } from "@/lib/qr/url";
import { resolveUtmDefaults } from "@/lib/qr/utm";
import { isAdminLockEnabled } from "@/lib/auth/admin";
```

`@/` means `src/`.

## What not to edit by hand

- `src/generated/prisma/` — run `npm run db:generate`
- `node_modules/`
- `.next/` — build cache

→ Next: [02-system-flow.md](./02-system-flow.md)
