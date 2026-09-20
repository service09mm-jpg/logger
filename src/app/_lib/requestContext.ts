import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
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
 * Юзер поточної сесії — рівно один похід у базу на весь запит.
 *
 * Юзера питають і макет, і сама сторінка, і серверна дія. Вони про це не
 * знають, тому без обгортки кожен ходив би в базу окремо: два однакові запити
 * на кожен рендер сторінки й ще один на кожну дію.
 *
 * `cache` тут з React, а не з Next.js, і це не кеш «на хвилину»: він живе
 * рівно стільки, скільки обробка одного запиту. Другий виклик у межах того
 * самого запиту отримує результат першого, наступний запит починає з чистого
 * аркуша. Тому застарілих даних тут не буває за побудовою.
 *
 * Лежить ця обгортка в шарі застосунку, а не поряд із самим запитом: `data/`
 * фічі про React не знає й знати не повинен — «один раз на запит» це поняття
 * не бази, а обробки запиту.
 */
export const getSessionUser = cache(
  async (): Promise<CurrentUser | null> => getCurrentUser()
);

/**
 * Той самий юзер, але якщо він не увійшов — відправляє на сторінку входу.
 *
 * `redirect()` не повертає керування: під капотом він кидає спеціальну
 * помилку, яку перехоплює Next.js. Тому після виклику цієї функції юзер
 * гарантовано є, і перевіряти ще раз не треба.
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getSessionUser();
  if (user === null) {
    redirect("/login");
  }
  return user;
}
