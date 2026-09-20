"use client";

// Клієнтський компонент: тост сам зникає через кілька секунд, а це таймер,
// тобто ефект, якого в серверному компоненті не буває.

import { useEffect } from "react";
import { Button } from "./Button";

const VISIBLE_MILLISECONDS = 6000;

/**
 * Повідомлення внизу екрана, яке саме зникає.
 *
 * Лишилось два приводи його показати: видалення запису в журналі (там немає
 * підтвердження, тож замість «ви впевнені?» — кнопка відкату) і помилка, коли
 * дія не дійшла до сервера. Підтверджувати успіх тостом ми перестали: на
 * вдалу дію відповідає сам інтерфейс, а зайвий банер після кожного тапу
 * тільки заважає.
 */
export function Toast({
  message,
  actionLabel,
  onAction,
  onHide,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onHide: () => void;
}): React.ReactElement {
  useEffect(() => {
    const timer = setTimeout(onHide, VISIBLE_MILLISECONDS);
    return () => clearTimeout(timer);
  }, [onHide]);

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm">
        <span>{message}</span>
        {actionLabel === undefined || onAction === undefined ? null : (
          <Button variant="ghost" onClick={onAction} className="px-1 py-0">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
