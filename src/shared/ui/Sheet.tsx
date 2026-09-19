"use client";

// Клієнтський компонент: шторка слухає клавішу Escape і кліки по тлу, а
// обробників подій у серверному компоненті бути не може.

import { useEffect } from "react";
import type { ReactNode } from "react";

export function Sheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}): React.ReactElement | null {
  // Escape закриває шторку. Підписка живе рівно стільки, скільки шторка
  // відкрита, — інакше слухачі накопичувались би при кожному відкритті.
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={title}
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />
      <div className="relative w-full max-w-md rounded-t-2xl border border-line bg-surface p-5 sm:rounded-2xl">
        <h2 className="mb-4 text-base font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  );
}
