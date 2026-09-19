/**
 * Наскільки «насичено» фарбується клітинка календаря: 0 — записів не було,
 * 4 — значення на рівні шкали або вище.
 *
 * Шкалою слугує ціль, якщо вона є. Якщо цілі немає, викликач передає
 * найбільше значення за видимий проміжок — тоді градієнт показує відносну
 * інтенсивність: найактивніший день найтемніший.
 */
export type IntensityLevel = 0 | 1 | 2 | 3 | 4;

export function calculateIntensity(
  value: number | null,
  scaleMax: number
): IntensityLevel {
  if (value === null) {
    return 0;
  }

  // Запис на нуль — це все одно запис, і він має відрізнятись від порожнього
  // дня. Те саме, якщо шкала вироджена (усі значення нульові).
  if (scaleMax <= 0 || value <= 0) {
    return 1;
  }

  const ratio = value / scaleMax;
  if (ratio < 0.25) {
    return 1;
  }
  if (ratio < 0.5) {
    return 2;
  }
  if (ratio < 0.75) {
    return 3;
  }
  return 4;
}
