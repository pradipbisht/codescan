import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";

/** Dashboard micro-refresh: all QR scan counts */
export async function GET() {
  const rows = await prisma.qrCode.findMany({
    select: {
      id: true,
      scanCount: true,
      lastScannedAt: true,
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    {
      items: rows.map((r) => ({
        id: r.id,
        scanCount: r.scanCount,
        lastScannedAt: r.lastScannedAt?.toISOString() ?? null,
        isActive: r.isActive,
      })),
      totalScans: rows.reduce((s, r) => s + r.scanCount, 0),
      totalCodes: rows.length,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
