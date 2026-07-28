import Link from "next/link";
import { Lock, QrCode } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { isAdminAuthenticated, isAdminLockEnabled } from "@/lib/auth/admin";
import { cn } from "@/lib/utils";

export async function SiteHeader({
  active,
}: {
  active?: "home" | "dashboard" | "create";
}) {
  const locked = isAdminLockEnabled();
  const authed = await isAdminAuthenticated();
  // When lock is off (local empty password), treat as "authed" for nav
  const showAdmin = !locked || authed;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-semibold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 text-white shadow-sm ring-1 ring-black/5 transition group-hover:scale-[1.03] dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900">
            <QrCode className="size-4" />
          </span>
          <span className="hidden sm:inline">CodeScan</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {showAdmin ? (
            <>
              <Link
                href="/"
                className={cn(
                  buttonVariants({
                    variant: active === "home" ? "secondary" : "ghost",
                    size: "sm",
                  }),
                  "hidden sm:inline-flex"
                )}
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({
                    variant: active === "dashboard" ? "secondary" : "ghost",
                    size: "sm",
                  })
                )}
              >
                Dashboard
              </Link>
              <Link
                href="/qr/new"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "shadow-sm shadow-primary/10"
                )}
              >
                Create QR
              </Link>
            </>
          ) : (
            <Link
              href="/login?next=/dashboard"
              className={cn(
                buttonVariants({ size: "sm" }),
                "gap-1.5 shadow-sm shadow-primary/10"
              )}
            >
              <Lock className="size-3.5" />
              Admin login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
