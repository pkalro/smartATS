export default function Loading() {
  return (
    <div className="space-y-6 max-w-lg">
      <div className="h-8 w-24 rounded-md bg-muted animate-pulse" />
      <div className="rounded-lg border bg-card p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="h-9 w-full rounded-md bg-muted animate-pulse" />
          </div>
        ))}
        <div className="h-9 w-24 rounded-md bg-muted animate-pulse mt-2" />
      </div>
    </div>
  );
}
