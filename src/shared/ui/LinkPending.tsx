"use client";

// Клієнтський компонент: `useLinkStatus` — хук, і жити він може лише тут.

import { useLinkStatus } from "next/link";
import type { ReactNode } from "react";

/**
 * Крутилка на час переходу за посиланням.
 *
 * Наші сторінки — динамічні (кожна читає куку сесії), а `loading.tsx` у
 * проєкті поки немає. За документацією Next.js це означає, що такі сторінки
 * не підвантажуються заздалегідь, і після тапу браузер просто стоїть на
 * старій сторінці, доки не приїде відповідь. Юзер бачить, що нічого не
 * сталось, і тисне ще раз.
 *
 * `useLinkStatus` дає стан саме того посилання, всередині якого компонент
 * стоїть, — тому він має бути в піддереві `<Link>`.
 *
 * `idle` — що показувати, поки нічого не відбувається: для картки метрики це
 * стрілка «›», яку крутилка підміняє собою, щоб нічого не стрибало.
 */
export function LinkPending({ idle = null }: { idle?: ReactNode }): ReactNode {
  const { pending } = useLinkStatus();

  if (!pending) {
    return idle;
  }

  return (
    <span
      aria-hidden
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border border-line border-t-foreground align-middle"
    />
  );
}
