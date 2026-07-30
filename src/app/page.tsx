import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Lock,
  QrCode,
  ShieldCheck,
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
import {
  isAdminAuthenticated,
  isAdminLockEnabled,
} from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Public homepage: aggregate totals only.
 * Individual QR names, destinations, campaigns stay private (dashboard).
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
  const locked = isAdminLockEnabled();
  const authed = await isAdminAuthenticated();
  const showAdmin = !locked || authed;

  return (
    <div className="page-shell flex min-h-full flex-1 flex-col">
      <SiteHeader active="home" />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-16">
        <section className="relative overflow-hidden pt-10 sm:pt-14">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
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
                Live network · public totals only
              </p>

              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl sm:leading-[1.1]">
                Print QR campaigns that{" "}
                <span className="bg-gradient-to-r from-sky-700 via-violet-700 to-fuchsia-700 bg-clip-text text-transparent dark:from-sky-300 dark:via-violet-300 dark:to-fuchsia-300">
                  measure real scans
                </span>
              </h1>

              <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                CodeScan tracks offline print → online visits. This page only
                shows network totals. Placement names, destinations, and
                research data stay behind admin login.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {showAdmin ? (
                  <>
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
                  </>
                ) : (
                  <Link
                    href="/login?next=/dashboard"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "shadow-md shadow-primary/15"
                    )}
                  >
                    <Lock className="size-4" />
                    Admin login
                    <ArrowRight className="size-4" />
                  </Link>
                )}
              </div>

              {/* Public totals only — no individual QR details */}
              <div className="mt-10 grid grid-cols-3 gap-3">
                {[
                  { label: "QR codes", value: data.totalQr, icon: QrCode },
                  { label: "Active", value: data.activeCount, icon: Zap },
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
                      <ShieldCheck className="size-4" />
                    </span>
                    <div>
                      <CardTitle className="text-base">
                        Privacy-first public view
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Totals only · no placement list
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

                  <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground">
                    <li className="flex gap-2">
                      <Sparkles className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                      Public: counts only (QR total, active, scans)
                    </li>
                    <li className="flex gap-2">
                      <Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      Private: names, destinations, campaigns, download QR
                    </li>
                  </ul>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      Totals public
                    </span>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
                      Research private
                    </span>
                  </div>

                  <Link
                    href={
                      showAdmin ? "/dashboard" : "/login?next=/dashboard"
                    }
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "w-full shadow-sm"
                    )}
                  >
                    {showAdmin ? (
                      <>
                        Go to dashboard
                        <ArrowRight className="size-3.5" />
                      </>
                    ) : (
                      <>
                        <Lock className="size-3.5" />
                        Admin login for full tools
                      </>
                    )}
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Print · scan · measure — password holders only */}
        {showAdmin ? (
          <section className="mt-16">
            <div className="mb-6">
              <p className="text-xs font-medium tracking-wide text-primary uppercase">
                Admin only
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                Print · scan · measure
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Visible only when logged in. Public visitors never see this
                section or individual QR details.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: QrCode,
                  step: "01",
                  title: "Create",
                  body: "Name the placement, pick a channel, set any after-scan website.",
                  href: "/qr/new",
                  cta: "New QR",
                },
                {
                  icon: Zap,
                  step: "02",
                  title: "Print & place",
                  body: "Download PNG for newspapers, posters, pamphlets, or hoardings.",
                  href: "/dashboard",
                  cta: "Your QRs",
                },
                {
                  icon: BarChart3,
                  step: "03",
                  title: "Measure privately",
                  body: "Filter and sort every QR. Live scan counts stay on your dashboard.",
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
        ) : (
          <section className="mt-16">
            <Card className="border-dashed border-border/80 bg-card/50">
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <Lock className="size-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">Admin tools are locked</p>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    Dashboard, create QR, and placement research require a
                    password. You only see the totals above.
                  </p>
                </div>
                <Link
                  href="/login?next=/dashboard"
                  className={cn(buttonVariants({ size: "sm" }))}
                >
                  <Lock className="size-3.5" />
                  Admin login
                </Link>
              </CardContent>
            </Card>
          </section>
        )}
      </main>

      <footer className="border-t border-border/80 py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
          <p className="font-medium text-foreground/80">
            CodeScan · research attribution
          </p>
          <p>
            {data.ok
              ? `${data.totalQr.toLocaleString()} placements · ${data.totalScans.toLocaleString()} scans (totals only)`
              : "Offline QR attribution"}
          </p>
        </div>
      </footer>
    </div>
  );
}
