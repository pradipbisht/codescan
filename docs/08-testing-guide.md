# Testing guide (no real campaign needed)

## Setup

1. App live: `https://codescan-inky.vercel.app`  
2. Env set on Vercel (DB + `NEXT_PUBLIC_APP_URL`)  
3. Browser on **that domain** (not localhost) for print tests  

## Test 1 — Create

1. Open `/qr/new`  
2. Name: `Test phone 1`  
3. Channel: Newspaper print  
4. After-scan: `https://dgs.goalkeepers.org.in`  
5. Create  

## Test 2 — URL inside QR

On detail page, scan URL must be:

```
https://codescan-inky.vercel.app/r/........
```

If you see `localhost` → wrong host when creating.

## Test 3 — Scan without print

- Copy scan URL → open on phone, **or**  
- Download PNG → open image → camera / Lens  

Expect:

1. Land on goalkeepers (or your URL) with `utm_…` in address bar  
2. Detail page **Scans** jumps without refresh (Live)  
3. Dashboard count for that card +1  

## Test 4 — Which QR?

1. Create QR A and QR B  
2. Scan only B twice  
3. Dashboard: A = 0 (or old), B = +2  

## Test 5 — Edit destination

1. Edit QR → change after-scan URL  
2. Scan again → new landing  
3. Same PNG still works (token unchanged)  

## Test 6 — Disable / delete

1. Disable → scan link shows disabled  
2. Delete → row gone, old token 404  

## SQL check (optional)

Neon SQL editor:

```sql
SELECT label, channel, "scanCount", "destinationPath", "lastScannedAt"
FROM qr_codes
ORDER BY "createdAt" DESC;
```

## Pass criteria

| Check | Pass |
|-------|------|
| Live domain in QR URL | Yes |
| External redirect + UTMs | Yes |
| Count only for scanned QR | Yes |
| Live UI updates | Yes without F5 |

← Back to [docs index](./README.md)
