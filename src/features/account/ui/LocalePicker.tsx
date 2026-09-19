import type { Dictionary, Locale } from "@/shared/i18n";

/**
 * Перемикач мови: дві кнопки в одній формі, кожна зі своїм значенням.
 * Обрана мова підсвічена межею, і саме вона зберігається в `User.locale`.
 */
export function LocalePicker({
  current,
  dict,
  setLocaleAction,
}: {
  current: Locale;
  dict: Dictionary;
  setLocaleAction: (formData: FormData) => Promise<void>;
}): React.ReactElement {
  const options: { value: Locale; label: string }[] = [
    { value: "uk", label: dict.settings.languageUk },
    { value: "en", label: dict.settings.languageEn },
  ];

  return (
    <form action={setLocaleAction} className="flex gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="submit"
          name="locale"
          value={option.value}
          className={`rounded-lg border px-4 py-2.5 text-sm ${
            option.value === current
              ? "border-foreground text-foreground"
              : "border-line text-muted hover:text-foreground"
          }`}
        >
          {option.label}
        </button>
      ))}
    </form>
  );
}
