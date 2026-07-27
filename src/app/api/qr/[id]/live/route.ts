import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * Lightweight live stats for auto-refresh UI (no full page reload).
 * Poll from client every few seconds.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const qr = await prisma.qrCode.findUnique({
    where: { id },
    select: {
      id: true,
      scanCount: true,
      lastScannedAt: true,
      isActive: true,
      scans: {
        orderBy: { scannedAt: "desc" },
        take: 12,
        select: {
          id: true,
          scannedAt: true,
          userAgent: true,
        },
      },
    },
  });

  if (!qr) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      id: qr.id,
      scanCount: qr.scanCount,
      lastScannedAt: qr.lastScannedAt?.toISOString() ?? null,
      isActive: qr.isActive,
      scans: qr.scans.map((s) => ({
        id: s.id,
        scannedAt: s.scannedAt.toISOString(),
        userAgent: s.userAgent,
      })),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
