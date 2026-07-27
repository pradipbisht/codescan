import Link from "next/link";
import { QrCode } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader({
  active,
}: {
  active?: "home" | "dashboard" | "create";
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 text-white shadow-sm dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900">
            <QrCode className="size-4" />
          </span>
          <span className="hidden sm:inline">CodeScan</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
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
            className={cn(buttonVariants({ size: "sm" }), "shadow-sm")}
          >
            Create QR
          </Link>
        </nav>
      </div>
    </header>
  );
}
