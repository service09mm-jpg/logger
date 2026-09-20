/**
 * Український словник.
 *
 * Тут лише рядки й масиви рядків: словник цілком передається в клієнтські
 * компоненти, а функції через межу «сервер → клієнт» не проходять.
 * Він же — джерело правди для типу `Dictionary`:
 * англійський словник оголошений як `Dictionary`, тому пропущений у ньому
 * ключ ламає збірку, а не виявляється в продакшні порожнім рядком.
 *
 * Жодного тексту прямо в JSX: усі рядки беруться звідси.
 */
export const uk = {
  common: {
    save: "Зберегти",
    cancel: "Скасувати",
    delete: "Видалити",
    back: "Назад",
    undo: "Скасувати",
    today: "Сьогодні",
    noTarget: "Без цілі",
  },
  auth: {
    appName: "Logger",
    tagline: "Рахує те, що ви самі вирішили рахувати.",
    email: "Пошта",
    password: "Пароль",
    signIn: "Увійти",
    signUp: "Зареєструватися",
    signOut: "Вийти",
    loginTitle: "Вхід",
    registerTitle: "Реєстрація",
    noAccount: "Ще немає акаунта?",
    haveAccount: "Уже є акаунт?",
    invalidCredentials: "Невірна пошта або пароль.",
    invalidEmail: "Схоже, це не поштова адреса.",
    emailTaken: "Акаунт із такою поштою вже існує.",
    // {min} підставляється в коді — тримати число в тексті двох мов означає
    // рано чи пізно розійтись із реальним обмеженням.
    weakPassword: "Пароль має бути не коротшим за {min} символів.",
    unknownError: "Щось пішло не так. Спробуйте ще раз.",
  },
  dashboard: {
    title: "Сьогодні",
    emptyTitle: "Поки що порожньо",
    emptyHint: "Додайте першу метрику — це один тап.",
    addMetric: "Додати метрику",
    settings: "Налаштування",
  },
  metric: {
    newTitle: "Нова метрика",
    templatesHint: "Оберіть готову метрику або створіть свою.",
    custom: "Своя метрика",
    name: "Назва",
    namePlaceholder: "Наприклад, Англійська",
    unit: "Одиниця",
    unitPlaceholder: "хв",
    aggregation: "Як рахувати за період",
    target: "Ціль",
    targetPlaceholder: "Можна пропустити",
    targetPeriod: "Період цілі",
    targetDirection: "Напрям цілі",
    color: "Колір",
    create: "Створити",
    settingsTitle: "Налаштування метрики",
    archive: "Архівувати",
    archiveHint: "Метрика зникне з головного екрана, записи лишаться.",
    history: "Історія",
    historyEmpty: "Записів ще немає.",
    chartTitle: "Графік",
    chartEmpty: "Даних для графіка ще немає.",
    openSettings: "Налаштування",
    noEntriesToday: "—",
  },
  entry: {
    logTitle: "Записати",
    value: "Значення",
    date: "Дата",
    note: "Нотатка",
    notePlaceholder: "Необов'язково",
    submit: "Записати",
    saved: "Записано",
    deleted: "Запис видалено",
    edit: "Редагувати запис",
    update: "Зберегти",
    clear: "Очистити",
    failed: "Не вдалось зберегти. Спробуйте ще раз.",
  },
  aggregation: {
    SUM: "Сума за період",
    AVG: "Середнє за період",
    LAST: "Останнє значення",
    COUNT: "Кількість записів",
  },
  targetPeriod: {
    DAY: "День",
    WEEK: "Тиждень",
    MONTH: "Місяць",
    YEAR: "Рік",
  },
  targetDirection: {
    AT_LEAST: "Не менше ніж",
    AT_MOST: "Не більше ніж",
  },
  templates: {
    weight: { name: "Вага", unit: "кг" },
    calories: { name: "Калорії", unit: "ккал" },
    water: { name: "Вода", unit: "мл" },
    coffee: { name: "Кава", unit: "чашок" },
    sleep: { name: "Сон", unit: "год" },
    workout: { name: "Тренування", unit: "разів" },
    steps: { name: "Кроки", unit: "кроків" },
    reading: { name: "Читання", unit: "хв" },
  },
  settings: {
    title: "Налаштування",
    language: "Мова",
    languageUk: "Українська",
    languageEn: "English",
    account: "Акаунт",
  },
  weekdays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
  periodLabel: {
    DAY: "за день",
    WEEK: "за тиждень",
    MONTH: "за місяць",
    YEAR: "за рік",
  },
};
