/**
 * Сірий прямокутник, що пульсує, — заготовка під майбутній вміст.
 *
 * З таких складаються файли `loading.tsx`: вони малюються, поки сторінка
 * чекає на дані, і показують її майбутню форму замість порожнечі.
 *
 * `aria-hidden` тут навмисно. Кістяк нічого не повідомляє: у ньому немає
 * тексту, а мови юзера `loading.tsx` не знає — вона лежить у базі, по яку ми
 * саме й пішли. Тому для скрінрідера його просто не існує, а озвучить він
 * справжній вміст, коли той приїде.
 */
export function Skeleton({
  className = "",
}: {
  className?: string;
}): React.ReactElement {
  return (
    <div aria-hidden className={`animate-pulse rounded-md bg-line ${className}`} />
  );
}

/** Обгортка екрана — ті самі поля, що й у справжніх сторінок. */
export function SkeletonPage({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">{children}</main>
  );
}

/** Шапка: заголовок ліворуч, посилання праворуч. */
export function SkeletonHeader(): React.ReactElement {
  return (
    <div className="mb-5 flex items-baseline justify-between">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

/**
 * Кістяк сторінки з формою — їх у застосунку три, і всі однакові на вигляд:
 * шапка, кілька полів, кнопка.
 */
export function FormLoading({
  fields,
}: {
  fields: number;
}): React.ReactElement {
  return (
    <SkeletonPage>
      <SkeletonHeader />
      <div className="flex flex-col gap-4">
        {Array.from({ length: fields }, (_, index) => (
          <div key={index}>
            <Skeleton className="mb-1.5 h-3 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="mt-2 h-11 w-full" />
      </div>
    </SkeletonPage>
  );
}
