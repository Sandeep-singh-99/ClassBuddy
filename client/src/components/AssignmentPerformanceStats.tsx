import { useAppSelector } from "@/hooks/hooks";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

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

  const { grades_vs_assignments, submission_count_per_month } = performanceStats;

  return (
    <div className="grid gap-6 md:grid-cols-2 w-full max-w-6xl mx-auto p-4">
      {/* --- Chart 1: Submissions Per Month --- */}
      <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            🗓️ Submissions Per Month
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={submission_count_per_month || []}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="month"
                stroke="#aaa"
                tickLine={false}
                axisLine={false}
              />
              <YAxis stroke="#aaa" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px",
                }}
              />
              <Bar
                dataKey="count"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* --- Chart 2: Grades vs Assignments --- */}
      <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            🧠 Grades vs Assignments
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={grades_vs_assignments || []}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="assignment_title"
                stroke="#aaa"
                angle={-10}
                tickMargin={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#aaa"
                label={{
                  value: "Grade",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#aaa",
                }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px",
                }}
              />
              <Line
                type="monotone"
                dataKey="grade"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4, fill: "#60a5fa", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
