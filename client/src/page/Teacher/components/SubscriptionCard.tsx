import type { IPlan } from "@/types/subscription";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Users,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useAppDispatch } from "@/hooks/hooks";
import {
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  fetchSubscription,
} from "@/redux/slice/subscriptionSlice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface SubscriptionCardProps {
  plan: IPlan;
}

export const SubscriptionCard = ({ plan }: SubscriptionCardProps) => {
  const dispatch = useAppDispatch();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    plan_name: plan.plan_name,
    amount: plan.amount,
    validity_days: plan.validity_days,
  });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Computed rate per month (30 days)
  const monthlyRate = Math.round((plan.amount / Math.max(plan.validity_days, 1)) * 30);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await dispatch(deleteSubscriptionPlan(plan.id)).unwrap();
      toast.success(response.message || "Plan deleted successfully");
      dispatch(fetchSubscription());
    } catch (error: any) {
      toast.error(error || "Failed to delete plan");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editFormData.plan_name.trim() || editFormData.amount <= 0 || editFormData.validity_days <= 0) {
      toast.error("Please enter valid plan details");
      return;
    }
    setLoading(true);
    try {
      const response = await dispatch(
        updateSubscriptionPlan({
          plan_id: plan.id,
          data: editFormData,
        })
      ).unwrap();
      toast.success(response.message || "Plan updated successfully");
      setIsEditDialogOpen(false);
      dispatch(fetchSubscription());
    } catch (error: any) {
      toast.error(error || "Failed to update plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card to-card/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Decorative top accent line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-blue-500 to-indigo-500" />
      
      {/* Background ambient glow on hover */}
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div>
        <CardHeader className="p-6 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              {plan.group_name && (
                <Badge
                  variant="outline"
                  className="mb-1 text-[11px] font-medium border-primary/20 bg-primary/10 text-primary flex items-center w-fit gap-1"
                >
                  <Users className="h-3 w-3" />
                  {plan.group_name}
                </Badge>
              )}
              <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                {plan.plan_name}
              </CardTitle>
            </div>
            
            <Badge
              variant="secondary"
              className="text-xs font-semibold px-2.5 py-1 bg-secondary text-secondary-foreground border border-border/50 shrink-0"
            >
              {plan.validity_days} Days
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0 space-y-5">
          {/* Price display */}
          <div className="p-4 rounded-xl bg-muted/40 dark:bg-muted/20 border border-border/40 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-foreground tracking-tight">
                ₹{plan.amount}
              </span>
              <span className="text-xs text-muted-foreground ml-1 font-medium">
                / {plan.validity_days} days
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-primary block">
                ~₹{monthlyRate}/mo
              </span>
              <span className="text-[10px] text-muted-foreground">Approx. rate</span>
            </div>
          </div>

          {/* Plan highlights */}
          <div className="space-y-2.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Full course & materials access</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500 shrink-0" />
              <span>Valid for {plan.validity_days} days from activation</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Created on {new Date(plan.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Card actions footer */}
      <CardFooter className="p-6 pt-3 gap-3 border-t border-border/40 bg-muted/20 dark:bg-muted/10">
        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2 rounded-xl border-border/60 hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                Edit Plan
              </DialogTitle>
              <DialogDescription>
                Update the subscription plan details below.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="plan_name_edit" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Plan Name
                </Label>
                <Input
                  id="plan_name_edit"
                  value={editFormData.plan_name}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      plan_name: e.target.value,
                    })
                  }
                  className="rounded-xl border-border/80"
                  placeholder="e.g. Premium Plan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="amount_edit" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Amount (₹)
                  </Label>
                  <Input
                    id="amount_edit"
                    type="number"
                    min={0}
                    value={editFormData.amount}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        amount: Number(e.target.value),
                      })
                    }
                    className="rounded-xl border-border/80"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="validity_edit" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Validity (Days)
                  </Label>
                  <Input
                    id="validity_edit"
                    type="number"
                    min={1}
                    value={editFormData.validity_days}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        validity_days: Number(e.target.value),
                      })
                    }
                    className="rounded-xl border-border/80"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditDialogOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUpdate}
                disabled={loading}
                className="rounded-xl gap-2 min-w-[100px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Alert */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Delete Subscription Plan?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong className="text-foreground">"{plan.plan_name}"</strong>? Students will no longer be able to purchase this plan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};
