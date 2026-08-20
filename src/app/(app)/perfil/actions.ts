"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validations/profile";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio"),
    image: formData.get("image"),
    xpLabel: formData.get("xpLabel"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { name, bio, image, xpLabel } = parsed.data;
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      bio: bio || null,
      image: image || null,
      xpLabel,
    },
  });

  revalidatePath("/perfil");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteAccount() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await prisma.user.delete({ where: { id: session.user.id } });
  await signOut({ redirectTo: "/" });
}
