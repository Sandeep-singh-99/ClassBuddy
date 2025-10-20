import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { fetchStudentAssignmentStats, studentSubmissionStats } from "@/redux/slice/submissionSlice";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import AssignmentStatsChart from "@/components/AssignmentStatsChart";
import ProfileCard from "@/components/ProfileCard";
import AssignmentLists from "@/components/AssignmentLists";

export default function DashboardHome() {
  const dispatch = useAppDispatch();
  const { studentAssignmentStats, loading } = useAppSelector(
    (state) => state.submissions
  );

  useEffect(() => {
    dispatch(studentSubmissionStats());
    dispatch(fetchStudentAssignmentStats());
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
    <div className="relative min-h-screen text-foreground p-6">
  {/* Header Section */}
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
    <div>
      <h1 className="text-2xl font-bold tracking-tight">📊 Student Dashboard</h1>
      <p className="text-muted-foreground text-sm">
        Track your assignments, progress, and performance insights.
      </p>
    </div>

    {/* Profile on the right */}
    <div className="mt-4 md:mt-0">
      <ProfileCard />
    </div>
  </div>

  {/* Main Content Section */}
  <div className="space-y-6 mx-auto w-full max-w-6xl">

    <AssignmentLists />

  

    <AssignmentStatsChart
      data={completion_over_time}
      totalCompleted={total_submissions}
    />

  </div>
</div>
  );
}
