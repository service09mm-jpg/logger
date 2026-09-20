import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("показує галочку замість підпису одразу після ✓", () => {
    const { onSubmit } = renderSheet();

    fireEvent.click(screen.getByRole("button", { name: "7" }));
    fireEvent.click(screen.getByRole("button", { name: texts.submit }));

    // Кнопка лишається на місці, але тепер на ній галочка — підтвердження
    // з'являється там, де щойно був палець.
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText(texts.submit).textContent).toBe("✓");
  });

  it("закривається сама трохи згодом, а не в мить тапу", async () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    render(
      <ValueSheet
        open
        label="Калорії"
        unit="ккал"
        initialValue=""
        initialDate="2026-09-19"
        texts={texts}
        onSubmit={onSubmit}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "7" }));
    fireEvent.click(screen.getByRole("button", { name: texts.submit }));

    // Запис пішов одразу, а шторка ще на екрані.
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("показує курсор, щоб було видно, куди набирається число", () => {
    renderSheet();

    const caret = screen.getByTestId("caret");
    expect(caret.className).toContain("animate-caret");
    // Для скрінрідера курсора не існує: він нічого не повідомляє, а число
    // поруч і так озвучується.
    expect(caret.getAttribute("aria-hidden")).toBe("true");
  });

  it("поки нічого не набрано, нуль сірий", () => {
    renderSheet();
    // Нуль є і на numpad, тому шукаємо саме той, що в полі: на кнопках
    // numpad інший тег.
    expect(
      screen.getByText("0", { selector: "span" }).className
    ).toContain("text-muted");

    fireEvent.click(screen.getByRole("button", { name: "5" }));

    expect(
      screen.getByText("5", { selector: "span" }).className
    ).not.toContain("text-muted");
  });
});
