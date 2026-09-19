import { describe, expect, it } from "vitest";
import type { Entry } from "@/features/metrics";
import { aggregateEntries } from "./aggregateEntries";

function entry(value: number, at: string): Entry {
  return {
    id: `entry-${at}-${value}`,
    metricId: "metric",
    value,
    localDate: at.slice(0, 10),
    at: new Date(at),
    note: null,
  };
}

describe("aggregateEntries", () => {
  it("повертає null, коли записів немає", () => {
    expect(aggregateEntries([], "SUM")).toBeNull();
    expect(aggregateEntries([], "COUNT")).toBeNull();
  });

  it("SUM додає значення — калорії за день", () => {
    const entries = [
      entry(400, "2026-09-19T08:00:00.000Z"),
      entry(650, "2026-09-19T13:00:00.000Z"),
      entry(300, "2026-09-19T19:00:00.000Z"),
    ];
    expect(aggregateEntries(entries, "SUM")).toBe(1350);
  });

  it("LAST бере найпізніший запис — вагу, а не суму зважувань", () => {
    const entries = [
      entry(78.2, "2026-09-19T07:00:00.000Z"),
      entry(79.1, "2026-09-19T21:00:00.000Z"),
    ];
    expect(aggregateEntries(entries, "LAST")).toBe(79.1);
  });

  it("LAST не залежить від порядку записів у списку", () => {
    const entries = [
      entry(79.1, "2026-09-19T21:00:00.000Z"),
      entry(78.2, "2026-09-19T07:00:00.000Z"),
    ];
    expect(aggregateEntries(entries, "LAST")).toBe(79.1);
  });

  it("AVG усереднює — настрій за день", () => {
    const entries = [
      entry(7, "2026-09-19T09:00:00.000Z"),
      entry(4, "2026-09-19T14:00:00.000Z"),
      entry(8, "2026-09-19T20:00:00.000Z"),
    ];
    expect(aggregateEntries(entries, "AVG")).toBeCloseTo(6.333, 3);
  });

  it("COUNT рахує кількість записів, а не їхню суму", () => {
    const entries = [
      entry(1, "2026-09-19T09:00:00.000Z"),
      entry(1, "2026-09-20T09:00:00.000Z"),
    ];
    expect(aggregateEntries(entries, "COUNT")).toBe(2);
  });

  it("розрізняє «нема записів» і «залоговано нуль»", () => {
    expect(aggregateEntries([], "SUM")).toBeNull();
    expect(aggregateEntries([entry(0, "2026-09-19T09:00:00.000Z")], "SUM")).toBe(
      0
    );
  });
});
