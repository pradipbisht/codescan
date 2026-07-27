# 03 — Phase B test checklist

Do these after you finish Phase B steps. Tick mentally or on paper.

---

## A. App starts

- [ ] `npm run dev` runs without crash  
- [ ] http://localhost:3000 opens  
- [ ] Links to Dashboard and Create QR work  

---

## B. Create QR

- [ ] Open `/qr/new`  
- [ ] Create **QR 1** — channel `hoarding`, label something clear  
- [ ] Create **QR 2** — channel `poster`  
- [ ] Create **QR 3** — channel `pamphlet`  
- [ ] Create **QR 4** — channel `flyer`  
- [ ] After create, you land on detail page with a **visible QR image**  
- [ ] Scan URL looks like: `http://localhost:3000/r/xxxxxxxx...` (long token, not `/r/1`)  

---

## C. Dashboard

- [ ] `/dashboard` lists all 4  
- [ ] All start with **scan count 0** (or only increase when you scan)  
- [ ] “Open” goes to detail page  

---

## D. Scan tracking (core product)

- [ ] Copy QR 2 scan URL  
- [ ] Open it in browser (or phone on same network — harder on localhost)  
- [ ] You get redirected (home or destination path)  
- [ ] URL bar may show UTM params if you set them  
- [ ] Refresh dashboard → **only QR 2** count went up  
- [ ] Open QR 2 link **two more times** → count becomes **3**  
- [ ] QR 1, 3, 4 still lower / unchanged  

---

## E. Security basics

- [ ] Fake URL `/r/not-a-real-token` → 404 / error (not a crash)  
- [ ] (If you built toggle) disable QR 3 → its link no longer works normally  
- [ ] Destination cannot be `https://google.com` as free redirect (path must start with `/`)  

---

## F. Database check (optional)

```powershell
npm run db:studio
```

- [ ] `qr_codes` has 4 rows  
- [ ] `scanCount` matches dashboard  
- [ ] `qr_scans` has one row per successful scan  

---

## Pass / fail

| Result | Meaning |
|--------|---------|
| All core D checks pass | Phase B done 🎉 |
| Create works, scan doesn’t | Fix `/r/[token]` first |
| Scan works, dashboard stale | Add `dynamic = "force-dynamic"` or revalidate |
| Nothing saves | Check Neon `.env` + `prisma` import |

---

## After Phase B works

You can:

1. Print a QR (screenshot the image) and put it on a test paper.  
2. Ask Grok for Phase C (UTM polish, filters, nicer UI).  
3. Or hand the repo to someone else with README + this `docs/` folder.

If you **cannot finish Phase B**, tell Grok:

> Implement Phase B for me following docs/02-phase-b-step-by-step.md
