import {
  Skeleton,
  SkeletonHeader,
  SkeletonPage,
} from "@/shared/ui/Skeleton";

/**
 * Кістяк головної.
 *
 * Next.js показує цей файл, поки сторінка поруч чекає на дані з бази. Але
 * головне навіть не це: за документацією Next.js динамічна сторінка — а наші
 * всі такі, бо читають куку сесії — **не підвантажується заздалегідь**, якщо
 * поряд немає `loading`. Тобто цей файл не просто прикриває очікування, він
 * вмикає попереднє завантаження: браузер починає тягнути сторінку, щойно
 * посилання на неї потрапило на екран, і до тапу половина роботи вже зроблена.
 *
 * Форма кістяка повторює справжню сторінку — три картки метрик і кнопка
 * «додати». Так вміст не стрибає, коли приїде.
 */
export default function DashboardLoading(): React.ReactElement {
  return (
    <SkeletonPage>
      <SkeletonHeader />
      <div className="flex flex-col gap-2.5">
        {[0, 1, 2].map((index) => (
          <div key={index} className="rounded-xl border border-line bg-surface px-4 py-3.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-7 w-24" />
            <Skeleton className="mt-3 h-1 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-3 h-12 w-full" />
    </SkeletonPage>
  );
}
