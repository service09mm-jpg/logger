"use client";

// Клієнтський компонент: numpad набирає значення в локальному стані, і лише
// готове число їде на сервер. Саме тут живе «гарячий шлях» — два тапи від
// картки до записаного значення.

import { useState } from "react";
import { Button } from "./Button";
import { Numpad } from "./Numpad";
import { Sheet } from "./Sheet";

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
  onSubmit: (value: number, localDate: string) => void;
  onClose: () => void;
}): React.ReactElement {
  // Початкові значення беруться з пропсів рівно один раз — при монтуванні.
  // Щоб шторка почала з чистого аркуша для іншої метрики, батьківський
  // компонент передає їй `key`: React тоді монтує її заново, і синхронізувати
  // стан ефектом не треба.
  const [value, setValue] = useState(initialValue);
  const [date, setDate] = useState(initialDate);

  const parsedValue = Number.parseFloat(value);
  const canSubmit = value.length > 0 && !Number.isNaN(parsedValue);

  function handleSubmit(): void {
    if (!canSubmit) {
      return;
    }
    onSubmit(parsedValue, date);
  }

  return (
    <Sheet open={open} title={label} onClose={onClose}>
      <div className="flex flex-col gap-4">
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
            className="flex-[2]"
          >
            {texts.submit}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
