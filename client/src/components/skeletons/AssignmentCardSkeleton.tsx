import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssignmentCardSkeleton() {
  return (
    <Card className="w-full overflow-hidden rounded-2xl border border-border/60 bg-card p-0 shadow-xs">
      <div className="h-1.5 w-full bg-muted" />
      <CardHeader className="p-5 pb-2">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
          <Skeleton className="h-5 w-3/4 rounded-md" />
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-3">
        <Skeleton className="h-3.5 w-full rounded-md" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-3 w-20 rounded-md" />
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 flex justify-end">
        <Skeleton className="h-9 w-32 rounded-xl" />
      </CardFooter>
    </Card>
  );
}
