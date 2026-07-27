/**
 * Public site origin used inside QR images.
 *
 * Order:
 * 1. NEXT_PUBLIC_APP_URL (set this on Vercel for production)
 * 2. VERCEL_URL / related (auto on Vercel servers — no localhost)
 * 3. localhost only for local `npm run dev`
 */
export function getAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (fromEnv) {
    return fromEnv;
  }

  // Set automatically by Vercel (server runtime + build). Avoids baking localhost into QR PNGs.
  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    process.env.VERCEL_URL;

  if (vercelHost) {
    const host = vercelHost.replace(/\/$/, "");
    if (host.startsWith("http://") || host.startsWith("https://")) {
      return host;
    }
    return `https://${host}`;
  }

  // Local development only
  return "http://localhost:3000";
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

/** Build redirect target with UTM query params (path + search only) */
export function buildRedirectUrl(fields: UtmFields): string {
  const path = isSafeDestinationPath(fields.destinationPath)
    ? fields.destinationPath
    : "/";

  const url = new URL(path, getAppUrl());

  if (fields.utmSource) url.searchParams.set("utm_source", fields.utmSource);
  if (fields.utmMedium) url.searchParams.set("utm_medium", fields.utmMedium);
  if (fields.utmCampaign)
    url.searchParams.set("utm_campaign", fields.utmCampaign);
  if (fields.utmContent)
    url.searchParams.set("utm_content", fields.utmContent);

  return url.pathname + url.search;
}
