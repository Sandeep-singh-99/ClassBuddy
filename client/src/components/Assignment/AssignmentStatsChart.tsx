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

const chartConfig = {
  count: {
    label: "Assignments",
    color: "#6366f1",
  },
  trend: {
    label: "Trend",
    color: "#22d3ee",
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
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center justify-between">
          <span>📊 Assignment Completion Insights</span>
          <span className="text-sm font-normal text-muted-foreground">
            Total:{" "}
            <span className="text-primary font-semibold">{totalCompleted}</span>
          </span>
        </CardTitle>
        <CardDescription>Daily assignment completion trends</CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="w-full h-[360px]">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ComposedChart data={data}>
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

              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <ChartLegend content={<ChartLegendContent />} />

              <Area
                type="monotone"
                dataKey="count"
                name="trend"
                stroke="#22d3ee"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#areaGradient)"
              />
              <Bar
                dataKey="count"
                name="count"
                fill="url(#barGradient)"
                barSize={30}
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
