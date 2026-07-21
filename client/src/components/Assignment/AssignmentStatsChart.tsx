import { useState } from "react";
import {
  ComposedChart,
  Bar,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  BarChart,
  LineChart,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  Layers,
  CalendarCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const chartConfig = {
  count: {
    label: "Completions",
    color: "#6366f1",
  },
  trend: {
    label: "Trend",
    color: "#06b6d4",
  },
} satisfies ChartConfig;

type ChartType = "composed" | "area" | "bar" | "line";

export default function AssignmentStatsChart({
  data = [],
  totalCompleted = 0,
}: {
  data: any[];
  totalCompleted: number;
}) {
  const [chartType, setChartType] = useState<ChartType>("composed");

  return (
    <Card className="border border-border/60 shadow-sm rounded-3xl bg-card overflow-hidden w-full">
      <CardHeader className="p-6 pb-4 border-b border-border/40 flex flex-row items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              Assignment Completion Trends
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Daily completion metrics and output volume over time
          </CardDescription>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="text-xs font-semibold px-3 py-1 border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5"
          >
            <CalendarCheck className="h-3.5 w-3.5" />
            <span>Total: {totalCompleted} Submissions</span>
          </Badge>

          {/* Chart Type Selector Switcher */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
            <Button
              variant={chartType === "composed" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0 rounded-lg"
              onClick={() => setChartType("composed")}
              title="Composed Combo Chart"
            >
              <Layers className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={chartType === "area" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0 rounded-lg"
              onClick={() => setChartType("area")}
              title="Area Chart"
            >
              <AreaChartIcon className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={chartType === "bar" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0 rounded-lg"
              onClick={() => setChartType("bar")}
              title="Bar Chart"
            >
              <BarChart3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={chartType === "line" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0 rounded-lg"
              onClick={() => setChartType("line")}
              title="Line Chart"
            >
              <LineChartIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="w-full h-[320px]">
          <ChartContainer config={chartConfig} className="h-full w-full">
            {chartType === "composed" ? (
              <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.15} />
                  </linearGradient>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="90%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} fontSize={11} className="fill-muted-foreground" />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={10} fontSize={11} className="fill-muted-foreground" />
                <ChartTooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} content={<ChartTooltipContent indicator="dot" />} />
                <ChartLegend content={<ChartLegendContent />} />

                <Area type="monotone" dataKey="count" name="trend" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#areaGradient)" />
                <Bar dataKey="count" name="count" fill="url(#barGradient)" barSize={32} radius={[6, 6, 0, 0]} />
              </ComposedChart>
            ) : chartType === "area" ? (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="singleAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} fontSize={11} className="fill-muted-foreground" />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={10} fontSize={11} className="fill-muted-foreground" />
                <ChartTooltip cursor={{ stroke: "var(--border)" }} content={<ChartTooltipContent indicator="dot" />} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} fill="url(#singleAreaGradient)" />
              </AreaChart>
            ) : chartType === "bar" ? (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} fontSize={11} className="fill-muted-foreground" />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={10} fontSize={11} className="fill-muted-foreground" />
                <ChartTooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={35} />
              </BarChart>
            ) : (
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} fontSize={11} className="fill-muted-foreground" />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={10} fontSize={11} className="fill-muted-foreground" />
                <ChartTooltip cursor={{ stroke: "var(--border)" }} content={<ChartTooltipContent indicator="dot" />} />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: "var(--background)" }} activeDot={{ r: 6 }} />
              </LineChart>
            )}
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
