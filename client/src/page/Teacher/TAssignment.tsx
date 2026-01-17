import { AlertCircle, BookOpenText } from "lucide-react";
import AssignmentForm from "./components/AssignmentForm";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { useEffect } from "react";
import { fetchTeacherAssignments } from "@/redux/slice/assignmentSlice";
import { BarLoader } from "react-spinners";
import AssignmentCard from "./components/AssignmentCard";

export default function TAssignment() {
  const dispatch = useAppDispatch();

  const { assignments, loading, error } = useAppSelector(
    (state) => state.assignments
  );

  useEffect(() => {
    dispatch(fetchTeacherAssignments());
  }, [dispatch]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <BookOpenText className="w-8 h-8 text-blue-600" /> Assignment
      </h1>

      <div className="flex justify-end">
        <AssignmentForm />
      </div>

      {loading && <BarLoader width={"100%"} color="gray" className="my-4" />}

      {error && (
        <div className="flex items-center justify-center gap-2 p-4 my-6 bg-red-50 text-red-600 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Error: {error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {assignments.map((assignment) => (
          <AssignmentCard assignment={assignment} />
        ))}
      </div>
    </div>
  );
}
