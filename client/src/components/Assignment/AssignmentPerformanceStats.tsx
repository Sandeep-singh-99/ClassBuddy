import { useMemo } from "react";
import { useAppSelector } from "@/hooks/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, TrendingUp, Trophy, Award, CheckCircle2, Sparkles } from "lucide-react";

export default function AssignmentPerformanceStats() {
  const { performanceStats, loading } = useAppSelector(
    (state) => state.submissions
  );


  // Computed KPI Metrics
  const metrics = useMemo(() => {
    if (!performanceStats) {
      return { totalSubmissions: 0, avgGrade: 0, topGrade: 0, totalGradesCount: 0 };
    }

    const { grades_vs_assignments, submission_count_per_month } = performanceStats;

    const totalSubmissions = submission_count_per_month
      ? submission_count_per_month.reduce((acc: number, item: any) => acc + (item.count || 0), 0)
      : 0;

    const grades = grades_vs_assignments
      ? grades_vs_assignments
          .map((item: any) => Number(item.grade) || 0)
          .filter((g: number) => g > 0)
      : [];

    const avgGrade = grades.length > 0 ? Math.round(grades.reduce((a: number, b: number) => a + b, 0) / grades.length) : 0;
    const topGrade = grades.length > 0 ? Math.max(...grades) : 0;

    return {
      totalSubmissions,
      avgGrade,
      topGrade,
      totalGradesCount: grades.length,
    };
  }, [performanceStats]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground bg-card border border-border/60 rounded-3xl p-8 space-y-3">
        <Loader2 className="animate-spin w-7 h-7 text-primary" />
        <p className="text-xs font-medium">Loading performance analytics...</p>
      </div>
    );
  }

  if (!performanceStats) {
    return (
      <Card className="border-dashed border-border/80 bg-muted/20 rounded-3xl">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground space-y-3">
          <div className="p-3.5 rounded-full bg-muted text-muted-foreground">
            <TrendingUp className="h-8 w-8 opacity-50" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="font-semibold text-base text-foreground">No Performance Data Yet</h3>
            <p className="text-xs text-muted-foreground">
              Complete your assignments to start generating interactive submission and grade analytics.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="space-y-6">
      {/* ── Top Metric Badges / KPI Cards ────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 rounded-2xl border border-border/60 bg-gradient-to-b from-card to-card/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Submissions</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-foreground">{metrics.totalSubmissions}</span>
            <span className="text-[10px] text-muted-foreground font-semibold">tasks</span>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border border-border/60 bg-gradient-to-b from-card to-card/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Average Grade</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-foreground">{metrics.avgGrade}</span>
            <span className="text-[10px] text-muted-foreground font-semibold">/ 100</span>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border border-border/60 bg-gradient-to-b from-card to-card/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Highest Score</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Trophy className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-foreground">{metrics.topGrade}</span>
            <span className="text-[10px] text-muted-foreground font-semibold">pts</span>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border border-border/60 bg-gradient-to-b from-card to-card/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Graded Tasks</span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-foreground">{metrics.totalGradesCount}</span>
            <span className="text-[10px] text-muted-foreground font-semibold">reviewed</span>
          </div>
        </Card>
      </div>

    </div>
  );
}
