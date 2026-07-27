import Link from "next/link";

import { logoutAction } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isAdminLockEnabled } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  channel?: string;
  campaign?: string;
  active?: string;
}>;

function formatWhen(date: Date | null) {
  if (!date) return "never";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
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

  const codes = allCodes.filter((q) => {
    if (channelFilter && q.channel !== channelFilter) return false;
    if (campaignFilter && (q.campaign ?? "") !== campaignFilter) return false;
    if (activeFilter === "yes" && !q.isActive) return false;
    if (activeFilter === "no" && q.isActive) return false;
    return true;
  });

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

  const hasFilters = Boolean(channelFilter || campaignFilter || activeFilter);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            QR Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Each <strong>row</strong> is one physical QR. The{" "}
            <strong>Scans</strong> column shows how many times{" "}
            <em>that</em> QR was used.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" render={<Link href="/" />}>
            Home
          </Button>
          <Button render={<Link href="/qr/new" />}>+ New QR</Button>
          {isAdminLockEnabled() ? (
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                Log out
              </Button>
            </form>
          ) : null}
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card size="sm">
          <CardHeader className="pb-0">
            <CardDescription>Total QR codes</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {allCodes.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {activeCount} active
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader className="pb-0">
            <CardDescription>Total scans</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {totalScansAll}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            All placements combined
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader className="pb-0">
            <CardDescription>Filtered scans</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {totalScansFiltered}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {hasFilters ? `${codes.length} matching codes` : "No filter applied"}
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader className="pb-0">
            <CardDescription>Top channel</CardDescription>
            <CardTitle className="truncate text-2xl capitalize">
              {topChannelEntry?.[0] ?? "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {topChannelEntry
              ? `${topChannelEntry[1]} scan${topChannelEntry[1] === 1 ? "" : "s"}`
              : "No scans yet"}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Narrow by channel, campaign, or active status (GET filters — shareable
            URL).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            method="get"
            className="flex flex-wrap items-end gap-3"
            action="/dashboard"
          >
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Channel</span>
              <select
                name="channel"
                defaultValue={channelFilter}
                className="block h-8 min-w-36 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">All channels</option>
                {channels.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Campaign</span>
              <select
                name="campaign"
                defaultValue={campaignFilter}
                className="block h-8 min-w-40 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">All campaigns</option>
                {campaigns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Active</span>
              <select
                name="active"
                defaultValue={activeFilter}
                className="block h-8 min-w-28 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Any</option>
                <option value="yes">Active only</option>
                <option value="no">Disabled only</option>
              </select>
            </label>

            <Button type="submit" size="sm">
              Apply
            </Button>
            {hasFilters ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                render={<Link href="/dashboard" />}
              >
                Clear
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Which QR was used?</CardTitle>
          <CardDescription>
            Look at the <strong>Label</strong> (e.g. “Poster – Mall Gate 2”) and
            its <strong>Scans</strong> number. If someone scans the pamphlet QR,
            only the pamphlet row increases — not the hoarding row. Open a row
            for the QR image, download PNG, and recent scan times.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {codes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {allCodes.length === 0 ? (
                <>
                  No QR codes yet.{" "}
                  <Link
                    href="/qr/new"
                    className="underline underline-offset-4"
                  >
                    Create one
                  </Link>
                  .
                </>
              ) : (
                <>
                  No codes match these filters.{" "}
                  <Link
                    href="/dashboard"
                    className="underline underline-offset-4"
                  >
                    Clear filters
                  </Link>
                  .
                </>
              )}
            </p>
          ) : (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2 pr-3 font-medium">Label</th>
                  <th className="pb-2 pr-3 font-medium">Channel</th>
                  <th className="pb-2 pr-3 font-medium">Location</th>
                  <th className="pb-2 pr-3 font-medium">Campaign</th>
                  <th className="pb-2 pr-3 font-medium">
                    Scans{" "}
                    <span className="font-normal text-muted-foreground">
                      (this QR)
                    </span>
                  </th>
                  <th className="pb-2 pr-3 font-medium">Last scanned</th>
                  <th className="pb-2 pr-3 font-medium">Active</th>
                  <th className="pb-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {codes.map((q) => (
                  <tr key={q.id} className="border-b border-border/60">
                    <td className="py-3 pr-3 font-medium">{q.label}</td>
                    <td className="py-3 pr-3 capitalize">{q.channel}</td>
                    <td className="py-3 pr-3">{q.location ?? "—"}</td>
                    <td className="py-3 pr-3">{q.campaign ?? "—"}</td>
                    <td className="py-3 pr-3">
                      <span className="inline-flex min-w-8 justify-center rounded-md bg-primary/10 px-2 py-0.5 tabular-nums font-semibold">
                        {q.scanCount}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-xs text-muted-foreground">
                      {formatWhen(q.lastScannedAt)}
                    </td>
                    <td className="py-3 pr-3">
                      {q.isActive ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          yes
                        </span>
                      ) : (
                        <span className="text-muted-foreground">no</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/qr/${q.id}`}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
