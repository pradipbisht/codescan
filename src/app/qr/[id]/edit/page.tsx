import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import { EditQrForm } from "./edit-form";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditQrPage({ params }: PageProps) {
  const { id } = await params;
  const qr = await prisma.qrCode.findUnique({ where: { id } });
  if (!qr) notFound();

  return (
    <EditQrForm
      qr={{
        id: qr.id,
        label: qr.label,
        channel: qr.channel,
        location: qr.location,
        campaign: qr.campaign,
        destinationPath: qr.destinationPath,
        isActive: qr.isActive,
        utmSource: qr.utmSource,
        utmMedium: qr.utmMedium,
        utmCampaign: qr.utmCampaign,
        utmContent: qr.utmContent,
        token: qr.token,
      }}
    />
  );
}
