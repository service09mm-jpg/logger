import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Entry, Metric } from "@/features/metrics";
import { summarizeMetric } from "@/features/targets";
import { uk } from "@/shared/i18n/uk";
import { MetricList } from "./MetricList";

const TODAY = "2026-09-19";

const metric: Metric = {
  id: "metric-1",
  name: "Калорії",
  unit: "ккал",
  aggregation: "SUM",
  targetValue: 2000,
  targetDirection: "AT_MOST",
  targetPeriod: "DAY",
  color: "#4f7cac",
  sortOrder: 0,
};

const entries: Entry[] = [];

function renderList(
  logEntryAction: (input: {
    metricId: string;
    value: number;
    localDate: string;
  }) => Promise<{ entryId: string } | { error: true }>
) {
  render(
    <MetricList
      summaries={[summarizeMetric(metric, entries, TODAY)]}
      dict={uk}
      locale="uk"
      todayIso={TODAY}
      logEntryAction={logEntryAction}
    />
  );
}

/** Відкриває шторку й записує значення 7. */
function logSeven(): void {
  fireEvent.click(
    screen.getByRole("button", { name: `${uk.entry.logTitle}: ${metric.name}` })
  );
  fireEvent.click(screen.getByRole("button", { name: "7" }));
  fireEvent.click(screen.getByRole("button", { name: uk.entry.submit }));
}

describe("MetricList", () => {
  it("після запису не показує банер підтвердження", async () => {
    const logEntryAction = vi.fn(async () => ({ entryId: "entry-1" }));
    renderList(logEntryAction);

    logSeven();

    await waitFor(() => expect(logEntryAction).toHaveBeenCalledTimes(1));
    // Ні «Записано», ні кнопки відкату: відповіддю на вдалий запис служить
    // саме значення на картці, яке змінюється ще до відповіді сервера.
    expect(screen.queryByRole("button", { name: uk.common.undo })).toBeNull();
  });

  it("показує повідомлення, якщо запис не дійшов до сервера", async () => {
    const logEntryAction = vi.fn(async () => ({ error: true as const }));
    renderList(logEntryAction);

    logSeven();

    expect(await screen.findByText(uk.entry.failed)).toBeTruthy();
  });
});
