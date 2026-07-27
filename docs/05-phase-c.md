# 05 — Phase C (marketing polish) — implemented

## What Phase C added

| Feature | Where |
|---------|--------|
| Dashboard filters (channel, campaign, active) | `/dashboard?channel=&campaign=&active=` |
| Summary cards (totals, filtered scans, top channel) | `/dashboard` |
| Last scanned column | Dashboard table |
| Auto UTM defaults from channel / campaign / location | Create form + server |
| Live UTM redirect preview | `/qr/new` |
| Default destination `/offers/summer` | Create form |
| Sample landing shows UTMs after scan | `/offers/summer` |
| Copy link + download PNG | Detail (Phase B, kept) |
| Recent scan events list | `/qr/[id]` |

## Quick test

1. `npm run dev`
2. Create QR with campaign `Summer Sale 2026`, location `Andheri`
3. Confirm UTMs auto-fill (e.g. `summer_sale_2026`, `andheri`)
4. Open scan URL → land on `/offers/summer?utm_...`
5. Dashboard → filter by channel/campaign → counts & last scanned

## Files touched

- `src/lib/utm.ts` (new)
- `src/app/dashboard/page.tsx`
- `src/app/qr/new/page.tsx`, `actions.ts`
- `src/app/qr/[id]/page.tsx`
- `src/app/offers/summer/page.tsx` (new)
- `src/app/page.tsx`
