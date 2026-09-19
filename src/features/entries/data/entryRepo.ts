import type { Entry } from "@/features/metrics";
import { fromIsoDate, toIsoDate } from "@/features/targets";
import type { IsoDate } from "@/features/targets";
import { getPrismaClient } from "@/lib/prisma";

const ENTRY_FIELDS = {
  id: true,
  metricId: true,
  value: true,
  at: true,
  localDate: true,
  note: true,
} as const;

/** Рядок бази в тому вигляді, в якому його віддає Prisma. */
type EntryRow = {
  id: string;
  metricId: string;
  value: number;
  at: Date;
  localDate: Date;
  note: string | null;
};

/**
 * Єдине перетворення між базою й логікою: колонка типу DATE приходить як
 * `Date` (опівніч UTC), а вся логіка працює з днем-рядком "YYYY-MM-DD".
 */
function toEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    metricId: row.metricId,
    value: row.value,
    at: row.at,
    localDate: toIsoDate(row.localDate),
    note: row.note,
  };
}

export type EntryInput = {
  metricId: string;
  value: number;
  localDate: IsoDate;
  at: Date;
  note: string | null;
};

/** Усі записи юзера за проміжок днів. Межі включно. */
export async function listEntriesBetween(
  userId: string,
  fromIso: IsoDate,
  toIso: IsoDate
): Promise<Entry[]> {
  const rows = await getPrismaClient().entry.findMany({
    where: {
      userId,
      localDate: { gte: fromIsoDate(fromIso), lte: fromIsoDate(toIso) },
    },
    orderBy: { at: "asc" },
    select: ENTRY_FIELDS,
  });
  return rows.map(toEntry);
}

/** Записи однієї метрики за проміжок днів. */
export async function listEntriesForMetric(
  userId: string,
  metricId: string,
  fromIso: IsoDate,
  toIso: IsoDate
): Promise<Entry[]> {
  const rows = await getPrismaClient().entry.findMany({
    where: {
      userId,
      metricId,
      localDate: { gte: fromIsoDate(fromIso), lte: fromIsoDate(toIso) },
    },
    orderBy: { at: "asc" },
    select: ENTRY_FIELDS,
  });
  return rows.map(toEntry);
}

/**
 * Останній запис метрики, скільки б днів тому він не був.
 *
 * Потрібен метрикам з агрегацією LAST: на картці ваги має стояти останнє
 * відоме значення, навіть якщо зважувались позавчора.
 */
export async function getLatestEntry(
  userId: string,
  metricId: string
): Promise<Entry | null> {
  const row = await getPrismaClient().entry.findFirst({
    where: { userId, metricId },
    orderBy: { at: "desc" },
    select: ENTRY_FIELDS,
  });
  return row === null ? null : toEntry(row);
}

/** Останні записи метрики — журнал на сторінці метрики. */
export async function listRecentEntries(
  userId: string,
  metricId: string,
  limit: number
): Promise<Entry[]> {
  const rows = await getPrismaClient().entry.findMany({
    where: { userId, metricId },
    orderBy: { at: "desc" },
    take: limit,
    select: ENTRY_FIELDS,
  });
  return rows.map(toEntry);
}

/**
 * Створює запис. Повертає `null`, якщо метрика не належить цьому юзеру —
 * `metricId` приходить з браузера, і вірити йому не можна.
 */
export async function createEntry(
  userId: string,
  input: EntryInput
): Promise<Entry | null> {
  const metric = await getPrismaClient().metric.findFirst({
    where: { id: input.metricId, userId },
    select: { id: true },
  });

  if (metric === null) {
    return null;
  }

  const row = await getPrismaClient().entry.create({
    data: {
      userId,
      metricId: input.metricId,
      value: input.value,
      at: input.at,
      localDate: fromIsoDate(input.localDate),
      note: input.note,
    },
    select: ENTRY_FIELDS,
  });

  return toEntry(row);
}

/** Змінює запис. `false` — запису немає або він чужий. */
export async function updateEntry(
  userId: string,
  entryId: string,
  input: { value: number; localDate: IsoDate; at: Date; note: string | null }
): Promise<boolean> {
  const result = await getPrismaClient().entry.updateMany({
    where: { id: entryId, userId },
    data: {
      value: input.value,
      at: input.at,
      localDate: fromIsoDate(input.localDate),
      note: input.note,
    },
  });
  return result.count === 1;
}

/** Видаляє запис. `false` — запису немає або він чужий. */
export async function deleteEntry(
  userId: string,
  entryId: string
): Promise<boolean> {
  const result = await getPrismaClient().entry.deleteMany({
    where: { id: entryId, userId },
  });
  return result.count === 1;
}
