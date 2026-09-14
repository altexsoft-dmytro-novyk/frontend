export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6" data-skeleton="true">
      {/* Header skeleton */}
      <div className="pghd pb-4 border-b border-border animate-pulse" role="banner">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="h-3 w-36 rounded-sm bg-muted" />
          <div className="h-4 w-48 rounded-sm bg-muted" />
        </div>
        <div className="h-8 w-44 rounded-md bg-muted mt-2" />
        <div className="h-3.5 w-72 rounded-sm bg-muted mt-2" />
      </div>

      {/* Preset tabs skeleton */}
      <div className="flex items-center justify-between gap-4 border-b border-border pb-2 animate-pulse">
        <div className="h-9 w-28 rounded-lg bg-muted" />
        <div className="h-8 w-24 rounded-md bg-muted" />
      </div>

      {/* Metric Cards Skeleton Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 animate-pulse">
          <div>
            <div className="h-4 w-28 rounded-sm bg-muted" />
            <div className="h-10 w-16 rounded-md bg-muted mt-4" />
            <div className="h-3 w-40 rounded-sm bg-muted mt-2" />
          </div>
          <div className="h-3 w-48 rounded-sm bg-muted mt-6 pt-2" />
        </div>

        <div className="md:col-span-2 rounded-xl border border-border bg-card p-5 animate-pulse">
          <div className="h-4 w-24 rounded-sm bg-muted mb-4" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>

      {/* Unavailable Slots Skeleton Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-xl border border-dashed border-border bg-card/60 p-5 animate-pulse"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="h-4 w-28 rounded-sm bg-muted" />
                <div className="h-4 w-4 rounded-full bg-muted" />
              </div>
              <div className="h-4 w-16 rounded-md bg-muted mt-3" />
              <div className="h-3 w-44 rounded-sm bg-muted mt-2" />
            </div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-xl border border-border bg-card p-5 animate-pulse">
        <div className="flex items-center justify-between pb-4">
          <div className="h-5 w-32 rounded-md bg-muted" />
          <div className="h-4 w-16 rounded-sm bg-muted" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-4 py-2 border-b border-border/50">
              <div className="h-7 w-7 rounded-full bg-muted shrink-0" />
              <div className="h-4 w-32 rounded-sm bg-muted" />
              <div className="h-4 w-24 rounded-sm bg-muted" />
              <div className="h-4 w-16 rounded-sm bg-muted" />
              <div className="h-4 w-16 rounded-sm bg-muted" />
            </div>
          ))}
        </div>
        <div className="h-3 w-48 rounded-sm bg-muted mt-6" />
      </div>
    </div>
  )
}
