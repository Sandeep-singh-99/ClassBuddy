import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import {
  fetchStudentAssignmentStats,
  fetchStudentPerformanceStats,
  studentSubmissionStats,
} from "@/redux/slice/submissionSlice";
import { useEffect, Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import ProfileCard from "@/components/ProfileCard";
import { toast } from "react-toastify";

// Lazy load heavy components
const AssignmentStatsChart = lazy(
  () => import("@/components/AssignmentStatsChart")
);
const AssignmentPerformanceStats = lazy(
  () => import("@/components/AssignmentPerformanceStats")
);
const AssignmentLists = lazy(() => import("@/components/AssignmentLists"));

export default function DashboardHome() {
  const dispatch = useAppDispatch();
  const { studentAssignmentStats, loading } = useAppSelector(
    (state) => state.submissions
  );

  useEffect(() => {
    (async () => {
      const results = await Promise.allSettled([
        dispatch(studentSubmissionStats()),
        dispatch(fetchStudentAssignmentStats()),
        dispatch(fetchStudentPerformanceStats()),
      ]);

      results.forEach((res, index) => {
        if (res.status === "rejected") {
          toast.error(`Failed to load data ${index + 1}: ${res.reason}`);
        }
      });
    })();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
        <Loader2 className="animate-spin w-6 h-6 text-indigo-400 mb-2" />
        <p>Loading your stats...</p>
      </div>
    );
  }

  // if (!studentAssignmentStats) {
  //   return (
  //     <div className="flex items-center justify-center h-[400px] text-gray-500">
  //       No stats available yet 📉
  //     </div>
  //   );
  // }

  // const { total_submissions, completion_over_time } = studentAssignmentStats;

  return (
    <div className="relative min-h-screen text-foreground p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            📊 Student Dashboard
          </h1>
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
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-40 text-gray-400">
              <Loader2 className="animate-spin w-5 h-5 mr-2" />
              Loading assignments...
            </div>
          }
        >
          <AssignmentLists />
        </Suspense>

        <Suspense
          fallback={
            <div className="flex items-center justify-center h-40 text-gray-400">
              <Loader2 className="animate-spin w-5 h-5 mr-2" />
              Loading performance...
            </div>
          }
        >
          <AssignmentPerformanceStats />
        </Suspense>

        {studentAssignmentStats ? (
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-40 text-gray-400">
                <Loader2 className="animate-spin w-5 h-5 mr-2" />
                Loading chart...
              </div>
            }
          >
            <AssignmentStatsChart
              data={studentAssignmentStats.completion_over_time || []}
              totalCompleted={studentAssignmentStats.total_submissions || 0}
            />
          </Suspense>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-gray-500">
            No stats available yet 📉
          </div>
        )}
      </div>
    </div>
  );
}
