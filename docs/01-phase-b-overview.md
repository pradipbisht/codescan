# 01 — Phase B overview (study first)

**Goal:** Make a working loop:

> Create QR → see QR image → open/scan link → count +1 in DB → redirect user → see updated count on dashboard

No login. No fancy design required. Keep it simple.

---

## The story in 30 seconds

1. You open **/qr/new** and fill: label, channel, location, campaign, destination.  
2. Server saves a row in `qr_codes` with a **random token**.  
3. Screen shows a QR image for:  
   `http://localhost:3000/r/THAT_TOKEN`  
4. Someone (or you) opens that URL.  
5. Route **/r/[token]**:
   - finds the QR in DB  
   - if inactive/missing → error page  
   - if ok → `scanCount + 1`, write `qr_scans` row, redirect to destination + UTM query  
6. **/dashboard** lists all QRs and their counts.

---

## Routes you will build

| Route | Type | Purpose |
|-------|------|---------|
| `/` | Page | Simple home with links |
| `/dashboard` | Page | Table of all QR codes + scan counts |
| `/qr/new` | Page | Form to create a QR |
| `/qr/[id]` | Page | Detail: big QR, copy link, toggle active (optional in B) |
| `/r/[token]` | Page or route handler | **Public** track + redirect |

---

## Files you will add (suggested)

```
src/
├── lib/
│   ├── prisma.ts          ← already exists
│   ├── tokens.ts          ← generate random token
│   └── qr-url.ts          ← build full public URL + UTM redirect URL
├── app/
│   ├── page.tsx           ← update home links
│   ├── dashboard/
│   │   └── page.tsx
│   ├── qr/
│   │   ├── new/
│   │   │   ├── page.tsx
│   │   │   └── actions.ts   ← server action: create QR
│   │   └── [id]/
│   │       └── page.tsx
│   └── r/
│       └── [token]/
│           └── route.ts     ← or page.tsx with redirect()
```

You may also need a package to draw the QR image, for example:

```powershell
npm install qrcode
npm install -D @types/qrcode
```

Or use an API/image route. Step-by-step doc explains one simple approach.

---

## Security rules (must follow)

1. **Token** = long random (e.g. `nanoid` or `crypto.randomBytes`). Not `1`, `2`, `3` in the public URL.  
2. After scan, only redirect to **your own paths** (start with `/`, no `http://evil.com`).  
3. QR only encodes HTTPS/HTTP link to **your** `NEXT_PUBLIC_APP_URL`.  
4. Respect `isActive` — disabled QR must not redirect as normal.

---

## Data flow diagram

```
[Form /qr/new]
      │
      ▼
prisma.qrCode.create({ token, label, channel, ... })
      │
      ▼
Show QR image of  NEXT_PUBLIC_APP_URL + "/r/" + token
      │
      ▼
Phone / browser hits  /r/[token]
      │
      ├─ not found / inactive → show message
      │
      └─ ok → transaction:
            update scanCount + 1
            create QrScan
            redirect(destination + utm params)
```

---

## Success looks like

1. Create 4 QRs (hoarding, poster, pamphlet, flyer).  
2. Open QR #2’s `/r/...` link three times.  
3. Dashboard: only #2 has `scanCount = 3`.  
4. Final browser URL after scan includes UTM params (if you set them).

---

## Order of work (recommended)

1. Helper: generate token + build URLs  
2. Server action: create QR  
3. Page: `/qr/new` form  
4. Page: `/dashboard` list  
5. Route: `/r/[token]` track + redirect  
6. QR image display (on new + detail)  
7. Home page links  
8. Test with checklist in `03-phase-b-checklist.md`

---

## Out of scope for Phase B

- Better Auth / login  
- Delete QR UI (optional)  
- Charts / graphs  
- Bot filtering  
- Production deploy polish  

Those are later (see `04-later-phases.md`).

---

**Next:** open [02-phase-b-step-by-step.md](./02-phase-b-step-by-step.md) and type the code.
