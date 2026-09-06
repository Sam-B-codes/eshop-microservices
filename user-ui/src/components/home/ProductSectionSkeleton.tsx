interface ProductSectionSkeletonProps {
  count?: number;
}

export default function ProductSectionSkeleton({
  count = 4,
}: ProductSectionSkeletonProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {Array.from({
        length: count,
      }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-3xl border border-neutral-200 bg-white"
        >
          <div className="aspect-[4/5] animate-pulse bg-neutral-200" />

          <div className="space-y-3 p-4 sm:p-5">
            <div className="h-3 w-24 animate-pulse rounded-full bg-neutral-200" />

            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded-full bg-neutral-200" />

              <div className="h-4 w-3/4 animate-pulse rounded-full bg-neutral-200" />
            </div>

            <div className="flex gap-2">
              <div className="h-5 w-16 animate-pulse rounded-full bg-neutral-200" />

              <div className="h-4 w-12 animate-pulse rounded-full bg-neutral-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}