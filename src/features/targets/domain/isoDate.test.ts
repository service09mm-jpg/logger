import { describe, expect, it } from "vitest";
import {
  addDays,
  daysBetween,
  fromIsoDate,
  isIsoDate,
  isoWeekday,
  middayOf,
  toIsoDate,
  todayIsoInTimeZone,
} from "./isoDate";

describe("isIsoDate", () => {
  it("приймає справжній день", () => {
    expect(isIsoDate("2026-09-19")).toBe(true);
  });

  it("відкидає неправильну форму", () => {
    expect(isIsoDate("19.09.2026")).toBe(false);
    expect(isIsoDate("2026-9-19")).toBe(false);
    expect(isIsoDate("")).toBe(false);
  });

  it("відкидає дату, якої не існує", () => {
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("2026-13-01")).toBe(false);
  });

  it("приймає 29 лютого у високосний рік і відкидає у звичайний", () => {
    expect(isIsoDate("2024-02-29")).toBe(true);
    expect(isIsoDate("2026-02-29")).toBe(false);
  });
});

describe("toIsoDate", () => {
  it("читає день з опівночі UTC — саме так Prisma віддає колонку DATE", () => {
    expect(toIsoDate(new Date("2026-09-19T00:00:00.000Z"))).toBe("2026-09-19");
  });

  it("доповнює місяць і день нулями", () => {
    expect(toIsoDate(new Date("2026-01-05T00:00:00.000Z"))).toBe("2026-01-05");
  });
});

describe("fromIsoDate", () => {
  it("повертає опівніч UTC", () => {
    expect(fromIsoDate("2026-09-19").toISOString()).toBe(
      "2026-09-19T00:00:00.000Z"
    );
  });
});

describe("addDays", () => {
  it("переходить через межу місяця", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
  });

  it("переходить через межу року назад", () => {
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });

  it("враховує високосний рік", () => {
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
  });
});

describe("daysBetween", () => {
  it("рахує відстань у днях", () => {
    expect(daysBetween("2026-09-01", "2026-09-19")).toBe(18);
    expect(daysBetween("2026-09-19", "2026-09-19")).toBe(0);
    expect(daysBetween("2026-09-19", "2026-09-01")).toBe(-18);
  });
});

describe("isoWeekday", () => {
  it("рахує понеділок першим днем тижня", () => {
    expect(isoWeekday("2026-09-14")).toBe(1);
    expect(isoWeekday("2026-09-20")).toBe(7);
  });
});

describe("todayIsoInTimeZone", () => {
  // 20:30 UTC — у Києві вже наступна доба тільки після 21:00 (літом 22:00),
  // а в Окленді вона почалась задовго до того.
  const evening = new Date("2026-09-19T20:30:00.000Z");

  it("бере день з таймзони юзера, а не з UTC", () => {
    expect(todayIsoInTimeZone(evening, "Europe/Kyiv")).toBe("2026-09-19");
    expect(todayIsoInTimeZone(evening, "Pacific/Auckland")).toBe("2026-09-20");
    expect(todayIsoInTimeZone(evening, "America/Los_Angeles")).toBe("2026-09-19");
  });

  it("на межі доби віддає різні дні для різних таймзон", () => {
    const justBeforeMidnightUtc = new Date("2026-09-19T23:30:00.000Z");
    expect(todayIsoInTimeZone(justBeforeMidnightUtc, "Europe/Kyiv")).toBe(
      "2026-09-20"
    );
    expect(todayIsoInTimeZone(justBeforeMidnightUtc, "UTC")).toBe("2026-09-19");
  });

  it("відкочується на UTC, якщо таймзона не існує", () => {
    expect(todayIsoInTimeZone(evening, "Not/AZone")).toBe("2026-09-19");
  });
});

describe("middayOf", () => {
  it("дає полудень UTC цього дня", () => {
    expect(middayOf("2026-09-19").toISOString()).toBe(
      "2026-09-19T12:00:00.000Z"
    );
  });

  it("лишається в межах доби навіть у далеких таймзонах", () => {
    const midday = middayOf("2026-09-19");
    const inAuckland = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Pacific/Auckland",
    }).format(midday);
    const inLosAngeles = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Los_Angeles",
    }).format(midday);
    expect(inAuckland).toBe("2026-09-20");
    expect(inLosAngeles).toBe("2026-09-19");
  });
});
