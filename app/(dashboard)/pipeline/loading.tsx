export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-24 rounded-md bg-muted animate-pulse" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-5 w-24 rounded bg-muted animate-pulse" />
            {[...Array(3)].map((_, j) => (
              <div key={j} className="rounded-lg border bg-card p-3 space-y-2">
                <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                <div className="h-6 w-12 rounded-full bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
