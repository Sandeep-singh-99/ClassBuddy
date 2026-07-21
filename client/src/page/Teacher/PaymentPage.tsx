import { useEffect, useState, useMemo } from "react";
import { CreateSubscriptionDialog } from "./components/CreateSubscriptionDialog";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import {
  fetchSubscription,
  teacherSubscriptionStats,
  fetchSubscriptionAnalytics,
} from "@/redux/slice/subscriptionSlice";
import { SubscriptionCard } from "./components/SubscriptionCard";
import { PaymentStats } from "./components/PaymentStats";
import { SubscriptionAnalytics } from "./components/SubscriptionAnalytics";
import {
  Search,
  Sparkles,
  Layers,
  BarChart3,
  PackageX,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentPage() {
  const dispatch = useAppDispatch();
  const {
    plans,
    loading: plansLoading,
    stats,
    analytics,
  } = useAppSelector((state) => state.subscription);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all");

  const loadData = () => {
    dispatch(fetchSubscription());
    dispatch(teacherSubscriptionStats());
    dispatch(fetchSubscriptionAnalytics());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter plans based on search query and tab selection
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesSearch = plan.plan_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterTab === "short") {
        return plan.validity_days <= 30;
      }
      if (filterTab === "long") {
        return plan.validity_days > 30;
      }
      return true;
    });
  }, [plans, searchQuery, filterTab]);

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-10">
      {/* ── 1. Hero Header Banner ──────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-r from-card via-card/90 to-primary/10 dark:to-primary/20 p-6 sm:p-8 shadow-sm">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 dark:bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Subscription & Monetization</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Payment & Subscription Manager
            </h1>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              Create, configure, and monitor subscription plans for your student batches. Track earnings and daily revenue trends in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={loadData}
              className="rounded-xl border-border/80 hover:bg-accent"
              title="Refresh Data"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            <CreateSubscriptionDialog />
          </div>
        </div>
      </div>

      {/* ── 2. KPI Stats Overview ──────────────────────────────────────── */}
      <PaymentStats stats={stats} />

      {/* ── 3. Subscription Plans Section ─────────────────────────────── */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Active Subscription Plans ({filteredPlans.length})
            </h2>
          </div>

          {/* Controls: Search & Tabs */}
          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search plan name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl border-border/80 text-xs h-9"
              />
            </div>

            <Tabs value={filterTab} onValueChange={setFilterTab} className="h-9">
              <TabsList className="rounded-xl h-9 p-1 bg-muted/60">
                <TabsTrigger value="all" className="text-xs rounded-lg px-3 py-1">
                  All
                </TabsTrigger>
                <TabsTrigger value="short" className="text-xs rounded-lg px-3 py-1">
                  ≤ 30 Days
                </TabsTrigger>
                <TabsTrigger value="long" className="text-xs rounded-lg px-3 py-1">
                  &gt; 30 Days
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Loading Skeletons State */}
        {plansLoading && plans.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="rounded-2xl p-6 space-y-4">
                <Skeleton className="h-6 w-1/2 rounded-lg" />
                <Skeleton className="h-10 w-3/4 rounded-lg" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-9 w-full rounded-xl" />
              </Card>
            ))}
          </div>
        ) : filteredPlans.length === 0 ? (
          /* Empty State Card */
          <Card className="border-dashed border-border/80 bg-muted/20 rounded-2xl">
            <CardContent className="py-14 text-center space-y-4">
              <div className="p-4 rounded-full bg-muted/60 text-muted-foreground w-fit mx-auto">
                <PackageX className="h-8 w-8" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-semibold text-base text-foreground">
                  {searchQuery ? "No matching plans found" : "No Subscription Plans Created Yet"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search query or filters above."
                    : "Create your first plan to start offering paid subscriptions to your students."}
                </p>
              </div>

              {!searchQuery && (
                <div className="pt-2">
                  <CreateSubscriptionDialog />
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <SubscriptionCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </div>

      {/* ── 4. Analytics Section ──────────────────────────────────────── */}
      <div className="pt-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-border/50 pb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Revenue Analytics & Performance
          </h2>
        </div>

        <SubscriptionAnalytics analytics={analytics} />
      </div>
    </div>
  );
}
