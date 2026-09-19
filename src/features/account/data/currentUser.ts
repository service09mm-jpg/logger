import { auth } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import type { Locale } from "@/shared/i18n";

/** Юзер, від імені якого виконується запит. */
export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  locale: Locale;
};

/**
 * Юзер поточної сесії, або `null` якщо він не увійшов.
 *
 * Це єдине місце, звідки береться `userId`. Далі він іде параметром у кожен
 * запит до бази — рядки різних юзерів лежать в одних таблицях, і розділяє їх
 * саме ця колонка.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  const userId = session?.user?.id;

  if (userId === undefined) {
    return null;
  }

  const user = await getPrismaClient().user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, image: true, locale: true },
  });

  return user;
}

/** Змінює мову інтерфейсу. */
export async function updateUserLocale(
  userId: string,
  locale: Locale
): Promise<void> {
  await getPrismaClient().user.update({
    where: { id: userId },
    data: { locale },
  });
}
