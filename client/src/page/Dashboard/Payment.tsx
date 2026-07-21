import { useEffect, useState, useMemo } from "react";
import { fetchStudentSubscriptionPlans } from "@/redux/slice/subscriptionSlice";
import { StudentGroupCard } from "../../components/StudentGroupCard";
import {
  Sparkles,
  Search,
  CreditCard,
  CheckCircle2,
  Users,
  AlertCircle,
  RefreshCw,
  FolderX,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Payment() {
  const dispatch = useAppDispatch();
  const { studentGroups, loading, error } = useAppSelector(
    (state) => state.subscription
  );

  const [searchQuery, setSearchQuery] = useState("");

  const loadData = () => {
    dispatch(fetchStudentSubscriptionPlans());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute student summary metrics
  const activeSubscriptionsCount = useMemo(() => {
    const today = new Date();
    return studentGroups.filter((item) => {
      if (!item.subscription || !item.subscription.is_active) return false;
      const validTill = new Date(item.subscription.valid_till);
      return validTill.getTime() > today.getTime();
    }).length;
  }, [studentGroups]);

  // Filter groups by group name or teacher name
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return studentGroups;
    const q = searchQuery.toLowerCase();
    return studentGroups.filter(
      (item) =>
        item.group.name?.toLowerCase().includes(q) ||
        item.teacher.name?.toLowerCase().includes(q)
    );
  }, [studentGroups, searchQuery]);

  if (loading && studentGroups.length === 0) {
    return (
      <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <Skeleton className="h-44 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-80 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-5xl mx-auto p-6">
        <Alert variant="destructive" className="rounded-2xl border-destructive/30">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-bold">Failed to load subscription plans</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* ── 1. Hero Header Banner ──────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-r from-card via-card/90 to-indigo-500/10 dark:to-indigo-500/20 p-6 sm:p-8 shadow-sm">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Student Subscription Portal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              My Class Subscriptions
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Explore subscription plans for your enrolled groups, extend active access, and manage course material memberships.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={loadData}
              className="rounded-xl border-border/80 hover:bg-accent"
              title="Refresh Subscription Data"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. Quick Summary Metrics Row ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border/60 bg-card/60 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Joined Groups
            </span>
            <span className="text-2xl font-extrabold text-foreground">
              {studentGroups.length}
            </span>
          </div>
        </Card>

        <Card className="border border-border/60 bg-card/60 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Active Subscriptions
            </span>
            <span className="text-2xl font-extrabold text-foreground">
              {activeSubscriptionsCount}
            </span>
          </div>
        </Card>

        <Card className="border border-border/60 bg-card/60 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Status
            </span>
            <Badge
              variant="outline"
              className="mt-1 text-xs font-semibold border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
            >
              {activeSubscriptionsCount > 0 ? "Access Granted" : "Plans Available"}
            </Badge>
          </div>
        </Card>
      </div>

      {/* ── 3. Search Bar & Content Grid ───────────────────────────────── */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Group Subscription Plans ({filteredGroups.length})
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search group or teacher name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-border/80 text-xs h-9"
            />
          </div>
        </div>

        {/* Empty State */}
        {studentGroups.length === 0 ? (
          <Card className="border-dashed border-border/80 bg-muted/20 rounded-2xl">
            <CardContent className="py-16 text-center space-y-4">
              <div className="p-4 rounded-full bg-muted text-muted-foreground w-fit mx-auto">
                <FolderX className="h-8 w-8" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-semibold text-base text-foreground">No Groups Found</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You haven't joined any student groups yet, or your groups don't have active subscription plans.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : filteredGroups.length === 0 ? (
          <Card className="border-dashed border-border/80 bg-muted/20 rounded-2xl">
            <CardContent className="py-12 text-center space-y-2">
              <p className="font-semibold text-sm text-foreground">No matching groups</p>
              <p className="text-xs text-muted-foreground">
                No groups matched your search query "{searchQuery}".
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((item, index) => (
              <StudentGroupCard key={`${item.group.id}-${index}`} data={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
