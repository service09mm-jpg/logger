import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Sheet } from "./Sheet";

/**
 * Тести на поведінку шторки з кнопкою «назад».
 *
 * Історію браузера тут не проганяють по-справжньому: jsdom виконує `back()`
 * асинхронно, і тест залежав би від таймінгу. Замість цього ми стежимо за
 * самими викликами `pushState` і `back()`, а натискання кнопки «назад»
 * імітуємо подією `popstate` — рівно те, що браузер надсилає сторінці.
 */
function spyOnHistory() {
  return {
    pushState: vi.spyOn(window.history, "pushState"),
    back: vi.spyOn(window.history, "back").mockImplementation(() => {}),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Sheet", () => {
  it("кладе в історію запис, коли відкривається", () => {
    const history = spyOnHistory();

    render(
      <Sheet open title="Калорії" onClose={vi.fn()}>
        <p>вміст</p>
      </Sheet>
    );

    expect(history.pushState).toHaveBeenCalledTimes(1);
  });

  it("закритою не чіпає історію", () => {
    const history = spyOnHistory();

    render(
      <Sheet open={false} title="Калорії" onClose={vi.fn()}>
        <p>вміст</p>
      </Sheet>
    );

    expect(history.pushState).not.toHaveBeenCalled();
    expect(screen.queryByText("вміст")).toBeNull();
  });

  it("кнопка «назад» закриває шторку замість переходу на попередню сторінку", () => {
    const history = spyOnHistory();
    const onClose = vi.fn();

    const { unmount } = render(
      <Sheet open title="Калорії" onClose={onClose}>
        <p>вміст</p>
      </Sheet>
    );

    fireEvent.popState(window);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Запис з історії браузер зняв сам — знімати його ще раз не можна,
    // інакше юзера викине на сторінку назад.
    unmount();
    expect(history.back).not.toHaveBeenCalled();
  });

  it("прибирає свій запис з історії, коли шторку закрили кнопкою", () => {
    const history = spyOnHistory();

    const { unmount } = render(
      <Sheet open title="Калорії" onClose={vi.fn()}>
        <p>вміст</p>
      </Sheet>
    );

    unmount();

    expect(history.back).toHaveBeenCalledTimes(1);
  });

  it("не дописує історію на кожен рендер", () => {
    const history = spyOnHistory();

    const { rerender } = render(
      <Sheet open title="Калорії" onClose={() => {}}>
        <p>вміст</p>
      </Sheet>
    );
    // Новий обробник на кожному рендері — так робить батьківський компонент,
    // передаючи стрілку прямо в розмітці.
    rerender(
      <Sheet open title="Калорії" onClose={() => {}}>
        <p>вміст</p>
      </Sheet>
    );

    expect(history.pushState).toHaveBeenCalledTimes(1);
  });

  it("Escape закриває шторку", () => {
    spyOnHistory();
    const onClose = vi.fn();

    render(
      <Sheet open title="Калорії" onClose={onClose}>
        <p>вміст</p>
      </Sheet>
    );

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
