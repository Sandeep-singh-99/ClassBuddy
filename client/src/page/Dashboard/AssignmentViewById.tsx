import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { fetchAssignmentById } from "@/redux/slice/assignmentSlice";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import MDEditor from "@uiw/react-md-editor";
import { Card, CardContent } from "@/components/ui/card";

export default function AssignmentViewById() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const dispatch = useAppDispatch();

  const { currentAssignment, loading, error } = useAppSelector(
    (state) => state.assignments
  );

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (assignmentId) {
      dispatch(fetchAssignmentById(assignmentId));
    }
  }, [assignmentId, dispatch]);

  const handleAnswerChange = (index: number, value?: string) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value || "",
    }));
  };

  const handleSubmit = async () => {
    if (!Object.keys(answers).length) {
      alert("Please answer at least one question before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      console.log("Submitting answers:", answers);
      // TODO: dispatch(submitAssignment({ assignmentId, answers }))
      setTimeout(() => {
        setSubmitting(false);
        alert("Answers submitted successfully!");
      }, 800);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  // ======= Loading =======
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
      <div className="flex items-center justify-center gap-2 p-4 mt-8 bg-red-950/30 text-red-400 border border-red-800 rounded-lg max-w-5xl mx-auto">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Error: {error}</span>
      </div>
    );
  }

  // ======= No Assignment =======
  if (!currentAssignment) {
    return (
      <div className="flex items-center justify-center gap-2 p-4 mt-8 bg-yellow-900/30 text-yellow-400 border border-yellow-700 rounded-lg max-w-5xl mx-auto">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm font-medium">No Assignment Found</span>
      </div>
    );
  }

  const questions = currentAssignment.questions?.length
    ? JSON.parse(currentAssignment.questions[0].question_text)
    : [];

  // ======= UI =======
  return (
    <div
      className="max-w-6xl mx-auto p-8 space-y-8 text-gray-200"
      data-color-mode="dark"
    >
      {/* Assignment Header */}
      <Card className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 shadow-md">
        <CardContent>
          <h1 className="text-2xl font-bold text-white">
            {currentAssignment.title}
          </h1>
          <p className="mt-2 text-gray-400">
            {currentAssignment.description}
          </p>
          <p className="text-sm mt-3 text-gray-500">
            Due:{" "}
            <span className="font-medium text-gray-300">
              {new Date(currentAssignment.due_date).toLocaleString()}
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Questions */}
      {questions.length === 0 ? (
        <div className="flex items-center justify-center gap-2 p-4 bg-yellow-900/30 text-yellow-400 border border-yellow-700 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">No Questions Found</span>
        </div>
      ) : (
        <Card className="bg-zinc-900 border border-zinc-800 space-y-5">
          {questions.map(
            (
              q: { id?: number; question?: string; type?: string } | string,
              index: number
            ) => {
              const questionText =
                typeof q === "string" ? q : q?.question || "Untitled question";

              return (
                <CardContent
                  key={q?.id || index}
                  className="p-6 rounded-xl hover:bg-zinc-800/40 transition-all"
                >
                  <h2 className="font-semibold text-gray-100 mb-3">
                    Question {index + 1}
                  </h2>

                  {/* Question Markdown Viewer */}
                  <div className="rounded-md  mb-4 bg-zinc-800/50 border border-zinc-700">
                    <MDEditor.Markdown
                      source={questionText}
                      className="rounded-md text-gray-100 p-2"
                    />
                  </div>

                  {/* Student Answer Input */}
                  <div data-color-mode="dark">
                    <MDEditor
                      value={answers[index] || ""}
                      onChange={(val) => handleAnswerChange(index, val)}
                      height={200}
                      preview="edit"
                    />
                  </div>
                </CardContent>
              );
            }
          )}

          {/* Submit Button */}
          <div className="flex justify-end p-4">
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              variant={"default"}
            >
              {submitting ? "Submitting..." : "Submit Answers"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
