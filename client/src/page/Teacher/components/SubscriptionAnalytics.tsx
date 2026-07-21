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
  Activity,
  Sparkles,
  IndianRupee,
  Crown,
  CreditCard,
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
import type { ITeacherAnalytics } from "@/types/subscription";

interface SubscriptionAnalyticsProps {
  analytics: ITeacherAnalytics | null;
}

type ChartType = "area" | "bar" | "line";

const chartConfig = {
  total: {
    label: "Total Revenue",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export const SubscriptionAnalytics = ({
  analytics,
}: SubscriptionAnalyticsProps) => {
  const [chartType, setChartType] = useState<ChartType>("area");
  const [timeRange, setTimeRange] = useState<"all" | "recent5" | "recent10">("all");

  const { chartData, stats } = useMemo(() => {
    if (!analytics || !analytics.monthly_trends || analytics.monthly_trends.length === 0) {
      return {
        chartData: [],
        stats: { totalRevenue: 0, topPlanName: "N/A", topPlanRevenue: 0, totalSales: 0, trend: 0 },
        planNames: [],
      };
    }

    const uniquePlanNames = Array.from(
      new Set((analytics.plan_earnings || []).map((p) => p.name))
    );

    // Sort trends by date ascending
    const sortedTrends = [...analytics.monthly_trends].sort(
      (a, b) => new Date(a.name).getTime() - new Date(b.name).getTime()
    );

    let sliced = sortedTrends;
    if (timeRange === "recent5") sliced = sortedTrends.slice(-5);
    if (timeRange === "recent10") sliced = sortedTrends.slice(-10);

    const formatted = sliced.map((item) => {
      let dayTotal = 0;
      const entry: Record<string, any> = {
        date: format(new Date(item.name), "MMM dd"),
        fullDate: format(new Date(item.name), "MMM dd, yyyy"),
        rawDate: item.name,
      };

      uniquePlanNames.forEach((planName) => {
        const val = item[planName] || 0;
        entry[planName] = val;
        dayTotal += val;
      });

      entry.total = dayTotal;
      return entry;
    });

    // Calculate Summary Stats
    const totalRevenue = (analytics.plan_earnings || []).reduce(
      (sum, p) => sum + (p.value || 0),
      0
    );

    const topPlan = (analytics.plan_earnings || []).reduce(
      (prev, current) => (current.value > (prev?.value || 0) ? current : prev),
      analytics.plan_earnings?.[0]
    );

    const totalSales = (analytics.plan_earnings || []).reduce(
      (sum, p) => sum + (p.count || 0),
      0
    );

    // Calculate recent delta between last 2 data points
    let trend = 0;
    if (formatted.length >= 2) {
      const recent = formatted[formatted.length - 1].total;
      const previous = formatted[formatted.length - 2].total;
      trend = recent - previous;
    }

    return {
      chartData: formatted,
      stats: {
        totalRevenue,
        topPlanName: topPlan?.name || "N/A",
        topPlanRevenue: topPlan?.value || 0,
        totalSales,
        trend,
      },
    };
  }, [analytics, timeRange]);

  if (!analytics || !analytics.plan_earnings?.length) {
    return (
      <Card className="w-full border-dashed border-border/80 bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-3">
          <div className="p-3 bg-muted rounded-full text-muted-foreground">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground text-sm">No Revenue Analytics Available</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Revenue trends and plan analytics will be generated automatically as students subscribe to your plans.
            </p>
          </div>
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
                Revenue Performance Analytics
                <Badge
                  variant="outline"
                  className="text-xs font-normal border-primary/20 bg-primary/5 text-primary"
                >
                  <Sparkles className="h-3 w-3 mr-1" /> Real-time
                </Badge>
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs sm:text-sm">
                Track revenue growth, daily performance, and plan sales outcomes
              </CardDescription>
            </div>
          </div>
        </div>

        {/* Controls: Time Range & Chart View Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Switcher */}
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
              Last 10 Days
            </button>
            <button
              onClick={() => setTimeRange("recent5")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                timeRange === "recent5"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Last 5 Days
            </button>
          </div>

          {/* Chart Type Switcher */}
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
        {/* Metric Badges Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border/50 bg-background/60 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Total Revenue</span>
              <IndianRupee className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-foreground">
                ₹{stats.totalRevenue.toLocaleString()}
              </span>
              <Badge
                variant="secondary"
                className="text-[10px] bg-emerald-500/10 text-emerald-500 font-semibold border-0"
              >
                Lifetime
              </Badge>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-background/60 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Top Plan</span>
              <Crown className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-extrabold text-foreground truncate max-w-[110px]" title={stats.topPlanName}>
                {stats.topPlanName}
              </span>
              <Badge
                variant="secondary"
                className="text-[10px] bg-amber-500/10 text-amber-500 font-semibold border-0"
              >
                ₹{stats.topPlanRevenue.toLocaleString()}
              </Badge>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-background/60 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Sales Volume</span>
              <CreditCard className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-foreground">
                {stats.totalSales}
              </span>
              <span className="text-xs text-muted-foreground">subscriptions</span>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-background/60 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Recent Delta</span>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span
                className={`text-2xl font-extrabold ${
                  stats.trend >= 0 ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {stats.trend >= 0 ? `+₹${stats.trend}` : `-₹${Math.abs(stats.trend)}`}
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
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    className="stroke-border/40"
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tickFormatter={(v) => `₹${v}`}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12 }}
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
                                <p className="font-semibold text-foreground text-sm">
                                  Daily Total: ₹{dataItem.total?.toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {dataItem.fullDate}
                                </p>
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
                    dataKey="total"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                    activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--background)" }}
                  />
                </AreaChart>
              ) : chartType === "bar" ? (
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    className="stroke-border/40"
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tickFormatter={(v) => `₹${v}`}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12 }}
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
                                <p className="font-semibold text-foreground text-sm">
                                  Daily Revenue
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {dataItem.fullDate}
                                </p>
                              </div>
                            );
                          }
                          return "";
                        }}
                      />
                    }
                  />
                  <Bar
                    dataKey="total"
                    fill="var(--chart-1)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              ) : (
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    className="stroke-border/40"
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tickFormatter={(v) => `₹${v}`}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12 }}
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
                                <p className="font-semibold text-foreground text-sm">
                                  Daily Total: ₹{dataItem.total?.toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {dataItem.fullDate}
                                </p>
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
                    dataKey="total"
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
                <p className="font-medium text-foreground text-sm">No Revenue Data Yet</p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Once your student subscriptions are processed, visual analytics and daily revenue charts will appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
