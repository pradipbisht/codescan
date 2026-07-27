# 02 — Phase B step by step (type this yourself)

Work in:

```powershell
cd C:\Users\ACER\Desktop\codescan
npm run dev
```

Keep another terminal for installs/commands.

---

## Step 0 — Install packages you need

```powershell
npm install qrcode nanoid
npm install -D @types/qrcode
```

| Package | Why |
|---------|-----|
| `nanoid` | Safe random `token` for `/r/{token}` |
| `qrcode` | Turn URL into PNG/data-URL for display |

---

## Step 1 — Token helper

**Create file:** `src/lib/tokens.ts`

```ts
import { nanoid } from "nanoid";

/** Public QR token — long enough that guessing is impractical */
export function createQrToken(): string {
  return nanoid(24);
}
```

---

## Step 2 — URL helpers

**Create file:** `src/lib/qr-url.ts`

```ts
/** Base site URL for encoding into QR images */
export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

/** Full public scan URL put inside the QR image */
export function buildScanUrl(token: string): string {
  return `${getAppUrl()}/r/${token}`;
}

/**
 * Only allow same-site paths for redirect (blocks open redirect attacks).
 * Good: "/offers/summer"  Bad: "https://evil.com"
 */
export function isSafeDestinationPath(path: string): boolean {
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("://")) return false;
  return true;
}

type UtmFields = {
  destinationPath: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
};

/** Build redirect target with UTM query params */
export function buildRedirectUrl(fields: UtmFields): string {
  const path = isSafeDestinationPath(fields.destinationPath)
    ? fields.destinationPath
    : "/";

  const url = new URL(path, getAppUrl());

  if (fields.utmSource) url.searchParams.set("utm_source", fields.utmSource);
  if (fields.utmMedium) url.searchParams.set("utm_medium", fields.utmMedium);
  if (fields.utmCampaign) url.searchParams.set("utm_campaign", fields.utmCampaign);
  if (fields.utmContent) url.searchParams.set("utm_content", fields.utmContent);

  // Return path + query only (relative) so Next redirect stays on our site
  return url.pathname + url.search;
}
```

---

## Step 3 — Create QR (Server Action)

**Create file:** `src/app/qr/new/actions.ts`

```ts
"use server";

import { prisma } from "@/lib/prisma";
import { createQrToken } from "@/lib/tokens";
import { isSafeDestinationPath } from "@/lib/qr-url";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreateQrState = {
  error?: string;
};

export async function createQrAction(
  _prev: CreateQrState,
  formData: FormData
): Promise<CreateQrState> {
  const label = String(formData.get("label") || "").trim();
  const channel = String(formData.get("channel") || "").trim();
  const location = String(formData.get("location") || "").trim() || null;
  const campaign = String(formData.get("campaign") || "").trim() || null;
  let destinationPath = String(formData.get("destinationPath") || "/").trim();
  const utmSource = String(formData.get("utmSource") || "").trim() || null;
  const utmMedium =
    String(formData.get("utmMedium") || "offline").trim() || "offline";
  const utmCampaign = String(formData.get("utmCampaign") || "").trim() || null;
  const utmContent = String(formData.get("utmContent") || "").trim() || null;

  if (!label) return { error: "Label is required." };
  if (!channel) return { error: "Channel is required." };

  if (!destinationPath.startsWith("/")) {
    destinationPath = "/" + destinationPath;
  }
  if (!isSafeDestinationPath(destinationPath)) {
    return { error: "Destination must be a path on this site, like /offers/summer" };
  }

  const token = createQrToken();

  const qr = await prisma.qrCode.create({
    data: {
      token,
      label,
      channel,
      location,
      campaign,
      destinationPath,
      utmSource: utmSource ?? channel,
      utmMedium,
      utmCampaign,
      utmContent,
    },
  });

  revalidatePath("/dashboard");
  redirect(`/qr/${qr.id}`);
}
```

---

## Step 4 — Create form page

**Create file:** `src/app/qr/new/page.tsx`

Use your existing UI components (`Button`, `Input`, `Label`, `Card` from `@/components/ui/...`).

Ideas for the form fields:

| Input `name` | Required | Example |
|--------------|----------|---------|
| `label` | yes | Hoarding – Ring Road |
| `channel` | yes | hoarding / poster / pamphlet / flyer / other |
| `location` | no | Andheri, Mumbai |
| `campaign` | no | Summer Sale 2026 |
| `destinationPath` | no (default `/`) | `/` or `/offers/summer` |
| `utmSource` | no | auto = channel is fine |
| `utmMedium` | no | offline |
| `utmCampaign` | no | summer_sale_2026 |
| `utmContent` | no | andheri_ring_road_v1 |

Pattern for Server Actions + form:

```tsx
"use client";

import { useActionState } from "react";
import { createQrAction, type CreateQrState } from "./actions";
// import Button, Input, Label, Card...

const initial: CreateQrState = {};

export default function NewQrPage() {
  const [state, formAction, pending] = useActionState(createQrAction, initial);

  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-semibold mb-4">Create QR code</h1>
      <form action={formAction} className="space-y-4">
        {/* inputs with name=... */}
        {state.error && <p className="text-red-600">{state.error}</p>}
        <button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create QR"}
        </button>
      </form>
    </main>
  );
}
```

Make the form look nice with shadcn — function first, beauty second.

---

## Step 5 — Dashboard list

**Create file:** `src/app/dashboard/page.tsx`

This can be a **Server Component** (no `"use client"`):

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // always fresh counts

export default async function DashboardPage() {
  const codes = await prisma.qrCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">QR Dashboard</h1>
        <Link href="/qr/new">+ New QR</Link>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            <th>Label</th>
            <th>Channel</th>
            <th>Location</th>
            <th>Scans</th>
            <th>Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {codes.map((q) => (
            <tr key={q.id}>
              <td>{q.label}</td>
              <td>{q.channel}</td>
              <td>{q.location ?? "—"}</td>
              <td>{q.scanCount}</td>
              <td>{q.isActive ? "yes" : "no"}</td>
              <td>
                <Link href={`/qr/${q.id}`}>Open</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {codes.length === 0 && <p>No QR codes yet. Create one.</p>}
    </main>
  );
}
```

---

## Step 6 — Detail page + QR image

**Create file:** `src/app/qr/[id]/page.tsx`

1. Load QR by `id` with `prisma.qrCode.findUnique`.  
2. If missing → `notFound()`.  
3. Build scan URL: `buildScanUrl(qr.token)`.  
4. Generate QR image as data URL:

```ts
import QRCode from "qrcode";
import { buildScanUrl } from "@/lib/qr-url";

const scanUrl = buildScanUrl(qr.token);
const qrDataUrl = await QRCode.toDataURL(scanUrl, {
  width: 320,
  margin: 2,
});
```

5. Render:

```tsx
<img src={qrDataUrl} alt={`QR for ${qr.label}`} />
<p>Scan URL: {scanUrl}</p>
<p>Scans: {qr.scanCount}</p>
```

Optional: copy button (client component) for the URL.

---

## Step 7 — Public scan route (the important one)

**Create file:** `src/app/r/[token]/route.ts`

Using a Route Handler is clean for redirects:

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildRedirectUrl } from "@/lib/qr-url";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  const qr = await prisma.qrCode.findUnique({
    where: { token },
  });

  if (!qr) {
    return NextResponse.json(
      { error: "QR code not found" },
      { status: 404 }
    );
  }

  if (!qr.isActive) {
    return NextResponse.json(
      { error: "This QR code is disabled" },
      { status: 410 }
    );
  }

  const userAgent = request.headers.get("user-agent");
  const referer = request.headers.get("referer");

  // Update count + log scan together
  await prisma.$transaction([
    prisma.qrCode.update({
      where: { id: qr.id },
      data: {
        scanCount: { increment: 1 },
        lastScannedAt: new Date(),
      },
    }),
    prisma.qrScan.create({
      data: {
        qrCodeId: qr.id,
        userAgent: userAgent,
        referer: referer,
      },
    }),
  ]);

  const target = buildRedirectUrl({
    destinationPath: qr.destinationPath,
    utmSource: qr.utmSource,
    utmMedium: qr.utmMedium,
    utmCampaign: qr.utmCampaign,
    utmContent: qr.utmContent,
  });

  // Relative redirect on same origin
  return NextResponse.redirect(new URL(target, request.url));
}
```

**Note (Next.js 15/16):** `params` is often a **Promise** — `await context.params` as above.

If JSON 404 is ugly for phones, later you can use a small `page.tsx` with HTML message instead of JSON.

---

## Step 8 — Home page links

**Edit:** `src/app/page.tsx`

Replace starter boilerplate with simple links:

- Dashboard → `/dashboard`  
- Create QR → `/qr/new`  

Keep it minimal.

---

## Step 9 — (Optional) soft-disable QR

On detail page, a small server action:

```ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleQrActive(id: string, isActive: boolean) {
  await prisma.qrCode.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath(`/qr/${id}`);
  revalidatePath("/dashboard");
}
```

Nice to have; not required for first test.

---

## Common errors & fixes

| Error | Fix |
|-------|-----|
| `DATABASE_URL is not set` | Check `.env` exists in project root |
| `Can't reach database` | Neon sleeping? Retry. Check DIRECT/DATABASE URLs |
| `Cannot find module '@/generated/prisma'` | Run `npm run db:generate` |
| QR image blank | Check `buildScanUrl` + `qrcode` import |
| Count not updating | Hit `/r/TOKEN` not homepage; hard-refresh dashboard |
| `params` type error | `const { token } = await params` (Promise) |
| Redirect to evil.com | Always use `isSafeDestinationPath` |

---

## When you are stuck

Message Grok something like:

> Phase B stuck at Step 7 scan route. Error: …  
> OR  
> I can’t do Phase B, please implement the whole phase.

Paste the **error text** if you have one.

---

**Next:** [03-phase-b-checklist.md](./03-phase-b-checklist.md) to test your work.
