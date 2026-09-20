import {
  Skeleton,
  SkeletonHeader,
  SkeletonPage,
} from "@/shared/ui/Skeleton";

/** Кістяк сторінки метрики: велике значення, графік, журнал. */
export default function MetricLoading(): React.ReactElement {
  return (
    <SkeletonPage>
      <SkeletonHeader />
      <Skeleton className="mb-6 h-9 w-32" />

      <Skeleton className="mb-2.5 h-4 w-24" />
      <Skeleton className="mb-8 h-40 w-full" />

      <Skeleton className="mb-2.5 h-4 w-20" />
      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3, 4].map((index) => (
          <Skeleton key={index} className="h-5 w-full" />
        ))}
      </div>
    </SkeletonPage>
  );
}
