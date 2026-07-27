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
 */
export async function getAppUrl(): Promise<string> {
  try {
    const h = await headers();
    const host = (h.get("x-forwarded-host") || h.get("host") || "").trim();
    const protoHeader = (h.get("x-forwarded-proto") || "").split(",")[0]?.trim();

    if (host && !isLocalHost(host)) {
      const proto = protoHeader === "http" ? "https" : protoHeader || "https";
      return stripSlash(`${proto}://${host}`);
    }

    const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (fromEnv && !isLocalHost(fromEnv)) {
      return stripSlash(fromEnv);
    }

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

    if (host) {
      const proto = protoHeader || "http";
      return stripSlash(`${proto}://${host}`);
    }
  } catch {
    // outside request
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
 * Normalize user input:
 * - "/offers/summer" → same-site path
 * - "https://dgs.goalkeepers.org.in" → full URL
 * - "dgs.goalkeepers.org.in" → https://dgs.goalkeepers.org.in
 */
export function normalizeDestination(raw: string): string {
  let value = raw.trim();
  if (!value) return "/";

  // Same-site path
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  // Protocol-relative //evil.com — reject later
  if (value.startsWith("//")) {
    return value;
  }

  // Bare domain / full host without protocol
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) {
    value = `https://${value}`;
  }

  return value;
}

/**
 * Safe destinations:
 * - Path on this app: /offers/summer
 * - Full https URL: https://dgs.goalkeepers.org.in/...
 * - http only for localhost (dev)
 * Blocks javascript:, data:, etc.
 */
export function isSafeDestination(dest: string): boolean {
  const value = dest.trim();
  if (!value) return false;

  // Same-site path
  if (value.startsWith("/") && !value.startsWith("//")) {
    if (value.includes("://")) return false;
    return true;
  }

  try {
    const url = new URL(value);
    const protocol = url.protocol.toLowerCase();

    if (protocol === "https:") return true;

    if (protocol === "http:") {
      return isLocalHost(url.hostname);
    }

    return false;
  } catch {
    return false;
  }
}

/** @deprecated use isSafeDestination */
export function isSafeDestinationPath(path: string): boolean {
  return isSafeDestination(normalizeDestination(path));
}

type UtmFields = {
  destinationPath: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
};

/**
 * Build final redirect URL (absolute) with UTM query params.
 * Works for both /paths and https://external.sites
 */
export async function buildRedirectUrl(fields: UtmFields): Promise<string> {
  const normalized = normalizeDestination(fields.destinationPath);
  const baseApp = await getAppUrl();

  let url: URL;
  try {
    if (isSafeDestination(normalized) && normalized.startsWith("/")) {
      url = new URL(normalized, baseApp);
    } else if (isSafeDestination(normalized)) {
      url = new URL(normalized);
    } else {
      url = new URL("/", baseApp);
    }
  } catch {
    url = new URL("/", baseApp);
  }

  if (fields.utmSource) url.searchParams.set("utm_source", fields.utmSource);
  if (fields.utmMedium) url.searchParams.set("utm_medium", fields.utmMedium);
  if (fields.utmCampaign)
    url.searchParams.set("utm_campaign", fields.utmCampaign);
  if (fields.utmContent)
    url.searchParams.set("utm_content", fields.utmContent);

  return url.toString();
}
