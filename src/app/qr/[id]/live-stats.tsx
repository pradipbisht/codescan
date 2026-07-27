"use client";

import { useEffect, useState } from "react";

type LivePayload = {
  scanCount: number;
  lastScannedAt: string | null;
  isActive: boolean;
  scans: {
    id: string;
    scannedAt: string;
    userAgent: string | null;
  }[];
};

function formatWhen(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function LiveStats({
  qrId,
  initialCount,
  initialLastScanned,
  initialScans,
}: {
  qrId: string;
  initialCount: number;
  initialLastScanned: string | null;
  initialScans: LivePayload["scans"];
}) {
  const [data, setData] = useState<LivePayload>({
    scanCount: initialCount,
    lastScannedAt: initialLastScanned,
    isActive: true,
    scans: initialScans,
  });
  const [pulse, setPulse] = useState(false);
  const [live, setLive] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!live) return;

    let cancelled = false;
    let prevCount = initialCount;

    async function tick() {
      try {
        const res = await fetch(`/api/qr/${qrId}/live`, {
          cache: "no-store",
        });
        if (!res.ok || cancelled) return;
        const json = (await res.json()) as LivePayload;
        if (cancelled) return;

        if (json.scanCount !== prevCount) {
          setPulse(true);
          setTimeout(() => setPulse(false), 600);
          prevCount = json.scanCount;
        }
        setData(json);
        setUpdatedAt(new Date());
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
  }, [qrId, live, initialCount]);

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
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Recent scans
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Live list · this placement only
            </p>
          </div>
          <p className="text-xs text-muted-foreground tabular-nums">
            Showing {data.scans.length}
            {data.scanCount > data.scans.length ? ` of ${data.scanCount}` : ""}
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
            <ul className="divide-y divide-border">
              {data.scans.map((s, i) => (
                <li
                  key={s.id}
                  className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium tabular-nums text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium tabular-nums">
                      {formatWhen(s.scannedAt)}
                    </span>
                  </div>
                  <span className="max-w-xl truncate pl-10 text-xs text-muted-foreground sm:pl-0 sm:text-right">
                    {s.userAgent ?? "Unknown device"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
