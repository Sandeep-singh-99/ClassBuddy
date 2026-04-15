import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function PerformanceChartSkeleton() {
  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          <Skeleton className="h-6 w-48" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-40 mt-2" />
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-[350px] w-full">
          {/* Chart bars skeleton */}
          <div className="flex items-end justify-around h-full gap-2 px-4">
            {[1, 2, 3, 4, 5, 6, 7].map((index) => (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                <div className="flex gap-1 items-end justify-center h-64 w-full">
                  <Skeleton className="w-6 h-32 rounded" />
                  <Skeleton className="w-6 h-48 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* X-axis labels skeleton */}
          <div className="flex justify-around gap-2 mt-4 px-4">
            {[1, 2, 3, 4, 5, 6, 7].map((index) => (
              <Skeleton key={index} className="h-3 w-12 rounded" />
            ))}
          </div>

          {/* Legend skeleton */}
          <div className="flex gap-4 mt-8 flex-wrap">
            {[1, 2, 3].map((index) => (
              <div key={index} className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
