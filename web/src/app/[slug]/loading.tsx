import { Skeleton } from "@/components/ui/skeleton"

export default function CardapioLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 pb-28">
      {/* Header skeleton */}
      <div className="sticky top-0 z-10 border-b bg-white/95">
        <div className="mx-auto max-w-3xl px-4 py-5 flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        {/* Category 1 */}
        <section className="space-y-4">
          <Skeleton className="h-7 w-32" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border bg-white p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-9 w-28 rounded-full" />
            </div>
          ))}
        </section>

        {/* Category 2 */}
        <section className="space-y-4">
          <Skeleton className="h-7 w-28" />
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border bg-white p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-9 w-28 rounded-full" />
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
