import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { IPlan } from "@/types/subscription";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  CheckCircle2,
  CreditCard,
  Layers,
  GraduationCap,
  ShieldCheck,
  FileText,
  Clock,
  Zap,
  Star,
  Lock,
} from "lucide-react";
import BuyPlanButton from "./BuyPlanButton";
import { cn } from "@/lib/utils";

interface SubscriptionPlansDialogProps {
  plans: IPlan[];
  groupName: string;
  trigger?: React.ReactNode;
}

export function SubscriptionPlansDialog({
  plans,
  groupName,
  trigger,
}: SubscriptionPlansDialogProps) {
  // Sort plans by validity duration ascending for intuitive progression
  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => a.validity_days - b.validity_days);
  }, [plans]);

  // Determine the best value plan (lowest rate per day when multiple plans exist)
  const bestValuePlanId = useMemo(() => {
    if (sortedPlans.length <= 1) return null;
    let minRate = Infinity;
    let bestId = null;
    sortedPlans.forEach((plan) => {
      const dailyRate = plan.amount / Math.max(plan.validity_days, 1);
      if (dailyRate < minRate) {
        minRate = dailyRate;
        bestId = plan.id;
      }
    });
    return bestId;
  }, [sortedPlans]);

  // Baseline monthly rate (from the shortest plan) to calculate percentage savings
  const baselineMonthlyRate = useMemo(() => {
    if (sortedPlans.length <= 1) return null;
    const shortestPlan = sortedPlans[0];
    return (shortestPlan.amount / Math.max(shortestPlan.validity_days, 1)) * 30;
  }, [sortedPlans]);

  // Format days into intuitive human-friendly string (e.g. "30 Days", "3 Months", "1 Year")
  const formatDuration = (days: number) => {
    if (days === 30) return "1 Month";
    if (days === 60) return "2 Months";
    if (days === 90) return "3 Months (Quarterly)";
    if (days === 180) return "6 Months (Semester)";
    if (days >= 360 && days <= 366) return "1 Year (Annual)";
    return `${days} Days`;
  };

  const getContainerMaxWidth = () => {
    if (sortedPlans.length <= 1) return "sm:max-w-[560px]";
    if (sortedPlans.length === 2) return "sm:max-w-2xl md:max-w-3xl";
    return "sm:max-w-3xl md:max-w-4xl lg:max-w-5xl";
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button className="group relative w-full h-11 rounded-xl gap-2 font-semibold shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md transition-all duration-300 cursor-pointer">
            <CreditCard className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span>Unlock Full Access • View Plans</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        className={cn(
          "rounded-3xl p-0 overflow-hidden border-border/70 shadow-2xl transition-all duration-300",
          getContainerMaxWidth()
        )}
      >
        {/* ── 1. Header & Hero Value Proposition ───────────────────────── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-indigo-500/10 to-violet-500/10 dark:from-primary/15 dark:via-indigo-500/10 dark:to-violet-500/15 p-6 sm:p-7 border-b border-border/60">
          {/* Subtle Ambient Glow Blobs */}
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 -bottom-12 h-36 w-36 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />

          <DialogHeader className="relative z-10 space-y-2.5">
            {/* Top Eyebrow Tag */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/25 shadow-xs">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Classroom Membership</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted/80 text-muted-foreground border border-border/50">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                <span>Verified Teacher Content</span>
              </span>
            </div>

            {/* Main Title */}
            <DialogTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex flex-wrap items-center gap-2 pt-1">
              <span>Plans for</span>
              <span className="bg-gradient-to-r from-primary via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {groupName}
              </span>
            </DialogTitle>

            {/* Description */}
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Select a subscription package to unlock full access to course notes and assignments.
              Enjoy uninterrupted study materials, teacher grading, and dedicated group discussions.
            </DialogDescription>

            {/* Quick Benefits Pills */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] font-medium text-foreground/85">
              <div className="flex items-center gap-1.5 bg-background/80 dark:bg-background/60 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-border/40 shadow-2xs">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span>Instant Activation</span>
              </div>
              <div className="flex items-center gap-1.5 bg-background/80 dark:bg-background/60 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-border/40 shadow-2xs">
                <FileText className="h-3.5 w-3.5 text-indigo-500" />
                <span>Complete Notes & Solutions</span>
              </div>
              <div className="flex items-center gap-1.5 bg-background/80 dark:bg-background/60 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-border/40 shadow-2xs">
                <Lock className="h-3.5 w-3.5 text-emerald-500" />
                <span>One-Time • No Auto-Debit</span>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* ── 2. Scrollable Plans Container ────────────────────────────── */}
        <ScrollArea className="max-h-[64vh] p-5 sm:p-7">
          {sortedPlans.length === 0 ? (
            /* ── Empty State ────────────────────────────────────────── */
            <div className="flex flex-col items-center justify-center py-14 px-4 text-center space-y-3">
              <div className="p-4 rounded-2xl bg-muted/60 border border-border/60 text-muted-foreground">
                <Layers className="h-10 w-10 opacity-50" />
              </div>
              <div className="space-y-1 max-w-sm">
                <p className="font-bold text-base text-foreground">
                  No Active Plans Published
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your educator hasn&apos;t created any subscription tiers for{" "}
                  <span className="font-semibold text-foreground">{groupName}</span> yet.
                  Please check back shortly or request your teacher to publish a plan.
                </p>
              </div>
            </div>
          ) : (
            /* ── Plans Grid ─────────────────────────────────────────── */
            <div
              className={cn(
                "grid gap-5 items-stretch",
                sortedPlans.length === 1
                  ? "grid-cols-1 max-w-md mx-auto"
                  : sortedPlans.length === 2
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              )}
            >
              {sortedPlans.map((plan) => {
                const isBestValue = plan.id === bestValuePlanId;
                const dailyRate = plan.amount / Math.max(plan.validity_days, 1);
                const monthlyRate = Math.round(dailyRate * 30);
                const dailyCost = Math.round(dailyRate);

                // Calculate savings compared to baseline shortest plan
                let savingsPercent: number | null = null;
                if (
                  baselineMonthlyRate &&
                  baselineMonthlyRate > 0 &&
                  monthlyRate < baselineMonthlyRate &&
                  sortedPlans.length > 1
                ) {
                  savingsPercent = Math.round(
                    ((baselineMonthlyRate - monthlyRate) / baselineMonthlyRate) * 100
                  );
                }

                return (
                  <Card
                    key={plan.id}
                    className={cn(
                      "group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-300",
                      isBestValue
                        ? "border-primary/80 dark:border-primary/70 bg-gradient-to-b from-primary/[0.04] via-card to-card shadow-lg ring-2 ring-primary/20 hover:shadow-xl hover:border-primary"
                        : "border-border/70 bg-gradient-to-b from-card to-card/60 shadow-xs hover:border-border hover:shadow-md"
                    )}
                  >
                    {/* Top Accent Strip */}
                    <div
                      className={cn(
                        "h-1.5 w-full",
                        isBestValue
                          ? "bg-gradient-to-r from-indigo-500 via-primary to-violet-500"
                          : "bg-muted-foreground/15"
                      )}
                    />

                    {/* Best Value Badge Header Float */}
                    {isBestValue && (
                      <div className="absolute top-3 right-4 z-10">
                        <Badge className="bg-gradient-to-r from-indigo-600 via-primary to-violet-600 text-white font-bold text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 border-0">
                          <Star className="h-3 w-3 fill-current text-amber-300" />
                          <span>Best Value</span>
                        </Badge>
                      </div>
                    )}

                    {/* Card Header */}
                    <CardHeader className="p-5 pb-3 space-y-3">
                      <div className="space-y-1 pr-20">
                        <CardTitle className="text-lg font-bold tracking-tight text-foreground line-clamp-1">
                          {plan.plan_name}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDuration(plan.validity_days)}</span>
                        </div>
                      </div>

                      {/* Pricing Block */}
                      <div
                        className={cn(
                          "p-3.5 rounded-xl border transition-colors",
                          isBestValue
                            ? "bg-primary/5 border-primary/20 dark:bg-primary/10"
                            : "bg-muted/40 border-border/50 dark:bg-muted/20"
                        )}
                      >
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-3xl font-extrabold tracking-tight text-foreground">
                              ₹{plan.amount}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1.5 font-medium">
                              / {plan.validity_days} days
                            </span>
                          </div>

                          {savingsPercent && savingsPercent > 0 && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                            >
                              Save {savingsPercent}%
                            </Badge>
                          )}
                        </div>

                        {/* Breakdown Subline */}
                        <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="font-medium text-foreground/80">
                            ~₹{monthlyRate}/mo
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            approx. ₹{dailyCost}/day
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Features List */}
                    <CardContent className="p-5 pt-1 pb-4 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5 pt-1">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          What&apos;s Included:
                        </p>

                        <ul className="space-y-2 text-xs text-foreground/90">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>
                              <strong>Full Course Notes</strong> & curated study sheets
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>
                              <strong>Assignments & Tests</strong> with educator grading
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>
                              <strong>Peer & Teacher Q&amp;A</strong> in group channels
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>
                              <strong>Instant Unlocked Access</strong> for {plan.validity_days} days
                            </span>
                          </li>
                        </ul>
                      </div>

                      {/* Buy Action Button - single solid color */}
                      <div className="pt-3">
                        <BuyPlanButton
                          plan_id={plan.id}
                          planName={plan.plan_name}
                          isPopular={isBestValue}
                          buttonText={
                            isBestValue
                              ? `Subscribe (${formatDuration(plan.validity_days)})`
                              : `Choose ${plan.plan_name}`
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* ── 3. Footer Trust & Assurance Strip ────────────────────────── */}
        <div className="bg-muted/30 dark:bg-muted/15 border-t border-border/50 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>
              <strong>100% Secure Checkout</strong> via Razorpay • 256-bit SSL encryption
            </span>
          </div>

          <div className="flex items-center gap-3 font-medium">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              <span>UPI, Cards, NetBanking</span>
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span>Instant Access</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
