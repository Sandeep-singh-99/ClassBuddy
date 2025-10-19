import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

export default function PerformanceChart() {

  const { data, loading, error } = useAppSelector((state) => state.interview);
  const [chartData, setChartData] = useState([]);

  
  useEffect(() => {
    if (data && Array.isArray(data)) {
      const formattedData = data.map((quiz) => ({
        date: format(new Date(quiz.created_at), "MMM dd"),
        score: quiz.score * 50,
        name: quiz.name,
      }));
      setChartData(formattedData);
    }
  }, [data]);

  if (loading)
    return <BarLoader width={"100%"} color="gray" className="my-4" />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="gradient-title text-3xl md:text-4xl">
          Performance Trend
        </CardTitle>
        <CardDescription>Your quiz scores over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="bg-background border rounded-lg p-2 shadow-md">
                          <p className="text-sm font-medium">
                            {payload[0].payload.name}
                          </p>
                          <p className="text-sm font-semibold">
                            Score: {payload[0].value}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payload[0].payload.date}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground">
              No quiz performance data yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
