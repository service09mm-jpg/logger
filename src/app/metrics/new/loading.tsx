import { Skeleton, SkeletonHeader, SkeletonPage } from "@/shared/ui/Skeleton";

/** Кістяк галереї шаблонів: сітка два на чотири. */
export default function NewMetricLoading(): React.ReactElement {
  return (
    <SkeletonPage>
      <SkeletonHeader />
      <Skeleton className="mb-4 h-4 w-56" />
      <div className="grid grid-cols-2 gap-2.5">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
    </SkeletonPage>
  );
}
