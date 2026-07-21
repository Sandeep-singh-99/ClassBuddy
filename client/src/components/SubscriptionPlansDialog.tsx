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
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { IPlan } from "@/types/subscription";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays, Sparkles, CheckCircle2, CreditCard, Layers } from "lucide-react";
import BuyPlanButton from "./BuyPlanButton";

interface SubscriptionPlansDialogProps {
  plans: IPlan[];
  groupName: string;
}

export function SubscriptionPlansDialog({
  plans,
  groupName,
}: SubscriptionPlansDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full rounded-xl gap-2 font-semibold shadow-md bg-primary text-primary-foreground hover:opacity-90 transition-all duration-300">
          <CreditCard className="h-4 w-4" />
          <span>View Subscription Plans</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[550px] rounded-2xl p-0 overflow-hidden border-border/80">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-primary/10 via-indigo-500/10 to-violet-500/10 p-6 pb-4 border-b border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
              <div className="p-2 rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              Plans for {groupName}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Select a subscription package to unlock full access to course notes and assignments.
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[60vh] p-6">
          <div className="space-y-4">
            {plans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 text-muted-foreground">
                <Layers className="h-8 w-8 opacity-40" />
                <p className="font-semibold text-sm text-foreground">No Plans Available</p>
                <p className="text-xs text-muted-foreground">
                  The teacher hasn't published active subscription plans for this group yet.
                </p>
              </div>
            ) : (
              plans.map((plan) => {
                const monthlyRate = Math.round(
                  (plan.amount / Math.max(plan.validity_days, 1)) * 30
                );

                return (
                  <Card
                    key={plan.id}
                    className="relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card to-card/60 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="h-1 w-full bg-gradient-to-r from-primary via-indigo-500 to-violet-500" />

                    <CardHeader className="p-5 pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-bold tracking-tight text-foreground">
                            {plan.plan_name}
                          </CardTitle>
                          <CardDescription className="text-[11px] text-muted-foreground mt-0.5">
                            Created on {new Date(plan.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>

                        <Badge
                          variant="secondary"
                          className="text-xs font-semibold px-2.5 py-1 bg-secondary text-secondary-foreground"
                        >
                          {plan.validity_days} Days
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 pt-0 space-y-3">
                      <div className="p-3.5 rounded-xl bg-muted/40 dark:bg-muted/20 border border-border/40 flex items-baseline justify-between">
                        <div>
                          <span className="text-2xl font-extrabold text-foreground">
                            ₹{plan.amount}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1 font-medium">
                            / {plan.validity_days} days
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-primary">
                          ~₹{monthlyRate}/mo
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>Full access to group notes & assignments</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          <span>Valid for {plan.validity_days} days from activation</span>
                        </div>
                      </div>
                    </CardContent>

                    <div className="p-5 pt-0">
                      <BuyPlanButton plan_id={plan.id} planName={plan.plan_name} />
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
