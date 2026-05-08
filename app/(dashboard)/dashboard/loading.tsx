export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="h-8 w-40 rounded-md bg-muted animate-pulse" />
      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
            <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            <div className="h-8 w-12 rounded-md bg-muted animate-pulse" />
          </div>
        ))}
      </div>
      {/* Queue cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
            <div className="h-5 w-36 rounded bg-muted animate-pulse" />
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-14 rounded-md bg-muted animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
