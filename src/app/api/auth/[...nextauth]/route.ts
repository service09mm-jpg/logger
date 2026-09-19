// Роут, через який Auth.js обробляє власні запити (сесія, вихід, CSRF).
// Свого коду тут немає — обробники приходять готовими з конфігурації.
import { handlers } from "@/features/account";

export const { GET, POST } = handlers;
