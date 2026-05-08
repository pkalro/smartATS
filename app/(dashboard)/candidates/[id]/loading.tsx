export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="mb-2 h-7 w-32 rounded-md bg-muted animate-pulse" />
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="h-8 w-56 rounded-md bg-muted animate-pulse" />
            <div className="h-4 w-72 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-9 w-20 rounded-md bg-muted animate-pulse" />
        </div>
      </div>

      {/* Applications bar */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 w-32 rounded-md bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-10 rounded-md bg-muted animate-pulse" />
        <div className="h-24 rounded-md bg-muted animate-pulse" />
      </div>

      {/* Notes */}
      <div className="rounded-lg border bg-card p-4">
        <div className="h-4 w-24 rounded bg-muted animate-pulse mb-3" />
        <div className="h-20 rounded-md bg-muted animate-pulse" />
      </div>

      {/* Profile */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="h-5 w-16 rounded bg-muted animate-pulse" />
        <div className="grid grid-cols-[120px_1fr] gap-y-3">
          {[...Array(7)].map((_, i) => (
            <>
              <div key={`l${i}`} className="h-4 w-20 rounded bg-muted animate-pulse" />
              <div key={`v${i}`} className="h-4 w-40 rounded bg-muted animate-pulse" />
            </>
          ))}
        </div>
      </div>

      {/* Screening kit */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="h-5 w-28 rounded bg-muted animate-pulse" />
        <div className="h-48 rounded-md bg-muted animate-pulse" />
      </div>
    </div>
  );
}
