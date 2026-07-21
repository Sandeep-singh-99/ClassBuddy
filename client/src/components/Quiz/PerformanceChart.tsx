import { useState, useMemo } from "react";
import { format } from "date-fns";
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
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  Trophy,
  Activity,
  Target,
  Sparkles,
} from "lucide-react";

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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/hooks/hooks";
import PerformanceChartSkeleton from "../skeletons/PerformanceChartSkeleton";

const chartConfig = {
  score: {
    label: "Score",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

type ChartType = "area" | "bar" | "line";

export default function PerformanceChart() {
  const { data, loading, error } = useAppSelector((state) => state.interview);
  const [chartType, setChartType] = useState<ChartType>("area");
  const [timeRange, setTimeRange] = useState<"all" | "recent5" | "recent10">("all");

  // Transform data for chart rendering
  const { chartData, stats } = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        chartData: [],
        stats: { avgScore: 0, maxScore: 0, total: 0, trend: 0 },
      };
    }

    // Filter only completed or scored quizzes
    const validQuizzes = [...data]
      .filter((q) => typeof q.score === "number" && !isNaN(q.score))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    let sliced = validQuizzes;
    if (timeRange === "recent5") sliced = validQuizzes.slice(-5);
    if (timeRange === "recent10") sliced = validQuizzes.slice(-10);

    const formatted = sliced.map((quiz, index) => {
      let scoreVal = quiz.score;
      if (scoreVal <= 2 && scoreVal > 0) scoreVal = scoreVal * 50;
      scoreVal = Math.min(100, Math.max(0, Math.round(scoreVal)));

      return {
        id: quiz.id || index,
        date: format(new Date(quiz.created_at), "MMM dd"),
        fullDate: format(new Date(quiz.created_at), "MMM dd, yyyy · HH:mm"),
        name: quiz.name || "Untitled Quiz",
        score: scoreVal,
      };
    });

    const total = validQuizzes.length;
    const scores = validQuizzes.map((q) => {
      let scoreVal = q.score;
      if (scoreVal <= 2 && scoreVal > 0) scoreVal = scoreVal * 50;
      return Math.min(100, Math.max(0, Math.round(scoreVal)));
    });

    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;

    let trend = 0;
    if (scores.length >= 2) {
      const recent = scores[scores.length - 1];
      const previous = scores[scores.length - 2];
      trend = recent - previous;
    }

    return {
      chartData: formatted,
      stats: { avgScore, maxScore, total, trend },
    };
  }, [data, timeRange]);

  if (loading) {
    return <PerformanceChartSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 text-destructive">
        <CardContent className="flex items-center justify-center p-8 text-center font-medium">
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-border/60 shadow-md bg-card/80 backdrop-blur-sm transition-all duration-300">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Performance Analytics
                <Badge variant="outline" className="text-xs font-normal border-primary/20 bg-primary/5 text-primary">
                  <Sparkles className="h-3 w-3 mr-1" /> Real-time
                </Badge>
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs sm:text-sm">
                Track your score progression and quiz outcomes over time
              </CardDescription>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-1 text-xs">
            <button
              onClick={() => setTimeRange("all")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                timeRange === "all"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTimeRange("recent10")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                timeRange === "recent10"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Last 10
            </button>
            <button
              onClick={() => setTimeRange("recent5")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                timeRange === "recent5"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Last 5
            </button>
          </div>

          <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-1">
            <Button
              variant={chartType === "area" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={() => setChartType("area")}
              title="Area Chart"
            >
              <AreaChartIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === "bar" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={() => setChartType("bar")}
              title="Bar Chart"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === "line" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={() => setChartType("line")}
              title="Line Chart"
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Metric Badges Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border/50 bg-background/60 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Avg Score</span>
              <Target className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-foreground">{stats.avgScore}%</span>
              <Badge variant="secondary" className="text-[10px] bg-indigo-500/10 text-indigo-500 font-semibold border-0">
                Target 80%
              </Badge>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-background/60 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Top Score</span>
              <Trophy className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-foreground">{stats.maxScore}%</span>
              <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-500 font-semibold border-0">
                Personal Best
              </Badge>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-background/60 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Total Quizzes</span>
              <Activity className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-foreground">{stats.total}</span>
              <span className="text-xs text-muted-foreground">completed</span>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-background/60 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Recent Delta</span>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className={`text-2xl font-extrabold ${stats.trend >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {stats.trend >= 0 ? `+${stats.trend}%` : `${stats.trend}%`}
              </span>
              <span className="text-xs text-muted-foreground">vs previous</span>
            </div>
          </div>
        </div>

        {/* Main Chart Container */}
        <div className="h-[320px] w-full pt-2">
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-full w-full">
              {chartType === "area" ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12 }}
                    unit="%"
                    className="text-muted-foreground"
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="bg-card text-card-foreground border-border shadow-xl rounded-xl p-3"
                        labelFormatter={(_, payload) => {
                          if (payload && payload.length > 0) {
                            const dataItem = payload[0].payload;
                            return (
                              <div className="space-y-1">
                                <p className="font-semibold text-foreground text-sm">{dataItem.name}</p>
                                <p className="text-xs text-muted-foreground">{dataItem.fullDate}</p>
                              </div>
                            );
                          }
                          return "";
                        }}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#scoreGradient)"
                    activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--background)" }}
                  />
                </AreaChart>
              ) : chartType === "bar" ? (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12 }}
                    unit="%"
                    className="text-muted-foreground"
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="bg-card text-card-foreground border-border shadow-xl rounded-xl p-3"
                        labelFormatter={(_, payload) => {
                          if (payload && payload.length > 0) {
                            const dataItem = payload[0].payload;
                            return (
                              <div className="space-y-1">
                                <p className="font-semibold text-foreground text-sm">{dataItem.name}</p>
                                <p className="text-xs text-muted-foreground">{dataItem.fullDate}</p>
                              </div>
                            );
                          }
                          return "";
                        }}
                      />
                    }
                  />
                  <Bar
                    dataKey="score"
                    fill="var(--chart-1)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12 }}
                    unit="%"
                    className="text-muted-foreground"
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="bg-card text-card-foreground border-border shadow-xl rounded-xl p-3"
                        labelFormatter={(_, payload) => {
                          if (payload && payload.length > 0) {
                            const dataItem = payload[0].payload;
                            return (
                              <div className="space-y-1">
                                <p className="font-semibold text-foreground text-sm">{dataItem.name}</p>
                                <p className="text-xs text-muted-foreground">{dataItem.fullDate}</p>
                              </div>
                            );
                          }
                          return "";
                        }}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--chart-1)"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "var(--background)" }}
                    activeDot={{ r: 7, strokeWidth: 2, fill: "var(--chart-1)" }}
                  />
                </LineChart>
              )}
            </ChartContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 rounded-xl border border-dashed border-border/80 bg-muted/20 p-6">
              <div className="p-3 bg-muted rounded-full text-muted-foreground">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground text-sm">No Performance Data Yet</p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Complete your first quiz session to start generating visual analytics and tracking performance growth.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}