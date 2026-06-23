import { Skeleton } from "@/components/ui/skeleton"

export default function PainelLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="w-full border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-36" />
          </div>
          <Skeleton className="h-9 w-16 rounded-md" />
        </div>
      </div>

      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-border md:block">
          <div className="space-y-2 px-4 py-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </aside>
        <main className="flex-1 px-6 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-[1600px] space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              ))}
            </div>
            <div className="rounded-xl border bg-card p-6 space-y-3">
              <Skeleton className="h-5 w-40" />
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
