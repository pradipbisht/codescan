# CodeScan — Offline QR Attribution App

> **Status:** Phases A–D implemented (DB, QR app, marketing polish, handoff).  
> **Stack:** Next.js 16 · Prisma 7.9 · Neon Postgres · no Better Auth.  
> **Docs:** start at [docs/README.md](./docs/README.md) · deploy notes [docs/06-phase-d.md](./docs/06-phase-d.md).

### Quick start

```bash
npm install
# set DATABASE_URL + DIRECT_URL + NEXT_PUBLIC_APP_URL in .env
npm run db:push
npm run dev
```

**Create a QR:** only **Name** + **Channel** (optional fields under “More options”).  
**Optional lock:** set `ADMIN_PASSWORD` to protect dashboard/create.

This README explains **what we will build**, **why**, **how it works end-to-end**, and **what is intentionally left out** so the repo stays simple and easy to hand off to someone else.

---

## 1. What is this project?

**CodeScan** is a small web app that lets you:

1. **Create unique QR codes** for real-world marketing materials (hoardings, posters, pamphlets, flyers).
2. **Print / display** those QR codes offline.
3. When someone **scans** a QR with their phone, they land on your website.
4. Your **database records which exact QR** was scanned (e.g. “Hoarding – Andheri Ring Road”, not “some random visit”).
5. The **scan counter for that QR increases by +1**.
6. You can **compare performance** across placements for marketing decisions.
7. Redirects can include **UTM tags** so Google Analytics / ads tools also understand the source.

### What it is *not* (v1)

| Not in v1 | Why |
|-----------|-----|
| User login / Better Auth | Extra complexity; not needed to create & test QR tracking |
| GPS tracking of the phone | We attribute by **which printed QR** was used, not satellite location |
| Multi-company / multi-tenant | Overkill for first version |
| Payment / checkout | Out of scope |
| Public short-link company features | We only need our own tracked links |

---

## 2. The business problem (in plain language)

You put different QR codes in different places:

| Physical asset | Question you want answered |
|----------------|----------------------------|
| Highway hoarding | Did this expensive board drive traffic? |
| Mall poster | Which mall gate works better? |
| Pamphlet at an event | Did the pamphlet get people to the site? |
| Newspaper flyer | Offline print → website: did it work? |

When a person scans, you want your system to say:

> “This visit came from **QR #2 (Mall Poster – Gate B)**.”  
> Not just: “Someone visited the homepage.”

That is called **channel / placement attribution**. It is how offline marketing becomes measurable online.

---

## 3. How it works (big picture)

```
┌─────────────────────────────────────────────────────────────────┐
│  YOU (marketer / admin)                                         │
│  Open the app → fill form: label, channel, city, destination    │
│  Click "Create QR"                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  SERVER + DATABASE (Neon Postgres via Prisma)                   │
│  Save a new row:                                                │
│    - unique secret token (e.g. x7k9m2p...)                      │
│    - label: "Hoarding – Ring Road"                              │
│    - channel: hoarding                                          │
│    - location: Andheri, Mumbai                                  │
│    - scanCount: 0                                               │
│    - destination: /offers/summer                                │
│    - UTM fields for marketing tools                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  APP SHOWS YOU                                                  │
│  - QR image that encodes:                                       │
│    https://yoursite.com/r/x7k9m2p...                            │
│  - Download / print that image for the hoarding/poster          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  PUBLIC WORLD                                                   │
│  Person sees poster → opens camera → scans QR                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  SCAN ROUTE: /r/[token]                                         │
│  1. Look up token in database                                   │
│  2. If invalid / disabled → show safe error page                │
│  3. If valid:                                                   │
│       - scanCount = scanCount + 1                               │
│       - optional: write a ScanLog row (time, device hint)       │
│  4. Redirect user to destination + UTM query params             │
│     e.g. /offers/summer?utm_source=hoarding&utm_medium=offline  │
└─────────────────────────────────────────────────────────────────┘
```

### Example with 4 QR codes

| QR | Token (example) | Label | After 10 people scan #2 |
|----|-----------------|-------|-------------------------|
| 1 | `a1b2...` | Hoarding – Highway | scanCount stays as-is |
| 2 | `c3d4...` | Poster – Mall Gate 2 | **scanCount becomes 10** |
| 3 | `e5f6...` | Pamphlet – Expo Booth | unchanged |
| 4 | `g7h8...` | Flyer – Sunday Paper | unchanged |

You always know **which physical asset** was used because **each asset has its own token and its own DB row**.

---

## 4. Tech stack (agreed)

| Layer | Choice | Role |
|-------|--------|------|
| Framework | **Next.js** (already in this repo: v16) | UI + server routes |
| UI | **React + Tailwind + shadcn/ui** (partially set up) | Forms, cards, tables |
| Database host | **Neon** | Hosted PostgreSQL |
| Database | **PostgreSQL** (via Neon) | Store QR + scan data |
| ORM | **Prisma** (latest, to be added) | Schema, migrations, queries |
| Auth | **None in v1** | Faster ship + easier handoff |
| QR image | Library such as `qrcode` (to be added) | Generate PNG/SVG from URL |

### Current repo state

**Done (Phase A — database setup):**

- Next.js App Router + Tailwind + shadcn UI
- Prisma **7.9.0** + `@prisma/client` + `@prisma/adapter-neon`
- `prisma/schema.prisma` → models `QrCode` + `QrScan` (PostgreSQL)
- `prisma.config.ts` → CLI uses `DIRECT_URL` (Neon direct, for migrations)
- `src/lib/prisma.ts` → app uses `DATABASE_URL` (Neon pooled) via Neon adapter
- Generated client path: `src/generated/prisma`
- `.env` / `.env.example` templates ready for your Neon links
- npm scripts: `db:generate`, `db:push`, `db:migrate`, `db:studio`

**Not built yet (later phases):**

- QR create/list/dashboard UI
- Scan redirect route `/r/[token]`
- QR image generation

### How to connect your real Neon Postgres

1. Open [Neon Console](https://console.neon.tech) → create or open a project.
2. Click **Connect** and copy **both**:
   - **Pooled** connection string (hostname contains `-pooler`) → `DATABASE_URL`
   - **Direct** connection string (no `-pooler`) → `DIRECT_URL`
3. Edit `C:\Users\ACER\Desktop\codescan\.env` and replace the placeholders:

```env
DATABASE_URL="postgresql://...@ep-XXXX-pooler....neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://...@ep-XXXX....neon.tech/neondb?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. From the project folder, apply the schema:

```bash
cd C:\Users\ACER\Desktop\codescan
npm run db:push
```

   Or create a named migration:

```bash
npm run db:migrate
```

5. Optional: open Prisma Studio to browse tables:

```bash
npm run db:studio
```

After tables exist, study and build **Phase B** yourself using the docs folder:

→ **[docs/README.md](./docs/README.md)** (start here)  
→ Phase B overview + step-by-step + checklist  

If you get stuck, tell Grok to implement Phase B for you.

---

## 5. Data model (what we will store)

### Table: `QrCode` (one row = one printed QR)

| Field | Purpose |
|-------|---------|
| `id` | Internal ID (cuid/uuid) |
| `token` | Long random secret used in the public URL (`/r/{token}`). **Not** a simple 1,2,3 in the URL |
| `label` | Human name: “Hoarding – Ring Road” |
| `channel` | `hoarding` \| `poster` \| `pamphlet` \| `flyer` \| `other` |
| `location` | City / area / venue text |
| `campaign` | Optional campaign name: “Summer Sale 2026” |
| `destinationPath` | Where to send the user after scan, e.g. `/` or `/offers/summer` |
| `utmSource` | e.g. `hoarding` |
| `utmMedium` | e.g. `offline` |
| `utmCampaign` | e.g. `summer_sale_2026` |
| `utmContent` | e.g. `andheri_ring_road_v1` |
| `scanCount` | Total scans (incremented on each valid hit) |
| `isActive` | If `false`, scan shows “disabled” and does not redirect |
| `createdAt` | When this QR was created |
| `updatedAt` | Last update |
| `lastScannedAt` | Optional: last successful scan time |

### Table: `QrScan` (optional but recommended for marketing)

One row per scan event (richer than only a counter):

| Field | Purpose |
|-------|---------|
| `id` | Event id |
| `qrCodeId` | Which QR was scanned |
| `scannedAt` | Timestamp |
| `userAgent` | Browser/device string (rough device insight) |
| `referer` | Optional HTTP referer |

**Why both counter + log?**

- `scanCount` → fast dashboard numbers  
- `QrScan` → time series, peak hours, device mix, later charts  

### What we do **not** store in v1

- User accounts / passwords  
- Exact GPS coordinates  
- Payment data  
- Full IP addresses as primary identity (if we ever store IP, prefer hashing and document privacy)

---

## 6. Public URL design (security)

### Bad (easy to guess / abuse)

```
https://yoursite.com/qr/1
https://yoursite.com/qr/2
```

Someone can try `/qr/3`, `/qr/4`, … and mess with counts or probe your system.

### Good (what we will use)

```
https://yoursite.com/r/v9Kx2mQpL8nR4wYz...
```

- Token is **long and random** (e.g. nanoid / UUID).  
- Only your DB knows which token maps to which poster.  
- Guessing a valid token is impractical.

### Security rules (v1)

1. **QR only encodes an HTTPS link to our site** — no scripts, no SQL, no external random URLs from user input.  
2. **Server validates token** every time in `/r/[token]`.  
3. **Redirect only to allowlisted destinations** (paths on our own site, or a fixed allowlist). Prevents open-redirect phishing.  
4. **`isActive` flag** — wrong print or leaked QR can be turned off without affecting others.  
5. **Rate limiting (recommended)** — reduce spam that inflates counters.  
6. **No admin auth in v1** — for local testing this is fine; before public production, lock the create page (simple password, deploy protection, or auth later).

The QR image itself is not “encrypted magic.” **Security lives on the server**: token lookup + safe redirects.

---

## 7. App pages & routes (planned)

| Route | Who uses it | What it does |
|-------|-------------|--------------|
| `/` | You | Simple home + links to dashboard / create |
| `/dashboard` | You | List all QR codes, scan counts, channel, location, last scan |
| `/qr/new` | You | Form to create a new QR + show image to download/print |
| `/qr/[id]` | You | Detail page: big QR, copy link, metadata, disable/enable |
| `/r/[token]` | Public (phone scanners) | Track scan → redirect. **This is the link inside every QR** |
| Landing pages e.g. `/offers/summer` | Public | Normal content pages people land on after scan (can be simple placeholders first) |

### Create flow (you)

1. Open `/qr/new`.  
2. Enter label, channel, location, campaign, destination path, UTM fields.  
3. Submit → Prisma inserts row in Neon → page shows QR image.  
4. Download PNG → send to printer / designer → put on hoarding/poster/pamphlet.

### Scan flow (public)

1. Phone camera opens `https://.../r/{token}`.  
2. Next.js server route runs.  
3. Prisma finds `QrCode` where `token` matches and `isActive === true`.  
4. Transaction: `scanCount += 1`, set `lastScannedAt`, create `QrScan` row.  
5. `redirect` to `destinationPath` + UTM query string.  
6. User sees your offer page; you already recorded attribution.

---

## 8. Marketing & SEO: how data becomes useful

### Offline → online attribution

Each physical piece is a **named door** into the website:

```
Hoarding QR  → utm_source=hoarding  → Analytics sees "hoarding"
Poster QR    → utm_source=poster    → Analytics sees "poster"
Pamphlet QR  → utm_source=pamphlet  → Analytics sees "pamphlet"
```

Plus `utm_campaign` and `utm_content` to separate campaigns and specific locations.

### Example redirect

Created QR:

- Label: `Poster – Phoenix Mall Gate 2`  
- Destination: `/offers/summer`  
- UTMs: source=`poster`, medium=`offline`, campaign=`summer_2026`, content=`phoenix_gate2`

Scanner is sent to:

```
/offers/summer?utm_source=poster&utm_medium=offline&utm_campaign=summer_2026&utm_content=phoenix_gate2
```

### What you can report after a week

| Placement | Scans | Insight |
|-----------|------:|---------|
| Pamphlet – Expo | 120 | Strong; print more |
| Poster – Mall Gate 2 | 45 | OK |
| Hoarding – Ring Road | 18 | Weak for this campaign |
| Flyer – Newspaper | 7 | Reconsider spend |

### SEO note

- SEO is mostly about **good landing page content** (`/offers/summer`), not the QR image.  
- QR is the **bridge** from offline attention to that page.  
- Clean UTMs keep marketing data organized in GA / Meta / etc.  
- Your **own dashboard** keeps placement-level truth even if analytics tools are missing.

---

## 9. Environment & setup (after implementation)

You will need (when we build):

1. A free/paid **Neon** project → copy `DATABASE_URL`.  
2. Local `.env` (never commit secrets):

```env
DATABASE_URL="postgresql://...@...neon.tech/neondb?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

3. Commands (planned):

```bash
npm install
npx prisma migrate dev
npm run dev
```

4. Open `http://localhost:3000` → create QR → scan with phone (same Wi‑Fi / tunnel if needed) or open the `/r/...` link in a browser to test.

### Production handoff (for the next developer)

They mainly need:

- This README  
- `DATABASE_URL` from Neon  
- Deploy Next.js (e.g. Vercel) with the same env vars  
- `NEXT_PUBLIC_APP_URL` set to the real domain so QR images encode the correct production URL  

**No Better Auth setup** in v1 = fewer moving parts for the person who inherits the repo.

---

## 10. Planned folder structure (after build)

```
codescan/
├── README.md                 ← this document
├── prisma/
│   ├── schema.prisma         ← QrCode + QrScan models
│   └── migrations/           ← DB history
├── src/
│   ├── app/
│   │   ├── page.tsx          ← home
│   │   ├── dashboard/        ← list + stats
│   │   ├── qr/
│   │   │   ├── new/          ← create form
│   │   │   └── [id]/         ← detail + download QR
│   │   ├── r/[token]/        ← PUBLIC scan + redirect
│   │   └── offers/...        ← optional simple landing pages
│   ├── components/           ← UI (shadcn + custom)
│   └── lib/
│       ├── prisma.ts         ← Prisma client singleton
│       ├── qr.ts             ← token + image helpers
│       └── utils.ts
├── .env                      ← local secrets (gitignored)
└── package.json
```

---

## 11. Implementation phases (when you say “start”)

### Phase A — Foundation

- Add Prisma + Neon connection  
- Create `QrCode` (+ `QrScan`) schema and migrate  
- Prisma client helper  

### Phase B — Core product

- Create QR form + save to DB  
- Generate unique token  
- Generate QR image for `NEXT_PUBLIC_APP_URL/r/{token}`  
- Public `/r/[token]` track + redirect  
- Dashboard list with scan counts  

### Phase C — Marketing polish (still simple)

- UTM fields on create + applied on redirect  
- Detail page: copy link, download QR, toggle active  
- Optional basic filters (by channel / campaign)  

### Phase D — Handoff polish

- Clear README setup steps (update this file after build)  
- Example env template `.env.example`  
- Minimal landing page placeholders  

**Out of scope until you ask later:** Better Auth, roles, maps, advanced charts, bot filtering, multi-tenant orgs.

---

## 12. Testing plan (how you will verify it works)

1. Create 4 QR codes with different labels (simulate hoarding, poster, pamphlet, flyer).  
2. Open each `/r/{token}` link in the browser (or scan with phone).  
3. Refresh dashboard → only the scanned ones increase.  
4. Scan QR #2 three times → its count is +3; others unchanged.  
5. Disable QR #3 → opening its link no longer redirects / shows disabled.  
6. Confirm final URL includes expected UTM params.  

That proves the core promise: **unique QRs, known placement, countable scans, safe entry into the site.**

---

## 13. Risks & honest limitations

| Topic | Reality |
|-------|---------|
| “Know the person” | Without login you know the **placement**, not the human’s name |
| “Know exact GPS” | No — you know **which poster** they used |
| Bots / link previews | Some apps may hit the URL and inflate counts slightly; v1 can ignore or improve later |
| Open create page | Fine for local test; lock before real public deploy |
| Printed QR is permanent | If print is wrong, **disable token** in DB and reprint a new QR |
| Neon free tier | Fine for testing; watch limits in production |

---

## 14. Decisions already agreed (summary)

| Decision | Choice |
|----------|--------|
| Goal | Track offline QR placements for marketing |
| Framework | Next.js (this repo) |
| DB | Neon + PostgreSQL |
| ORM | Prisma (latest) |
| Auth | **None for v1** (reduce burden, faster handoff) |
| Security model | Random tokens + server validation + safe redirects |
| Physical use | Hoardings, posters, pamphlets, flyers — one QR per placement |
| SEO/marketing | Metadata in DB + UTM on redirect |

---

## 15. What you should do now

1. **Read this README fully.**  
2. Check that the flow matches your mental model (create → print → scan → count → compare).  
3. Note anything you want changed (fields, pages, naming, destinations).  
4. When ready, reply with **start permission** (and any changes).  

Only after that will implementation begin in this repo:

`C:\Users\ACER\Desktop\codescan`

---

## 16. One-sentence product definition

> **CodeScan turns each printed QR into a unique, measurable doorway into your website so you know which hoarding, poster, or pamphlet actually drove the scan — stored in Neon Postgres, built with Next.js + Prisma, no auth complexity in v1.**

---

*This document is the blueprint. Code changes start only after you explicitly approve.*
