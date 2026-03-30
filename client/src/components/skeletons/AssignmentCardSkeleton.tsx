import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssignmentCardSkeleton() {
  return (
    <Card className="w-full max-w-sm rounded-xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded-full bg-muted" />
          <Skeleton className="h-6 w-3/4 bg-muted" />
        </CardTitle>
      </CardHeader>

      <CardContent className="flex items-center justify-between mt-1">
        <Skeleton className="h-4 w-28 bg-muted" />
        <Skeleton className="h-3 w-16 bg-muted" />
      </CardContent>

      <CardFooter className="flex justify-end pt-2">
        <Skeleton className="h-9 w-32 bg-muted rounded-md" />
      </CardFooter>
    </Card>
  );
}
