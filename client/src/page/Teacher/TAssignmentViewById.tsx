import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { fetchAssignmentById } from "@/redux/slice/assignmentSlice";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import AQuestions from "./components/AQuestions";
import GenerateAssignment from "./components/GenerateAssignment";
import AssignmentStats from "@/components/AssignmentStats";
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
      {questions.length === 0 && !currentAssignment.is_generating && (
       <div>
        <div className="py-10 flex justify-end">
          <GenerateAssignment id={assignmentId!} />
        </div>
         <div className="flex items-center justify-center gap-2 p-4 bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">No Questions Found</span>
        </div>
       </div>
      )}

      {currentAssignment?.is_generating && (
        <div className="flex flex-col gap-4 mt-8">
          <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg animate-pulse">
            <BarLoader color="#2563eb" className="my-2 mr-4" width={100} />
            <span className="text-sm font-medium">Generating assignment questions using AI... This may take a moment.</span>
          </div>
          <Card className="border border-zinc-700 bg-zinc-900/60 text-zinc-100 shadow-lg backdrop-blur-md">
            <CardHeader className="space-y-4">
              <div className="h-8 bg-zinc-800/50 rounded-lg w-1/3 animate-pulse"></div>
              <div className="h-4 bg-zinc-800/50 rounded-lg w-1/2 animate-pulse"></div>
            </CardHeader>
            <div className="p-6 pt-0 space-y-4">
              <div className="h-24 bg-zinc-800/50 rounded-lg animate-pulse w-full"></div>
              <div className="h-24 bg-zinc-800/50 rounded-lg animate-pulse w-full"></div>
              <div className="h-24 bg-zinc-800/50 rounded-lg animate-pulse w-full"></div>
            </div>
          </Card>
        </div>
      )}

      {questions.length > 0 && !currentAssignment.is_generating && (
        <>
        <div className="flex flex-col gap-4">
          <AssignmentStats id={assignmentId!} />
          <AssignmentMarksCard id={assignmentId!} />
        </div>
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
        </>
      )}
    </div>
  );
}
