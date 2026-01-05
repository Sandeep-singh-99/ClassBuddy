import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssignmentChartSkeleton() {
  return (
    <Card className="shadow-sm w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-4 w-48 mt-1" />
      </CardHeader>
      <CardContent className="pt-4">
        <div className="w-full h-[360px] flex items-end justify-between gap-1">
          {[...Array(12)].map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t-sm"
              style={{ height: `${Math.floor(Math.random() * 80 + 20)}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
