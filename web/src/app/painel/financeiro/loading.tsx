import { Skeleton } from "@/components/ui/skeleton"

export default function FinanceiroLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-9 w-16 rounded-md" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        {/* Filters */}
        <Skeleton className="h-48 w-full rounded-xl" />
        {/* Metric cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        {/* Chart */}
        <Skeleton className="h-64 w-full rounded-xl" />
        {/* Table */}
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    </div>
  )
}
