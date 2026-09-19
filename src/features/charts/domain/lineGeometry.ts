import { daysBetween } from "@/features/targets";
import type { IsoDate } from "@/features/targets";

export type LinePoint = {
  iso: IsoDate;
  value: number;
};

export type PlottedPoint = {
  x: number;
  y: number;
  iso: IsoDate;
  value: number;
};

export type LineGeometry = {
  points: PlottedPoint[];
  /** Готовий атрибут `points` для SVG-елемента <polyline>. */
  polyline: string;
  /** Координата Y горизонтальної лінії цілі, або `null` якщо цілі немає. */
  targetY: number | null;
  minValue: number;
  maxValue: number;
};

/**
 * Перекладає значення в координати всередині SVG.
 *
 * Вісь X — реальна відстань у днях, а не номер точки: двотижнева пауза у
 * зважуваннях має виглядати як пауза, а не як звичайний крок.
 *
 * Вісь Y в SVG росте вниз, тому більше значення дає менший `y`.
 */
export function buildLineGeometry(
  points: readonly LinePoint[],
  options: { width: number; height: number; targetValue: number | null }
): LineGeometry {
  const { width, height, targetValue } = options;

  if (points.length === 0) {
    return { points: [], polyline: "", targetY: null, minValue: 0, maxValue: 0 };
  }

  const values: number[] = [];
  for (const point of points) {
    values.push(point.value);
  }
  if (targetValue !== null) {
    values.push(targetValue);
  }

  let minValue = values[0];
  let maxValue = values[0];
  for (const value of values) {
    if (value < minValue) {
      minValue = value;
    }
    if (value > maxValue) {
      maxValue = value;
    }
  }

  const span = maxValue - minValue;
  const toY = (value: number): number => {
    // Усі значення однакові — малюємо лінію посередині, інакше ділили б на нуль.
    if (span === 0) {
      return height / 2;
    }
    return height - ((value - minValue) / span) * height;
  };

  const firstIso = points[0].iso;
  const lastIso = points[points.length - 1].iso;
  const totalDays = daysBetween(firstIso, lastIso);

  const plotted: PlottedPoint[] = [];
  for (const point of points) {
    const x =
      totalDays === 0 ? width / 2 : (daysBetween(firstIso, point.iso) / totalDays) * width;
    plotted.push({ x, y: toY(point.value), iso: point.iso, value: point.value });
  }

  const polylineParts: string[] = [];
  for (const point of plotted) {
    polylineParts.push(`${round(point.x)},${round(point.y)}`);
  }

  return {
    points: plotted,
    polyline: polylineParts.join(" "),
    targetY: targetValue === null ? null : toY(targetValue),
    minValue,
    maxValue,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
