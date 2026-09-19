import { describe, expect, it } from "vitest";
import { calculateProgress } from "./progress";

describe("calculateProgress", () => {
  it("рахує ціль «не менше ніж» виконаною від межі й вище", () => {
    const below = calculateProgress({
      current: 1200,
      targetValue: 2000,
      targetDirection: "AT_LEAST",
    });
    expect(below.reached).toBe(false);
    expect(below.ratio).toBeCloseTo(0.6);

    const exactly = calculateProgress({
      current: 2000,
      targetValue: 2000,
      targetDirection: "AT_LEAST",
    });
    expect(exactly.reached).toBe(true);
  });

  it("рахує ціль «не більше ніж» виконаною, поки не перевищено межу", () => {
    const within = calculateProgress({
      current: 1800,
      targetValue: 2000,
      targetDirection: "AT_MOST",
    });
    expect(within.reached).toBe(true);

    const over = calculateProgress({
      current: 2100,
      targetValue: 2000,
      targetDirection: "AT_MOST",
    });
    expect(over.reached).toBe(false);
  });

  it("не показує виконану ціль, коли записів не було", () => {
    const empty = calculateProgress({
      current: null,
      targetValue: 2000,
      targetDirection: "AT_MOST",
    });
    expect(empty.reached).toBe(false);
    expect(empty.ratio).toBe(0);
  });

  it("не дає смужці вилізти за межі 0..1", () => {
    expect(
      calculateProgress({
        current: 5000,
        targetValue: 2000,
        targetDirection: "AT_LEAST",
      }).ratio
    ).toBe(1);

    expect(
      calculateProgress({
        current: -10,
        targetValue: 2000,
        targetDirection: "AT_LEAST",
      }).ratio
    ).toBe(0);
  });

  it("не ділить на нуль", () => {
    expect(
      calculateProgress({
        current: 10,
        targetValue: 0,
        targetDirection: "AT_LEAST",
      }).ratio
    ).toBe(0);
  });
});
