import { Skeleton, SkeletonHeader, SkeletonPage } from "@/shared/ui/Skeleton";

/** Кістяк налаштувань: мова й акаунт. */
export default function SettingsLoading(): React.ReactElement {
  return (
    <SkeletonPage>
      <SkeletonHeader />
      <Skeleton className="mb-2.5 h-4 w-20" />
      <div className="mb-8 flex gap-2">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-28" />
      </div>
      <Skeleton className="mb-2.5 h-4 w-20" />
      <Skeleton className="mb-3 h-4 w-48" />
      <Skeleton className="h-10 w-24" />
    </SkeletonPage>
  );
}
