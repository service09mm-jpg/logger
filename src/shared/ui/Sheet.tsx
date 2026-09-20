"use client";

// Клієнтський компонент: шторка слухає клавішу Escape і кліки по тлу, а
// обробників подій у серверному компоненті бути не може.

import { useEffect, useRef } from "react";
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
  // Батько зазвичай передає сюди стрілку, створену прямо в розмітці, — на
  // кожному рендері це нова функція. Для підписок це дрібниця, але ефект нижче
  // чіпає історію браузера, і перезапускатись він має лише коли шторка справді
  // відкрилась чи закрилась. Тому свіжий обробник живе в ref, а залежність у
  // ефектів лишається одна — `open`.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Escape закриває шторку. Підписка живе рівно стільки, скільки шторка
  // відкрита, — інакше слухачі накопичувались би при кожному відкритті.
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Кнопка «назад» має закривати шторку, а не йти на попередню сторінку.
  //
  // Для браузера шторки не існує: вона лише стан у пам'яті React, і в історії
  // від неї нічого немає. Тому при відкритті ми дописуємо в історію порожній
  // запис — адреса не змінюється, сторінка не перезавантажується (Next.js
  // окремо підтримує прямі виклики `history.pushState`), але тепер у стеку є
  // що знімати. Кнопка «назад» знімає саме його, ми ловимо `popstate` і просто
  // закриваємо шторку.
  //
  // Той самий `popstate` приходить від жесту «свайп від краю» на iPhone і від
  // системного жесту назад на Android, тож вони запрацюють так само.
  useEffect(() => {
    if (!open) {
      return;
    }

    window.history.pushState({ sheet: true }, "");

    // Шторку можна закрити двома способами, і прибирати за собою треба
    // по-різному. Якщо це зробила кнопка «назад» — запис з історії вже зник.
    // Якщо ✓, «Скасувати» чи Escape — запис лишився, і його треба зняти
    // самому, інакше наступне «назад» нічого не зробить.
    let closedByBackButton = false;

    function handlePopState(): void {
      closedByBackButton = true;
      onCloseRef.current();
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (!closedByBackButton) {
        window.history.back();
      }
    };
  }, [open]);

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
