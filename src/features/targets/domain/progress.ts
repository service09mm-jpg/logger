import type { TargetDirection } from "@/features/metrics";

export type TargetProgress = {
  /** Скільки вже є. `null` — записів за період не було. */
  current: number | null;
  targetValue: number;
  /** Частка від 0 до 1 — те, чим заповнюється смужка на картці. */
  ratio: number;
  reached: boolean;
};

/**
 * Поточний стан цілі. Це чиста функція від записів: жодного «фінального
 * вердикту» наприкінці періоду не існує, тому ловити момент його закриття
 * нікому не треба.
 *
 * Порожній період (`current === null`) не вважається виконаним навіть для
 * цілі «не більше ніж»: формально нуль у межі вкладається, але показувати
 * «виконано» за день, у якому нічого не сталось, — це брехня.
 */
export function calculateProgress(input: {
  current: number | null;
  targetValue: number;
  targetDirection: TargetDirection;
}): TargetProgress {
  const { current, targetValue, targetDirection } = input;

  if (current === null) {
    return { current: null, targetValue, ratio: 0, reached: false };
  }

  const reached =
    targetDirection === "AT_LEAST" ? current >= targetValue : current <= targetValue;

  return { current, targetValue, ratio: toRatio(current, targetValue), reached };
}

function toRatio(current: number, targetValue: number): number {
  if (targetValue <= 0) {
    return 0;
  }
  const ratio = current / targetValue;
  if (ratio < 0) {
    return 0;
  }
  if (ratio > 1) {
    return 1;
  }
  return ratio;
}
