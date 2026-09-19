import { getPrismaClient } from "@/lib/prisma";
import type {
  Aggregation,
  Metric,
  TargetDirection,
  TargetPeriod,
} from "../domain/metricTypes";

/**
 * Поля, які бачить решта застосунку. `userId` сюди не входить навмисно:
 * він потрібен лише всередині запитів як фільтр.
 */
const METRIC_FIELDS = {
  id: true,
  name: true,
  unit: true,
  aggregation: true,
  targetValue: true,
  targetDirection: true,
  targetPeriod: true,
  color: true,
  sortOrder: true,
} as const;

export type MetricInput = {
  name: string;
  unit: string;
  aggregation: Aggregation;
  targetValue: number | null;
  targetDirection: TargetDirection;
  targetPeriod: TargetPeriod;
  color: string;
};

/** Активні метрики юзера в тому порядку, в якому вони лягають на екран. */
export async function listMetrics(userId: string): Promise<Metric[]> {
  return getPrismaClient().metric.findMany({
    where: { userId, archivedAt: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: METRIC_FIELDS,
  });
}

/**
 * Одна метрика юзера, або `null`.
 *
 * `userId` стоїть у `where` поряд з `id` навмисно: id приходить з адресного
 * рядка, і без цієї умови чужу метрику можна було б відкрити, просто знаючи
 * її ідентифікатор.
 */
export async function getMetric(
  userId: string,
  metricId: string
): Promise<Metric | null> {
  return getPrismaClient().metric.findFirst({
    where: { id: metricId, userId },
    select: METRIC_FIELDS,
  });
}

export async function createMetric(
  userId: string,
  input: MetricInput
): Promise<Metric> {
  const lastMetric = await getPrismaClient().metric.findFirst({
    where: { userId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const nextSortOrder = lastMetric === null ? 0 : lastMetric.sortOrder + 1;

  return getPrismaClient().metric.create({
    data: { ...input, userId, sortOrder: nextSortOrder },
    select: METRIC_FIELDS,
  });
}

/**
 * Оновлює метрику. Повертає `false`, якщо метрики немає або вона чужа —
 * `updateMany` з `userId` у фільтрі просто не зачепить жодного рядка.
 */
export async function updateMetric(
  userId: string,
  metricId: string,
  input: MetricInput
): Promise<boolean> {
  const result = await getPrismaClient().metric.updateMany({
    where: { id: metricId, userId },
    data: input,
  });
  return result.count === 1;
}

/** Ховає метрику з головного екрана. Записи лишаються в базі. */
export async function archiveMetric(
  userId: string,
  metricId: string
): Promise<boolean> {
  const result = await getPrismaClient().metric.updateMany({
    where: { id: metricId, userId, archivedAt: null },
    data: { archivedAt: new Date() },
  });
  return result.count === 1;
}
