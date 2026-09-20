"use server";

import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import {
  getCurrentUser,
  MIN_PASSWORD_LENGTH,
  registerUser,
  signIn,
  signOut,
  updateUserLocale,
} from "@/features/account";
import type { CredentialsFormState } from "@/features/account";
import { DEFAULT_LOCALE, fillTemplate, getDictionary, isLocale } from "@/shared/i18n";

/**
 * Дії входу й реєстрації.
 *
 * Обидві мають форму, якої чекає `useActionState`: приймають попередній стан
 * форми (він тут не потрібен) і дані форми, а повертають новий стан. Текст
 * помилки збирається на сервері й приходить готовим рядком.
 *
 * Мова тут завжди типова: юзер ще не увійшов, і дізнатись його вибір нізвідки.
 */

export async function signInAction(
  _previousState: CredentialsFormState,
  formData: FormData
): Promise<CredentialsFormState> {
  const dict = getDictionary(DEFAULT_LOCALE);
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    // Успішний вхід теж закінчується винятком: `signIn` кидає
    // перенаправлення, і Next.js передає його саме так. Тому ловимо лише
    // AuthError (невірні дані), а решту кидаємо далі.
    if (error instanceof AuthError) {
      return { errorMessage: dict.auth.invalidCredentials, email };
    }
    throw error;
  }

  return { errorMessage: null, email };
}

export async function registerAction(
  _previousState: CredentialsFormState,
  formData: FormData
): Promise<CredentialsFormState> {
  const dict = getDictionary(DEFAULT_LOCALE);
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const result = await registerUser(email, password);

  if (result.status === "invalid-email") {
    return { errorMessage: dict.auth.invalidEmail, email };
  }
  if (result.status === "weak-password") {
    return {
      errorMessage: fillTemplate(dict.auth.weakPassword, {
        min: MIN_PASSWORD_LENGTH,
      }),
      email,
    };
  }
  if (result.status === "email-taken") {
    return { errorMessage: dict.auth.emailTaken, email };
  }

  try {
    await signIn("credentials", {
      email: result.email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Акаунт створено, але автоматичний вхід не вдався — лишається
      // звичайний вхід руками.
      redirect("/login", RedirectType.replace);
    }
    throw error;
  }

  return { errorMessage: null, email };
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
