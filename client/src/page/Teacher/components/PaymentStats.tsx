import { Card, CardContent } from "@/components/ui/card";
import type { ITeacherSubscriptionStats } from "@/types/subscription";
import {
  IndianRupee,
  Users,
  CreditCard,
  TrendingUp,
  UserCheck,
  Percent,
} from "lucide-react";

interface PaymentStatsProps {
  stats: ITeacherSubscriptionStats | null;
}

export const PaymentStats = ({ stats }: PaymentStatsProps) => {
  const totalEarnings = stats?.total_earnings ?? 0;
  const paidStudents = stats?.paid_students ?? 0;
  const totalStudents = stats?.total_students ?? 0;
  
  const conversionRate = totalStudents > 0 
    ? Math.round((paidStudents / totalStudents) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* 1. Total Revenue Card */}
      <Card className="relative overflow-hidden border border-border/60 bg-gradient-to-br from-card via-card/90 to-emerald-500/5 dark:to-emerald-500/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Earnings
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-extrabold tracking-tight text-foreground">
              ₹{totalEarnings.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Lifetime Revenue</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Paid Students Card */}
      <Card className="relative overflow-hidden border border-border/60 bg-gradient-to-br from-card via-card/90 to-blue-500/5 dark:to-blue-500/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Paid vs Total
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-extrabold tracking-tight text-foreground flex items-baseline gap-1.5">
              <span>{paidStudents}</span>
              <span className="text-sm font-normal text-muted-foreground">
                / {totalStudents} students
              </span>
            </div>
            
            {/* Simple mini progress bar */}
            <div className="mt-3 w-full bg-secondary rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(conversionRate, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Active Subscribers Card */}
      <Card className="relative overflow-hidden border border-border/60 bg-gradient-to-br from-card via-card/90 to-violet-500/5 dark:to-violet-500/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 dark:bg-violet-500/20 rounded-full blur-2xl pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Subscribers
            </span>
            <div className="p-2.5 rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/20">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-extrabold tracking-tight text-foreground">
              {paidStudents}
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground font-medium gap-1">
              <Users className="h-3.5 w-3.5 text-violet-500" />
              <span>Enrolled & Paid</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Conversion Rate Card */}
      <Card className="relative overflow-hidden border border-border/60 bg-gradient-to-br from-card via-card/90 to-amber-500/5 dark:to-amber-500/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 dark:bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Conversion Rate
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Percent className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-extrabold tracking-tight text-foreground">
              {conversionRate}%
            </div>
            <div className="mt-2 flex items-center text-xs text-amber-600 dark:text-amber-400 font-medium">
              <span>Paid Student Share</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
