import {
  ComposedChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default function AssignmentStatsChart({ data = [], totalCompleted = 0 }) {
  return (
    <Card className="bg-[#0f172a] border border-gray-800 shadow-lg rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-gray-100 text-xl flex items-center justify-between">
          <span>📊 Assignment Completion Insights</span>
          <span className="text-sm font-normal text-gray-400">
            Total:{" "}
            <span className="text-indigo-400 font-semibold">{totalCompleted}</span>
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="w-full h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              {/* Gradients */}
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopColor="#22d3ee" stopOpacity={0.6} />
                  <stop offset="90%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8" }}
                tickLine={{ stroke: "#334155" }}
              />
              <YAxis
                allowDecimals={false}
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8" }}
                tickLine={{ stroke: "#334155" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "10px",
                  color: "#e2e8f0",
                }}
                labelStyle={{ color: "#cbd5e1" }}
              />
              <Legend
                verticalAlign="top"
                wrapperStyle={{ color: "#94a3b8", marginBottom: 10 }}
              />

              {/* Smooth trend + solid bars */}
              <Area
                type="monotone"
                dataKey="count"
                name="Completion Trend"
                stroke="#22d3ee"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#areaGradient)"
              />
              <Bar
                dataKey="count"
                name="Assignments Completed"
                fill="url(#barGradient)"
                barSize={30}
                radius={[6, 6, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
