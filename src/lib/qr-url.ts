import { headers } from "next/headers";

function stripSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function isLocalHost(host: string): boolean {
  const h = host.toLowerCase();
  return (
    h.includes("localhost") ||
    h.startsWith("127.0.0.1") ||
    h.startsWith("0.0.0.0") ||
    h.startsWith("[::1]")
  );
}

/**
 * Origin for QR images — prefers the site the user is actually visiting.
 * That way https://codescan-inky.vercel.app never encodes localhost.
 */
export async function getAppUrl(): Promise<string> {
  // 1) Real request host (best on Vercel production)
  try {
    const h = await headers();
    const host = (h.get("x-forwarded-host") || h.get("host") || "").trim();
    const protoHeader = (h.get("x-forwarded-proto") || "").split(",")[0]?.trim();

    if (host && !isLocalHost(host)) {
      const proto = protoHeader === "http" ? "https" : protoHeader || "https";
      return stripSlash(`${proto}://${host}`);
    }

    // 2) Env production URL (local dev can still print production QRs)
    const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (fromEnv && !isLocalHost(fromEnv)) {
      return stripSlash(fromEnv);
    }

    // 3) Vercel system env
    const vercelHost =
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.NEXT_PUBLIC_VERCEL_URL ||
      process.env.VERCEL_URL;
    if (vercelHost) {
      const hostOnly = stripSlash(vercelHost);
      if (hostOnly.startsWith("http://") || hostOnly.startsWith("https://")) {
        return hostOnly;
      }
      return `https://${hostOnly}`;
    }

    // 4) Local browsing only
    if (host) {
      const proto = protoHeader || "http";
      return stripSlash(`${proto}://${host}`);
    }
  } catch {
    // headers() can throw outside a request — fall through
  }

  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return stripSlash(fromEnv);

  return "http://localhost:3000";
}

/** Full public scan URL put inside the QR image */
export async function buildScanUrl(token: string): Promise<string> {
  const base = await getAppUrl();
  return `${base}/r/${token}`;
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
export async function buildRedirectUrl(fields: UtmFields): Promise<string> {
  const path = isSafeDestinationPath(fields.destinationPath)
    ? fields.destinationPath
    : "/";

  const base = await getAppUrl();
  const url = new URL(path, base);

  if (fields.utmSource) url.searchParams.set("utm_source", fields.utmSource);
  if (fields.utmMedium) url.searchParams.set("utm_medium", fields.utmMedium);
  if (fields.utmCampaign)
    url.searchParams.set("utm_campaign", fields.utmCampaign);
  if (fields.utmContent)
    url.searchParams.set("utm_content", fields.utmContent);

  return url.pathname + url.search;
}
