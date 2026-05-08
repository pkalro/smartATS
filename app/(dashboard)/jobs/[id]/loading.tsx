export default function Loading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="mb-2 h-7 w-20 rounded-md bg-muted animate-pulse" />
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="h-8 w-64 rounded-md bg-muted animate-pulse" />
            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-28 rounded-md bg-muted animate-pulse" />
            <div className="h-9 w-20 rounded-md bg-muted animate-pulse" />
            <div className="h-9 w-28 rounded-md bg-muted animate-pulse" />
          </div>
        </div>
      </div>

      {/* Section heading + 2-col grid */}
      <div className="space-y-4">
        <div className="h-6 w-36 rounded bg-muted animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
              <div className="h-4 w-32 rounded bg-muted animate-pulse" />
              <div className="h-24 rounded-md bg-muted animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
              <div className="h-4 w-28 rounded bg-muted animate-pulse" />
              <div className="flex flex-wrap gap-1.5">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-6 w-16 rounded-full bg-muted animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Candidates table skeleton */}
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="h-5 w-24 rounded bg-muted animate-pulse" />
          <div className="h-8 w-32 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 flex-1 rounded bg-muted animate-pulse" />
              <div className="h-4 w-12 rounded bg-muted animate-pulse" />
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              <div className="h-4 w-16 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
