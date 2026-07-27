# CodeScan

Track which **printed QR** (newspaper, poster, pamphlet, hoarding) brought people to your site.

Live: [codescan-inky.vercel.app](https://codescan-inky.vercel.app)

---

## Study the project

**Full docs (phase-wise):** → **[docs/README.md](./docs/README.md)**

| Start here | Content |
|------------|---------|
| [docs/00-product-overview.md](./docs/00-product-overview.md) | What & why |
| [docs/01-folder-structure.md](./docs/01-folder-structure.md) | Every folder explained |
| [docs/02-system-flow.md](./docs/02-system-flow.md) | Create → scan → count |
| [docs/03-phase-a-database.md](./docs/03-phase-a-database.md) | Neon + Prisma |
| [docs/04-phase-b-qr-core.md](./docs/04-phase-b-qr-core.md) | Core QR features |
| [docs/05-phase-c-marketing.md](./docs/05-phase-c-marketing.md) | UTMs + full URLs |
| [docs/06-phase-d-production.md](./docs/06-phase-d-production.md) | Vercel / env |
| [docs/07-phase-e-live-ui.md](./docs/07-phase-e-live-ui.md) | Live counts, edit/delete |
| [docs/08-testing-guide.md](./docs/08-testing-guide.md) | How to test |

---

## Quick start (local)

```bash
npm install
# copy .env.example → .env  (Neon + NEXT_PUBLIC_APP_URL)
npm run db:push
npm run dev
```

Open http://localhost:3000  

For **phone-ready QR images**, create them on the **deployed** site, not localhost.

---

## Stack

Next.js 16 · Prisma 7 · Neon Postgres · Vercel · Tailwind / shadcn

---

## One-line flow

**Create QR → print PNG → scan `/r/{token}` → DB +1 → redirect to full URL with UTMs → live dashboard.**
