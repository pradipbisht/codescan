import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  ExternalLink,
  Link2,
  MapPin,
  Megaphone,
  QrCode,
  Radio,
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
import { channelLabel } from "@/lib/qr/channels";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatWhen(date: Date | null) {
  if (!date) return "Never";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatRelative(date: Date | null) {
  if (!date) return "No scans yet";
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatWhen(date);
}

async function loadHomeData() {
  try {
    const [
      totalQr,
      activeCount,
      scanSum,
      topCodes,
      latestCodes,
      recentScans,
      channelRows,
    ] = await Promise.all([
      prisma.qrCode.count(),
      prisma.qrCode.count({ where: { isActive: true } }),
      prisma.qrCode.aggregate({ _sum: { scanCount: true } }),
      prisma.qrCode.findMany({
        orderBy: [{ scanCount: "desc" }, { createdAt: "desc" }],
        take: 5,
      }),
      prisma.qrCode.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.qrScan.findMany({
        orderBy: { scannedAt: "desc" },
        take: 8,
        include: {
          qrCode: {
            select: { id: true, label: true, channel: true, campaign: true },
          },
        },
      }),
      prisma.qrCode.groupBy({
        by: ["channel"],
        _sum: { scanCount: true },
        orderBy: { _sum: { scanCount: "desc" } },
        take: 1,
      }),
    ]);

    const totalScans = scanSum._sum.scanCount ?? 0;
    const topChannel: [string, number] | undefined = channelRows[0]
      ? [channelRows[0].channel, channelRows[0]._sum.scanCount ?? 0]
      : undefined;

    return {
      ok: true as const,
      totalQr,
      activeCount,
      totalScans,
      topCodes,
      latestCodes,
      recentScans,
      topChannel,
    };
  } catch {
    return {
      ok: false as const,
      totalQr: 0,
      activeCount: 0,
      totalScans: 0,
      topCodes: [] as Awaited<ReturnType<typeof prisma.qrCode.findMany>>,
      latestCodes: [] as Awaited<ReturnType<typeof prisma.qrCode.findMany>>,
      recentScans: [] as Array<{
        id: string;
        scannedAt: Date;
        qrCode: {
          id: string;
          label: string;
          channel: string;
          campaign: string | null;
        };
      }>,
      topChannel: undefined as [string, number] | undefined,
    };
  }
}

export default async function Home() {
  const data = await loadHomeData();
  const featured = data.topCodes[0] ?? data.latestCodes[0] ?? null;

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
                Live offline attribution
                {data.ok && data.totalScans > 0 ? (
                  <span className="text-foreground">
                    · {data.totalScans.toLocaleString()} scans tracked
                  </span>
                ) : null}
              </p>

              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl sm:leading-[1.1]">
                Know which poster, paper, or hoarding{" "}
                <span className="bg-gradient-to-r from-sky-700 via-violet-700 to-fuchsia-700 bg-clip-text text-transparent dark:from-sky-300 dark:via-violet-300 dark:to-fuchsia-300">
                  actually drives visits
                </span>
              </h1>

              <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Print a unique QR per placement. Every scan is counted on your
                dashboard, then visitors land on any website you choose — with
                UTMs for marketing tools.
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

              {/* Live stat strip */}
              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                  {
                    label: "Top channel",
                    value: data.topChannel
                      ? channelLabel(data.topChannel[0])
                      : "—",
                    icon: Radio,
                    text: true,
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
                    <p
                      className={cn(
                        "mt-1.5 font-semibold tracking-tight",
                        stat.text
                          ? "truncate text-sm capitalize"
                          : "text-2xl tabular-nums"
                      )}
                    >
                      {typeof stat.value === "number"
                        ? stat.value.toLocaleString()
                        : stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured live card from real data */}
            <div className="relative mx-auto w-full max-w-md">
              <div
                aria-hidden
                className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-sky-400/20 via-violet-400/10 to-fuchsia-400/20 blur-xl"
              />
              <Card className="glass-card relative overflow-hidden border-border/70 shadow-xl">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-violet-500 to-fuchsia-500" />
                <CardHeader className="border-b border-border/60 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 text-white shadow-sm dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900">
                        <Activity className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <CardTitle className="truncate text-base">
                          {featured?.label ?? "Your first placement"}
                        </CardTitle>
                        <CardDescription className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
                          {featured ? (
                            <>
                              <span className="rounded-full bg-muted px-2 py-0.5 capitalize">
                                {channelLabel(featured.channel)}
                              </span>
                              {featured.isActive ? (
                                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-700 dark:text-emerald-400">
                                  Active
                                </span>
                              ) : (
                                <span className="rounded-full bg-muted px-2 py-0.5">
                                  Disabled
                                </span>
                              )}
                            </>
                          ) : (
                            <span>Create a QR to see live stats here</span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="rounded-xl bg-primary/10 px-3 py-2 text-center">
                      <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                        Scans
                      </p>
                      <p className="text-2xl font-semibold tabular-nums leading-none">
                        {(featured?.scanCount ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-5">
                  {featured ? (
                    <>
                      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-xs">
                        <dt className="flex items-center gap-1 text-muted-foreground">
                          <Megaphone className="size-3.5" />
                          Campaign
                        </dt>
                        <dd className="truncate font-medium">
                          {featured.campaign ?? "—"}
                        </dd>
                        <dt className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="size-3.5" />
                          Location
                        </dt>
                        <dd className="truncate font-medium">
                          {featured.location ?? "—"}
                        </dd>
                        <dt className="text-muted-foreground">Last scan</dt>
                        <dd className="font-medium">
                          {formatRelative(featured.lastScannedAt)}
                        </dd>
                        <dt className="text-muted-foreground">Destination</dt>
                        <dd className="truncate font-mono text-[11px]">
                          {featured.destinationPath}
                        </dd>
                      </dl>
                      <Link
                        href={`/qr/${featured.id}`}
                        className={cn(
                          buttonVariants({ size: "sm" }),
                          "w-full shadow-sm"
                        )}
                      >
                        Open placement
                        <ExternalLink className="size-3.5" />
                      </Link>
                    </>
                  ) : (
                    <div className="space-y-3 py-2 text-center">
                      <p className="text-sm text-muted-foreground">
                        No placements yet. Create a trackable QR for a poster,
                        newspaper, or hoarding.
                      </p>
                      <Link
                        href="/qr/new"
                        className={cn(buttonVariants({ size: "sm" }))}
                      >
                        Create your first QR
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────── */}
        <section className="mt-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-wide text-primary uppercase">
                How it works
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                Print · scan · measure
              </h2>
            </div>
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
                title: "Measure live",
                body: "Each scan increments the right QR. Dashboard counts update without a full refresh.",
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

        {/* ── Real data: top + recent ──────────────────────────── */}
        {(data.topCodes.length > 0 || data.recentScans.length > 0) && (
          <section className="mt-16 grid gap-8 lg:grid-cols-2">
            {/* Top placements */}
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium tracking-wide text-primary uppercase">
                    Performance
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">
                    Top placements
                  </h2>
                </div>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-2">
                {data.topCodes.length === 0 ? (
                  <Card className="bg-card/90">
                    <CardContent className="py-8 text-center text-sm text-muted-foreground">
                      Scans will rank placements here.
                    </CardContent>
                  </Card>
                ) : (
                  data.topCodes.map((q, i) => {
                    const max = Math.max(
                      data.topCodes[0]?.scanCount ?? 1,
                      1
                    );
                    const pct = Math.round((q.scanCount / max) * 100);
                    return (
                      <Link
                        key={q.id}
                        href={`/qr/${q.id}`}
                        className="block rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm transition hover:border-border hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-[11px] font-medium text-muted-foreground">
                                {i + 1}
                              </span>
                              <p className="truncate font-medium">{q.label}</p>
                            </div>
                            <p className="mt-1 pl-8 text-xs text-muted-foreground">
                              {channelLabel(q.channel)}
                              {q.campaign ? ` · ${q.campaign}` : ""}
                              {q.location ? ` · ${q.location}` : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold tabular-nums leading-none">
                              {q.scanCount.toLocaleString()}
                            </p>
                            <p className="mt-0.5 text-[10px] tracking-wide text-muted-foreground uppercase">
                              scans
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

            {/* Live feed */}
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium tracking-wide text-primary uppercase">
                    Activity
                  </p>
                  <h2 className="mt-1 flex items-center gap-2 text-lg font-semibold tracking-tight">
                    Recent scans
                    <Sparkles className="size-4 text-amber-500" />
                  </h2>
                </div>
              </div>
              <Card className="border-border/80 bg-card/90 shadow-sm">
                <CardContent className="divide-y divide-border p-0">
                  {data.recentScans.length === 0 ? (
                    <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                      No scans yet. Open a scan URL on your phone to see events
                      here.
                    </p>
                  ) : (
                    data.recentScans.map((scan) => (
                      <Link
                        key={scan.id}
                        href={`/qr/${scan.qrCode.id}`}
                        className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-muted/40"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          <Activity className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {scan.qrCode.label}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {channelLabel(scan.qrCode.channel)}
                            {scan.qrCode.campaign
                              ? ` · ${scan.qrCode.campaign}`
                              : ""}
                          </p>
                        </div>
                        <time className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          {formatRelative(scan.scannedAt)}
                        </time>
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* ── Latest QRs ───────────────────────────────────────── */}
        {data.latestCodes.length > 0 ? (
          <section className="mt-16">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium tracking-wide text-primary uppercase">
                  Library
                </p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">
                  Recently created
                </h2>
              </div>
              <Link
                href="/qr/new"
                className={cn(buttonVariants({ size: "sm" }), "shadow-sm")}
              >
                Create QR
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {data.latestCodes.map((q) => (
                <Link
                  key={q.id}
                  href={`/qr/${q.id}`}
                  className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm font-medium leading-snug">
                      {q.label}
                    </p>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                        q.isActive
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {q.isActive ? "Active" : "Off"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {channelLabel(q.channel)}
                  </p>
                  <div className="mt-3 flex items-end justify-between border-t border-border/60 pt-3">
                    <span className="text-[11px] text-muted-foreground">
                      {formatRelative(q.createdAt)}
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {q.scanCount}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        scans
                      </span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <footer className="border-t border-border/80 py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
          <p className="font-medium text-foreground/80">
            CodeScan · print · scan · measure
          </p>
          <p>
            {data.ok
              ? `${data.totalQr} placements · ${data.totalScans.toLocaleString()} scans`
              : "Offline QR attribution"}
          </p>
        </div>
      </footer>
    </div>
  );
}
