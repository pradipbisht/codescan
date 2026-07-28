# CodeScan — Documentation (study guide)

Read these **in order**. Each file is one phase or topic.

| # | File | What you learn |
|---|------|----------------|
| 0 | [00-product-overview.md](./00-product-overview.md) | What the app is and why it exists |
| 1 | [01-folder-structure.md](./01-folder-structure.md) | Every folder/file and what it does |
| 2 | [02-system-flow.md](./02-system-flow.md) | Full create → scan → count flow |
| 3 | [03-phase-a-database.md](./03-phase-a-database.md) | Neon + Prisma + models |
| 4 | [04-phase-b-qr-core.md](./04-phase-b-qr-core.md) | Create QR, scan route, dashboard |
| 5 | [05-phase-c-marketing.md](./05-phase-c-marketing.md) | UTMs, channels, external landing URL |
| 6 | [06-phase-d-production.md](./06-phase-d-production.md) | Vercel, env, admin lock, rate limit |
| 7 | [07-phase-e-live-ui.md](./07-phase-e-live-ui.md) | Live scan polling, edit/delete, UI |
| 8 | [08-testing-guide.md](./08-testing-guide.md) | How to test without a real campaign |

**Root file:** [`../README.md`](../README.md) — short start only. Details live here.

---

## Quick map

```
You create QR  →  Neon saves row  →  PNG encodes /r/{token}
Someone scans  →  /r/[token] +1   →  redirect to full URL + UTMs
You watch live →  dashboard/detail auto-refresh counts
```

Public scan base: value of `NEXT_PUBLIC_APP_URL` (use a custom domain, not `*.vercel.app`)
