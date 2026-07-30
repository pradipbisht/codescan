import Link from "next/link";
import {
  ArrowDownWideNarrow,
  BarChart3,
  QrCode,
  Radio,
  Search,
  Sparkles,
} from "lucide-react";

import { logoutAction } from "@/app/login/actions";
import { DeleteQrButton } from "@/app/qr/[id]/delete-button";
import { SiteHeader } from "@/components/site-header";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isAdminLockEnabled } from "@/lib/auth/admin";
import { channelLabel } from "@/lib/qr/channels";
import { prisma } from "@/lib/db/prisma";
import { cn } from "@/lib/utils";

import { LiveCountsBridge } from "./live-counts";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  channel?: string;
  campaign?: string;
  active?: string;
  q?: string;
  sort?: string;
}>;

type SortKey =
  | "newest"
  | "oldest"
  | "scans_desc"
  | "scans_asc"
  | "label_asc"
  | "label_desc"
  | "last_scan";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "scans_desc", label: "Most scans" },
  { value: "scans_asc", label: "Least scans" },
  { value: "last_scan", label: "Last scanned" },
  { value: "label_asc", label: "Name A–Z" },
  { value: "label_desc", label: "Name Z–A" },
];

function formatWhen(date: Date | null) {
  if (!date) return "Never";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function parseSort(raw: string | undefined): SortKey {
  const v = (raw || "newest").trim() as SortKey;
  return SORT_OPTIONS.some((o) => o.value === v) ? v : "newest";
}

function sortCodes<
  T extends {
    createdAt: Date;
    scanCount: number;
    label: string;
    lastScannedAt: Date | null;
  },
>(list: T[], sort: SortKey): T[] {
  const copy = [...list];
  copy.sort((a, b) => {
    switch (sort) {
      case "oldest":
        return a.createdAt.getTime() - b.createdAt.getTime();
      case "scans_desc":
        return b.scanCount - a.scanCount || b.createdAt.getTime() - a.createdAt.getTime();
      case "scans_asc":
        return a.scanCount - b.scanCount || b.createdAt.getTime() - a.createdAt.getTime();
      case "label_asc":
        return a.label.localeCompare(b.label);
      case "label_desc":
        return b.label.localeCompare(a.label);
      case "last_scan": {
        const at = a.lastScannedAt?.getTime() ?? 0;
        const bt = b.lastScannedAt?.getTime() ?? 0;
        return bt - at || b.scanCount - a.scanCount;
      }
      case "newest":
      default:
        return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });
  return copy;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const channelFilter = params.channel?.trim() || "";
  const campaignFilter = params.campaign?.trim() || "";
  const activeFilter = params.active?.trim() || "";
  const search = params.q?.trim().toLowerCase() || "";
  const sort = parseSort(params.sort);

  const allCodes = await prisma.qrCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  const channels = Array.from(
    new Set(allCodes.map((q) => q.channel).filter(Boolean))
  ).sort();
  const campaigns = Array.from(
    new Set(
      allCodes
        .map((q) => q.campaign)
        .filter((c): c is string => Boolean(c && c.trim()))
    )
  ).sort();

  const filtered = allCodes.filter((q) => {
    if (channelFilter && q.channel !== channelFilter) return false;
    if (campaignFilter && (q.campaign ?? "") !== campaignFilter) return false;
    if (activeFilter === "yes" && !q.isActive) return false;
    if (activeFilter === "no" && q.isActive) return false;
    if (search) {
      const hay =
        `${q.label} ${q.channel} ${q.location ?? ""} ${q.campaign ?? ""} ${q.destinationPath ?? ""}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });

  const codes = sortCodes(filtered, sort);

  const totalScansAll = allCodes.reduce((sum, q) => sum + q.scanCount, 0);
  const totalScansFiltered = codes.reduce((sum, q) => sum + q.scanCount, 0);
  const activeCount = allCodes.filter((q) => q.isActive).length;

  const scansByChannel = allCodes.reduce<Record<string, number>>((acc, q) => {
    acc[q.channel] = (acc[q.channel] ?? 0) + q.scanCount;
    return acc;
  }, {});
  const topChannelEntry = Object.entries(scansByChannel).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const hasFilters = Boolean(
    channelFilter || campaignFilter || activeFilter || search || sort !== "newest"
  );

  return (
    <div className="page-shell min-h-full">
      <SiteHeader active="dashboard" />

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-primary uppercase">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              Live dashboard · private
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Placement performance
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Filter and sort every QR.{" "}
              <strong className="text-foreground">Scans</strong> update live —
              no full page refresh. Public visitors only see totals on the home
              page.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/qr/new"
              className={cn(buttonVariants({ size: "sm" }), "shadow-sm")}
            >
              Create QR
            </Link>
            {isAdminLockEnabled() ? (
              <form action={logoutAction}>
                <Button type="submit" variant="outline" size="sm">
                  Log out
                </Button>
              </form>
            ) : null}
          </div>
        </div>

        <LiveCountsBridge />

        {/* Stats */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            size="sm"
            className="border-border/80 bg-card/95 shadow-sm transition hover:shadow-md"
          >
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardDescription>Total QR codes</CardDescription>
                <QrCode className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl tabular-nums">
                {allCodes.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {activeCount} active · {allCodes.length - activeCount} disabled
            </CardContent>
          </Card>

          <Card
            size="sm"
            className="border-border/80 bg-gradient-to-br from-card to-sky-50/80 shadow-sm transition hover:shadow-md dark:to-sky-950/20"
          >
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardDescription>Total scans</CardDescription>
                <BarChart3 className="size-4 text-sky-600 dark:text-sky-400" />
              </div>
              <CardTitle
                className="text-3xl tabular-nums"
                data-live-total-scans
              >
                {totalScansAll}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              All placements combined · live
            </CardContent>
          </Card>

          <Card
            size="sm"
            className="border-border/80 bg-card/95 shadow-sm transition hover:shadow-md"
          >
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardDescription>In this view</CardDescription>
                <Sparkles className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl tabular-nums">
                {totalScansFiltered}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {codes.length} QR{codes.length === 1 ? "" : "s"} after filters
            </CardContent>
          </Card>

          <Card
            size="sm"
            className="border-border/80 bg-card/95 shadow-sm transition hover:shadow-md"
          >
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardDescription>Top channel</CardDescription>
                <Radio className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="truncate text-2xl capitalize">
                {topChannelEntry ? channelLabel(topChannelEntry[0]) : "—"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {topChannelEntry
                ? `${topChannelEntry[1]} scan${topChannelEntry[1] === 1 ? "" : "s"}`
                : "No scans yet"}
            </CardContent>
          </Card>
        </div>

        {/* Filters + sort */}
        <Card className="mb-6 overflow-hidden border-border/80 bg-card/95 shadow-sm">
          <CardHeader className="border-b border-border/60 pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Search className="size-4" />
                </span>
                <div>
                  <CardTitle className="text-base">Filter &amp; sort</CardTitle>
                  <CardDescription className="text-xs">
                    Search, channel, campaign, status, and order
                  </CardDescription>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                <ArrowDownWideNarrow className="size-3.5" />
                {codes.length} / {allCodes.length} shown
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-(--card-spacing)">
            <form
              method="get"
              action="/dashboard"
              className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end"
            >
              <label className="min-w-40 flex-1 space-y-1 text-sm">
                <span className="text-muted-foreground">Search</span>
                <input
                  name="q"
                  defaultValue={params.q?.trim() || ""}
                  placeholder="Name, channel, campaign, destination…"
                  className="block h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Channel</span>
                <select
                  name="channel"
                  defaultValue={channelFilter}
                  className="block h-9 min-w-36 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">All</option>
                  {channels.map((c) => (
                    <option key={c} value={c}>
                      {channelLabel(c)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Campaign</span>
                <select
                  name="campaign"
                  defaultValue={campaignFilter}
                  className="block h-9 min-w-40 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">All</option>
                  {campaigns.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Status</span>
                <select
                  name="active"
                  defaultValue={activeFilter}
                  className="block h-9 min-w-32 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Any</option>
                  <option value="yes">Active</option>
                  <option value="no">Disabled</option>
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Sort by</span>
                <select
                  name="sort"
                  defaultValue={sort}
                  className="block h-9 min-w-40 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  Apply
                </Button>
                {hasFilters ? (
                  <Link
                    href="/dashboard"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" })
                    )}
                  >
                    Clear
                  </Link>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Empty */}
        {codes.length === 0 ? (
          <Card className="bg-card shadow-sm">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <QrCode className="size-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">
                  {allCodes.length === 0
                    ? "No QR codes yet"
                    : "No matches for these filters"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {allCodes.length === 0
                    ? "Create your first placement QR for a poster or newspaper ad."
                    : "Try clearing filters or a different search."}
                </p>
              </div>
              <Link
                href={allCodes.length === 0 ? "/qr/new" : "/dashboard"}
                className={cn(buttonVariants({ size: "sm" }))}
              >
                {allCodes.length === 0 ? "Create QR" : "Clear filters"}
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {codes.map((q, index) => (
              <Card
                key={q.id}
                className={cn(
                  "group border-border/80 bg-card/95 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md",
                  !q.isActive && "opacity-75"
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          #{index + 1}
                        </span>
                        <CardTitle className="truncate text-base">
                          {q.label}
                        </CardTitle>
                      </div>
                      <CardDescription className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                          {channelLabel(q.channel)}
                        </span>
                        {q.isActive ? (
                          <span className="inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-400">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            Disabled
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-sky-500/15 to-violet-500/15 px-2.5 py-1.5 text-center ring-1 ring-border/60">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Scans
                      </p>
                      <p
                        className="text-xl font-semibold tabular-nums leading-none"
                        data-live-count={q.id}
                      >
                        {q.scanCount}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                    <dt className="text-muted-foreground">Campaign</dt>
                    <dd className="truncate">{q.campaign ?? "—"}</dd>
                    <dt className="text-muted-foreground">Location</dt>
                    <dd className="truncate">{q.location ?? "—"}</dd>
                    <dt className="text-muted-foreground">Last scan</dt>
                    <dd data-live-last={q.id}>
                      {formatWhen(q.lastScannedAt)}
                    </dd>
                    <dt className="text-muted-foreground">UTM</dt>
                    <dd className="truncate font-mono">
                      {q.utmSource ?? "—"} / {q.utmMedium ?? "—"}
                    </dd>
                  </dl>

                  <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                    <Link
                      href={`/qr/${q.id}`}
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "flex-1 sm:flex-none"
                      )}
                    >
                      Open / QR
                    </Link>
                    <Link
                      href={`/qr/${q.id}/edit`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" })
                      )}
                    >
                      Edit
                    </Link>
                    <DeleteQrButton
                      id={q.id}
                      label={q.label}
                      variant="ghost"
                      size="sm"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
