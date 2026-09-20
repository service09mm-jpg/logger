"use server";

import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import {
  MIN_PASSWORD_LENGTH,
  registerUser,
  signIn,
  signOut,
  updateUserLocale,
} from "@/features/account";
import type { CredentialsFormState } from "@/features/account";
import { DEFAULT_LOCALE, fillTemplate, getDictionary, isLocale } from "@/shared/i18n";
import { getSessionUser } from "../_lib/requestContext";

/**
 * Дії входу й реєстрації.
 *
 * Обидві мають форму, якої чекає `useActionState`: приймають попередній стан
 * форми (він тут не потрібен) і дані форми, а повертають новий стан. Текст
 * помилки збирається на сервері й приходить готовим рядком.
 *
 * Мова тут завжди типова: юзер ще не увійшов, і дізнатись його вибір нізвідки.
 */

/**
 * Перехід на головну після входу — із заміною запису в історії.
 *
 * Сторінка входу — найперший екран сесії, тож вона лежить на самому дні
 * історії. Якщо просто перейти на головну, вона там і залишиться, і юзер,
 * натискаючи «назад» достатньо багато разів, зрештою впирається в екран
 * входу — виглядає так, ніби застосунок його викинув. `replace` затирає
 * сторінку входу собою: тепер дном історії стає головна, а наступне «назад»
 * закриває застосунок, як і має бути.
 *
 * Функція нічого не повертає й не повертає керування: `redirect` під капотом
 * кидає виняток, який перехоплює Next.js.
 */
function goToDashboard(): never {
  redirect("/", RedirectType.replace);
}

export async function signInAction(
  _previousState: CredentialsFormState,
  formData: FormData
): Promise<CredentialsFormState> {
  const dict = getDictionary(DEFAULT_LOCALE);
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    // `redirect: false` — щоб перенаправлення зробити самому. Кукі сесії
    // `signIn` ставить у будь-якому разі, ще до того, як вирішує, куди вести;
    // нам потрібна лише можливість сказати `replace` (див. коментар до
    // `goToDashboard`).
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    // Ловимо лише AuthError (невірні дані), а решту кидаємо далі: серед
    // «решти» буває перенаправлення, яке Next.js теж передає винятком, і
    // проковтнути його не можна.
    if (error instanceof AuthError) {
      return { errorMessage: dict.auth.invalidCredentials, email };
    }
    throw error;
  }

  goToDashboard();
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
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Акаунт створено, але автоматичний вхід не вдався — лишається
      // звичайний вхід руками.
      redirect("/login", RedirectType.replace);
    }
    throw error;
  }

  goToDashboard();
}

export async function signOutAction(): Promise<void> {
  // Так само з заміною: після виходу «назад» не має вести назад у застосунок.
  // Сторінки все одно відкинули б юзера на вхід — але спершу він побачив би,
  // як вони блимнули.
  await signOut({ redirect: false });
  redirect("/login", RedirectType.replace);
}

export async function setLocaleAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
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
