import { describe, expect, it } from "vitest";
import {
  isAggregation,
  isTargetDirection,
  isTargetPeriod,
  listAggregations,
  listTargetPeriods,
} from "./metricGuards";

describe("перевірки значень з форми", () => {
  it("пропускають відомі значення", () => {
    expect(isAggregation("SUM")).toBe(true);
    expect(isTargetDirection("AT_MOST")).toBe(true);
    expect(isTargetPeriod("WEEK")).toBe(true);
  });

  it("відкидають усе інше, включно з іншим регістром", () => {
    expect(isAggregation("sum")).toBe(false);
    expect(isAggregation("DROP TABLE")).toBe(false);
    expect(isTargetDirection("")).toBe(false);
    expect(isTargetPeriod("DECADE")).toBe(false);
  });
});

describe("списки для випадайок", () => {
  it("містять усі варіанти", () => {
    expect(listAggregations()).toEqual(["SUM", "AVG", "LAST", "COUNT"]);
    expect(listTargetPeriods()).toEqual(["DAY", "WEEK", "MONTH", "YEAR"]);
  });

  it("віддають копію, яку не можна зіпсувати ззовні", () => {
    const first = listAggregations();
    first.push("SUM");
    expect(listAggregations()).toHaveLength(4);
  });
});
