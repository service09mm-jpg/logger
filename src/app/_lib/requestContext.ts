import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/account";
import type { CurrentUser } from "@/features/account";
import { todayIsoInTimeZone } from "@/features/targets";
import type { IsoDate } from "@/features/targets";

/** Ім'я куки, в якій браузер лишає свою таймзону. */
export const TIME_ZONE_COOKIE = "tz";

/**
 * Таймзона юзера.
 *
 * Сервер її не знає: у сесії такого поля немає, і в базі ми його свідомо не
 * заводили. Натомість браузер один раз кладе назву таймзони в куку (див.
 * `TimeZoneSync`), а сервер її звідти читає. Поки куки немає — UTC.
 */
export async function getTimeZone(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get(TIME_ZONE_COOKIE)?.value ?? "UTC";
}

/** Який сьогодні день за годинником юзера. */
export async function getTodayIso(): Promise<IsoDate> {
  return todayIsoInTimeZone(new Date(), await getTimeZone());
}

/**
 * Юзер поточної сесії; якщо він не увійшов — відправляє на сторінку входу.
 *
 * `redirect()` не повертає керування: під капотом він кидає спеціальну
 * помилку, яку перехоплює Next.js. Тому після виклику цієї функції юзер
 * гарантовано є, і перевіряти ще раз не треба.
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (user === null) {
    redirect("/login");
  }
  return user;
}
