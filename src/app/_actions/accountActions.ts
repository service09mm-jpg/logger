"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, updateUserLocale } from "@/features/account";
import { isLocale } from "@/shared/i18n";
import { signIn, signOut } from "@/lib/auth";

export async function signInAction(): Promise<void> {
  await signIn("google", { redirectTo: "/" });
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

export async function setLocaleAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (user === null) {
    return;
  }

  const locale = String(formData.get("locale") ?? "");
  if (!isLocale(locale)) {
    return;
  }

  await updateUserLocale(user.id, locale);
  revalidatePath("/", "layout");
}
