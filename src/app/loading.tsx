export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-3">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg border bg-muted" />
        ))}
      </div>
    </div>
  )
}
