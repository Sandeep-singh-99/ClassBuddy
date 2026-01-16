import React from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
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
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ITeacherAnalytics } from "@/types/subscription";
import { useMemo } from "react";

interface SubscriptionAnalyticsProps {
  analytics: ITeacherAnalytics | null;
}

const BLUE_SHADES = [
  "#2563eb", // Blue 600
  "#60a5fa", // Blue 400
  "#1e40af", // Blue 800
  "#93c5fd", // Blue 300
  "#172554", // Blue 950
  "#3b82f6", // Blue 500
  "#1d4ed8", // Blue 700
];

export const SubscriptionAnalytics = ({
  analytics,
}: SubscriptionAnalyticsProps) => {
  if (!analytics || !analytics.plan_earnings?.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center text-muted-foreground">
          No subscription analytics data available yet.
        </CardContent>
      </Card>
    );
  }

  // ── Monthly/Daily Trends Data ───────────────────────────────
  const planNames = useMemo(
    () => Array.from(new Set(analytics.plan_earnings.map((p) => p.name))),
    [analytics.plan_earnings]
  );

  const { trendData, trendConfig } = useMemo(() => {
    const config: ChartConfig = {};
    const safeKeyMap: Record<string, string> = {};

    planNames.forEach((name, idx) => {
      const key = `plan_${idx}`;
      safeKeyMap[name] = key;
      config[key] = {
        label: name,
        color: BLUE_SHADES[idx % BLUE_SHADES.length],
      };
    });

    const data = analytics.monthly_trends.map((item) => {
      const entry: Record<string, any> = { name: item.name }; // item.name is now YYYY-MM-DD

      // Iterate through ALL plans to ensure we have a value (0 if missing) for each
      planNames.forEach((planName) => {
        const key = safeKeyMap[planName];
        entry[key] = item[planName] || 0;
      });

      return entry;
    });

    return { trendData: data, trendConfig: config };
  }, [analytics.monthly_trends, planNames]);

  return (
    <div className="space-y-6">
      <Card className="border shadow-md overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle>Daily Revenue Trends</CardTitle>
          <CardDescription>
            Revenue performance over time by plan
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <ChartContainer config={trendConfig} className="min-h-[420px] w-full">
            <ResponsiveContainer>
              <ComposedChart
                data={trendData}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                <defs>
                  {planNames.map((_, i) => {
                    const key = `plan_${i}`;
                    return (
                      <linearGradient
                        key={key}
                        id={`fill-${key}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={`var(--color-${key})`}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={`var(--color-${key})`}
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    );
                  })}
                </defs>

                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  opacity={0.5}
                />

                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  fontSize={12}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis
                  tickFormatter={(v) => `₹${v}`}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  fontSize={12}
                />

                <ChartTooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                      }}
                    />
                  }
                />

                <Legend
                  content={<ChartLegendContent />}
                  verticalAlign="top"
                  height={36}
                />

                {/* Vertical Bars for Trends ("Stick form") */}
                {planNames.map((planName, index) => {
                  const key = `plan_${index}`;
                  return (
                    <Bar
                      key={key}
                      dataKey={key}
                      fill={`var(--color-${key})`}
                      stackId="revenue"
                      barSize={45}
                      radius={[2, 2, 0, 0]}
                      name={planName}
                    />
                  );
                })}
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {analytics.plan_earnings.map((plan, idx) => (
          <Card key={idx} className="bg-muted/30">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <span className="text-sm text-muted-foreground">{plan.name}</span>
              <span className="text-2xl font-bold mt-1">
                ₹{plan.value.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">
                Total Revenue
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
