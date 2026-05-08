export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-7 w-24 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-72 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-9 w-24 rounded-md bg-muted animate-pulse" />
      </div>
      {/* Filter bar skeleton */}
      <div className="flex gap-2">
        <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
        <div className="h-8 w-20 rounded-full bg-muted animate-pulse" />
        <div className="h-8 w-20 rounded-full bg-muted animate-pulse" />
        <div className="h-8 w-20 rounded-full bg-muted animate-pulse" />
      </div>
      {/* Job row skeletons */}
      <div className="grid gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-48 rounded bg-muted animate-pulse" />
              <div className="h-3 w-32 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-8 w-8 rounded-md bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
