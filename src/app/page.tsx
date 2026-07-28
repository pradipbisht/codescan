import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Link2,
  QrCode,
  Sparkles,
  Zap,
} from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Public homepage: aggregate totals only.
 * Placement names, destinations, campaigns, and scan logs stay on /dashboard.
 */
async function loadPublicTotals() {
  try {
    const [totalQr, activeCount, scanSum] = await Promise.all([
      prisma.qrCode.count(),
      prisma.qrCode.count({ where: { isActive: true } }),
      prisma.qrCode.aggregate({ _sum: { scanCount: true } }),
    ]);

    return {
      ok: true as const,
      totalQr,
      activeCount,
      totalScans: scanSum._sum.scanCount ?? 0,
    };
  } catch {
    return {
      ok: false as const,
      totalQr: 0,
      activeCount: 0,
      totalScans: 0,
    };
  }
}

export default async function Home() {
  const data = await loadPublicTotals();

  return (
    <div className="page-shell flex min-h-full flex-1 flex-col">
      <SiteHeader active="home" />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-16">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-10 sm:pt-14">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <div className="hero-glow absolute -left-24 top-0 size-72 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="hero-glow absolute -right-16 top-10 size-80 rounded-full bg-violet-400/15 blur-3xl" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.9fr] lg:gap-12">
            <div className="max-w-xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                Offline print → online attribution
              </p>

              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl sm:leading-[1.1]">
                Know which poster, paper, or hoarding{" "}
                <span className="bg-gradient-to-r from-sky-700 via-violet-700 to-fuchsia-700 bg-clip-text text-transparent dark:from-sky-300 dark:via-violet-300 dark:to-fuchsia-300">
                  actually drives visits
                </span>
              </h1>

              <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Create a unique QR per placement. When someone scans, your
                private dashboard counts that asset — then visitors land on any
                website you choose, with UTMs for marketing tools.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/qr/new"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "shadow-md shadow-primary/15"
                  )}
                >
                  Create a QR code
                  <ArrowRight className="size-4" />
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

              {/* Public totals only — no placement names or destinations */}
              <div className="mt-10 grid grid-cols-3 gap-3">
                {[
                  {
                    label: "QR codes",
                    value: data.totalQr,
                    icon: QrCode,
                  },
                  {
                    label: "Active",
                    value: data.activeCount,
                    icon: Zap,
                  },
                  {
                    label: "Total scans",
                    value: data.totalScans,
                    icon: BarChart3,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-border/80 bg-card/80 px-3 py-3 shadow-sm backdrop-blur transition hover:border-border hover:shadow-md"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      <stat.icon className="size-3.5 opacity-70" />
                      {stat.label}
                    </div>
                    <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums">
                      {data.ok ? stat.value.toLocaleString() : "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Generic product preview — not real campaign data */}
            <div className="relative mx-auto w-full max-w-md">
              <div
                aria-hidden
                className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-sky-400/20 via-violet-400/10 to-fuchsia-400/20 blur-xl"
              />
              <Card className="glass-card relative overflow-hidden border-border/70 shadow-xl">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-violet-500 to-fuchsia-500" />
                <CardHeader className="border-b border-border/60 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 text-white shadow-sm dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900">
                      <Sparkles className="size-4" />
                    </span>
                    <div>
                      <CardTitle className="text-base">
                        Private research dashboard
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Placement names & destinations stay behind login
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-muted/60 px-4 py-3">
                      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                        Network scans
                      </p>
                      <p className="mt-1 text-3xl font-semibold tabular-nums">
                        {data.ok ? data.totalScans.toLocaleString() : "—"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/60 px-4 py-3">
                      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                        Placements
                      </p>
                      <p className="mt-1 text-3xl font-semibold tabular-nums">
                        {data.ok ? data.totalQr.toLocaleString() : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-dashed border-border px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                    Public pages show totals only. Open the dashboard to see
                    which poster, campaign, or city performed — that detail is
                    for your research, not the public site.
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      Totals public
                    </span>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
                      Details private
                    </span>
                  </div>
                  <Link
                    href="/dashboard"
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "w-full shadow-sm"
                    )}
                  >
                    Go to private dashboard
                    <ArrowRight className="size-3.5" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────── */}
        <section className="mt-16">
          <div className="mb-6">
            <p className="text-xs font-medium tracking-wide text-primary uppercase">
              How it works
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
              Print · scan · measure
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: QrCode,
                step: "01",
                title: "Create",
                body: "Name the placement, pick a channel, set any after-scan website. UTMs fill in for print.",
                href: "/qr/new",
                cta: "New QR",
              },
              {
                icon: Link2,
                step: "02",
                title: "Print & place",
                body: "Download the PNG for newspapers, posters, pamphlets, or hoardings.",
                href: "/dashboard",
                cta: "Your QRs",
              },
              {
                icon: BarChart3,
                step: "03",
                title: "Measure privately",
                body: "Each scan increments the right QR. Detailed performance stays on your dashboard.",
                href: "/dashboard",
                cta: "Dashboard",
              },
            ].map((item) => (
              <Card
                key={item.step}
                className="group border-border/80 bg-card/90 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardHeader>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                      <item.icon className="size-5" />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {item.step}
                    </span>
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {item.body}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {item.cta}
                    <ArrowRight className="size-3.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/80 py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
          <p className="font-medium text-foreground/80">
            CodeScan · print · scan · measure
          </p>
          <p>
            {data.ok
              ? `${data.totalQr.toLocaleString()} placements · ${data.totalScans.toLocaleString()} scans`
              : "Offline QR attribution"}
          </p>
        </div>
      </footer>
    </div>
  );
}
