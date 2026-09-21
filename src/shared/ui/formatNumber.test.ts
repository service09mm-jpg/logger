import { describe, expect, it } from "vitest";
import { formatCompactNumber } from "./formatNumber";

/** Пробіли в українських тисячах нерозривні — порівнюємо без них. */
const compact = (text: string): string => text.replace(/\s/g, "");

describe("formatCompactNumber", () => {
  it("малі числа лишає як є", () => {
    expect(formatCompactNumber(42, "uk", "к")).toBe("42");
    expect(formatCompactNumber(2.5, "uk", "к")).toBe("2,5");
    expect(compact(formatCompactNumber(999, "uk", "к"))).toBe("999");
  });

  it("тисячі скорочує з десятою часткою", () => {
    expect(formatCompactNumber(1750, "uk", "к")).toBe("1,8к");
    expect(formatCompactNumber(2000, "uk", "к")).toBe("2к");
  });

  it("від десяти тисяч десята частка вже нічого не додає", () => {
    expect(compact(formatCompactNumber(12500, "uk", "к"))).toBe("13к");
  });

  it("суфікс бере з мови", () => {
    expect(formatCompactNumber(1500, "en", "k")).toBe("1.5k");
  });

  it("від'ємні числа теж скорочує", () => {
    expect(formatCompactNumber(-1500, "uk", "к")).toBe("-1,5к");
  });
});
