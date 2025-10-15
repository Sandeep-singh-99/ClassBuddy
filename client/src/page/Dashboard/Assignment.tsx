import AssignmentViewCard from "@/components/AssignmentViewCard";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { fetchAssignments } from "@/redux/slice/assignmentSlice";
import { AlertCircle, BookOpenText } from "lucide-react";
import { useEffect } from "react";
import { BarLoader } from "react-spinners";

export default function Assignment() {
  const dispatch = useAppDispatch();

  const { assignments, loading, error } = useAppSelector(
    (state) => state.assignments
  );

  useEffect(() => {
    dispatch(fetchAssignments());
  }, [dispatch]);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <BookOpenText className="w-8 h-8 text-blue-600" /> Assignment
      </h1>

      {loading && <BarLoader width={"100%"} color="gray" className="my-4" />}

      {error && (
        <div className="flex items-center justify-center gap-2 p-4 my-6 bg-red-50 text-red-600 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Error: {error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {assignments.map((assignment) => (
          <AssignmentViewCard key={assignment.id} assignment={assignment} />
        ))}
      </div>
    </div>
  );
}
