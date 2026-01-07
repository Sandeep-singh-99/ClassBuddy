import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { fetchAssignmentById } from "@/redux/slice/assignmentSlice";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import MDEditor from "@uiw/react-md-editor";
import { Card, CardContent } from "@/components/ui/card";
import { SubmitSubmission } from "@/redux/slice/submissionSlice";

export default function AssignmentViewById() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const dispatch = useAppDispatch();

  const { currentAssignment, loading, error } = useAppSelector(
    (state) => state.assignments
  );

  const submissionState = useAppSelector((state) => state.submissions);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitting] = useState(false);

  useEffect(() => {
    if (assignmentId) dispatch(fetchAssignmentById(assignmentId));
  }, [assignmentId, dispatch]);

  const handleAnswerChange = (questionId: number | string, value?: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value || "",
    }));
  };

  const handleSubmit = async () => {
    if (!Object.keys(answers).length) {
      alert("Please answer at least one question before submitting.");
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
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-12 px-4">
        <BarLoader width="100%" color="#60a5fa" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center gap-2 p-4 mt-8 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg max-w-5xl mx-auto">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Error: {error}</span>
      </div>
    );
  }

  if (!currentAssignment) {
    return (
      <div className="flex items-center justify-center gap-2 p-4 mt-8 bg-muted text-muted-foreground border border-border rounded-lg max-w-5xl mx-auto">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm font-medium">No Assignment Found</span>
      </div>
    );
  }

  const questions = currentAssignment.questions?.length
    ? JSON.parse(currentAssignment.questions[0].question_text)
    : [];

  return (
    <>
      <div className="max-w-6xl mx-auto p-8 space-y-8 text-foreground">
        {/* Assignment Header */}
        <Card className="p-6 rounded-xl bg-card border border-border shadow-md">
          <CardContent>
            <h1 className="text-2xl font-bold text-foreground">
              {currentAssignment.title}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {currentAssignment.description}
            </p>
            <p className="text-sm mt-3 text-muted-foreground">
              Due:{" "}
              <span className="font-medium text-foreground">
                {new Date(currentAssignment.due_date).toLocaleString()}
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Questions */}
        {questions.length === 0 ? (
          <div className="flex items-center justify-center gap-2 p-4 bg-muted text-muted-foreground border border-border rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">No Questions Found</span>
          </div>
        ) : (
          <Card className="bg-card border border-border space-y-5">
            {questions.map((q: any, index: number) => {
              const questionText =
                typeof q === "string" ? q : q?.question || "Untitled question";
              const studentAnswer = answers[index] || "";
              const gradedAnswer = submitted
                ? submissionState.result?.answers?.find(
                    (a: any) => a.id === q.id
                  )?.answer
                : null;

              return (
                <CardContent
                  key={q?.id || index}
                  className="p-6 rounded-xl hover:bg-muted/50 transition-all"
                >
                  <h2 className="font-semibold text-foreground mb-3">
                    Question {index + 1}
                  </h2>

                  <div className="rounded-md mb-4 bg-muted/30 border border-border">
                    <MDEditor.Markdown
                      source={questionText}
                      className="rounded-md text-foreground p-2"
                    />
                  </div>

                  {!submitted ? (
                    <div>
                      <MDEditor
                        value={studentAnswer}
                        onChange={(val) => handleAnswerChange(index, val)}
                        height={200}
                        preview="edit"
                      />
                    </div>
                  ) : (
                    <div className="rounded-md p-4 bg-muted/30 border border-border">
                      <h3 className="text-foreground font-semibold mb-2">
                        Your Answer:
                      </h3>
                      <MDEditor.Markdown
                        source={studentAnswer}
                        className="text-foreground"
                      />
                      <h3 className="text-foreground font-semibold mt-3 mb-2">
                        AI Graded Answer:
                      </h3>
                      <MDEditor.Markdown
                        source={gradedAnswer || "N/A"}
                        className="text-foreground"
                      />
                    </div>
                  )}
                </CardContent>
              );
            })}

            {/* Submit Button & Feedback */}
            <div className="flex flex-col gap-4 p-4">
              {!submitted ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submissionState.loading}
                  variant="default"
                >
                  {submissionState.loading ? "Submitting..." : "Submit Answers"}
                </Button>
              ) : (
                <div className="rounded-md p-4 bg-green-500/10 border border-green-500/20">
                  <h3 className="font-semibold text-green-600 mb-2">
                    Submission Feedback:
                  </h3>
                  <p className="text-foreground">
                    Total Marks: {submissionState.result?.total_marks}
                  </p>
                  <p className="text-foreground mt-2">
                    {submissionState.result?.final_feedback}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
