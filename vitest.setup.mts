import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Кожен тест має починати з порожнього DOM. Автоматичне прибирання
// Testing Library вмикається лише в режимі globals, який ми не вмикаємо,
// тому робимо це явно.
afterEach(cleanup);
