# Full system flow (exact path)

## A. Create a QR (admin)

```
Browser: GET /qr/new
    → src/app/qr/new/page.tsx  (form UI)

Submit form
    → src/app/qr/new/actions.ts  createQrAction
        1. validate name, channel, destination
        2. normalizeDestination()     // https://dgs... or /path
        3. resolveUtmDefaults()       // newspaper_print, print, …
        4. createQrToken()            // nanoid 24
        5. prisma.qrCode.create(...)  // Neon
        6. redirect → /qr/{id}
```

## B. Show QR image (admin)

```
Browser: GET /qr/[id]
    → page.tsx
        1. load QrCode + recent QrScan from Neon
        2. buildScanUrl(token)
              → https://YOUR-DOMAIN/r/{token}
        3. QRCode.toDataURL(scanUrl)  // PNG pixels
        4. LiveStats polls /api/qr/[id]/live every 3s
```

**Important:** PNG bakes the URL at display time.  
Create on **Vercel domain**, not localhost, for real phones.

## C. Public scan (anyone)

```
Phone scans PNG
    → opens https://codescan-inky.vercel.app/r/TOKEN

GET /r/[token]
    → src/app/r/[token]/route.ts
        1. rateLimit (30 / min / IP / token)
        2. find QrCode by token
        3. if missing → 404 HTML
        4. if !isActive → 410 HTML
        5. transaction:
              scanCount += 1
              lastScannedAt = now
              create QrScan row
        6. buildRedirectUrl(...)
              → full URL + utm_source / medium / campaign / content
        7. NextResponse.redirect(absoluteUrl)
```

Example final browser address:

```
https://dgs.goalkeepers.org.in
  ?utm_source=newspaper_print
  &utm_medium=print
  &utm_campaign=...
  &utm_content=...
```

## D. Dashboard (admin)

```
GET /dashboard
    → list all QrCode rows
    → filters: search, channel, campaign, active
    → LiveCountsBridge polls /api/qr/live-all every 4s
         updates [data-live-count="id"] without full reload
```

## E. Edit / delete

```
Edit:  /qr/[id]/edit  → updateQrAction
         (token NEVER changes → printed QR still works)

Delete: deleteQrAction
         (cascade deletes QrScan rows)
```

## Data tables

| Table | Meaning |
|-------|---------|
| `qr_codes` | One row = one physical QR |
| `qr_scans` | One row = one scan event |

## Security points

1. Public URL uses long random `token`, not sequential 1,2,3.  
2. Destinations: only `https://…` or same-site `/path` (no `javascript:`).  
3. Admin lock (optional): `ADMIN_PASSWORD` + `src/proxy.ts`.  
4. Scan route rate limited.

→ Next: [03-phase-a-database.md](./03-phase-a-database.md)
