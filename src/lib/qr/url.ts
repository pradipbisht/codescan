import { headers } from "next/headers";

function stripSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function isLocalHost(host: string): boolean {
  const h = host.toLowerCase().replace(/^https?:\/\//, "");
  return (
    h.includes("localhost") ||
    h.startsWith("127.0.0.1") ||
    h.startsWith("0.0.0.0") ||
    h.startsWith("[::1]")
  );
}

/** True for default Vercel preview/production hosts (not a custom domain). */
export function isVercelAppHost(urlOrHost: string): boolean {
  try {
    const host = urlOrHost.includes("://")
      ? new URL(urlOrHost).hostname
      : urlOrHost.split("/")[0] ?? urlOrHost;
    return host.toLowerCase().endsWith(".vercel.app");
  } catch {
    return urlOrHost.toLowerCase().includes(".vercel.app");
  }
}

function normalizeOrigin(raw: string): string {
  const trimmed = stripSlash(raw.trim());
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Canonical public origin for QR images and scan links.
 *
 * Priority:
 * 1. NEXT_PUBLIC_APP_URL (set this to your custom domain — never *.vercel.app for print)
 * 2. Current request host when not localhost
 * 3. Localhost fallback for dev
 *
 * We intentionally do NOT auto-prefer VERCEL_URL so printed QRs are not
 * baked to codescan-xxx.vercel.app when a custom domain is configured.
 */
export async function getAppUrl(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    // Prefer explicit env even for localhost (dev), so QR base is predictable
    return normalizeOrigin(fromEnv);
  }

  try {
    const h = await headers();
    const host = (h.get("x-forwarded-host") || h.get("host") || "").trim();
    const protoHeader = (h.get("x-forwarded-proto") || "").split(",")[0]?.trim();

    if (host && !isLocalHost(host)) {
      const proto = protoHeader === "http" ? "https" : protoHeader || "https";
      return stripSlash(`${proto}://${host}`);
    }

    if (host) {
      const proto = protoHeader || "http";
      return stripSlash(`${proto}://${host}`);
    }
  } catch {
    // outside request (build / scripts)
  }

  return "http://localhost:3000";
}

/** Full public scan URL put inside the QR image: {origin}/r/{token} */
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
