import { Card, CardContent } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks"
import { fetchSubmissionResult } from "@/redux/slice/submissionSlice";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { BarLoader } from "react-spinners";

export default function AssignmentDetails() {
    const dispatch = useAppDispatch();

    const { assignmentId } = useParams<{ assignmentId: string }>();

    const { submissionResult, loading, error } = useAppSelector((state) => state.submissions);

    useEffect(() => {
        if (assignmentId) {
            dispatch(fetchSubmissionResult(assignmentId));
        }
    }, [dispatch, assignmentId])

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

  if (!submissionResult) {
    return (
      <div className="flex items-center justify-center gap-2 p-4 mt-8 bg-yellow-900/30 text-yellow-400 border border-yellow-700 rounded-lg max-w-5xl mx-auto">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm font-medium">No Assignment Found</span>
      </div>
    );
  }
  return (
    <div>
        <div className="flex justify-center items-center h-screen">
          <Card className="p-8 rounded-xl bg-green-950/40 border border-green-700 shadow-lg">
            <CardContent className="text-center">
              <h2 className="text-2xl font-bold text-green-300 mb-4">
                Submission Feedback
              </h2>
              <p className="text-gray-200 text-lg">
                <span className="font-semibold">Total Marks:</span>{" "}
                {submissionResult.grade}
              </p>
              <div className="mt-4 p-4 bg-green-900/30 rounded-md border border-green-700 text-gray-200">
                {submissionResult.feedback}
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  )
}
