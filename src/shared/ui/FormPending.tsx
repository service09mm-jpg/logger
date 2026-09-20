"use client";

// Клієнтський компонент: стан відправки форми знає лише браузер.

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

/**
 * Вимикає вміст форми, доки її серверна дія виконується.
 *
 * Без цього подвійний тап по плитці шаблона створював **дві** метрики, а
 * нетерплячий юзер, який тикає кнопку кілька разів підряд, запускав кілька
 * запитів одночасно — і застосунок, який і без того відповідає не миттєво,
 * починав гальмувати вже по-справжньому.
 *
 * `useFormStatus` читає стан найближчої форми вгору по дереву, тому цей
 * компонент має бути **всередині** `<form>`, а не навколо неї.
 *
 * Обгортка — `<fieldset disabled>`: один атрибут вимикає всі кнопки й поля
 * всередині, скільки б їх не було. `display: contents` прибирає саму обгортку
 * з розкладки, тож сітки й флекси всередині форми лишаються такими, як були.
 */
export function FormPending({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const { pending } = useFormStatus();

  return (
    <fieldset
      disabled={pending}
      aria-busy={pending}
      className="contents"
    >
      {children}
    </fieldset>
  );
}
