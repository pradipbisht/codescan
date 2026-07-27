# 04 — Later phases (not now)

Ignore until Phase B works end-to-end.

---

## Phase C — Marketing polish ✅ implemented

See [05-phase-c.md](./05-phase-c.md).

---

## Phase D — Handoff & production ✅ implemented

See [06-phase-d.md](./06-phase-d.md).

---

## Phase E — Optional later

- Better Auth (admin login)  
- Charts (scans over time)  
- Multi-user teams  
- Bot / preview hit filtering  
- Short branded domains  

---

## Remember

Printed QR encodes a **fixed URL**.  
If you test with `http://localhost:3000/r/...`, phones on the internet **cannot** open that.  

For real hoardings/posters you need:

1. Deployed site with public HTTPS domain  
2. `NEXT_PUBLIC_APP_URL=https://yourdomain.com`  
3. Create (or recreate) QRs so the image contains the production link  

---

Stay on Phase B until the checklist in `03` is green.
