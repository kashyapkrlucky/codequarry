import { Skeleton } from "@/components/ui/skeleton";

export function BrowserSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_1fr]" aria-busy="true" aria-label="Loading cheatsheets">
      <div className="space-y-4">
        <Skeleton className="h-9 w-full" />
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-6 w-3/4" />)}
      </div>
      <div className="space-y-5">
        <Skeleton className="h-8 w-full" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}
