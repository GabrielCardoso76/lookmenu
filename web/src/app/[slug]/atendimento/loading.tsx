import { Skeleton } from "@/components/ui/skeleton"

export default function AtendimentoLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <Skeleton className="h-6 w-20" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
