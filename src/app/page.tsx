import Link from "next/link";
import { BarChart3, QrCode, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <QrCode className="size-4" />
            </span>
            CodeScan
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Dashboard
            </Link>
            <Link
              href="/qr/new"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Create QR
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-12 sm:py-16">
        <div className="mb-10 max-w-xl">
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Offline QR attribution
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Know which poster or pamphlet brought people in
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Create one unique QR per hoarding, poster, or flyer. When someone
            scans it, your dashboard counts that placement — simple marketing
            tracking, no login for scanners.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/qr/new" className={cn(buttonVariants({ size: "lg" }))}>
              Create a QR code
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" })
              )}
            >
              Open dashboard
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card size="sm" className="bg-card">
            <CardHeader>
              <div className="mb-1 flex size-9 items-center justify-center rounded-lg bg-muted">
                <QrCode className="size-4" />
              </div>
              <CardTitle>Create</CardTitle>
              <CardDescription>
                Name + channel only. UTMs fill in automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/qr/new"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                New QR →
              </Link>
            </CardContent>
          </Card>

          <Card size="sm" className="bg-card">
            <CardHeader>
              <div className="mb-1 flex size-9 items-center justify-center rounded-lg bg-muted">
                <BarChart3 className="size-4" />
              </div>
              <CardTitle>Track</CardTitle>
              <CardDescription>
                Each scan adds +1 to that QR. Filter by channel or campaign.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Dashboard →
              </Link>
            </CardContent>
          </Card>

          <Card size="sm" className="bg-card">
            <CardHeader>
              <div className="mb-1 flex size-9 items-center justify-center rounded-lg bg-muted">
                <Sparkles className="size-4" />
              </div>
              <CardTitle>Landing</CardTitle>
              <CardDescription>
                Sample summer offer page for after-scan redirects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/offers/summer"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                View sample →
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        CodeScan · print QR · scan · measure
      </footer>
    </div>
  );
}
