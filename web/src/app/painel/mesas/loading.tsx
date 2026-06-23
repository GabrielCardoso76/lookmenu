import { Skeleton } from "@/components/ui/skeleton"

export default function MesasLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-9 w-16 rounded-md" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-36 w-full rounded-xl" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
