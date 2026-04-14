import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import {
  fetchStudentAssignmentStats,
  fetchStudentPerformanceStats,
  studentSubmissionStats,
} from "@/redux/slice/submissionSlice";
import { useEffect, Suspense, lazy } from "react";
import ProfileCard from "@/components/ProfileCard";

// Lazy load heavy components
const AssignmentStatsChart = lazy(
  () => import("@/components/AssignmentStatsChart")
);
const AssignmentPerformanceStats = lazy(
  () => import("@/components/AssignmentPerformanceStats")
);
const AssignmentLists = lazy(() => import("@/components/AssignmentLists"));

import AssignmentListSkeleton from "@/components/skeletons/AssignmentListSkeleton";
import PerformanceStatsSkeleton from "@/components/skeletons/PerformanceStatsSkeleton";
import AssignmentChartSkeleton from "@/components/skeletons/AssignmentChartSkeleton";
import { toast } from "sonner";

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
      <div className="space-y-6 mx-auto w-full max-w-6xl p-6">
        <AssignmentListSkeleton />
        <PerformanceStatsSkeleton />
        <AssignmentChartSkeleton />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-foreground p-6 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="relative mb-10 rounded-3xl bg-card border border-border/40 overflow-hidden shadow-sm">
        {/* Background Decorative Patterns */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="absolute right-0 top-0 w-[500px] h-[300px] bg-primary/10 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center p-8 md:p-10 gap-8">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Overview & Analytics
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-3">
              Welcome to your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">Dashboard</span>
            </h1>
            
            <p className="text-muted-foreground text-base max-w-xl leading-relaxed">
              Track your assignments, monitor your progress, and unlock AI-driven performance insights all in one place.
            </p>
          </div>

          {/* Profile on the right */}
          <div className="w-full xl:w-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-violet-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative bg-background/50 backdrop-blur-xl border border-border/50 rounded-2xl p-2 md:p-3 shadow-sm">
              <ProfileCard />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="space-y-8 mx-auto w-full max-w-7xl">
        <Suspense fallback={<AssignmentListSkeleton />}>
          <AssignmentLists />
        </Suspense>

        <Suspense fallback={<PerformanceStatsSkeleton />}>
          <AssignmentPerformanceStats />
        </Suspense>

        {studentAssignmentStats ? (
          <Suspense fallback={<AssignmentChartSkeleton />}>
            <div className="bg-card border border-border/40 p-6 rounded-2xl shadow-sm">
              <AssignmentStatsChart
                data={studentAssignmentStats.completion_over_time || []}
                totalCompleted={studentAssignmentStats.total_submissions || 0}
              />
            </div>
          </Suspense>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground bg-card border border-dashed border-border/80 rounded-2xl">
            <div className="p-4 bg-muted/30 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            </div>
            <p className="text-lg font-medium text-foreground">No stats available yet</p>
            <p className="text-sm mt-1 max-w-sm text-center">Complete some assignments or quizzes to see your insights and track progress over time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
