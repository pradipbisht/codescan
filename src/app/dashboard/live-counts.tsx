"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  scanCount: number;
  lastScannedAt: string | null;
  isActive: boolean;
};

/**
 * Micro frontend: polls scan counts and injects into cards via data-qr-id.
 * Keeps dashboard numbers fresh without full page reload.
 */
export function LiveCountsBridge() {
  const [live, setLive] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!live) return;

    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/qr/live-all", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const json = (await res.json()) as {
          items: Item[];
          totalScans: number;
          totalCodes: number;
        };

        for (const item of json.items) {
          const countEls = document.querySelectorAll(
            `[data-live-count="${item.id}"]`
          );
          countEls.forEach((el) => {
            const prev = el.textContent?.trim();
            const next = String(item.scanCount);
            if (prev !== next) {
              el.textContent = next;
              el.classList.add("animate-pulse");
              setTimeout(() => el.classList.remove("animate-pulse"), 500);
            }
          });

          const lastEls = document.querySelectorAll(
            `[data-live-last="${item.id}"]`
          );
          lastEls.forEach((el) => {
            el.textContent = item.lastScannedAt
              ? new Date(item.lastScannedAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "Never";
          });
        }

        const totalEl = document.querySelector("[data-live-total-scans]");
        if (totalEl) totalEl.textContent = String(json.totalScans);

        if (!cancelled) setTick((t) => t + 1);
      } catch {
        // ignore
      }
    }

    poll();
    const id = setInterval(poll, 4000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [live]);

  return (
    <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground shadow-sm">
      <span>
        {live ? (
          <>
            <span className="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live counts · every 4s
            {tick > 0 ? ` · refreshed ×${tick}` : ""}
          </>
        ) : (
          "Live counts paused"
        )}
      </span>
      <button
        type="button"
        className="underline-offset-4 hover:underline"
        onClick={() => setLive((v) => !v)}
      >
        {live ? "Pause" : "Resume"}
      </button>
    </div>
  );
}
