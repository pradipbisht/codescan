export const QR_CHANNELS = [
  { value: "newspaper", label: "Newspaper print" },
  { value: "flyer", label: "Flyer" },
  { value: "pamphlet", label: "Pamphlet" },
  { value: "poster", label: "Poster" },
  { value: "hoarding", label: "Hoarding" },
  { value: "other", label: "Other" },
] as const;

export function channelLabel(value: string): string {
  return (
    QR_CHANNELS.find((c) => c.value === value)?.label ??
    value.charAt(0).toUpperCase() + value.slice(1)
  );
}
