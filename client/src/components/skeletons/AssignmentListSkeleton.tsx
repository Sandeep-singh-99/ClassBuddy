import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssignmentListSkeleton() {
  return (
    <div className="w-full flex justify-center items-start">
      <Card className="w-full max-w-6xl shadow-lg border border-border bg-card">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {/* Table Header Skeleton */}
            <div className="flex items-center p-4 border-b">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1 mx-2" />
              ))}
            </div>
            {/* Table Rows Skeleton */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center p-4 border-b last:border-0"
              >
                <Skeleton className="h-4 flex-1 mx-2" />
                <Skeleton className="h-4 flex-1 mx-2" />
                <Skeleton className="h-4 flex-1 mx-2" />
                <Skeleton className="h-4 flex-1 mx-2" />
                <Skeleton className="h-6 w-20 mx-2 rounded-full" />
                <Skeleton className="h-4 flex-1 mx-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
