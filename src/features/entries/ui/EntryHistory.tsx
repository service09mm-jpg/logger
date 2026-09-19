"use client";

// Клієнтський компонент: рядок журналу можна відкрити на редагування або
// видалити, і обидві дії живуть на обробниках кліків.

import { useState, useTransition } from "react";
import type { Entry, Metric } from "@/features/metrics";
import type { Dictionary, Locale } from "@/shared/i18n";
import { formatIsoDate, formatTimeOfDay } from "@/shared/ui/formatDate";
import { formatNumber } from "@/shared/ui/formatNumber";
import { Toast } from "@/shared/ui/Toast";
import { ValueSheet } from "@/shared/ui/ValueSheet";

export function EntryHistory({
  entries,
  metric,
  dict,
  locale,
  timeZone,
  updateEntryAction,
  deleteEntryAction,
  restoreEntryAction,
}: {
  entries: Entry[];
  metric: Metric;
  dict: Dictionary;
  locale: Locale;
  /** Таймзона юзера — з неї малюється час запису. */
  timeZone: string;
  updateEntryAction: (input: {
    entryId: string;
    value: number;
    localDate: string;
  }) => Promise<void>;
  deleteEntryAction: (entryId: string) => Promise<void>;
  restoreEntryAction: (input: {
    metricId: string;
    value: number;
    localDate: string;
  }) => Promise<void>;
}): React.ReactElement {
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    restore: { metricId: string; value: number; localDate: string } | null;
  } | null>(null);
  const [, startTransition] = useTransition();

  if (entries.length === 0) {
    return <p className="text-sm text-muted">{dict.metric.historyEmpty}</p>;
  }

  function handleUpdate(value: number, localDate: string): void {
    if (editingEntry === null) {
      return;
    }
    const entryId = editingEntry.id;
    setEditingEntry(null);
    startTransition(async () => {
      await updateEntryAction({ entryId, value, localDate });
    });
  }

  function handleDelete(entry: Entry): void {
    // Підтвердження немає навмисно: замість «ви впевнені?» тост із відкатом.
    setToast({
      message: dict.entry.deleted,
      restore: {
        metricId: entry.metricId,
        value: entry.value,
        localDate: entry.localDate,
      },
    });
    startTransition(async () => {
      await deleteEntryAction(entry.id);
    });
  }

  return (
    <>
      <ul className="flex flex-col divide-y divide-line">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center gap-3 py-2.5">
            <button
              type="button"
              onClick={() => setEditingEntry(entry)}
              className="flex flex-1 items-baseline gap-3 text-left"
            >
              <span className="tabular text-sm font-medium">
                {formatNumber(entry.value, locale)}
              </span>
              <span className="text-xs text-muted">{metric.unit}</span>
              <span className="ml-auto text-xs text-muted">
                {formatIsoDate(entry.localDate, locale)}
              </span>
              <span className="tabular text-xs text-muted">
                {formatTimeOfDay(entry.at, locale, timeZone)}
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleDelete(entry)}
              aria-label={dict.common.delete}
              className="px-1 text-sm text-muted hover:text-red-600"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {editingEntry === null ? null : (
        <ValueSheet
          key={editingEntry.id}
          open
          label={dict.entry.edit}
          unit={metric.unit}
          initialValue={String(editingEntry.value)}
          initialDate={editingEntry.localDate}
          texts={{
            title: dict.entry.edit,
            date: dict.entry.date,
            submit: dict.entry.update,
            cancel: dict.common.cancel,
          }}
          onSubmit={handleUpdate}
          onClose={() => setEditingEntry(null)}
        />
      )}

      {toast === null ? null : (
        <Toast
          message={toast.message}
          actionLabel={dict.common.undo}
          onAction={() => {
            const restore = toast.restore;
            setToast(null);
            if (restore !== null) {
              startTransition(async () => {
                await restoreEntryAction(restore);
              });
            }
          }}
          onHide={() => setToast(null)}
        />
      )}
    </>
  );
}
