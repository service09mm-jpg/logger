import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Metric } from "@/features/metrics";
import { summarizeMetric } from "@/features/targets";
import type { Entry } from "@/features/metrics";
import { uk } from "@/shared/i18n/uk";
import { MetricCard } from "./MetricCard";

const TODAY = "2026-09-19";

/**
 * Пошук тексту без огляду на пробіли: українське форматування ставить у
 * тисячах нерозривний пробіл, і зіставляти його посимвольно — крихко.
 */
function textIs(expected: string) {
  const compact = (text: string): string => text.replace(/\s/g, "");
  return (_content: string, element: Element | null): boolean =>
    element !== null &&
    element.children.length === 0 &&
    compact(element.textContent ?? "") === compact(expected);
}

function metric(overrides: Partial<Metric> = {}): Metric {
  return {
    id: "metric-1",
    name: "Калорії",
    unit: "ккал",
    aggregation: "SUM",
    targetValue: 2000,
    targetDirection: "AT_MOST",
    targetPeriod: "DAY",
    color: "#4f7cac",
    sortOrder: 0,
    ...overrides,
  };
}

function entry(value: number): Entry {
  return {
    id: `entry-${value}`,
    metricId: "metric-1",
    value,
    localDate: TODAY,
    at: new Date(`${TODAY}T12:00:00.000Z`),
    note: null,
  };
}

function renderCard(
  metricOverrides: Partial<Metric>,
  entries: Entry[],
  onLog = vi.fn()
) {
  const summary = summarizeMetric(metric(metricOverrides), entries, TODAY);
  render(
    <MetricCard summary={summary} dict={uk} locale="uk" onLog={onLog} />
  );
  return onLog;
}

describe("MetricCard", () => {
  it("показує суму за день і одиницю виміру", () => {
    renderCard({}, [entry(400), entry(650)]);
    expect(screen.getByText(textIs("1050"))).toBeInTheDocument();
    expect(screen.getByText("ккал")).toBeInTheDocument();
  });

  it("на порожньому дні показує прочерк, а не нуль", () => {
    renderCard({}, []);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("пише ціль з її напрямом", () => {
    renderCard({}, [entry(400)]);
    expect(
      screen.getByText(textIs("Не більше ніж 2000"))
    ).toBeInTheDocument();
  });

  it("для тижневої цілі дописує період", () => {
    renderCard(
      { targetPeriod: "WEEK", targetValue: 150, targetDirection: "AT_LEAST" },
      [entry(20)]
    );
    expect(
      screen.getByText(textIs("Не менше ніж 150 за тиждень"))
    ).toBeInTheDocument();
  });

  it("без цілі не показує ні підпису цілі, ні смужки прогресу", () => {
    const { container } = render(
      <MetricCard
        summary={summarizeMetric(metric({ targetValue: null }), [entry(400)], TODAY)}
        dict={uk}
        locale="uk"
        onLog={vi.fn()}
      />
    );
    expect(screen.queryByText(/Не більше ніж/)).not.toBeInTheDocument();
    expect(container.querySelectorAll("div[style*='width']")).toHaveLength(0);
  });

  it("веде на сторінку метрики з назви", () => {
    renderCard({}, []);
    expect(screen.getByRole("link", { name: /Калорії/ })).toHaveAttribute(
      "href",
      "/metrics/metric-1"
    );
  });

  it("тап по картці відкриває ввід значення", () => {
    const onLog = renderCard({}, [entry(400)]);
    fireEvent.click(screen.getByRole("button", { name: "Записати: Калорії" }));
    expect(onLog).toHaveBeenCalledTimes(1);
  });
});
