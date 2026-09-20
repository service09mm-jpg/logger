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

/** На картці вже є 400 — щоб було видно, що нове значення додалось. */
const entries: Entry[] = [
  {
    id: "entry-0",
    metricId: metric.id,
    value: 400,
    localDate: TODAY,
    at: new Date(`${TODAY}T08:00:00.000Z`),
    note: null,
  },
];


/** Пошук тексту без огляду на пробіли — див. MetricCard.test.tsx. */
function textIs(expected: string) {
  const compact = (text: string): string => text.replace(/\s/g, "");
  return (_content: string, element: Element | null): boolean =>
    element !== null &&
    element.children.length === 0 &&
    compact(element.textContent ?? "") === compact(expected);
}

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

    // Спершу дочекатись, поки шторка піде сама: поки вона на екрані, її
    // «Скасувати» називається так само, як кнопка відкату в тості.
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "7" })).toBeNull()
    );

    // Ні «Записано», ні кнопки відкату: відповіддю на вдалий запис служить
    // саме значення на картці, яке змінюється ще до відповіді сервера.
    expect(screen.queryByRole("button", { name: uk.common.undo })).toBeNull();
  });

  it("шторка закривається сама, без окремого тапу", async () => {
    const logEntryAction = vi.fn(async () => ({ entryId: "entry-1" }));
    renderList(logEntryAction);

    logSeven();

    // Одразу після ✓ шторка ще на екрані — саме в ці мілісекунди юзер бачить
    // галочку під пальцем.
    expect(screen.queryByRole("button", { name: "7" })).not.toBeNull();

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "7" })).toBeNull()
    );
  });

  it("показує повідомлення, якщо запис не дійшов до сервера", async () => {
    const logEntryAction = vi.fn(async () => ({ error: true as const }));
    renderList(logEntryAction);

    logSeven();

    expect(await screen.findByText(uk.entry.failed)).toBeTruthy();
  });

  it("показує оновлене значення ще у відкритій шторці", async () => {
    const logEntryAction = vi.fn(async () => ({ entryId: "entry-1" }));
    renderList(logEntryAction);

    fireEvent.click(
      screen.getByRole("button", {
        name: `${uk.entry.logTitle}: ${metric.name}`,
      })
    );
    // Поки набираємо, у шторці стоїть теперішній підсумок.
    expect(screen.getAllByText(textIs("400")).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: uk.entry.submit }));

    // Шторка ще на екрані — і підсумок у ній уже новий. Саме це юзер і бачить
    // замість зниклого вікна.
    await waitFor(() =>
      expect(screen.getAllByText(textIs("650")).length).toBeGreaterThan(0)
    );
    expect(screen.queryByRole("button", { name: "7" })).not.toBeNull();
  });
});
