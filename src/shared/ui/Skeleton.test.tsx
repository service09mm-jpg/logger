import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DashboardLoading from "@/app/loading";
import MetricLoading from "@/app/metrics/[id]/loading";
import { FormLoading, Skeleton } from "./Skeleton";

/**
 * Кістяки нічим не покриті, крім цих тестів: вони показуються долі секунди й
 * на скріншот майже не ловляться. Перевіряємо мінімум — що вони взагалі
 * малюються (файл `loading.tsx`, який падає, забирає з собою всю сторінку) і
 * що для скрінрідера їх не існує.
 */
describe("кістяки", () => {
  it("малюють пульсуючі блоки", () => {
    const { container } = render(<Skeleton className="h-4 w-10" />);
    const block = container.firstElementChild;

    expect(block?.className).toContain("animate-pulse");
    expect(block?.getAttribute("aria-hidden")).toBe("true");
  });

  it("форма показує стільки полів, скільки просили", () => {
    const { container } = render(<FormLoading fields={4} />);

    // Поле — це підпис плюс саме поле, тож блоків удвічі більше, плюс шапка
    // з двох і кнопка.
    expect(container.querySelectorAll(".animate-pulse").length).toBe(4 * 2 + 3);
  });

  it("кістяк головної малюється", () => {
    const { container } = render(<DashboardLoading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("кістяк сторінки метрики малюється", () => {
    const { container } = render(<MetricLoading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("нічого не повідомляє скрінрідеру", () => {
    render(<DashboardLoading />);
    expect(screen.queryByRole("status")).toBeNull();
  });
});
