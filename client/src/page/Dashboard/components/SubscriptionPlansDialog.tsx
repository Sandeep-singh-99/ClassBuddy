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
import { CalendarDays } from "lucide-react";

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
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
          View Subscription Plans
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Subscription Plans for {groupName}</DialogTitle>
          <DialogDescription>
            Choose a plan that fits your learning needs.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="grid gap-4 py-4">
            {plans.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No active subscription plans available for this group.
              </div>
            ) : (
              plans.map((plan) => (
                <Card
                  key={plan.id}
                  className="flex flex-col relative overflow-hidden transition-all hover:shadow-lg border-t-4 border-t-primary/80"
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-bold">
                          {plan.plan_name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Created on{" "}
                          {new Date(plan.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs bg-secondary/20"
                      >
                        {plan.validity_days} Days
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-2">
                    <div className="flex items-baseline mb-4">
                      <span className="text-3xl font-extrabold text-primary">
                        ₹{plan.amount}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        / {plan.validity_days} days
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
                      <span>
                        Valid for {plan.validity_days} days from purchase
                      </span>
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                      Subscribe Now
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
