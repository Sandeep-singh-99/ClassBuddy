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
import { Loader2 } from "lucide-react";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const submissionsChartConfig = {
  count: {
    label: "Submissions",
    color: "#2563eb",
  },
} satisfies ChartConfig;

const gradesChartConfig = {
  grade: {
    label: "Grade",
    color: "#2563eb",
  },
} satisfies ChartConfig;

export default function AssignmentPerformanceStats() {
  const { performanceStats, loading } = useAppSelector(
    (state) => state.submissions
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
        <Loader2 className="animate-spin w-6 h-6 text-primary mb-2" />
        <p>Loading performance stats...</p>
      </div>
    );
  }

  if (!performanceStats) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No performance data yet 📊
      </div>
    );
  }

  const { grades_vs_assignments, submission_count_per_month } =
    performanceStats;

  return (
    <div className="grid gap-6 md:grid-cols-2 w-full max-w-6xl mx-auto p-4">
      {/* --- Chart 1: Submissions Per Month --- */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            🗓️ Submissions Per Month
          </CardTitle>
          <CardDescription>
            Number of assignments submitted per month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ChartContainer
              config={submissionsChartConfig}
              className="h-full w-full"
            >
              <BarChart
                data={submission_count_per_month || []}
                margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* --- Chart 2: Grades vs Assignments --- */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            🧠 Grades vs Assignments
          </CardTitle>
          <CardDescription>Grades received for each assignment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ChartContainer
              config={gradesChartConfig}
              className="h-full w-full"
            >
              <LineChart
                data={grades_vs_assignments || []}
                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="assignment_title"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  angle={-10}
                  height={60}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Line
                  type="monotone"
                  dataKey="grade"
                  stroke="var(--color-grade)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--color-grade)", strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
