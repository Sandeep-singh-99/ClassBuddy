import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { BarLoader } from "react-spinners";
import { TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useAppSelector } from "@/hooks/hooks";

// Fallback colors if CSS variables aren't set
// Blue shades palette
const CHART_COLORS = [
  "#2563eb", // Blue 600
  "#3b82f6", // Blue 500
  "#60a5fa", // Blue 400
  "#93c5fd", // Blue 300
  "#1d4ed8", // Blue 700
];

export default function PerformanceChart() {
  const { data, loading, error } = useAppSelector((state) => state.interview);
  const [chartData, setChartData] = useState<any[]>([]);
  const [quizNames, setQuizNames] = useState<string[]>([]);

  useEffect(() => {
    if (!data || !Array.isArray(data)) return;

    // Collect all unique quiz names
    const names = Array.from(new Set(data.map((quiz) => quiz.name)));
    setQuizNames(names);

    // Group data by date
    // We need to merge scores for the same date into one object
    const dataByDate = data.reduce((acc: any, quiz) => {
      const dateKey = format(new Date(quiz.created_at), "MMM dd");
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey };
      }
      // Convert score to percentage (assuming score is out of 2)
      acc[dateKey][quiz.name] = quiz.score * 50;
      return acc;
    }, {});

    setChartData(Object.values(dataByDate));
  }, [data]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    quizNames.forEach((name, index) => {
      config[name] = {
        label: name,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });
    return config;
  }, [quizNames]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px] w-full bg-muted/10 rounded-xl">
        <BarLoader color="#3b82f6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] w-full bg-red-500/10 rounded-xl border border-red-500/20">
        <p className="text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Performance Analytics
        </CardTitle>
        <CardDescription>Your quiz scores over time</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-[350px] w-full">
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="stroke-muted"
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  domain={[0, 100]}
                  unit="%"
                />
                <ChartTooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <ChartLegend
                  content={<ChartLegendContent className="pt-4" />}
                />
                {quizNames.map((name, index) => (
                  <Bar
                    key={name}
                    dataKey={name}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                ))}
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="p-3 bg-muted rounded-full">
                <TrendingUp className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                No quiz performance data yet.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}