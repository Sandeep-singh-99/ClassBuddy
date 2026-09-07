import { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BriefcaseIcon,
  LineChart,
  TrendingUp,
  TrendingDown,
  Brain,
  AlertCircle,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { FetchDashboardData } from "@/redux/slice/dashboardSlice";
import { Skeleton } from "@/components/ui/skeleton";
import GenerateDashboardBtn from "@/components/GenerateDashboardBtn";

export default function CareerDashboard() {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    if (!data || data.length === 0) {
      dispatch(FetchDashboardData());
    }
  }, [dispatch, data]);

  if (loading)
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-80 w-full" />
      </div>
    );

  if (error)
    return (
      <section>
        <div className="flex justify-end pt-20">
          <GenerateDashboardBtn />
        </div>
        <div className="flex items-center justify-center gap-2 p-4 my-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Error: {error}</span>
        </div>
      </section>
    );

  const latestData = data && data.length > 0 ? data[0] : null;

  if (!latestData || !Array.isArray(latestData.salary_range)) {
    return (
      <section className="p-8">
        <div className="flex justify-end pt-4">
          <GenerateDashboardBtn />
        </div>
        <div className="flex flex-col items-center justify-center gap-3 p-8 my-4 bg-primary/10 text-primary border border-primary/20 rounded-lg">
          <AlertCircle className="w-6 h-6" />
          <span className="text-sm font-medium">
            No valid career insights found. Click above to generate your first insight!
          </span>
        </div>
      </section>
    );
  }

  // Helper functions safely handling undefined
  const salaryData = (latestData.salary_range || []).map((range) => ({
    name: range.role || "Role",
    min: (range.min || 0) / 1000,
    max: (range.max || 0) / 1000,
    median: (range.median || 0) / 1000,
  }));

  const getDemandLevelColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getMarketOutlookInfo = (outlook?: string) => {
    switch (outlook?.toLowerCase()) {
      case "positive":
        return { icon: TrendingUp, color: "text-green-500" };
      case "neutral":
        return { icon: LineChart, color: "text-yellow-500" };
      case "negative":
        return { icon: TrendingDown, color: "text-red-500" };
      default:
        return { icon: LineChart, color: "text-gray-500" };
    }
  };

  const marketOutlook = latestData.market_outlook || "Neutral";
  const OutlookIcon = getMarketOutlookInfo(marketOutlook).icon;
  const outlookColor = getMarketOutlookInfo(marketOutlook).color;

  const lastUpdatedDate = latestData.updated_at
    ? format(new Date(latestData.updated_at), "dd/MM/yyyy")
    : "N/A";
  const nextUpdateDistance = latestData.updated_at
    ? formatDistanceToNow(new Date(latestData.updated_at), { addSuffix: true })
    : "soon";

  const ownerName = latestData.owner?.full_name || "Student";
  const ownerIndustry = latestData.owner?.industry || "General";
  const ownerAvatar = latestData.owner?.image_url || "";

  const topSkills = latestData.top_skills || [];
  const keyTrends = latestData.key_trends || [];
  const recommendSkills = latestData.recommend_skills || [];

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Badge variant="outline">Last updated: {lastUpdatedDate}</Badge>
        <div className="flex items-center space-x-2">
          {ownerAvatar && (
            <img
              src={ownerAvatar}
              alt={ownerName}
              className="h-10 w-10 rounded-full border"
            />
          )}
          <div>
            <p className="font-semibold">{ownerName}</p>
            <p className="text-xs text-muted-foreground">{ownerIndustry}</p>
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Market Outlook */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Market Outlook
            </CardTitle>
            <OutlookIcon className={`h-4 w-4 ${outlookColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketOutlook}</div>
            <p className="text-xs text-muted-foreground">
              Next update {nextUpdateDistance}
            </p>
          </CardContent>
        </Card>

        {/* Industry Growth */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Industry Growth
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestData.growth_rate ?? 0}%
            </div>
            <Progress value={latestData.growth_rate ?? 0} className="mt-2" />
          </CardContent>
        </Card>

        {/* Demand Level */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Demand Level</CardTitle>
            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestData.demand_level || "N/A"}
            </div>
            <div
              className={`h-2 w-full rounded-full mt-2 ${getDemandLevelColor(
                latestData.demand_level
              )}`}
            />
          </CardContent>
        </Card>
      </div>

      {/* Salary Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Salary Ranges by Role</CardTitle>
          <CardDescription>
            Minimum, median, and maximum salaries (in thousands)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-2 shadow-md">
                          <p className="font-medium">{label}</p>
                          {payload.map((item) => (
                            <p key={item.name} className="text-sm">
                              {item.name}: ${item.value}K
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="min" fill="#94a3b8" name="Min Salary (K)" />
                <Bar dataKey="median" fill="#64748b" name="Median Salary (K)" />
                <Bar dataKey="max" fill="#475569" name="Max Salary (K)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Skills</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {topSkills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trends + Recommended Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Key Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Key Industry Trends</CardTitle>
            <CardDescription>
              Current trends shaping the industry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {keyTrends.map((trend, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary shrink-0" />
                  <span>{trend}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recommended Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Skills</CardTitle>
            <CardDescription>Skills to consider developing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recommendSkills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
