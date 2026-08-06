import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";

/** Rows per page on QR detail scan history */
export const SCAN_PAGE_SIZE = 12;

/**
 * Live stats + paginated scan history for auto-refresh UI.
 * Query: ?page=1 (1-based). Page size is fixed at 12.
 * Pagination controls are only needed when total > 12.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const rawPage = Number(request.nextUrl.searchParams.get("page") || "1");
  const requestedPage =
    Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const pageSize = SCAN_PAGE_SIZE;

  const meta = await prisma.qrCode.findUnique({
    where: { id },
    select: {
      id: true,
      scanCount: true,
      lastScannedAt: true,
      isActive: true,
      _count: { select: { scans: true } },
    },
  });

  if (!meta) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const total = meta._count.scans;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * pageSize;

  const scans =
    total === 0
      ? []
      : await prisma.qrScan.findMany({
          where: { qrCodeId: id },
          orderBy: { scannedAt: "desc" },
          skip,
          take: pageSize,
          select: {
            id: true,
            scannedAt: true,
            userAgent: true,
          },
        });

  const needsPagination = total > pageSize;

  return NextResponse.json(
    {
      id: meta.id,
      scanCount: meta.scanCount,
      lastScannedAt: meta.lastScannedAt?.toISOString() ?? null,
      isActive: meta.isActive,
      scans: scans.map((s) => ({
        id: s.id,
        scannedAt: s.scannedAt.toISOString(),
        userAgent: s.userAgent,
      })),
      page,
      pageSize,
      total,
      totalPages,
      hasPrev: needsPagination && page > 1,
      hasNext: needsPagination && page < totalPages,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
