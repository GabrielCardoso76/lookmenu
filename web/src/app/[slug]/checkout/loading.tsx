import { Skeleton } from "@/components/ui/skeleton"

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-white/95">
        <div className="mx-auto flex max-w-lg items-center gap-4 px-4 py-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </div>
      </div>

      <main className="mx-auto max-w-lg space-y-6 px-4 py-6">
        {/* Resumo */}
        <div className="rounded-2xl border bg-white p-5 space-y-3">
          <Skeleton className="h-5 w-24" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
          <div className="pt-2 border-t flex justify-between">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>

        {/* Dados */}
        <div className="rounded-2xl border bg-white p-5 space-y-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>

        {/* Entrega */}
        <div className="rounded-2xl border bg-white p-5 space-y-4">
          <Skeleton className="h-5 w-20" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        </div>

        <Skeleton className="h-14 w-full rounded-2xl" />
      </main>
    </div>
  )
}
