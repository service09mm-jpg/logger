import { describe, expect, it } from "vitest";
import type { Entry, Metric } from "@/features/metrics";
import { applyOptimisticEntry, summarizeMetric } from "./metricSummary";

function metric(overrides: Partial<Metric>): Metric {
  return {
    id: "metric-1",
    name: "Калорії",
    unit: "ккал",
    aggregation: "SUM",
    targetValue: 2000,
    targetDirection: "AT_MOST",
    targetPeriod: "DAY",
    color: "#4f7cac",
    sortOrder: 0,
    ...overrides,
  };
}

function entry(value: number, localDate: string, metricId = "metric-1"): Entry {
  return {
    id: `entry-${localDate}-${value}`,
    metricId,
    value,
    localDate,
    at: new Date(`${localDate}T12:00:00.000Z`),
    note: null,
  };
}

describe("summarizeMetric", () => {
  it("бере тільки записи поточного періоду", () => {
    const summary = summarizeMetric(
      metric({}),
      [entry(400, "2026-09-19"), entry(650, "2026-09-19"), entry(900, "2026-09-18")],
      "2026-09-19"
    );
    expect(summary.current).toBe(1050);
  });

  it("не бере записи чужої метрики", () => {
    const summary = summarizeMetric(
      metric({}),
      [entry(400, "2026-09-19"), entry(999, "2026-09-19", "metric-2")],
      "2026-09-19"
    );
    expect(summary.current).toBe(400);
  });

  it("для тижневої цілі збирає весь тиждень з понеділка", () => {
    const summary = summarizeMetric(
      metric({ aggregation: "SUM", targetPeriod: "WEEK", targetValue: 150 }),
      [
        entry(20, "2026-09-13"),
        entry(30, "2026-09-14"),
        entry(45, "2026-09-19"),
      ],
      "2026-09-19"
    );
    expect(summary.current).toBe(75);
    expect(summary.bounds).toEqual({
      startIso: "2026-09-14",
      endIso: "2026-09-20",
    });
  });

  it("для LAST показує останнє відоме значення, навіть якщо воно не сьогоднішнє", () => {
    const summary = summarizeMetric(
      metric({
        aggregation: "LAST",
        unit: "кг",
        targetValue: 75,
        targetDirection: "AT_MOST",
      }),
      [entry(79.1, "2026-09-16")],
      "2026-09-19"
    );
    expect(summary.current).toBe(79.1);
  });

  it("для LAST не рахує прогрес — стану «виконано» для ваги не існує", () => {
    const summary = summarizeMetric(
      metric({ aggregation: "LAST", targetValue: 75 }),
      [entry(70, "2026-09-19")],
      "2026-09-19"
    );
    expect(summary.progress).toBeNull();
  });

  it("без цілі рахує значення, але не рахує прогрес", () => {
    const summary = summarizeMetric(
      metric({ targetValue: null }),
      [entry(400, "2026-09-19")],
      "2026-09-19"
    );
    expect(summary.current).toBe(400);
    expect(summary.progress).toBeNull();
  });

  it("порожній період дає null, а не нуль", () => {
    const summary = summarizeMetric(metric({}), [], "2026-09-19");
    expect(summary.current).toBeNull();
    expect(summary.progress?.reached).toBe(false);
  });
});

describe("applyOptimisticEntry", () => {
  const today = "2026-09-19";

  it("SUM додає значення до поточного", () => {
    const summary = summarizeMetric(metric({}), [entry(400, today)], today);
    const next = applyOptimisticEntry(summary, 650);
    expect(next.current).toBe(1050);
    expect(next.entryCount).toBe(2);
  });

  it("SUM працює і на порожньому періоді", () => {
    const summary = summarizeMetric(metric({}), [], today);
    expect(applyOptimisticEntry(summary, 400).current).toBe(400);
  });

  it("LAST замінює значення, а не додає", () => {
    const summary = summarizeMetric(
      metric({ aggregation: "LAST", targetValue: null }),
      [entry(79.1, today)],
      today
    );
    expect(applyOptimisticEntry(summary, 78.4).current).toBe(78.4);
  });

  it("COUNT рахує ще один запис", () => {
    const summary = summarizeMetric(
      metric({ aggregation: "COUNT", targetValue: 3, targetDirection: "AT_LEAST" }),
      [entry(1, today)],
      today
    );
    expect(applyOptimisticEntry(summary, 1).current).toBe(2);
  });

  it("AVG перераховує середнє з урахуванням кількості записів", () => {
    const summary = summarizeMetric(
      metric({ aggregation: "AVG", targetValue: null }),
      [entry(7, today), entry(5, today)],
      today
    );
    expect(applyOptimisticEntry(summary, 9).current).toBe(7);
  });

  it("одразу перераховує прогрес до цілі", () => {
    const summary = summarizeMetric(
      metric({ targetValue: 2000, targetDirection: "AT_MOST" }),
      [entry(1900, today)],
      today
    );
    expect(summary.progress?.reached).toBe(true);
    expect(applyOptimisticEntry(summary, 300).progress?.reached).toBe(false);
  });
});
