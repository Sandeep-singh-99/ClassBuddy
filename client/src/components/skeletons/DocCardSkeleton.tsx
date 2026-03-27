import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DocCardSkeleton() {
  return (
    <Card className="flex flex-col justify-between">
      <CardContent className="p-4 flex flex-col gap-3">

        {/* Header (title + delete btn placeholder) */}
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-6 rounded-md" />
        </div>

        {/* Description */}
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[90%]" />
        <Skeleton className="h-3 w-[70%]" />

        {/* Link */}
        <Skeleton className="h-3 w-24 mt-2" />
      </CardContent>
    </Card>
  )
}