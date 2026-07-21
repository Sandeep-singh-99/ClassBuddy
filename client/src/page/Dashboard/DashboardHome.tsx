import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import {
  fetchStudentAssignmentStats,
  fetchStudentPerformanceStats,
  studentSubmissionStats,
} from "@/redux/slice/submissionSlice";
import { useEffect, Suspense, lazy } from "react";
import ProfileCard from "@/components/ProfileCard";
import { Sparkles, BarChart3 } from "lucide-react";

// Lazy load heavy dashboard components
const AssignmentStatsChart = lazy(
  () => import("@/components/Assignment/AssignmentStatsChart")
);
const AssignmentPerformanceStats = lazy(
  () => import("@/components/Assignment/AssignmentPerformanceStats")
);
const AssignmentLists = lazy(() => import("@/components/Assignment/AssignmentLists"));

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
      <div className="space-y-6 mx-auto w-full max-w-7xl p-6">
        <AssignmentListSkeleton />
        <PerformanceStatsSkeleton />
        <AssignmentChartSkeleton />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-foreground p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* ── 1. Hero Header Section ────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-r from-card via-card/90 to-primary/10 dark:to-primary/20 p-6 sm:p-8 md:p-10 shadow-sm">
        {/* Decorative Grid Patterns & Ambient Light Glows */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute left-0 bottom-0 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span>Overview & Analytics</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Welcome to your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-violet-500">Student Dashboard</span>
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Track your coursework, monitor your monthly submission trends, and review AI-driven grade feedback all in one place.
            </p>
          </div>

          {/* Profile Card Container */}
          <div className="w-full xl:w-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-violet-500/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />
            <div className="relative bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-2 sm:p-3 shadow-xs">
              <ProfileCard />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Main Dashboard Content ─────────────────────────────────── */}
      <div className="space-y-8">
        {/* Section 1: Assignment Lists Table */}
        <Suspense fallback={<AssignmentListSkeleton />}>
          <AssignmentLists />
        </Suspense>

        {/* Section 2: Dual Performance Stats Charts */}
        <Suspense fallback={<PerformanceStatsSkeleton />}>
          <AssignmentPerformanceStats />
        </Suspense>

        {/* Section 3: Daily Completion Insights Chart */}
        {studentAssignmentStats ? (
          <Suspense fallback={<AssignmentChartSkeleton />}>
            <AssignmentStatsChart
              data={studentAssignmentStats.completion_over_time || []}
              totalCompleted={studentAssignmentStats.total_submissions || 0}
            />
          </Suspense>
        ) : (
          <div className="flex flex-col items-center justify-center h-[280px] text-muted-foreground bg-card border border-dashed border-border/80 rounded-2xl p-8 space-y-3">
            <div className="p-3.5 bg-muted rounded-full text-muted-foreground">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="space-y-1 text-center">
              <p className="text-base font-semibold text-foreground">No completion stats available yet</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Complete your assignments to start generating visual analytics and tracking performance growth.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
