import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { buildRedirectUrl } from "@/lib/qr/url";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const limited = rateLimit(`scan:${token}:${ip}`, 30, 60_000);
  if (!limited.ok) {
    return new NextResponse(
      htmlPage("Too many requests", "Please wait a minute and try again."),
      {
        status: 429,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }

  const qr = await prisma.qrCode.findUnique({
    where: { token },
  });

  if (!qr) {
    return new NextResponse(
      htmlPage(
        "QR not found",
        "This QR code does not exist or the link is wrong."
      ),
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  if (!qr.isActive) {
    return new NextResponse(
      htmlPage(
        "QR disabled",
        "This QR code has been turned off. Contact the campaign owner."
      ),
      { status: 410, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const userAgent = request.headers.get("user-agent");
  const referer = request.headers.get("referer");

  await prisma.$transaction([
    prisma.qrCode.update({
      where: { id: qr.id },
      data: {
        scanCount: { increment: 1 },
        lastScannedAt: new Date(),
      },
    }),
    prisma.qrScan.create({
      data: {
        qrCodeId: qr.id,
        userAgent,
        referer,
      },
    }),
  ]);

  // Absolute URL (path on CodeScan OR full external e.g. https://dgs.goalkeepers.org.in)
  const target = await buildRedirectUrl({
    destinationPath: qr.destinationPath,
    utmSource: qr.utmSource,
    utmMedium: qr.utmMedium,
    utmCampaign: qr.utmCampaign,
    utmContent: qr.utmContent,
  });

  return NextResponse.redirect(target);
}

function htmlPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} · CodeScan</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 28rem; margin: 4rem auto; padding: 0 1rem; color: #111; }
    h1 { font-size: 1.25rem; }
    p { color: #444; line-height: 1.5; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(message)}</p>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
