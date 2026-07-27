"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { isSafeDestinationPath } from "@/lib/qr-url";
import { resolveUtmDefaults } from "@/lib/utm";

export async function toggleQrActive(id: string, isActive: boolean) {
  await prisma.qrCode.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath(`/qr/${id}`);
  revalidatePath("/dashboard");
}

export type UpdateQrState = {
  error?: string;
};

export async function updateQrAction(
  id: string,
  _prev: UpdateQrState,
  formData: FormData
): Promise<UpdateQrState> {
  const label = String(formData.get("label") || "").trim();
  const channel = String(formData.get("channel") || "newspaper").trim();
  const location = String(formData.get("location") || "").trim() || null;
  const campaign = String(formData.get("campaign") || "").trim() || null;
  let destinationPath = String(
    formData.get("destinationPath") || "/offers/summer"
  ).trim();
  const isActive = formData.get("isActive") === "on";

  const utmSourceRaw = String(formData.get("utmSource") || "").trim() || null;
  const utmMediumRaw = String(formData.get("utmMedium") || "").trim() || null;
  const utmCampaignRaw =
    String(formData.get("utmCampaign") || "").trim() || null;
  const utmContentRaw =
    String(formData.get("utmContent") || "").trim() || null;

  if (!label) return { error: "Name is required." };
  if (!channel) return { error: "Channel is required." };

  if (!destinationPath.startsWith("/")) {
    destinationPath = `/${destinationPath}`;
  }
  if (!isSafeDestinationPath(destinationPath)) {
    return {
      error: "Destination must be a path on this site, like /offers/summer",
    };
  }

  const existing = await prisma.qrCode.findUnique({ where: { id } });
  if (!existing) return { error: "QR not found." };

  // Keep token stable so printed QR images still work.
  // UTMs / destination can change (affects after-scan redirect only).
  const utm = resolveUtmDefaults({
    channel,
    campaign,
    location,
    label,
    utmSource: utmSourceRaw,
    utmMedium: utmMediumRaw,
    utmCampaign: utmCampaignRaw,
    utmContent: utmContentRaw,
  });

  await prisma.qrCode.update({
    where: { id },
    data: {
      label,
      channel,
      location,
      campaign,
      destinationPath,
      isActive,
      utmSource: utm.utmSource,
      utmMedium: utm.utmMedium,
      utmCampaign: utm.utmCampaign,
      utmContent: utm.utmContent,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/qr/${id}`);
  revalidatePath(`/qr/${id}/edit`);
  redirect(`/qr/${id}`);
}

export async function deleteQrAction(id: string) {
  await prisma.qrCode.delete({
    where: { id },
  });
  // Scans cascade via Prisma onDelete: Cascade
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
