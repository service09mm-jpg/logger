"use client";

// Клієнтський компонент: numpad набирає значення в локальному стані, і лише
// готове число їде на сервер. Саме тут живе «гарячий шлях» — два тапи від
// картки до записаного значення.

import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { Numpad } from "./Numpad";
import { Sheet } from "./Sheet";

/**
 * Скільки шторка лишається на екрані після ✓.
 *
 * Не затримка й не очікування сервера: запис іде одразу. Ці міліcекунди
 * потрібні оку — за них воно встигає побачити, як над numpad змінилось
 * значення метрики й доповзла смужка прогресу. Якщо шторка зникає раніше,
 * зміна відбувається за лаштунками, і лишається відчуття, що нічого не
 * сталось.
 *
 * Трохи довше за анімацію смужки (400 мс), щоб вона встигла дійти.
 */
const CONFIRMATION_MILLISECONDS = 700;

export type ValueSheetTexts = {
  title: string;
  date: string;
  submit: string;
  cancel: string;
};

/**
 * Шторка з numpad для вводу одного числа.
 *
 * Компонент навмисно нічого не знає ні про метрики, ні про записи: він приймає
 * підпис, одиницю виміру й початкове значення, а віддає число та день.
 */
export function ValueSheet({
  open,
  label,
  unit,
  initialValue,
  initialDate,
  texts,
  preview,
  onSubmit,
  onClose,
}: {
  open: boolean;
  label: string;
  unit: string;
  /** Для метрик типу «вага» сюди йде попереднє значення — правиш одну цифру. */
  initialValue: string;
  initialDate: string;
  texts: ValueSheetTexts;
  /**
   * Поточний стан того, що записуємо, — показується над numpad.
   *
   * Компонент і далі нічого не знає ні про метрики, ні про записи: йому
   * передають готову розмітку. Важливо лише, що вона приходить ззовні й
   * оновлюється сама — тоді юзер бачить результат свого запису ще до того,
   * як шторка піде.
   */
  preview?: React.ReactNode;
  onSubmit: (value: number, localDate: string) => void;
  onClose: () => void;
}): React.ReactElement {
  // Початкові значення беруться з пропсів рівно один раз — при монтуванні.
  // Щоб шторка почала з чистого аркуша для іншої метрики, батьківський
  // компонент передає їй `key`: React тоді монтує її заново, і синхронізувати
  // стан ефектом не треба.
  const [value, setValue] = useState(initialValue);
  const [date, setDate] = useState(initialDate);
  // Шторка закривається одразу після ✓, але палець встигає натиснути двічі —
  // а це вже два записи в базі. Прапорець тримається до кінця життя шторки.
  const [submitted, setSubmitted] = useState(false);

  const parsedValue = Number.parseFloat(value);
  const canSubmit =
    !submitted && value.length > 0 && !Number.isNaN(parsedValue);

  // Таймер треба прибрати, якщо шторку закрили раніше — наприклад кнопкою
  // «назад» одразу після ✓.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (closeTimer.current !== null) {
        clearTimeout(closeTimer.current);
      }
    },
    []
  );

  function handleSubmit(): void {
    if (!canSubmit) {
      return;
    }
    setSubmitted(true);
    // Запис іде негайно — картка оновлюється, не чекаючи, поки шторка піде.
    onSubmit(parsedValue, date);
    closeTimer.current = setTimeout(onClose, CONFIRMATION_MILLISECONDS);
  }

  return (
    <Sheet open={open} title={label} onClose={onClose}>
      <div className="flex flex-col gap-4">
        {preview === undefined ? null : (
          <div className="rounded-lg border border-line px-4 py-3">{preview}</div>
        )}

        <div className="flex items-baseline justify-center gap-2 rounded-lg border border-line py-4">
          <span className="tabular text-3xl font-semibold">
            {value.length === 0 ? "0" : value}
          </span>
          <span className="text-sm text-muted">{unit}</span>
        </div>

        <Numpad value={value} onChange={setValue} />

        <label className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted">{texts.date}</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40"
          />
        </label>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            {texts.cancel}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
            // Кнопка справді вимкнена — другий тап нічого не зробить. Але
            // зблякла вона має бути лише тоді, коли тиснути нема чого: з
            // галочкою це знак «готово», а не «недоступно».
            style={submitted ? { opacity: 1 } : undefined}
            className="flex-[2]"
          >
            {submitted ? (
              <span aria-label={texts.submit} className="block text-lg leading-5">
                ✓
              </span>
            ) : (
              texts.submit
            )}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
