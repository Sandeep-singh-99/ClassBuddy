import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function NoteCardSkeleton() {
  return (
    <Card className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-0 shadow-xs">
      <div className="h-1.5 w-full bg-muted" />
      <CardContent className="p-5 flex flex-col gap-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-3 w-1/3 rounded-md" />
          </div>
        </div>

        {/* Content lines */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-[88%] rounded-md" />
          <Skeleton className="h-3 w-[65%] rounded-md" />
        </div>

        {/* Link / CTA */}
        <div className="pt-2 flex items-center justify-between">
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}