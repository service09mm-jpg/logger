import { describe, expect, it } from "vitest";
import type { Entry } from "@/features/metrics";
import { buildDailyValues, toSortedPoints } from "./dailyValues";

function entry(value: number, localDate: string, hour = 12): Entry {
  return {
    id: `entry-${localDate}-${value}`,
    metricId: "metric-1",
    value,
    localDate,
    at: new Date(`${localDate}T${String(hour).padStart(2, "0")}:00:00.000Z`),
    note: null,
  };
}

describe("buildDailyValues", () => {
  it("зводить кілька записів одного дня в одне число", () => {
    const values = buildDailyValues(
      [entry(400, "2026-09-19"), entry(650, "2026-09-19"), entry(900, "2026-09-18")],
      "SUM"
    );
    expect(values.get("2026-09-19")).toBe(1050);
    expect(values.get("2026-09-18")).toBe(900);
  });

  it("для LAST бере останній запис дня, а не суму", () => {
    const values = buildDailyValues(
      [entry(78.2, "2026-09-19", 7), entry(79.1, "2026-09-19", 21)],
      "LAST"
    );
    expect(values.get("2026-09-19")).toBe(79.1);
  });

  it("дні без записів у мапу не потрапляють", () => {
    const values = buildDailyValues([entry(400, "2026-09-19")], "SUM");
    expect(values.has("2026-09-18")).toBe(false);
  });
});

describe("toSortedPoints", () => {
  it("вишиковує дні за зростанням", () => {
    const points = toSortedPoints(
      new Map([
        ["2026-09-19", 3],
        ["2026-09-01", 1],
        ["2026-09-10", 2],
      ])
    );
    expect(points.map((point) => point.iso)).toEqual([
      "2026-09-01",
      "2026-09-10",
      "2026-09-19",
    ]);
  });
});
