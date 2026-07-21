import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { fetchAssignmentById } from "@/redux/slice/assignmentSlice";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MDEditor from "@uiw/react-md-editor";
import { Card, CardContent } from "@/components/ui/card";
import { SubmitSubmission } from "@/redux/slice/submissionSlice";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";

export default function AssignmentViewById() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const dispatch = useAppDispatch();
  const { theme } = useTheme();

  const { currentAssignment, loading, error } = useAppSelector(
    (state) => state.assignments
  );

  const submissionState = useAppSelector((state) => state.submissions);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (assignmentId) dispatch(fetchAssignmentById(assignmentId));
  }, [assignmentId, dispatch]);

  const handleAnswerChange = (index: number, value?: string) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value || "",
    }));
  };

  const handleSubmit = async () => {
    if (!Object.keys(answers).length || !Object.values(answers).some(a => a.trim())) {
      toast.error("Please answer at least one question before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const payload: Record<string, string> = {};
      questions.forEach((q: any, index: number) => {
        const qid = typeof q === "string" ? String(index + 1) : String(q.id);
        payload[qid] = answers[index] || "";
      });

      await dispatch(
        SubmitSubmission({ id: assignmentId!, data: payload })
      ).unwrap();
      toast.success("Assignment submitted successfully 🎉");
      setSubmitting(false);
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : "Submission failed");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center p-16 bg-card rounded-3xl border border-border">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl text-xs font-semibold">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>Error loading assignment: {error}</span>
        </div>
      </div>
    );
  }

  if (!currentAssignment) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-2 p-4 bg-muted text-muted-foreground border border-border rounded-2xl text-xs font-semibold">
          <HelpCircle className="h-5 w-5 shrink-0" />
          <span>No assignment found with ID: {assignmentId}</span>
        </div>
      </div>
    );
  }

  const questions = currentAssignment.questions?.length
    ? JSON.parse(currentAssignment.questions[0].question_text)
    : [];

  const dueDate = new Date(currentAssignment.due_date);
  const now = new Date();
  const isPastDue = dueDate < now;

  return (
    <div className="container max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 text-foreground">
      {/* Back Button Link */}
      <div>
        <Link to="/dashboard-panel/assignments">
          <Button variant="ghost" size="sm" className="rounded-xl gap-2 text-xs">
            <ArrowLeft className="h-4 w-4" /> Back to Assignments
          </Button>
        </Link>
      </div>

      {/* Assignment Header Banner */}
      <Card className="overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-r from-card via-card/90 to-primary/10 dark:to-primary/20 shadow-sm p-6 sm:p-8">
        <CardContent className="p-0 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Assignment Task</span>
            </div>

            <Badge
              variant="outline"
              className={`text-xs font-semibold px-3 py-1 ${
                isPastDue
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {isPastDue ? "Closed" : "Active"}
            </Badge>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {currentAssignment.title}
            </h1>

            {currentAssignment.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentAssignment.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/40">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="h-4 w-4 text-primary" />
              Due: {dueDate.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Questions Section */}
      {questions.length === 0 ? (
        <Card className="border-dashed border-border/80 bg-muted/20 rounded-2xl p-8 text-center text-muted-foreground space-y-2">
          <HelpCircle className="h-8 w-8 mx-auto text-muted-foreground/60" />
          <p className="font-semibold text-sm">No questions found in this assignment.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Assignment Questions ({questions.length})
            </h2>
          </div>

          <div className="space-y-6">
            {questions.map((q: any, index: number) => {
              const questionText =
                typeof q === "string" ? q : q?.question || "Untitled question";
              const studentAnswer = answers[index] || "";

              return (
                <Card
                  key={q?.id || index}
                  className="rounded-2xl border border-border/60 bg-card p-6 space-y-4 shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Question {index + 1} of {questions.length}
                    </span>
                  </div>

                  {/* Question Prompt Markdown */}
                  <div
                    data-color-mode={theme === "dark" ? "dark" : "light"}
                    className="p-4 rounded-xl bg-muted/40 dark:bg-muted/20 border border-border/40 text-foreground text-sm"
                  >
                    <MDEditor.Markdown
                      source={questionText}
                      style={{ backgroundColor: "transparent", color: "inherit" }}
                    />
                  </div>

                  {/* Answer Input or Result */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Your Answer (Markdown supported):
                    </span>

                    <div data-color-mode={theme === "dark" ? "dark" : "light"}>
                      <MDEditor
                        value={studentAnswer}
                        onChange={(val) => handleAnswerChange(index, val)}
                        height={180}
                        preview="edit"
                      />
                    </div>
                  </div>
                </Card>
              );
            })}

            {/* Submission Action & Feedback */}
            <Card className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="space-y-4">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || submissionState.loading}
                  size="lg"
                  className="w-full sm:w-auto rounded-xl gap-2 font-semibold shadow-md min-w-[160px]"
                >
                  {submitting || submissionState.loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Submit Answers
                    </>
                  )}
                </Button>

                {submissionState.result && (
                  <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-emerald-600 dark:text-emerald-400 text-base flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" /> Submission Feedback & Result
                      </h3>
                      <Badge className="bg-emerald-500 text-white font-bold text-xs">
                        Grade: {submissionState.result?.total_marks}
                      </Badge>
                    </div>

                    <div className="text-sm text-foreground leading-relaxed p-4 rounded-xl bg-card border border-border/40">
                      {submissionState.result?.final_feedback}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
