import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpenText,
  AlertCircle,
  Sparkles,
  BrainCircuit,
  Loader2,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { fetchAssignmentById } from "@/redux/slice/assignmentSlice";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AQuestions from "./components/AQuestions";
import GenerateAssignment from "./components/GenerateAssignment";
import AssignmentStats from "@/components/Assignment/AssignmentStats";
import AssignmentMarksCard from "./components/AssignmentMarksCard";

export default function TAssignmentViewById() {
  const dispatch = useAppDispatch();
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { currentAssignment, loading, error } = useAppSelector(
    (state) => state.assignments
  );

  useEffect(() => {
    if (assignmentId) {
      dispatch(fetchAssignmentById(assignmentId));
    }
  }, [dispatch, assignmentId]);

  // Poll while generating
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentAssignment?.is_generating) {
      interval = setInterval(() => {
        if (assignmentId) {
          dispatch(fetchAssignmentById(assignmentId));
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentAssignment?.is_generating, dispatch, assignmentId]);

  if (loading && (!currentAssignment || currentAssignment.id !== assignmentId)) {
    return (
      <div className="max-w-6xl mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading assignment details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto mt-8 p-4">
        <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">Error loading assignment: {error}</span>
        </div>
      </div>
    );
  }

  if (!currentAssignment) {
    return (
      <div className="max-w-5xl mx-auto mt-8 p-4">
        <div className="flex items-center justify-between p-4 bg-muted/40 text-foreground border border-border rounded-xl">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium">No Assignment Found</span>
          </div>
          <Link to="/t-dashboard/assignments">
            <span className="text-xs text-primary font-semibold hover:underline">Return to Assignments</span>
          </Link>
        </div>
      </div>
    );
  }

  let questions: any[] = [];
  try {
    if (currentAssignment.questions?.length) {
      questions = JSON.parse(currentAssignment.questions[0].question_text);
    }
  } catch (e) {
    questions = [];
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8">
      {/* Top Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <Link
          to="/t-dashboard/assignments"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Assignments</span>
        </Link>

        {currentAssignment.due_date && (
          <Badge variant="outline" className="self-start sm:self-auto gap-1.5 px-3 py-1 text-xs border-border bg-card">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>Due Date: {format(new Date(currentAssignment.due_date), "MMM dd, yyyy")}</span>
          </Badge>
        )}
      </div>

      {/* Assignment Hero Section */}
      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <BookOpenText className="h-6 w-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {currentAssignment.title || "Untitled Assignment"}
              </h1>
            </div>
            {currentAssignment.description && (
              <p className="text-sm text-muted-foreground max-w-3xl pt-1">
                {currentAssignment.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {questions.length === 0 && !currentAssignment.is_generating && (
              <GenerateAssignment id={assignmentId!} />
            )}
          </div>
        </div>
      </div>

      {/* Generating Alert State */}
      {currentAssignment.is_generating && (
        <Card className="border border-primary/30 bg-primary/5 text-primary p-6 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <BrainCircuit className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-base text-foreground">Generating Assignment Questions with AI...</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Please wait while our AI engine generates coding & technical problem statements.
              </p>
            </div>
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
        </Card>
      )}

      {/* No Questions Found Warning */}
      {questions.length === 0 && !currentAssignment.is_generating && (
        <Card className="border-dashed border-border/80 bg-card/40 p-8 text-center flex flex-col items-center justify-center space-y-3 rounded-2xl">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-full">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-foreground text-base">No Questions Generated Yet</h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              Click 'Generate AI Questions' above to auto-generate questions for this assignment.
            </p>
          </div>
          <GenerateAssignment id={assignmentId!} />
        </Card>
      )}

      {/* Stats & Submissions Cards */}
      {questions.length > 0 && !currentAssignment.is_generating && (
        <div className="space-y-8">
          <AssignmentStats id={assignmentId!} />
          <AssignmentMarksCard id={assignmentId!} />

          {/* Questions Review Accordion Card */}
          <Card className="border-border/60 bg-card/80 backdrop-blur-sm text-card-foreground shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="p-6 pb-2 border-b border-border/60">
              <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Assignment Questions & Tasks
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
                Review the problem statements and questions assigned to students
              </CardDescription>
            </CardHeader>

            <AQuestions questions={questions} />
          </Card>
        </div>
      )}
    </div>
  );
}
