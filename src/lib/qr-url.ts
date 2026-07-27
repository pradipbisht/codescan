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
