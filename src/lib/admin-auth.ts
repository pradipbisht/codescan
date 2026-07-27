import { cookies } from "next/headers";

export const ADMIN_COOKIE = "codescan_admin";

/** If ADMIN_PASSWORD is unset, admin pages stay open (local dev). */
export function isAdminLockEnabled(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

export function expectedAdminToken(): string | null {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) return null;
  // Simple cookie value — not multi-user auth; fine for single-admin handoff
  return `ok:${password}`;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const expected = expectedAdminToken();
  if (!expected) return true; // lock disabled
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value === expected;
}
