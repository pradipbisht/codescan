import { nanoid } from "nanoid";

/** Public QR token — long enough that guessing is impractical */
export function createQrToken(): string {
  return nanoid(24);
}
