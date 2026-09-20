// Публічний API фічі «записи». Та сама осторога, що й у метрик: клієнтські
// компоненти всередині фічі ходять до сусідів відносним шляхом, бо цей файл
// тягне за собою Prisma.

export {
  createEntry,
  deleteEntry,
  listEntriesBetween,
  listEntriesForMetric,
  listLatestEntries,
  listRecentEntries,
  updateEntry,
} from "./data/entryRepo";
export type { EntryInput } from "./data/entryRepo";
export { EntryHistory } from "./ui/EntryHistory";
