import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useAppSelector } from "@/hooks/hooks";
import { BarLoader } from "react-spinners";
import { TrendingUp } from "lucide-react";

// Colors for lines
const COLORS = ["#ffffff", "#4ade80", "#60a5fa", "#facc15", "#ff6b6b", "#a78bfa"];

export default function PerformanceChart() {
  const { data, loading, error } = useAppSelector((state) => state.interview);
  const [chartData, setChartData] = useState<any[]>([]);
  const [quizNames, setQuizNames] = useState<string[]>([]);

  useEffect(() => {
    if (!data || !Array.isArray(data)) return;

    // Collect all quiz names
    const names = data.map((quiz) => quiz.name);
    setQuizNames(names);

    // Build chart data with one object per quiz date
    const formattedData = data.map((quiz) => ({
      date: format(new Date(quiz.created_at), "MMM dd"),
      [quiz.name]: quiz.score * 50, // convert to percentage
    }));

    setChartData(formattedData);
  }, [data]);

  if (loading)
    return (
      <div className="p-6">
        <BarLoader width={"100%"} color="white" className="my-4" />
      </div>
    );

  if (error) return <p className="text-center text-red-400">{error}</p>;

  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl md:text-3xl font-semibold text-white">
            Performance Trend
          </CardTitle>
          <CardDescription className="text-gray-300">
            Your quiz scores over time
          </CardDescription>
        </div>
        <TrendingUp className="h-8 w-8 text-white/70" />
      </CardHeader>

      <CardContent>
        <div className="h-[320px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />

                <XAxis
                  dataKey="date"
                  tick={{ fill: "white", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.3)" }}
                  tickLine={false}
                />

                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "white", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.3)" }}
                  tickLine={false}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-md p-3 rounded-lg">
                          {payload.map((p, i) => (
                            <div key={i} className="mb-1">
                              <p className="font-semibold text-sm">{p.dataKey}</p>
                              <p className="text-white font-bold text-sm">
                                Score: {p.value}%
                              </p>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Legend
                  wrapperStyle={{ color: "white", fontSize: 12 }}
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                />

                {quizNames.map((name, index) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      stroke: COLORS[index % COLORS.length],
                      strokeWidth: 2,
                      fill: "white",
                    }}
                    activeDot={{
                      r: 6,
                      stroke: COLORS[index % COLORS.length],
                      strokeWidth: 2,
                      fill: "white",
                    }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-2">
              <TrendingUp className="h-10 w-10 text-gray-500" />
              <p>No quiz performance data yet.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
