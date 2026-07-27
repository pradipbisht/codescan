/** Turn free text into a safe UTM-style slug */
export function slugifyUtm(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64);
}

/**
 * Fill empty UTM fields from placement metadata.
 * Explicit form values always win.
 */
export function resolveUtmDefaults(input: {
  channel: string;
  campaign?: string | null;
  location?: string | null;
  label?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
}) {
  const utmSource = input.utmSource?.trim() || input.channel;
  const utmMedium = input.utmMedium?.trim() || "offline";
  const utmCampaign =
    input.utmCampaign?.trim() ||
    (input.campaign ? slugifyUtm(input.campaign) : null);
  const utmContent =
    input.utmContent?.trim() ||
    (input.location
      ? slugifyUtm(input.location)
      : input.label
        ? slugifyUtm(input.label)
        : null);

  return { utmSource, utmMedium, utmCampaign, utmContent };
}
