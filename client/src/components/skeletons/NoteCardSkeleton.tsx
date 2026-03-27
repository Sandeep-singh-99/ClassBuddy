import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function NoteCardSkeleton() {
  return (
    <Card className="flex flex-col justify-between">
      <CardContent className="p-4 flex flex-col gap-3">
        
        {/* Title */}
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Content lines */}
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[90%]" />
        <Skeleton className="h-3 w-[70%]" />

        {/* Link */}
        <Skeleton className="h-3 w-24 mt-2" />
      </CardContent>
    </Card>
  )
}