import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { buildScanUrl } from "@/lib/qr-url";

import { toggleQrActive } from "./actions";
import { DeleteQrButton } from "./delete-button";
import { QrShareActions } from "./qr-share-actions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatWhen(date: Date | null) {
  if (!date) return "never";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function QrDetailPage({ params }: PageProps) {
  const { id } = await params;

  const qr = await prisma.qrCode.findUnique({
    where: { id },
    include: {
      scans: {
        orderBy: { scannedAt: "desc" },
        take: 10,
      },
    },
  });
  if (!qr) notFound();

  const scanUrl = await buildScanUrl(qr.token);
  const isLocalhostQr = scanUrl.includes("localhost");

  // Higher-res PNG for print / WhatsApp / designer handoff
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
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{qr.label}</h1>
          <p className="mt-1 text-sm capitalize text-muted-foreground">
            {qr.channel}
            {qr.location ? ` · ${qr.location}` : ""}
            {qr.campaign ? ` · ${qr.campaign}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" render={<Link href="/dashboard" />}>
            Dashboard
          </Button>
          <Button variant="outline" render={<Link href={`/qr/${qr.id}/edit`} />}>
            Edit
          </Button>
          <Button render={<Link href="/qr/new" />}>New QR</Button>
        </div>
      </div>

      {isLocalhostQr ? (
        <div
          className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm"
          role="alert"
        >
          <p className="font-medium text-destructive">
            This QR points to localhost — phones cannot open it
          </p>
          <p className="mt-1 text-muted-foreground">
            You opened the app on <code className="text-xs">localhost</code>.
            For a real QR, open{" "}
            <a
              className="underline underline-offset-4"
              href="https://codescan-inky.vercel.app/qr/new"
            >
              https://codescan-inky.vercel.app/qr/new
            </a>
            , create a <strong>new</strong> QR there, and download that PNG.
            Old localhost PNGs never work on other devices.
          </p>
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
          <p className="font-medium">Will I know which QR was used?</p>
          <p className="mt-1 text-muted-foreground">
            <strong>Yes.</strong> This QR has a unique secret link. When
            someone scans <em>this</em> image, only this row’s count goes up.
            Check{" "}
            <Link href="/dashboard" className="underline underline-offset-4">
              Dashboard → Scans column
            </Link>{" "}
            for <strong>{qr.label}</strong> (currently{" "}
            <span className="tabular-nums font-medium text-foreground">
              {qr.scanCount}
            </span>
            ).
          </p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
        <Card className="items-center">
          <CardHeader className="w-full">
            <CardTitle>QR image (share this)</CardTitle>
            <CardDescription>
              Download or share the <strong>picture</strong> for posters /
              pamphlets. The link alone is not the print asset.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt={`QR code for ${qr.label}`}
              width={320}
              height={320}
              className="rounded-lg bg-white p-2 shadow-sm ring-1 ring-border"
            />
            <QrShareActions
              qrDataUrl={qrDataUrl}
              scanUrl={scanUrl}
              fileName={fileName}
              label={qr.label}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tracking details</CardTitle>
            <CardDescription>
              Unique token for this placement only — not shared with other QRs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="mb-1 font-medium text-muted-foreground">
                Scan URL (inside the QR)
              </p>
              <p className="break-all rounded-lg bg-muted/50 p-2 font-mono text-xs">
                {scanUrl}
              </p>
            </div>

            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              <dt className="text-muted-foreground">Scans (this QR only)</dt>
              <dd className="text-lg tabular-nums font-semibold">
                {qr.scanCount}
              </dd>

              <dt className="text-muted-foreground">Last scanned</dt>
              <dd>{formatWhen(qr.lastScannedAt)}</dd>

              <dt className="text-muted-foreground">Active</dt>
              <dd>{qr.isActive ? "yes" : "no"}</dd>

              <dt className="text-muted-foreground">Destination</dt>
              <dd className="font-mono text-xs">
                <Link
                  href={qr.destinationPath}
                  className="underline underline-offset-4"
                >
                  {qr.destinationPath}
                </Link>
              </dd>

              <dt className="text-muted-foreground">Campaign</dt>
              <dd>{qr.campaign ?? "—"}</dd>

              <dt className="text-muted-foreground">UTM source</dt>
              <dd className="font-mono text-xs">{qr.utmSource ?? "—"}</dd>

              <dt className="text-muted-foreground">UTM medium</dt>
              <dd className="font-mono text-xs">{qr.utmMedium ?? "—"}</dd>

              <dt className="text-muted-foreground">UTM campaign</dt>
              <dd className="font-mono text-xs">{qr.utmCampaign ?? "—"}</dd>

              <dt className="text-muted-foreground">UTM content</dt>
              <dd className="font-mono text-xs">{qr.utmContent ?? "—"}</dd>
            </dl>

            <form action={onToggle}>
              <Button type="submit" variant="secondary" className="w-full">
                {qr.isActive ? "Disable this QR" : "Enable this QR"}
              </Button>
            </form>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant="outline"
                render={<Link href={`/qr/${qr.id}/edit`} />}
              >
                Edit details
              </Button>
              <DeleteQrButton id={qr.id} label={qr.label} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent scans for this QR</CardTitle>
          <CardDescription>
            Only events from people who used this placement’s code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {qr.scans.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No scans yet. Download the PNG, open it on your phone camera (or
              open the scan URL once), then refresh this page.
            </p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {qr.scans.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="tabular-nums">
                    {formatWhen(s.scannedAt)}
                  </span>
                  <span className="max-w-md truncate text-xs text-muted-foreground">
                    {s.userAgent ?? "unknown device"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
