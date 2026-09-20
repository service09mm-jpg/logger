"use server";

import { revalidatePath } from "next/cache";
import {
  createEntry,
  deleteEntry,
  updateEntry,
} from "@/features/entries";
import type { LogEntryResult } from "@/features/metrics";
import { isIsoDate, middayOf } from "@/features/targets";
import { getSessionUser, getTodayIso } from "../_lib/requestContext";

/**
 * Серверні дії для записів.
 *
 * Кожна з них окремо перевіряє, хто її викликав: дію можна смикнути звичайним
 * POST-запитом повз інтерфейс, тому перевірка сесії в компоненті нічого не
 * гарантує.
 */

/** Момент `at` для запису: для сьогоднішнього — зараз, для заднього — полудень. */
async function resolveInstant(localDate: string): Promise<Date> {
  const todayIso = await getTodayIso();
  if (localDate === todayIso) {
    return new Date();
  }
  return middayOf(localDate);
}

export async function logEntryAction(input: {
  metricId: string;
  value: number;
  localDate: string;
}): Promise<LogEntryResult> {
  const user = await getSessionUser();
  if (user === null) {
    return { error: true };
  }

  if (!Number.isFinite(input.value) || !isIsoDate(input.localDate)) {
    return { error: true };
  }

  const entry = await createEntry(user.id, {
    metricId: input.metricId,
    value: input.value,
    localDate: input.localDate,
    at: await resolveInstant(input.localDate),
    note: null,
  });

  if (entry === null) {
    return { error: true };
  }

  revalidatePath("/");
  revalidatePath(`/metrics/${input.metricId}`);
  return { entryId: entry.id };
}

export async function updateEntryAction(input: {
  entryId: string;
  value: number;
  localDate: string;
}): Promise<void> {
  const user = await getSessionUser();
  if (user === null) {
    return;
  }

  if (!Number.isFinite(input.value) || !isIsoDate(input.localDate)) {
    return;
  }

  await updateEntry(user.id, input.entryId, {
    value: input.value,
    localDate: input.localDate,
    at: await resolveInstant(input.localDate),
    note: null,
  });

  revalidatePath("/", "layout");
}

export async function deleteEntryAction(entryId: string): Promise<void> {
  const user = await getSessionUser();
  if (user === null) {
    return;
  }

  await deleteEntry(user.id, entryId);
  revalidatePath("/", "layout");
}
