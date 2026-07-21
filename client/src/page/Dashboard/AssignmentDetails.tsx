import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { fetchSubmissionResult } from "@/redux/slice/submissionSlice";
import { AlertCircle, ArrowLeft, CheckCircle2, Award, Loader2, MessageSquare } from "lucide-react";
import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center p-16 bg-card rounded-3xl border border-border">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-4">
        <Link to="/dashboard-panel/assignments">
          <Button variant="ghost" size="sm" className="rounded-xl gap-2 text-xs">
            <ArrowLeft className="h-4 w-4" /> Back to Assignments
          </Button>
        </Link>
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl text-xs font-semibold">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>Error loading submission result: {error}</span>
        </div>
      </div>
    );
  }

  if (!submissionResult) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-4">
        <Link to="/dashboard-panel/assignments">
          <Button variant="ghost" size="sm" className="rounded-xl gap-2 text-xs">
            <ArrowLeft className="h-4 w-4" /> Back to Assignments
          </Button>
        </Link>
        <div className="flex items-center justify-center gap-2 p-8 bg-muted text-muted-foreground border border-border rounded-2xl text-sm font-semibold">
          <AlertCircle className="h-5 w-5" />
          <span>No Submission Result Found for this Assignment.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <Link to="/dashboard-panel/assignments">
          <Button variant="ghost" size="sm" className="rounded-xl gap-2 text-xs">
            <ArrowLeft className="h-4 w-4" /> Back to Assignments
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-card to-card/60 shadow-md">
        <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        <CardHeader className="p-6 sm:p-8 pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-extrabold text-foreground tracking-tight">
                  Submission Feedback
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Graded review and AI feedback for your assignment
                </p>
              </div>
            </div>

            <Badge className="bg-emerald-500 text-white font-extrabold text-sm px-4 py-1.5 rounded-xl">
              Grade: {submissionResult.grade}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 pt-0 space-y-6">
          {/* Grade summary banner */}
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                Total Score
              </span>
              <span className="text-3xl font-black text-foreground">
                {submissionResult.grade}
              </span>
            </div>
            <div className="p-3 rounded-full bg-emerald-500 text-white">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          {/* Feedback section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Instructor / AI Feedback
            </h3>

            <div className="p-5 rounded-2xl bg-muted/40 dark:bg-muted/20 border border-border/50 text-foreground text-sm leading-relaxed">
              {submissionResult.feedback}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
