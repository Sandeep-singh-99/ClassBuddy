import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function TeacherCardSkeleton() {
  return (
    <Card className="border border-border shadow-md rounded-3xl overflow-hidden bg-card">
      {/* Group Cover Image Skeleton */}
      <CardHeader className="p-0">
        <Skeleton className="w-full h-44" />
        <div className="absolute top-4 right-4">
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </CardHeader>

      {/* Teacher Content Skeleton */}
      <CardContent className="p-5">
        {/* Teacher Profile Section */}
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>

        {/* Description Lines */}
        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-3 w-2/3 mb-5" />

        {/* Join Button Skeleton */}
        <Skeleton className="h-10 w-full rounded-xl" />
      </CardContent>
    </Card>
  )
}
