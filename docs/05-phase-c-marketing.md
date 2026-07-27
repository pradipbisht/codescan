# Phase C — Marketing (UTMs + full destination URL)

## Goal

Match print-ad analytics style (like TalentSprint newspaper ads).

## Target redirect shape

```
https://dgs.goalkeepers.org.in
  ?utm_source=newspaper_print
  &utm_medium=print
  &utm_campaign=your_campaign_slug
  &utm_content=your_edition_or_city_slug
```

## Files

| File | Role |
|------|------|
| `src/lib/qr/utm.ts` | Defaults from channel |
| `src/lib/qr/channels.ts` | newspaper, flyer, poster, … |
| `src/lib/qr/url.ts` | Full https destinations + UTM append |
| Create / edit forms | User enters destination + campaign |

## Channel → default UTMs

| Channel | utm_source | utm_medium |
|---------|------------|------------|
| newspaper | `newspaper_print` | `print` |
| flyer / pamphlet | channel name | `print` |
| poster / hoarding | channel name | `offline` |

Campaign name and location/label become `utm_campaign` / `utm_content` (slugified) if not filled manually.

## Destination rules

Allowed:

- `https://dgs.goalkeepers.org.in`  
- `dgs.goalkeepers.org.in` (auto `https://`)  
- `/offers/summer` (same CodeScan site)  

Blocked: `javascript:`, random `http://` non-local hosts (open redirect risk).

## Dashboard value

CodeScan still knows **which printed QR** was used (per-row `scanCount`).  
UTMs help Google Analytics / Meta after the browser lands on your site.

→ Next: [06-phase-d-production.md](./06-phase-d-production.md)
