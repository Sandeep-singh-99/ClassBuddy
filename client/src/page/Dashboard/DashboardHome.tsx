import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { studentSubmissionStats } from "@/redux/slice/submissionSlice";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import AssignmentStatsChart from "@/components/AssignmentStatsChart";

export default function DashboardHome() {
  const dispatch = useAppDispatch();
  const { studentAssignmentStats, loading } = useAppSelector(
    (state) => state.submissions
  );

  useEffect(() => {
    dispatch(studentSubmissionStats());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
        <Loader2 className="animate-spin w-6 h-6 text-indigo-400 mb-2" />
        <p>Loading your stats...</p>
      </div>
    );
  }

  if (!studentAssignmentStats) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-500">
        No stats available yet 📉
      </div>
    );
  }

  const { total_submissions, completion_over_time } = studentAssignmentStats;

  return (
    <div className="space-y-6 p-5">
      <AssignmentStatsChart
        data={completion_over_time}
        totalCompleted={total_submissions}
      />
    </div>
  );
}
