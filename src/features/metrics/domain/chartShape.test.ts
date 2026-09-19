import { describe, expect, it } from "vitest";
import { getChartShape } from "./chartShape";

describe("getChartShape", () => {
  it("малює вагу лінією, бо в неї важлива траєкторія", () => {
    expect(getChartShape("LAST", "DAY")).toBe("LINE");
    expect(getChartShape("LAST", "WEEK")).toBe("LINE");
  });

  it("малює календар, коли ціль денна", () => {
    expect(getChartShape("SUM", "DAY")).toBe("CALENDAR");
    expect(getChartShape("COUNT", "DAY")).toBe("CALENDAR");
    expect(getChartShape("AVG", "DAY")).toBe("CALENDAR");
  });

  it("малює стовпчики, коли ціль на тиждень або довше", () => {
    expect(getChartShape("SUM", "WEEK")).toBe("BARS");
    expect(getChartShape("COUNT", "MONTH")).toBe("BARS");
    expect(getChartShape("SUM", "YEAR")).toBe("BARS");
  });
});
