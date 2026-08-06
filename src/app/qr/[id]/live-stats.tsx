"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const PAGE_SIZE = 12;

type ScanRow = {
  id: string;
  scannedAt: string;
  userAgent: string | null;
};

type LivePayload = {
  scanCount: number;
  lastScannedAt: string | null;
  isActive: boolean;
  scans: ScanRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
};

function formatWhen(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function shortUa(ua: string | null): string {
  if (!ua) return "Unknown device";
  // Keep list readable; full UA still available via title tooltip
  if (ua.length <= 72) return ua;
  return `${ua.slice(0, 72)}…`;
}

export function LiveStats({
  qrId,
  initialCount,
  initialLastScanned,
  initialScans,
  initialTotal,
  initialIsActive = true,
}: {
  qrId: string;
  initialCount: number;
  initialLastScanned: string | null;
  initialScans: ScanRow[];
  /** Total scan events in DB (for pagination). Falls back to initialCount. */
  initialTotal?: number;
  initialIsActive?: boolean;
}) {
  const total0 = initialTotal ?? initialCount;
  const totalPages0 = Math.max(1, Math.ceil(total0 / PAGE_SIZE));

  const [data, setData] = useState<LivePayload>({
    scanCount: initialCount,
    lastScannedAt: initialLastScanned,
    isActive: initialIsActive,
    scans: initialScans,
    page: 1,
    pageSize: PAGE_SIZE,
    total: total0,
    totalPages: totalPages0,
    hasPrev: false,
    hasNext: total0 > PAGE_SIZE,
  });
  const [page, setPage] = useState(1);
  const [pulse, setPulse] = useState(false);
  const [live, setLive] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [loadingPage, setLoadingPage] = useState(false);

  // Keep latest page for the poll loop without re-creating the interval every click
  const pageRef = useRef(page);
  pageRef.current = page;
  const prevCountRef = useRef(initialCount);

  const applyPayload = useCallback((json: LivePayload) => {
    if (json.scanCount !== prevCountRef.current) {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 600);
      prevCountRef.current = json.scanCount;
    }
    setData(json);
    setUpdatedAt(new Date());

    // Clamp page if total shrank (e.g. delete) or API corrected page
    if (json.page !== pageRef.current) {
      setPage(json.page);
      pageRef.current = json.page;
    }
  }, []);

  const fetchPage = useCallback(
    async (targetPage: number, opts?: { quiet?: boolean }) => {
      if (!opts?.quiet) setLoadingPage(true);
      try {
        const res = await fetch(
          `/api/qr/${qrId}/live?page=${targetPage}`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const json = (await res.json()) as LivePayload;
        applyPayload(json);
      } catch {
        // keep last known
      } finally {
        if (!opts?.quiet) setLoadingPage(false);
      }
    },
    [qrId, applyPayload]
  );

  // Live poll: always refresh current page so counts + list stay in sync
  useEffect(() => {
    if (!live) return;

    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch(
          `/api/qr/${qrId}/live?page=${pageRef.current}`,
          { cache: "no-store" }
        );
        if (!res.ok || cancelled) return;
        const json = (await res.json()) as LivePayload;
        if (cancelled) return;
        applyPayload(json);
      } catch {
        // keep last known
      }
    }

    tick();
    const id = setInterval(tick, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [qrId, live, applyPayload]);

  // When user clicks Prev/Next, load that page immediately (skip first mount — SSR is page 1)
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    void fetchPage(page);
  }, [page, fetchPage]);

  const needsPagination = data.total > PAGE_SIZE;
  const from =
    data.total === 0 ? 0 : (data.page - 1) * data.pageSize + 1;
  const to = Math.min(data.page * data.pageSize, data.total);

  function goPrev() {
    if (!data.hasPrev || loadingPage) return;
    setPage((p) => Math.max(1, p - 1));
  }

  function goNext() {
    if (!data.hasNext || loadingPage) return;
    setPage((p) => p + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {live ? (
            <>
              <span className="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live · updates every 3s
              {updatedAt
                ? ` · last check ${updatedAt.toLocaleTimeString()}`
                : ""}
            </>
          ) : (
            "Live updates paused"
          )}
        </p>
        <button
          type="button"
          onClick={() => setLive((v) => !v)}
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          {live ? "Pause" : "Resume"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div
          className={`rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow ${
            pulse ? "ring-2 ring-primary/40 shadow-md" : ""
          }`}
        >
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Scans · this QR only
          </p>
          <p
            className={`mt-2 text-4xl font-semibold tracking-tight tabular-nums transition-transform ${
              pulse ? "scale-105" : ""
            }`}
          >
            {data.scanCount}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Auto-refreshes — no page reload
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Last scanned
          </p>
          <p className="mt-2 text-lg font-semibold tracking-tight">
            {formatWhen(data.lastScannedAt)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {data.isActive
              ? "Ready to accept scans"
              : "Disabled — scans are blocked"}
          </p>
        </div>
      </div>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Scan history
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              This placement only
              {needsPagination
                ? " · paginated when more than 12"
                : " · all scans on one page"}
            </p>
          </div>
          <p className="text-xs text-muted-foreground tabular-nums">
            {data.total === 0
              ? "No scans"
              : needsPagination
                ? `Showing ${from}–${to} of ${data.total}`
                : `Showing ${data.total} of ${data.total}`}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {data.scans.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm font-medium">No scans yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Open the scan URL on your phone. This number will jump without
                refreshing the page.
              </p>
            </div>
          ) : (
            <div
              className={
                loadingPage ? "opacity-60 transition-opacity" : undefined
              }
            >
              {/* Desktop / wide: table */}
              <div className="hidden sm:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/40 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    <tr>
                      <th className="w-14 px-5 py-3">#</th>
                      <th className="px-5 py-3">When</th>
                      <th className="px-5 py-3">Device</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.scans.map((s, i) => {
                      const rowNum = from + i;
                      return (
                        <tr key={s.id} className="hover:bg-muted/30">
                          <td className="px-5 py-3.5 tabular-nums text-muted-foreground">
                            {rowNum}
                          </td>
                          <td className="px-5 py-3.5 font-medium tabular-nums whitespace-nowrap">
                            {formatWhen(s.scannedAt)}
                          </td>
                          <td
                            className="max-w-md truncate px-5 py-3.5 text-xs text-muted-foreground"
                            title={s.userAgent ?? undefined}
                          >
                            {shortUa(s.userAgent)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile: stacked list */}
              <ul className="divide-y divide-border sm:hidden">
                {data.scans.map((s, i) => {
                  const rowNum = from + i;
                  return (
                    <li
                      key={s.id}
                      className="flex flex-col gap-1 px-5 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium tabular-nums text-muted-foreground">
                          {rowNum}
                        </span>
                        <span className="text-sm font-medium tabular-nums">
                          {formatWhen(s.scannedAt)}
                        </span>
                      </div>
                      <span
                        className="max-w-full truncate pl-10 text-xs text-muted-foreground"
                        title={s.userAgent ?? undefined}
                      >
                        {shortUa(s.userAgent)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Pagination only when more than one page of data */}
          {needsPagination ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/20 px-4 py-3">
              <p className="text-xs text-muted-foreground tabular-nums">
                Page {data.page} of {data.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!data.hasPrev || loadingPage}
                  onClick={goPrev}
                  className="gap-1"
                >
                  <ChevronLeft className="size-4" />
                  Prev
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!data.hasNext || loadingPage}
                  onClick={goNext}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
