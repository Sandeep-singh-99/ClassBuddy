import { useEffect, useState } from "react";
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
  Sparkles,
  Loader2,
  Search,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { FetchDashboardData, GenerateDashboardData } from "@/redux/slice/dashboardSlice";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GenerateDashboardBtn from "@/components/GenerateDashboardBtn";
import { toast } from "sonner";

export default function CareerDashboard() {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.dashboard);

  const [inputIndustry, setInputIndustry] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    if (!data || data.length === 0) {
      dispatch(FetchDashboardData());
    }
  }, [dispatch]);

  const handleQuickGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanIndustry = inputIndustry.trim();
    if (!cleanIndustry) {
      toast.error("Please enter an industry or field name");
      return;
    }
    try {
      const res = await dispatch(GenerateDashboardData({ industry: cleanIndustry }));
      if (GenerateDashboardData.fulfilled.match(res)) {
        toast.success(`Generated AI insights for "${cleanIndustry}"!`);
        setInputIndustry("");
        setSelectedIndex(0);
      } else {
        toast.error(`Error: ${res.payload || "Failed to generate insights"}`);
      }
    } catch (err) {
      toast.error("Failed to generate career dashboard");
    }
  };

  // 1. Loading UI during AI Response Generation Process
  if (loading) {
    return (
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {/* Loading Banner */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-background to-primary/5 shadow-md overflow-hidden relative">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping p-6" />
              <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg relative z-10">
                <Brain className="h-8 w-8 animate-bounce" />
              </div>
            </div>
            <div className="space-y-1 max-w-lg">
              <h2 className="text-xl font-bold flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-spin" />
                AI Agent is Researching & Analyzing Insights...
              </h2>
              <p className="text-sm text-muted-foreground">
                Analyzing real-time market statistics, average salaries, growth rate, and in-demand skills for your requested field.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Please wait a moment while AI builds your response...
            </div>
          </CardContent>
        </Card>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <section className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Career & Industry Insights</h1>
          <GenerateDashboardBtn />
        </div>
        <div className="flex items-center justify-center gap-2 p-4 my-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Error: {error}</span>
        </div>
      </section>
    );
  }

  const hasData = Array.isArray(data) && data.length > 0;
  const safeIndex = selectedIndex < (data?.length || 0) ? selectedIndex : 0;
  const currentInsight = hasData ? data[safeIndex] : null;

  // 3. Empty State (No insights generated yet)
  if (!currentInsight || !Array.isArray(currentInsight.salary_range)) {
    return (
      <section className="p-8 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">AI Industry Insights</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Enter any industry or job field below to generate real-time AI-powered market analysis, salary distributions, and skill roadmaps.
          </p>
        </div>

        <Card className="p-6 border-dashed border-2 shadow-sm">
          <form onSubmit={handleQuickGenerate} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter any field (e.g. Software Development, Data Science, AI Engineer, Finance)..."
                  className="pl-9 h-11"
                  value={inputIndustry}
                  onChange={(e) => setInputIndustry(e.target.value)}
                />
              </div>
              <Button type="submit" variant="destructive" className="h-11 px-6 gap-2 cursor-pointer">
                <Sparkles className="h-4 w-4" />
                Generate AI Insight
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              Try fields like: <span className="font-medium text-foreground">Cybersecurity, Cloud Architecture, Mobile Development, UX Design</span>
            </p>
          </form>
        </Card>

        <div className="flex flex-col items-center justify-center gap-3 p-8 bg-muted/40 border rounded-xl text-center">
          <Brain className="w-10 h-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground max-w-md">
            No career insights generated yet. Enter any field above or click below to generate your first industry report!
          </p>
          <GenerateDashboardBtn />
        </div>
      </section>
    );
  }

  // 4. Data Displayed in UI
  const salaryData = (currentInsight.salary_range || []).map((range) => ({
    name: range.role || "Role",
    min: (range.min || 0) / 1000,
    max: (range.max || 0) / 1000,
    median: (range.median || 0) / 1000,
  }));

  const getDemandLevelColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "bg-emerald-500";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-rose-500";
      default:
        return "bg-slate-500";
    }
  };

  const getMarketOutlookInfo = (outlook?: string) => {
    const text = outlook?.toLowerCase() || "";
    if (text.includes("positive") || text.includes("grow") || text.includes("high")) {
      return { icon: TrendingUp, color: "text-emerald-500", badge: "Positive Outlook" };
    } else if (text.includes("negative") || text.includes("decline")) {
      return { icon: TrendingDown, color: "text-rose-500", badge: "Challenging Outlook" };
    }
    return { icon: LineChart, color: "text-amber-500", badge: "Steady Outlook" };
  };

  const marketOutlook = currentInsight.market_outlook || "Neutral";
  const { icon: OutlookIcon, color: outlookColor, badge: outlookBadge } = getMarketOutlookInfo(marketOutlook);

  const lastUpdatedDate = currentInsight.updated_at
    ? format(new Date(currentInsight.updated_at), "dd/MM/yyyy")
    : "Just now";
  const nextUpdateDistance = currentInsight.updated_at
    ? formatDistanceToNow(new Date(currentInsight.updated_at), { addSuffix: true })
    : "soon";

  const ownerName = currentInsight.owner?.full_name || "Student";
  const ownerAvatar = currentInsight.owner?.image_url || "";

  const topSkills = currentInsight.top_skills || [];
  const keyTrends = currentInsight.key_trends || [];
  const recommendSkills = currentInsight.recommend_skills || [];

  return (
    <div className="space-y-6 p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Search & Quick Generation Header Bar */}
      <Card className="p-4 sm:p-6 bg-card shadow-sm border">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Industry Insight: {currentInsight.industry}</h1>
              <Badge variant="secondary" className="font-medium text-xs">
                {currentInsight.industry}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              AI Generated analysis based on real-time market trends • Updated {nextUpdateDistance}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Quick Input for Any Field */}
            <form onSubmit={handleQuickGenerate} className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter field (e.g. AI Engineer)..."
                className="w-full sm:w-60 text-sm h-9"
                value={inputIndustry}
                onChange={(e) => setInputIndustry(e.target.value)}
              />
              <Button type="submit" variant="destructive" size="sm" className="gap-1.5 cursor-pointer shrink-0">
                <Sparkles className="h-3.5 w-3.5" />
                Generate
              </Button>
            </form>

            {/* Industry Selector if multiple insights exist */}
            {data && data.length > 1 && (
              <Select
                value={String(safeIndex)}
                onValueChange={(val) => setSelectedIndex(Number(val))}
              >
                <SelectTrigger className="w-full sm:w-48 h-9 text-sm">
                  <SelectValue placeholder="Select Field" />
                </SelectTrigger>
                <SelectContent>
                  {data.map((item, idx) => (
                    <SelectItem key={item.id || idx} value={String(idx)}>
                      {item.industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <GenerateDashboardBtn onGenerated={() => setSelectedIndex(0)} />
          </div>
        </div>
      </Card>

      {/* Profile Bar & Last Updated */}
      <div className="flex justify-between items-center text-xs">
        <Badge variant="outline" className="text-muted-foreground">
          Last refreshed: {lastUpdatedDate}
        </Badge>
        <div className="flex items-center space-x-2">
          {ownerAvatar && (
            <img
              src={ownerAvatar}
              alt={ownerName}
              className="h-8 w-8 rounded-full border"
            />
          )}
          <div className="text-right">
            <p className="font-semibold text-foreground text-xs">{ownerName}</p>
            <p className="text-[11px] text-muted-foreground">Active Field: {currentInsight.industry}</p>
          </div>
        </div>
      </div>

      {/* Market Overview Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Market Outlook */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Market Outlook
            </CardTitle>
            <OutlookIcon className={`h-5 w-5 ${outlookColor}`} />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-xl font-bold flex items-center gap-2">
              <span>{marketOutlook.length > 40 ? `${marketOutlook.slice(0, 40)}...` : marketOutlook}</span>
            </div>
            <Badge variant="secondary" className="text-[11px] mt-1">
              {outlookBadge}
            </Badge>
          </CardContent>
        </Card>

        {/* Industry Growth */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Estimated Industry Growth
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground">
              +{currentInsight.growth_rate ?? 0}% <span className="text-xs font-normal text-muted-foreground">/ yr</span>
            </div>
            <Progress value={Math.min(Math.max((currentInsight.growth_rate ?? 0) * 4, 10), 100)} className="mt-3 h-2" />
          </CardContent>
        </Card>

        {/* Demand Level */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Demand Level</CardTitle>
            <BriefcaseIcon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground">
              {currentInsight.demand_level || "High"}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div
                className={`h-2.5 flex-1 rounded-full ${getDemandLevelColor(
                  currentInsight.demand_level
                )}`}
              />
              <span className="text-xs font-medium text-muted-foreground">
                {currentInsight.demand_level || "Active"} Market
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Market Outlook Description Card */}
      <Card className="bg-muted/30 border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Comprehensive Market Strategic Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground/90">
            {currentInsight.market_outlook}
          </p>
        </CardContent>
      </Card>

      {/* Salary Chart */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Salary Distribution by Roles</CardTitle>
          <CardDescription>
            Estimated Minimum, Median, and Maximum Salaries (in USD Thousands) for {currentInsight.industry}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[360px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(val) => `$${val}k`} tick={{ fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-popover border text-popover-foreground rounded-lg p-3 shadow-lg text-xs space-y-1">
                          <p className="font-bold text-sm border-b pb-1 mb-1">{label}</p>
                          {payload.map((item) => (
                            <div key={item.name} className="flex justify-between gap-4">
                              <span className="text-muted-foreground">{item.name}:</span>
                              <span className="font-semibold">${item.value}K</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="min" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Min Salary (K)" />
                <Bar dataKey="median" fill="#6366f1" radius={[4, 4, 0, 0]} name="Median Salary (K)" />
                <Bar dataKey="max" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Max Salary (K)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Skills */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-bold">Top In-Demand Technical Skills</CardTitle>
            <CardDescription className="text-xs">Key technologies and competencies required for {currentInsight.industry}</CardDescription>
          </div>
          <Brain className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 pt-1">
            {topSkills.map((skill) => (
              <Badge key={skill} variant="secondary" className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trends + Recommended Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Key Industry Trends</CardTitle>
            <CardDescription className="text-xs">Emerging shifts defining this sector</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {keyTrends.map((trend, index) => (
                <li key={index} className="flex items-start space-x-3 text-sm">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary shrink-0" />
                  <span className="leading-normal">{trend}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recommended Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Recommended Skills to Develop</CardTitle>
            <CardDescription className="text-xs">Strategic capabilities to enhance career growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recommendSkills.map((skill) => (
                <Badge key={skill} variant="outline" className="px-3 py-1 text-xs font-medium hover:bg-muted transition-colors">
                  ✨ {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

