"use client";

// Клієнтський компонент: форма показує помилку сервера, не перезавантажуючи
// сторінку, — і саме тому введена пошта не зникає після невдалої спроби.

import Link from "next/link";
import { useActionState } from "react";
import type { Dictionary } from "@/shared/i18n";
import { Button } from "@/shared/ui/Button";
import { Field, FIELD_CLASSES } from "@/shared/ui/Field";

/** Те, що серверна дія повертає формі. `null` в помилці — усе гаразд. */
export type CredentialsFormState = {
  errorMessage: string | null;
  /**
   * Пошта, яку юзер щойно ввів.
   *
   * React очищає поля форми після кожної серверної дії, тому щоб після
   * невдалої спроби не набирати адресу заново, її треба повернути назад і
   * підставити в `defaultValue`.
   */
  email: string;
};

export const EMPTY_FORM_STATE: CredentialsFormState = {
  errorMessage: null,
  email: "",
};

/**
 * Форма пошти й пароля — одна на вхід і на реєстрацію.
 *
 * `useActionState` бере серверну дію й дає три речі: її останню відповідь,
 * обгортку для `<form action>` і ознаку «запит ще виконується». Відповідь
 * приходить без переходу на іншу сторінку, тому поля лишаються заповненими,
 * а код помилки не треба тягти через адресний рядок.
 */
export function CredentialsForm({
  dict,
  action,
  submitLabel,
  isRegistration,
  footer,
}: {
  dict: Dictionary;
  action: (
    previousState: CredentialsFormState,
    formData: FormData
  ) => Promise<CredentialsFormState>;
  submitLabel: string;
  /** Від цього залежить лише підказка браузеру про пароль. */
  isRegistration: boolean;
  footer: { question: string; linkLabel: string; href: string };
}): React.ReactElement {
  const [state, submitAction, isPending] = useActionState(
    action,
    EMPTY_FORM_STATE
  );

  return (
    <div className="flex w-full flex-col gap-5">
      <form action={submitAction} className="flex flex-col gap-4">
        <Field label={dict.auth.email}>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={state.email}
            className={FIELD_CLASSES}
          />
        </Field>

        <Field label={dict.auth.password}>
          <input
            name="password"
            type="password"
            required
            autoComplete={isRegistration ? "new-password" : "current-password"}
            className={FIELD_CLASSES}
          />
        </Field>

        {state.errorMessage === null ? null : (
          <p role="alert" className="text-sm text-red-600">
            {state.errorMessage}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={isPending}
          className="mt-1"
        >
          {submitLabel}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        {footer.question}{" "}
        <Link href={footer.href} className="text-foreground underline">
          {footer.linkLabel}
        </Link>
      </p>
    </div>
  );
}
