import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PerformanceStatsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 w-full max-w-6xl mx-auto p-4">
      {/* Chart 1 Skeleton */}
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-end justify-between gap-2 px-4 pb-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton
                key={i}
                className={`w-12 h-${
                  Math.floor(Math.random() * 40) + 20
                } rounded-t-sm`}
                style={{ height: `${Math.floor(Math.random() * 60 + 20)}%` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart 2 Skeleton */}
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center">
            <Skeleton className="w-full h-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
