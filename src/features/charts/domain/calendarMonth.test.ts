import { describe, expect, it } from "vitest";
import { buildCalendarMonth, maxValueInWeeks } from "./calendarMonth";

describe("buildCalendarMonth", () => {
  it("у кожному тижні рівно сім днів", () => {
    const weeks = buildCalendarMonth("2026-09-19", new Map());
    for (const week of weeks) {
      expect(week).toHaveLength(7);
    }
  });

  it("починає сітку з понеділка перед першим числом", () => {
    // 1 вересня 2026 — вівторок, тож сітка стартує з 31 серпня.
    const weeks = buildCalendarMonth("2026-09-19", new Map());
    expect(weeks[0][0].iso).toBe("2026-08-31");
    expect(weeks[0][0].inMonth).toBe(false);
    expect(weeks[0][1].iso).toBe("2026-09-01");
    expect(weeks[0][1].inMonth).toBe(true);
  });

  it("закінчує сітку неділею після останнього числа", () => {
    const weeks = buildCalendarMonth("2026-09-19", new Map());
    const lastWeek = weeks[weeks.length - 1];
    expect(lastWeek[6].iso).toBe("2026-10-04");
    expect(lastWeek[6].inMonth).toBe(false);
  });

  it("розкладає значення по своїх днях, решту лишає порожніми", () => {
    const weeks = buildCalendarMonth(
      "2026-09-19",
      new Map([
        ["2026-09-01", 1350],
        ["2026-09-19", 900],
      ])
    );
    const allCells = weeks.flat();
    const first = allCells.find((cell) => cell.iso === "2026-09-01");
    const logged = allCells.find((cell) => cell.iso === "2026-09-19");
    const empty = allCells.find((cell) => cell.iso === "2026-09-02");

    expect(first?.value).toBe(1350);
    expect(logged?.value).toBe(900);
    expect(empty?.value).toBeNull();
  });

  it("місяць, що починається в понеділок, не отримує зайвого тижня спереду", () => {
    // 1 червня 2026 — понеділок.
    const weeks = buildCalendarMonth("2026-06-15", new Map());
    expect(weeks[0][0].iso).toBe("2026-06-01");
    expect(weeks[0][0].inMonth).toBe(true);
  });
});

describe("maxValueInWeeks", () => {
  it("знаходить найбільше значення", () => {
    const weeks = buildCalendarMonth(
      "2026-09-19",
      new Map([
        ["2026-09-01", 1350],
        ["2026-09-19", 2400],
      ])
    );
    expect(maxValueInWeeks(weeks)).toBe(2400);
  });

  it("порожній місяць дає нуль", () => {
    expect(maxValueInWeeks(buildCalendarMonth("2026-09-19", new Map()))).toBe(0);
  });
});
