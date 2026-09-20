"use client";

// Клієнтський компонент: кожна кнопка — обробник кліку, який дописує цифру
// до поточного значення.

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"];

export function Numpad({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}): React.ReactElement {
  function appendKey(key: string): void {
    if (key === "." && value.includes(".")) {
      return;
    }
    onChange(value + key);
  }

  function removeLastKey(): void {
    onChange(value.slice(0, -1));
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => appendKey(key)}
          className="tabular rounded-lg border border-line bg-surface py-3.5 text-lg font-medium text-foreground active:border-foreground/40"
        >
          {key}
        </button>
      ))}
      <button
        type="button"
        onClick={removeLastKey}
        aria-label="backspace"
        className="rounded-lg border border-line bg-surface py-3.5 text-lg text-muted active:border-foreground/40"
      >
        ⌫
      </button>
    </div>
  );
}
