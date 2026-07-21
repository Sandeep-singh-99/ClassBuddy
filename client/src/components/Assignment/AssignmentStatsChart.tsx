import {
  ComposedChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
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
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const chartConfig = {
  count: {
    label: "Completions",
    color: "var(--primary)",
  },
  trend: {
    label: "Trend Line",
    color: "#06b6d4",
  },
} satisfies ChartConfig;

export default function AssignmentStatsChart({
  data = [],
  totalCompleted = 0,
}: {
  data: any[];
  totalCompleted: number;
}) {
  return (
    <Card className="border border-border/60 shadow-sm rounded-2xl bg-card overflow-hidden w-full">
      <CardHeader className="pb-4 border-b border-border/40 flex flex-row items-center justify-between flex-wrap gap-4">
        <div>
          <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Assignment Completion Insights
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Daily completion volume and historical progress trends
          </CardDescription>
        </div>

        <Badge
          variant="outline"
          className="text-xs font-semibold px-3 py-1 border-primary/20 bg-primary/10 text-primary"
        >
          Total Submissions: {totalCompleted}
        </Badge>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="w-full h-[320px]">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.15} />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="90%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                fontSize={11}
                className="fill-muted-foreground"
              />
              <YAxis
                allowDecimals={false}
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
              <ChartLegend content={<ChartLegendContent />} />

              <Area
                type="monotone"
                dataKey="count"
                name="trend"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#areaGradient)"
              />
              <Bar
                dataKey="count"
                name="count"
                fill="url(#barGradient)"
                barSize={32}
                radius={[6, 6, 0, 0]}
              />
            </ComposedChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
