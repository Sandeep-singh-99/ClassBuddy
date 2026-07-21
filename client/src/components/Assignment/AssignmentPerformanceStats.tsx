import { useAppSelector } from "@/hooks/hooks";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, TrendingUp, BarChart3, LineChart as LineChartIcon } from "lucide-react";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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

export default function AssignmentPerformanceStats() {
  const { performanceStats, loading } = useAppSelector(
    (state) => state.submissions
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[260px] text-muted-foreground bg-card border border-border/60 rounded-2xl p-6">
        <Loader2 className="animate-spin w-6 h-6 text-primary mb-2" />
        <p className="text-xs font-medium">Loading performance stats...</p>
      </div>
    );
  }

  if (!performanceStats) {
    return (
      <Card className="border-dashed border-border/80 bg-muted/20 rounded-2xl">
        <CardContent className="flex flex-col items-center justify-center p-10 text-center text-muted-foreground space-y-2">
          <TrendingUp className="h-8 w-8 opacity-40" />
          <p className="font-semibold text-sm text-foreground">No Performance Analytics Yet</p>
          <p className="text-xs text-muted-foreground max-w-sm">
            Complete assignments and quizzes to start generating visual monthly trends and grade performance charts.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { grades_vs_assignments, submission_count_per_month } =
    performanceStats;

  return (
    <div className="grid gap-6 md:grid-cols-2 w-full">
      {/* ── Chart 1: Submissions Per Month ────────────────────────────── */}
      <Card className="border border-border/60 shadow-sm rounded-2xl bg-card overflow-hidden">
        <CardHeader className="pb-2 border-b border-border/40">
          <CardTitle className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Monthly Submissions Volume
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Number of completed assignments submitted each month
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="h-[280px] w-full">
            <ChartContainer
              config={submissionsChartConfig}
              className="h-full w-full"
            >
              <BarChart
                data={submission_count_per_month || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  fontSize={11}
                  className="fill-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={11}
                  className="fill-muted-foreground"
                />
                <ChartTooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar
                  dataKey="count"
                  fill="var(--chart-1)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* ── Chart 2: Grades vs Assignments ────────────────────────────── */}
      <Card className="border border-border/60 shadow-sm rounded-2xl bg-card overflow-hidden">
        <CardHeader className="pb-2 border-b border-border/40">
          <CardTitle className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
            <LineChartIcon className="h-4 w-4 text-emerald-500" />
            Grade Progression
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Grade outcomes received across recent assignments
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="h-[280px] w-full">
            <ChartContainer
              config={gradesChartConfig}
              className="h-full w-full"
            >
              <LineChart
                data={grades_vs_assignments || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis
                  dataKey="assignment_title"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  fontSize={11}
                  className="fill-muted-foreground"
                  angle={-10}
                  height={50}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={11}
                  className="fill-muted-foreground"
                />
                <ChartTooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Line
                  type="monotone"
                  dataKey="grade"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2, fill: "var(--background)" }}
                  activeDot={{ r: 6, strokeWidth: 2, fill: "var(--chart-1)" }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
