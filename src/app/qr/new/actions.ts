"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { isSafeDestinationPath } from "@/lib/qr-url";
import { createQrToken } from "@/lib/tokens";
import { resolveUtmDefaults } from "@/lib/utm";

export type CreateQrState = {
  error?: string;
};

export async function createQrAction(
  _prev: CreateQrState,
  formData: FormData
): Promise<CreateQrState> {
  const label = String(formData.get("label") || "").trim();
  const channel = String(formData.get("channel") || "newspaper").trim();
  const location = String(formData.get("location") || "").trim() || null;
  const campaign = String(formData.get("campaign") || "").trim() || null;
  let destinationPath = String(
    formData.get("destinationPath") || "/offers/summer"
  ).trim();

  // Optional manual overrides (leave empty to auto-fill like TalentSprint print)
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

  const token = createQrToken();

  const qr = await prisma.qrCode.create({
    data: {
      token,
      label,
      channel,
      location,
      campaign,
      destinationPath,
      utmSource: utm.utmSource,
      utmMedium: utm.utmMedium,
      utmCampaign: utm.utmCampaign,
      utmContent: utm.utmContent,
    },
  });

  revalidatePath("/dashboard");
  redirect(`/qr/${qr.id}`);
}
