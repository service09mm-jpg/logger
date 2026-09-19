import { describe, expect, it } from "vitest";
import { en } from "./en";
import { uk } from "./uk";
import { getDictionary, isLocale } from "./index";

function collectKeys(value: unknown, prefix: string): string[] {
  if (value === null || typeof value !== "object") {
    return [prefix];
  }
  if (Array.isArray(value)) {
    return [`${prefix}[]`];
  }

  const keys: string[] = [];
  for (const [key, nested] of Object.entries(value)) {
    keys.push(...collectKeys(nested, prefix === "" ? key : `${prefix}.${key}`));
  }
  return keys.sort();
}

describe("словники", () => {
  it("мають однаковий набір ключів", () => {
    expect(collectKeys(en, "")).toEqual(collectKeys(uk, ""));
  });

  it("не містять порожніх рядків", () => {
    const flatten = (value: unknown): string[] => {
      if (typeof value === "string") {
        return [value];
      }
      if (Array.isArray(value)) {
        return value.flatMap(flatten);
      }
      if (value !== null && typeof value === "object") {
        return Object.values(value).flatMap(flatten);
      }
      return [];
    };

    for (const text of [...flatten(uk), ...flatten(en)]) {
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  it("мають по сім днів тижня, починаючи з понеділка", () => {
    expect(uk.weekdays).toHaveLength(7);
    expect(en.weekdays).toHaveLength(7);
    expect(uk.weekdays[0]).toBe("Пн");
    expect(en.weekdays[0]).toBe("Mon");
  });
});

describe("getDictionary", () => {
  it("віддає словник обраної мови", () => {
    expect(getDictionary("uk").dashboard.title).toBe("Сьогодні");
    expect(getDictionary("en").dashboard.title).toBe("Today");
  });
});

describe("isLocale", () => {
  it("приймає лише підтримувані мови", () => {
    expect(isLocale("uk")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(false);
  });
});
