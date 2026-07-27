/** Turn free text into a safe UTM-style slug */
export function slugifyUtm(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

/**
 * TalentSprint-style print mapping:
 *   utm_source=newspaper_print
 *   utm_medium=print
 *   utm_campaign=...
 *   utm_content=...
 *
 * Outdoor digital-ish placements use offline medium instead.
 */
const PRINT_CHANNELS = new Set([
  "newspaper",
  "newspaper_print",
  "flyer",
  "pamphlet",
  "print",
]);

export function defaultUtmSourceForChannel(channel: string): string {
  const c = channel.toLowerCase().trim();
  if (c === "newspaper" || c === "newspaper_print" || c === "print") {
    return "newspaper_print";
  }
  if (c === "flyer" || c === "pamphlet") {
    // still print medium, source = channel name
    return c;
  }
  return c || "other";
}

export function defaultUtmMediumForChannel(channel: string): string {
  const c = channel.toLowerCase().trim();
  if (PRINT_CHANNELS.has(c)) {
    return "print";
  }
  // hoarding, poster, other
  return "offline";
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
  const channel = input.channel.trim() || "other";

  const utmSource =
    input.utmSource?.trim() || defaultUtmSourceForChannel(channel);

  const utmMedium =
    input.utmMedium?.trim() || defaultUtmMediumForChannel(channel);

  // Campaign: use provided campaign name, or build a print-style slug from label
  const utmCampaign =
    input.utmCampaign?.trim() ||
    (input.campaign
      ? slugifyUtm(input.campaign)
      : input.label
        ? slugifyUtm(input.label)
        : null);

  // Content: placement detail (location or label) — like ts-naio-common-newspaper_print
  const utmContent =
    input.utmContent?.trim() ||
    (input.location
      ? slugifyUtm(input.location)
      : input.label
        ? slugifyUtm(input.label)
        : null);

  return { utmSource, utmMedium, utmCampaign, utmContent };
}
