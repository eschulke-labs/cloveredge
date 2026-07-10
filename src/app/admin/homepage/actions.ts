"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateModuleOrder(formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized");
  }

  const updates: { id: string; order: number; active: boolean }[] = [];
  for (const [key, value] of formData.entries()) {
    const match = key.match(/^order:(.+)$/);
    if (match) {
      updates.push({
        id: match[1],
        order: Number(value),
        active: formData.get(`active:${match[1]}`) === "on",
      });
    }
  }

  await Promise.all(
    updates.map((u) =>
      prisma.homepageModule.update({
        where: { id: u.id },
        data: { order: u.order, active: u.active },
      }),
    ),
  );

  revalidatePath("/admin/homepage");
  revalidatePath("/");
}
