import { Skeleton } from "@/components/ui/skeleton"

export default function ConfiguracoesLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-9 w-16 rounded-md" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 space-y-1">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="max-w-lg space-y-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-72" />
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            </div>
          ))}
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>
      </div>
    </div>
  )
}
