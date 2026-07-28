# Testing guide (no real campaign needed)

## Setup

1. App live on your domain (or local for UI-only tests)  
2. Env set: DB + `NEXT_PUBLIC_APP_URL=https://YOUR-DOMAIN`  
3. For print/phone tests: browser on that domain, not localhost  

## Test 1 — Create

1. Open `/qr/new`  
2. Name: `Test phone 1`  
3. Channel: Newspaper print  
4. After-scan: `https://goalkeepers.org.in` (or any https site)  
5. Create  

## Test 2 — URL inside QR

On detail page, scan URL must be:

```
https://YOUR-DOMAIN/r/........
```

- If you see `localhost` → wrong host for phone tests  
- If you see `*.vercel.app` → set custom domain + `NEXT_PUBLIC_APP_URL`, redeploy, re-download  

## Test 3 — Scan without print

- Copy scan URL → open on phone, **or**  
- Download PNG → open image → camera / Lens  

Expect:

1. Land on destination with `utm_…` in address bar  
2. Detail page **Scans** jumps without refresh (Live)  
3. Dashboard count for that card +1  

## Test 4 — Which QR?

1. Create QR A and QR B  
2. Scan each  
3. Counts must increase on the correct card only  

## Test 5 — Other websites as destination

1. Create QR with after-scan `https://example.com`  
2. Scan → lands on example.com (+ UTMs)  
3. Count still on CodeScan for that token  

→ Back: [docs/README.md](./README.md)
