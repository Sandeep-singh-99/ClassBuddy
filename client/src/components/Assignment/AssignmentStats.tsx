import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { fetchAssignmentStats } from "@/redux/slice/submissionSlice";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface AssignmentStatsProps {
  id: string;
}

export default function AssignmentStats({ id: assignmentId }: AssignmentStatsProps) {
  const dispatch = useAppDispatch();
  const { stats, loading, error } = useAppSelector((state) => state.submissions);

  useEffect(() => {
    if (assignmentId) {
      dispatch(fetchAssignmentStats(assignmentId));
    }
  }, [assignmentId, dispatch]);

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto p-6 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto p-6 text-center text-destructive">
        Failed to load stats: {error}
      </Card>
    );
  }

  if (!stats) return null;

  const { total_students, students_completed } = stats;
  const percentage =
    total_students > 0 ? Math.round((students_completed / total_students) * 100) : 0;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Assignment Progress
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Total Students: {total_students}</span>
          <span>Completed: {students_completed}</span>
        </div>

        <Progress value={percentage} className="h-3" />

        <div className="text-sm text-foreground text-center font-medium">
          {percentage}% Completed
        </div>
      </CardContent>
    </Card>
  );
}
