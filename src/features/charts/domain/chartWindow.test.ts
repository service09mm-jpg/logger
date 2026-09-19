import { describe, expect, it } from "vitest";
import { getChartWindow } from "./chartWindow";

describe("getChartWindow", () => {
  it("для лінії бере останні 90 днів", () => {
    expect(
      getChartWindow({ aggregation: "LAST", targetPeriod: "DAY" }, "2026-09-19")
    ).toEqual({ startIso: "2026-06-21", endIso: "2026-09-19" });
  });

  it("для календаря бере поточний місяць", () => {
    expect(
      getChartWindow({ aggregation: "SUM", targetPeriod: "DAY" }, "2026-09-19")
    ).toEqual({ startIso: "2026-09-01", endIso: "2026-09-30" });
  });

  it("для стовпчиків бере вісім періодів назад", () => {
    expect(
      getChartWindow({ aggregation: "SUM", targetPeriod: "WEEK" }, "2026-09-19")
    ).toEqual({ startIso: "2026-07-27", endIso: "2026-09-19" });
  });
});
