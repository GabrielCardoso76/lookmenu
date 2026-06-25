import { Skeleton } from "@/components/ui/skeleton"

export default function RecuperadorLoading() {
  return (
    <div className="p-6">
      <Skeleton className="mb-2 h-8 w-64" />
      <Skeleton className="mb-6 h-4 w-96" />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="mb-8 h-48 w-full max-w-lg rounded-xl" />
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  )
}
