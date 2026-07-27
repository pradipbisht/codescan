# Phase 0 — Product overview

## What is CodeScan?

CodeScan is an **offline QR attribution** tool.

You print different QR codes on:

- newspaper ads  
- posters  
- pamphlets  
- hoardings  

When someone scans a code, your system knows **which physical piece** they used, increases that QR’s scan count, and sends them to your website (for example `https://dgs.goalkeepers.org.in`) with marketing **UTM** tags.

## What problem it solves

Without unique QRs, you only know “someone visited the website.”  
With CodeScan you know:

> “This visit came from **Newspaper – TOI full page**, not the mall poster.”

That is **channel / placement attribution**.

## What it is not

| Not included | Why |
|--------------|-----|
| Full Better Auth multi-user login | Keep simple for handoff |
| GPS of the phone | We track the **QR**, not satellite location |
| Magic “secure QR encryption” | Security = random token + server checks |

## Main actors

1. **You (admin)** — create/edit/delete QRs, view dashboard.  
2. **Public scanner** — opens `/r/{token}` with phone; no login.

## Stack

| Layer | Tech |
|-------|------|
| UI / routes | Next.js 16 (App Router) under `src/app` |
| Styling | Tailwind + shadcn/ui |
| Database | Neon PostgreSQL |
| ORM | Prisma 7 + Neon adapter |
| Hosting | Vercel |

## Success criteria

1. Create QR on **live** domain.  
2. Phone opens QR → lands on your destination with UTMs.  
3. Dashboard scan count for **that** QR only increases.  
4. Live UI updates without full page refresh.

→ Next: [01-folder-structure.md](./01-folder-structure.md)
