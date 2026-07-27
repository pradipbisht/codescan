# Phase E — Live UI, edit/delete, polish

## Goal

Usable product: live counts, edit metadata, delete, consistent UI.

## Live scan counts (no full page refresh)

| Piece | Path | Interval |
|-------|------|----------|
| API one QR | `GET /api/qr/[id]/live` | — |
| API all | `GET /api/qr/live-all` | — |
| Detail micro-UI | `app/qr/[id]/live-stats.tsx` | 3s |
| Dashboard bridge | `app/dashboard/live-counts.tsx` | 4s |

Detail page shows a green **Live** pulse when the number changes.  
Dashboard writes into elements with `data-live-count="{id}"`.

## Edit / delete

| Action | Route / file |
|--------|----------------|
| Edit form | `/qr/[id]/edit` |
| Update action | `qr/[id]/actions.ts` → `updateQrAction` |
| Delete | `DeleteQrButton` → `deleteQrAction` |

**Token does not change on edit** — printed posters keep working.  
Only destination, UTMs, label, channel, active flag change.

Delete removes the QR and its scan history (cascade).

## UI shell

| Piece | Role |
|-------|------|
| `components/site-header.tsx` | Sticky nav |
| `globals.css` `.page-shell` | Soft gradient background |
| Home / create / dashboard / detail | Shared look |

## Share QR image

`qr-share-actions.tsx`:

- Download PNG (print asset)  
- Copy image / link  
- Share / print  

Remember: for print you need the **PNG**, not only the text link.

→ Next: [08-testing-guide.md](./08-testing-guide.md)
