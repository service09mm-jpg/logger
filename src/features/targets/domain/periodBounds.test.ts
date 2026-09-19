import { describe, expect, it } from "vitest";
import {
  earliestPeriodStart,
  getPeriodBounds,
  isWithinBounds,
  listRecentPeriods,
} from "./periodBounds";

describe("getPeriodBounds", () => {
  it("для DAY повертає сам день", () => {
    expect(getPeriodBounds("DAY", "2026-09-19")).toEqual({
      startIso: "2026-09-19",
      endIso: "2026-09-19",
    });
  });

  it("для WEEK починає тиждень з понеділка", () => {
    // 2026-09-19 — субота.
    expect(getPeriodBounds("WEEK", "2026-09-19")).toEqual({
      startIso: "2026-09-14",
      endIso: "2026-09-20",
    });
  });

  it("для WEEK лишає неділю в тижні, що минув", () => {
    // 2026-09-20 — неділя, і вона закриває той самий тиждень.
    expect(getPeriodBounds("WEEK", "2026-09-20")).toEqual({
      startIso: "2026-09-14",
      endIso: "2026-09-20",
    });
  });

  it("для WEEK не ламається на межі року", () => {
    // 2026-01-01 — четвер, тиждень починається в попередньому році.
    expect(getPeriodBounds("WEEK", "2026-01-01")).toEqual({
      startIso: "2025-12-29",
      endIso: "2026-01-04",
    });
  });

  it("для MONTH бере весь календарний місяць", () => {
    expect(getPeriodBounds("MONTH", "2026-09-19")).toEqual({
      startIso: "2026-09-01",
      endIso: "2026-09-30",
    });
  });

  it("для MONTH знає довжину лютого у високосний і звичайний рік", () => {
    expect(getPeriodBounds("MONTH", "2024-02-10").endIso).toBe("2024-02-29");
    expect(getPeriodBounds("MONTH", "2026-02-10").endIso).toBe("2026-02-28");
  });

  it("для YEAR бере календарний рік, а не ковзний", () => {
    expect(getPeriodBounds("YEAR", "2026-09-19")).toEqual({
      startIso: "2026-01-01",
      endIso: "2026-12-31",
    });
  });
});

describe("isWithinBounds", () => {
  const week = getPeriodBounds("WEEK", "2026-09-19");

  it("включає обидві межі", () => {
    expect(isWithinBounds("2026-09-14", week)).toBe(true);
    expect(isWithinBounds("2026-09-20", week)).toBe(true);
  });

  it("не включає сусідні дні", () => {
    expect(isWithinBounds("2026-09-13", week)).toBe(false);
    expect(isWithinBounds("2026-09-21", week)).toBe(false);
  });
});

describe("listRecentPeriods", () => {
  it("віддає періоди від найстарішого до поточного", () => {
    const weeks = listRecentPeriods("WEEK", "2026-09-19", 3);
    expect(weeks).toEqual([
      { startIso: "2026-08-31", endIso: "2026-09-06" },
      { startIso: "2026-09-07", endIso: "2026-09-13" },
      { startIso: "2026-09-14", endIso: "2026-09-20" },
    ]);
  });

  it("переходить через межу року для місяців", () => {
    const months = listRecentPeriods("MONTH", "2026-01-15", 2);
    expect(months).toEqual([
      { startIso: "2025-12-01", endIso: "2025-12-31" },
      { startIso: "2026-01-01", endIso: "2026-01-31" },
    ]);
  });

  it("рахує роки календарними", () => {
    const years = listRecentPeriods("YEAR", "2026-09-19", 2);
    expect(years).toEqual([
      { startIso: "2025-01-01", endIso: "2025-12-31" },
      { startIso: "2026-01-01", endIso: "2026-12-31" },
    ]);
  });
});

describe("earliestPeriodStart", () => {
  it("без метрик повертає сьогодні", () => {
    expect(earliestPeriodStart([], "2026-09-19")).toBe("2026-09-19");
  });

  it("бере найширший період зі списку", () => {
    expect(earliestPeriodStart(["DAY", "WEEK"], "2026-09-19")).toBe("2026-09-14");
    expect(earliestPeriodStart(["DAY", "WEEK", "YEAR"], "2026-09-19")).toBe(
      "2026-01-01"
    );
  });
});
