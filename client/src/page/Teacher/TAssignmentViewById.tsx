import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { fetchAssignmentById } from "@/redux/slice/assignmentSlice";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import AQuestions from "./components/AQuestions";

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

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-8 px-4">
        <BarLoader width={"100%"} color="gray" className="my-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center gap-2 p-4 mt-8 bg-red-50 text-red-600 border border-red-200 rounded-lg max-w-5xl mx-auto">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Error: {error}</span>
      </div>
    );
  }

  if (!currentAssignment) {
    return (
       <div className="flex items-center justify-center gap-2 p-4 mt-8 bg-red-50 text-red-600 border border-red-200 rounded-lg max-w-5xl mx-auto">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm font-medium">No Assignment Found</span>
      </div>
    );
  }

  const questions = currentAssignment.questions?.length
    ? JSON.parse(currentAssignment.questions[0].question_text)
    : [];

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4 space-y-6">
      <Card className="border border-zinc-700 bg-zinc-900/60 text-zinc-100 shadow-lg backdrop-blur-md transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-white tracking-tight">
            {currentAssignment.title}
          </CardTitle>
          <p className="text-sm text-zinc-400 mt-1">
            {currentAssignment.description}
          </p>
        </CardHeader>

        <AQuestions questions={questions} />
      </Card>
    </div>
  );
}
