"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_COOKIE,
  expectedAdminToken,
  isAdminLockEnabled,
} from "@/lib/auth/admin";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  if (!isAdminLockEnabled()) {
    redirect("/dashboard");
  }

  const password = String(formData.get("password") || "");
  const expected = expectedAdminToken();

  if (!expected || password !== process.env.ADMIN_PASSWORD?.trim()) {
    return { error: "Wrong password." };
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // 14 days
  });

  const next = String(formData.get("next") || "/dashboard");
  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/login");
}
