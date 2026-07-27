"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function toggleQrActive(id: string, isActive: boolean) {
  await prisma.qrCode.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath(`/qr/${id}`);
  revalidatePath("/dashboard");
}
