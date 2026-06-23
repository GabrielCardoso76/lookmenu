import { Skeleton } from "@/components/ui/skeleton"

export default function AparenciaLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-9 w-16 rounded-md" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Skeleton className="h-7 w-32 mb-6" />
        <div className="flex gap-6">
          <div className="w-[42%] space-y-6">
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-36 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-10 w-36 rounded-md" />
          </div>
          <div className="hidden lg:block flex-1">
            <Skeleton className="h-full min-h-[560px] rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
