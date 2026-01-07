import { Card, CardContent } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { fetchSubmissionResult } from "@/redux/slice/submissionSlice";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { BarLoader } from "react-spinners";

export default function AssignmentDetails() {
  const dispatch = useAppDispatch();

  const { assignmentId } = useParams<{ assignmentId: string }>();

  const { submissionResult, loading, error } = useAppSelector(
    (state) => state.submissions
  );

  useEffect(() => {
    if (assignmentId) {
      dispatch(fetchSubmissionResult(assignmentId));
    }
  }, [dispatch, assignmentId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-12 px-4">
        <BarLoader width="100%" color="#60a5fa" />
      </div>
    );
  }

  // ======= Error =======
  if (error) {
    return (
      <div className="flex items-center justify-center gap-2 p-4 mt-8 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg max-w-5xl mx-auto">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Error: {error}</span>
      </div>
    );
  }

  if (!submissionResult) {
    return (
      <div className="flex items-center justify-center gap-2 p-4 mt-8 bg-muted text-muted-foreground border border-border rounded-lg max-w-5xl mx-auto">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm font-medium">No Assignment Found</span>
      </div>
    );
  }
  return (
    <div>
      <div className="flex justify-center items-center h-screen">
        <Card className="p-8 rounded-xl bg-card border border-border shadow-lg">
          <CardContent className="text-center">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Submission Feedback
            </h2>
            <p className="text-muted-foreground text-lg">
              <span className="font-semibold">Total Marks:</span>{" "}
              {submissionResult.grade}
            </p>
            <div className="mt-4 p-4 bg-muted/50 rounded-md border border-border text-foreground">
              {submissionResult.feedback}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
