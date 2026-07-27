import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  MapPin,
  Megaphone,
  QrCode,
} from "lucide-react";
import QRCode from "qrcode";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { channelLabel } from "@/lib/channels";
import { prisma } from "@/lib/prisma";
import { buildScanUrl } from "@/lib/qr-url";
import { cn } from "@/lib/utils";

import { toggleQrActive } from "./actions";
import { DeleteQrButton } from "./delete-button";
import { LiveStats } from "./live-stats";
import { QrShareActions } from "./qr-share-actions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatWhen(date: Date | null) {
  if (!date) return "Never";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function MetaTile({
  label,
  value,
  mono,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <div
        className={cn(
          "mt-2 text-sm break-words text-foreground",
          mono && "font-mono text-xs leading-relaxed"
        )}
      >
        {value}
      </div>
    </div>
  );
}

export default async function QrDetailPage({ params }: PageProps) {
  const { id } = await params;

  const qr = await prisma.qrCode.findUnique({
    where: { id },
    include: {
      scans: {
        orderBy: { scannedAt: "desc" },
        take: 12,
      },
    },
  });
  if (!qr) notFound();

  const scanUrl = await buildScanUrl(qr.token);
  const isLocalhostQr = scanUrl.includes("localhost");

  const qrDataUrl = await QRCode.toDataURL(scanUrl, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: "M",
  });

  const safeFile = qr.label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const fileName = `qr-${safeFile || qr.channel}-${qr.id.slice(0, 8)}.png`;

  const qrId = qr.id;
  const currentlyActive = qr.isActive;

  async function onToggle() {
    "use server";
    await toggleQrActive(qrId, !currentlyActive);
  }

  return (
    <div className="min-h-full bg-muted/20">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4">
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "gap-1.5"
            )}
          >
            <ArrowLeft className="size-4" />
            Dashboard
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/qr/${qr.id}/edit`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Edit
            </Link>
            <Link
              href="/qr/new"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              New QR
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-10">
        {/* Title block */}
        <div className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
              {channelLabel(qr.channel)}
            </span>
            {qr.isActive ? (
              <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Disabled
              </span>
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {qr.label}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {qr.campaign ? (
              <span className="inline-flex items-center gap-1.5">
                <Megaphone className="size-3.5 shrink-0" />
                {qr.campaign}
              </span>
            ) : null}
            {qr.location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" />
                {qr.location}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0" />
              Created {formatWhen(qr.createdAt)}
            </span>
          </p>
        </div>

        {isLocalhostQr ? (
          <div
            className="mb-8 rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm"
            role="alert"
          >
            <p className="font-medium text-destructive">
              This QR points to localhost — phones cannot open it
            </p>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Create and download QRs only from{" "}
              <a
                className="font-medium text-foreground underline underline-offset-4"
                href="https://codescan-inky.vercel.app/qr/new"
              >
                codescan-inky.vercel.app
              </a>
              . Old localhost PNGs will never work on other devices.
            </p>
          </div>
        ) : null}

        {/* Main grid: QR | stats + actions */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-start">
          {/* QR column */}
          <Card className="overflow-hidden bg-card shadow-sm">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <QrCode className="size-4 text-primary" />
                </span>
                <div>
                  <CardTitle className="text-base">Print this QR</CardTitle>
                  <CardDescription className="text-xs">
                    Download the image for posters &amp; newspaper ads
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-5 pt-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt={`QR code for ${qr.label}`}
                width={280}
                height={280}
                className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-border"
              />
              <QrShareActions
                qrDataUrl={qrDataUrl}
                scanUrl={scanUrl}
                fileName={fileName}
                label={qr.label}
              />
            </CardContent>
          </Card>

          {/* Right column — static details */}
          <div className="space-y-6">
            {/* Scan URL */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Scan URL (encoded in the QR)
              </p>
              <p className="mt-3 break-all rounded-xl bg-muted/60 px-3 py-3 font-mono text-xs leading-relaxed">
                {scanUrl}
              </p>
            </div>

            {/* Placement */}
            <div>
              <h2 className="mb-3 text-sm font-semibold tracking-tight">
                Placement
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <MetaTile label="Channel" value={channelLabel(qr.channel)} />
                <MetaTile
                  label="Status"
                  value={qr.isActive ? "Active" : "Disabled"}
                />
                <MetaTile label="Campaign" value={qr.campaign ?? "—"} />
                <MetaTile
                  label="Location / content"
                  value={qr.location ?? "—"}
                />
                <MetaTile
                  label="After-scan URL"
                  value={
                    <a
                      href={
                        qr.destinationPath.startsWith("http")
                          ? qr.destinationPath
                          : qr.destinationPath
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-start gap-1 underline-offset-4 hover:underline"
                    >
                      <span className="break-all">{qr.destinationPath}</span>
                      <ExternalLink className="mt-0.5 size-3 shrink-0 opacity-60" />
                    </a>
                  }
                  mono
                />
                <MetaTile label="Created" value={formatWhen(qr.createdAt)} />
              </div>
            </div>

            {/* UTM */}
            <div>
              <h2 className="mb-1 text-sm font-semibold tracking-tight">
                Marketing UTMs
              </h2>
              <p className="mb-3 text-xs text-muted-foreground">
                Appended after scan so analytics can attribute print ads.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <MetaTile
                  label="utm_source"
                  value={qr.utmSource ?? "—"}
                  mono
                />
                <MetaTile
                  label="utm_medium"
                  value={qr.utmMedium ?? "—"}
                  mono
                />
                <MetaTile
                  label="utm_campaign"
                  value={qr.utmCampaign ?? "—"}
                  mono
                />
                <MetaTile
                  label="utm_content"
                  value={qr.utmContent ?? "—"}
                  mono
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Manage this QR</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Edit destination/UTMs anytime. Token (printed QR) stays the
                  same.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={onToggle}>
                  <Button type="submit" variant="secondary" size="sm">
                    {qr.isActive ? "Disable" : "Enable"}
                  </Button>
                </form>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={`/qr/${qr.id}/edit`} />}
                >
                  Edit details
                </Button>
                <DeleteQrButton id={qr.id} label={qr.label} size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Live scan counter micro-UI — no full page refresh */}
        <section className="mt-10 border-t border-border pt-10">
          <LiveStats
            qrId={qr.id}
            initialCount={qr.scanCount}
            initialLastScanned={qr.lastScannedAt?.toISOString() ?? null}
            initialScans={qr.scans.map((s) => ({
              id: s.id,
              scannedAt: s.scannedAt.toISOString(),
              userAgent: s.userAgent,
            }))}
          />
        </section>
      </main>
    </div>
  );
}
