import { Skeleton } from "@/components/ui/skeleton"

export default function PedidosLoading() {
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
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map((col) => (
            <div key={col} className="w-72 shrink-0 space-y-3">
              <Skeleton className="h-10 w-full rounded-xl" />
              <div className="space-y-3 rounded-xl border-2 p-3 min-h-[200px]">
                {col <= 2 && [1, 2].map((i) => (
                  <div key={i} className="rounded-xl border surface-light p-4 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
