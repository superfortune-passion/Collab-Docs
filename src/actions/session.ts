"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { setCurrentUserId } from "@/lib/session";

export async function switchUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false as const, error: "User not found" };
  await setCurrentUserId(userId);
  revalidatePath("/", "layout");
  return { success: true as const };
}
