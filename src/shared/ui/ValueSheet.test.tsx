import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ValueSheet } from "./ValueSheet";

const texts = {
  title: "Калорії",
  date: "Дата",
  submit: "Записати",
  cancel: "Скасувати",
};

function renderSheet(initialValue = "") {
  const onSubmit = vi.fn();
  const onClose = vi.fn();
  render(
    <ValueSheet
      open
      label="Калорії"
      unit="ккал"
      initialValue={initialValue}
      initialDate="2026-09-19"
      texts={texts}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
  return { onSubmit, onClose };
}

describe("ValueSheet", () => {
  it("набирає число на numpad і віддає його разом з днем", () => {
    const { onSubmit } = renderSheet();

    fireEvent.click(screen.getByRole("button", { name: "4" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: texts.submit }));

    expect(onSubmit).toHaveBeenCalledWith(400, "2026-09-19");
  });

  it("стирає останню цифру", () => {
    const { onSubmit } = renderSheet();

    fireEvent.click(screen.getByRole("button", { name: "4" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "backspace" }));
    fireEvent.click(screen.getByRole("button", { name: texts.submit }));

    expect(onSubmit).toHaveBeenCalledWith(4, "2026-09-19");
  });

  it("не дає поставити другу крапку", () => {
    const { onSubmit } = renderSheet();

    fireEvent.click(screen.getByRole("button", { name: "7" }));
    fireEvent.click(screen.getByRole("button", { name: "." }));
    fireEvent.click(screen.getByRole("button", { name: "." }));
    fireEvent.click(screen.getByRole("button", { name: "9" }));
    fireEvent.click(screen.getByRole("button", { name: texts.submit }));

    expect(onSubmit).toHaveBeenCalledWith(7.9, "2026-09-19");
  });

  it("починає з попереднього значення — сценарій ваги", () => {
    const { onSubmit } = renderSheet("79.1");
    fireEvent.click(screen.getByRole("button", { name: texts.submit }));
    expect(onSubmit).toHaveBeenCalledWith(79.1, "2026-09-19");
  });

  it("не дає записати порожнє значення", () => {
    const { onSubmit } = renderSheet();
    fireEvent.click(screen.getByRole("button", { name: texts.submit }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("записує обрану дату заднім числом", () => {
    const { onSubmit } = renderSheet("5");

    fireEvent.change(screen.getByLabelText("Дата"), {
      target: { value: "2026-09-17" },
    });
    fireEvent.click(screen.getByRole("button", { name: texts.submit }));

    expect(onSubmit).toHaveBeenCalledWith(5, "2026-09-17");
  });
  it("не відправляє запис двічі, якщо швидко тапнути ✓ два рази", () => {
    const { onSubmit } = renderSheet();

    fireEvent.click(screen.getByRole("button", { name: "7" }));
    const submit = screen.getByRole("button", { name: texts.submit });
    fireEvent.click(submit);
    fireEvent.click(submit);

    // Шторка закривається не миттєво, тож другий тап цілком реальний — а це
    // був би другий запис у базі.
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
