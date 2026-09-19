// Словник значень, якими описується метрика.
//
// Ті самі рядки лежать в енумах Prisma (`Aggregation`, `TargetDirection`,
// `TargetPeriod`), але domain/ не має права імпортувати Prisma, тому вони
// продубльовані тут як звичайні union-типи. TypeScript звіряє їх автоматично:
// data/ передає значення з Prisma у ці типи, і будь-яке розходження впаде
// помилкою компіляції, а не тихо.

/** Як звести кілька записів за період в одне число. */
export type Aggregation = "SUM" | "AVG" | "LAST" | "COUNT";

/** У який бік ціль вважається виконаною. */
export type TargetDirection = "AT_LEAST" | "AT_MOST";

/** За який відрізок часу збирається прогрес до цілі. */
export type TargetPeriod = "DAY" | "WEEK" | "MONTH" | "YEAR";

/** Форма графіка не обирається юзером — вона виводиться з полів метрики. */
export type ChartShape = "LINE" | "CALENDAR" | "BARS";

/**
 * Метрика в тому вигляді, в якому її бачить логіка й UI.
 * Рядок з бази має ці ж поля плюс `userId`, тому мапер між шарами не потрібен.
 */
export type Metric = {
  id: string;
  name: string;
  unit: string;
  aggregation: Aggregation;
  targetValue: number | null;
  targetDirection: TargetDirection;
  targetPeriod: TargetPeriod;
  color: string;
  sortOrder: number;
};

/**
 * Один запис у журналі. `localDate` — календарний день у таймзоні юзера
 * у форматі YYYY-MM-DD; саме за ним відбувається будь-яке групування.
 */
export type Entry = {
  id: string;
  metricId: string;
  value: number;
  localDate: string;
  at: Date;
  note: string | null;
};
