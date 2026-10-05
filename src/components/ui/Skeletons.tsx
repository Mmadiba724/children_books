export function BookCardSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <div className="kb-skeleton aspect-3/4 w-full rounded-xl" />
      <div className="kb-skeleton h-4 w-4/5" />
      <div className="kb-skeleton h-3 w-1/2" />
      <div className="kb-skeleton mt-1 h-9 w-full rounded-full" />
    </div>
  );
}

export function BookGridSkeleton({ count = 8 }: { readonly count?: number }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading books"
      className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4"
    >
      {Array.from({ length: count }, (_, i) => (
        <BookCardSkeleton key={i} />
      ))}
      <span className="sr-only">Loading books…</span>
    </div>
  );
}
