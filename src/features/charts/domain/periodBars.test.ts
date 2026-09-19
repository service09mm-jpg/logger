import { describe, expect, it } from "vitest";
import type { Entry } from "@/features/metrics";
import { listRecentPeriods } from "@/features/targets";
import { buildPeriodBars, maxBarValue } from "./periodBars";

function entry(value: number, localDate: string): Entry {
  return {
    id: `entry-${localDate}-${value}`,
    metricId: "metric-1",
    value,
    localDate,
    at: new Date(`${localDate}T12:00:00.000Z`),
    note: null,
  };
}

describe("buildPeriodBars", () => {
  const weeks = listRecentPeriods("WEEK", "2026-09-19", 2);

  it("розкладає записи по тижнях", () => {
    const bars = buildPeriodBars(
      weeks,
      [entry(20, "2026-09-08"), entry(30, "2026-09-15"), entry(45, "2026-09-19")],
      "SUM"
    );
    expect(bars[0].value).toBe(20);
    expect(bars[1].value).toBe(75);
  });

  it("тиждень без записів дає null, а не нуль", () => {
    const bars = buildPeriodBars(weeks, [entry(45, "2026-09-19")], "SUM");
    expect(bars[0].value).toBeNull();
    expect(bars[1].value).toBe(45);
  });

  it("рахує період тією самою агрегацією, що й картка", () => {
    const bars = buildPeriodBars(
      weeks,
      [entry(2, "2026-09-15"), entry(4, "2026-09-16")],
      "AVG"
    );
    expect(bars[1].value).toBe(3);
  });

  it("COUNT рахує кількість записів у періоді", () => {
    const bars = buildPeriodBars(
      weeks,
      [entry(1, "2026-09-15"), entry(1, "2026-09-16"), entry(1, "2026-09-09")],
      "COUNT"
    );
    expect(bars[0].value).toBe(1);
    expect(bars[1].value).toBe(2);
  });
});

describe("maxBarValue", () => {
  it("знаходить найвищий стовпчик", () => {
    const weeks = listRecentPeriods("WEEK", "2026-09-19", 2);
    const bars = buildPeriodBars(
      weeks,
      [entry(20, "2026-09-08"), entry(75, "2026-09-15")],
      "SUM"
    );
    expect(maxBarValue(bars)).toBe(75);
  });

  it("порожні стовпчики дають нуль", () => {
    expect(maxBarValue([])).toBe(0);
  });
});
