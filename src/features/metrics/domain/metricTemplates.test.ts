import { describe, expect, it } from "vitest";
import { findMetricTemplate, METRIC_TEMPLATES } from "./metricTemplates";

describe("METRIC_TEMPLATES", () => {
  it("не містить двох шаблонів з однаковим id", () => {
    const seen = new Set<string>();
    for (const template of METRIC_TEMPLATES) {
      expect(seen.has(template.id)).toBe(false);
      seen.add(template.id);
    }
  });

  it("не ставить ціль метриці ваги — її задає юзер", () => {
    const weight = findMetricTemplate("weight");
    expect(weight?.suggestedTarget).toBeNull();
  });
});

describe("findMetricTemplate", () => {
  it("повертає шаблон за id", () => {
    expect(findMetricTemplate("water")?.aggregation).toBe("SUM");
  });

  it("повертає null на вигаданий id", () => {
    expect(findMetricTemplate("not-a-template")).toBeNull();
  });
});
