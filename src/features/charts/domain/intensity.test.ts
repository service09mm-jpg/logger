import { describe, expect, it } from "vitest";
import { calculateIntensity } from "./intensity";

describe("calculateIntensity", () => {
  it("порожній день не фарбується", () => {
    expect(calculateIntensity(null, 2000)).toBe(0);
  });

  it("запис на нуль видно — він не такий самий, як відсутність запису", () => {
    expect(calculateIntensity(0, 2000)).toBe(1);
  });

  it("розкладає значення на чотири рівні", () => {
    expect(calculateIntensity(400, 2000)).toBe(1);
    expect(calculateIntensity(800, 2000)).toBe(2);
    expect(calculateIntensity(1400, 2000)).toBe(3);
    expect(calculateIntensity(2000, 2000)).toBe(4);
  });

  it("не ламається на виродженій шкалі", () => {
    expect(calculateIntensity(5, 0)).toBe(1);
  });

  it("значення понад шкалу лишається найтемнішим рівнем", () => {
    expect(calculateIntensity(5000, 2000)).toBe(4);
  });
});
