"use client";

// Клієнтський компонент: лише браузер знає свою таймзону, і лише він може
// покласти її в куку.

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;

/**
 * Надсилає серверу таймзону браузера.
 *
 * Від неї залежить, який день вважати сьогоднішнім, а сервер її нізвідки
 * більше не дізнається. Кука ставиться один раз; якщо вона вже така сама —
 * компонент не робить нічого. Коли значення змінилось (юзер переїхав або
 * зайшов з іншого пристрою), сторінка перечитується з правильним днем.
 */
export function TimeZoneSync({
  cookieName,
  currentValue,
}: {
  cookieName: string;
  currentValue: string;
}): null {
  const router = useRouter();

  useEffect(() => {
    const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (browserTimeZone === undefined || browserTimeZone === currentValue) {
      return;
    }

    document.cookie = `${cookieName}=${encodeURIComponent(
      browserTimeZone
    )}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax`;
    router.refresh();
  }, [cookieName, currentValue, router]);

  return null;
}
