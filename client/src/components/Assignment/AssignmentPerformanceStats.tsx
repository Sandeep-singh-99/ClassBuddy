import { useState, useMemo } from "react";
import { useAppSelector } from "@/hooks/hooks";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Loader2,
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  Trophy,
  Award,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";

const submissionsChartConfig = {
  count: {
    label: "Submissions",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const gradesChartConfig = {
  grade: {
    label: "Grade",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

type ChartType = "area" | "bar" | "line";

export default function AssignmentPerformanceStats() {
  const { performanceStats, loading } = useAppSelector(
    (state) => state.submissions
  );

  const [submissionsChartType, setSubmissionsChartType] = useState<ChartType>("bar");
  const [gradesChartType, setGradesChartType] = useState<ChartType>("line");

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

  const { grades_vs_assignments = [], submission_count_per_month = [] } = performanceStats;

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

      {/* ── Dual Analytics Charts ──────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Chart 1: Monthly Submissions ───────────────────────────── */}
        <Card className="border border-border/60 shadow-sm rounded-3xl bg-card overflow-hidden">
          <CardHeader className="p-6 pb-2 border-b border-border/40 flex flex-row items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                <BarChart3 className="h-4.5 w-4.5 text-primary" />
                Monthly Submissions Volume
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Number of completed assignments submitted each month
              </CardDescription>
            </div>

            {/* Chart View Selector */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
              <Button
                variant={submissionsChartType === "area" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0 rounded-lg"
                onClick={() => setSubmissionsChartType("area")}
                title="Area Chart"
              >
                <AreaChartIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={submissionsChartType === "bar" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0 rounded-lg"
                onClick={() => setSubmissionsChartType("bar")}
                title="Bar Chart"
              >
                <BarChart3 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={submissionsChartType === "line" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0 rounded-lg"
                onClick={() => setSubmissionsChartType("line")}
                title="Line Chart"
              >
                <LineChartIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="h-[280px] w-full">
              <ChartContainer config={submissionsChartConfig} className="h-full w-full">
                {submissionsChartType === "area" ? (
                  <AreaChart data={submission_count_per_month} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="submissionsAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} fontSize={11} className="fill-muted-foreground" />
                    <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize={11} className="fill-muted-foreground" allowDecimals={false} />
                    <ChartTooltip cursor={{ stroke: "var(--border)" }} content={<ChartTooltipContent indicator="dot" />} />
                    <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2.5} fill="url(#submissionsAreaGradient)" />
                  </AreaChart>
                ) : submissionsChartType === "bar" ? (
                  <BarChart data={submission_count_per_month} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} fontSize={11} className="fill-muted-foreground" />
                    <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize={11} className="fill-muted-foreground" allowDecimals={false} />
                    <ChartTooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="count" fill="var(--chart-1)" radius={[6, 6, 0, 0]} maxBarSize={45} />
                  </BarChart>
                ) : (
                  <LineChart data={submission_count_per_month} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} fontSize={11} className="fill-muted-foreground" />
                    <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize={11} className="fill-muted-foreground" allowDecimals={false} />
                    <ChartTooltip cursor={{ stroke: "var(--border)" }} content={<ChartTooltipContent indicator="dot" />} />
                    <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--background)", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                )}
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* ── Chart 2: Grade Progression ─────────────────────────────── */}
        <Card className="border border-border/60 shadow-sm rounded-3xl bg-card overflow-hidden">
          <CardHeader className="p-6 pb-2 border-b border-border/40 flex flex-row items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                <LineChartIcon className="h-4.5 w-4.5 text-emerald-500" />
                Grade Outcomes & Scores
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Grade results achieved per completed course assignment
              </CardDescription>
            </div>

            {/* Chart View Selector */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
              <Button
                variant={gradesChartType === "area" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0 rounded-lg"
                onClick={() => setGradesChartType("area")}
                title="Area Chart"
              >
                <AreaChartIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={gradesChartType === "bar" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0 rounded-lg"
                onClick={() => setGradesChartType("bar")}
                title="Bar Chart"
              >
                <BarChart3 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={gradesChartType === "line" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0 rounded-lg"
                onClick={() => setGradesChartType("line")}
                title="Line Chart"
              >
                <LineChartIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="h-[280px] w-full">
              <ChartContainer config={gradesChartConfig} className="h-full w-full">
                {gradesChartType === "area" ? (
                  <AreaChart data={grades_vs_assignments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradesAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                    <XAxis dataKey="assignment_title" tickLine={false} axisLine={false} tickMargin={10} fontSize={11} className="fill-muted-foreground" angle={-10} height={50} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize={11} className="fill-muted-foreground" />
                    <ChartTooltip cursor={{ stroke: "var(--border)" }} content={<ChartTooltipContent indicator="dot" />} />
                    <Area type="monotone" dataKey="grade" stroke="#10b981" strokeWidth={2.5} fill="url(#gradesAreaGradient)" />
                  </AreaChart>
                ) : gradesChartType === "bar" ? (
                  <BarChart data={grades_vs_assignments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                    <XAxis dataKey="assignment_title" tickLine={false} axisLine={false} tickMargin={10} fontSize={11} className="fill-muted-foreground" angle={-10} height={50} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize={11} className="fill-muted-foreground" />
                    <ChartTooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="grade" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={45} />
                  </BarChart>
                ) : (
                  <LineChart data={grades_vs_assignments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                    <XAxis dataKey="assignment_title" tickLine={false} axisLine={false} tickMargin={10} fontSize={11} className="fill-muted-foreground" angle={-10} height={50} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize={11} className="fill-muted-foreground" />
                    <ChartTooltip cursor={{ stroke: "var(--border)" }} content={<ChartTooltipContent indicator="dot" />} />
                    <Line type="monotone" dataKey="grade" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: "var(--background)" }} activeDot={{ r: 6, strokeWidth: 2, fill: "#10b981" }} />
                  </LineChart>
                )}
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
