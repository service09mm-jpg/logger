import { describe, expect, it } from "vitest";
import { buildLineGeometry } from "./lineGeometry";

const size = { width: 100, height: 50 };

describe("buildLineGeometry", () => {
  it("порожній список дає порожню геометрію", () => {
    const geometry = buildLineGeometry([], { ...size, targetValue: null });
    expect(geometry.points).toEqual([]);
    expect(geometry.polyline).toBe("");
  });

  it("єдину точку ставить посередині", () => {
    const geometry = buildLineGeometry([{ iso: "2026-09-19", value: 79 }], {
      ...size,
      targetValue: null,
    });
    expect(geometry.points[0].x).toBe(50);
    expect(geometry.points[0].y).toBe(25);
  });

  it("найбільше значення опиняється вгорі, найменше внизу", () => {
    const geometry = buildLineGeometry(
      [
        { iso: "2026-09-17", value: 78 },
        { iso: "2026-09-19", value: 80 },
      ],
      { ...size, targetValue: null }
    );
    expect(geometry.points[0].y).toBe(50);
    expect(geometry.points[1].y).toBe(0);
  });

  it("розставляє точки за відстанню в днях, а не за їхнім номером", () => {
    const geometry = buildLineGeometry(
      [
        { iso: "2026-09-01", value: 80 },
        { iso: "2026-09-03", value: 79 },
        { iso: "2026-09-11", value: 78 },
      ],
      { ...size, targetValue: null }
    );
    // Друга точка — на другий день з десяти, тобто на 20% ширини.
    expect(geometry.points[1].x).toBeCloseTo(20);
    expect(geometry.points[2].x).toBe(100);
  });

  it("однакові значення дають рівну лінію посередині", () => {
    const geometry = buildLineGeometry(
      [
        { iso: "2026-09-17", value: 79 },
        { iso: "2026-09-19", value: 79 },
      ],
      { ...size, targetValue: null }
    );
    expect(geometry.points[0].y).toBe(25);
    expect(geometry.points[1].y).toBe(25);
  });

  it("ціль входить у масштаб, щоб лінія цілі не вилізла за графік", () => {
    const geometry = buildLineGeometry(
      [
        { iso: "2026-09-17", value: 78 },
        { iso: "2026-09-19", value: 80 },
      ],
      { ...size, targetValue: 75 }
    );
    expect(geometry.minValue).toBe(75);
    expect(geometry.targetY).toBe(50);
  });

  it("збирає рядок для SVG-полілінії", () => {
    const geometry = buildLineGeometry(
      [
        { iso: "2026-09-17", value: 78 },
        { iso: "2026-09-19", value: 80 },
      ],
      { ...size, targetValue: null }
    );
    expect(geometry.polyline).toBe("0,50 100,0");
  });
});
