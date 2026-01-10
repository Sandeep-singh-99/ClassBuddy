import type { IPlan } from "@/types/subscription";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Edit2, Trash2 } from "lucide-react";
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
} from "@/redux/slice/subscriptionSlice";
import { toast } from "react-toastify";
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

  const handleDelete = async () => {
    try {
      await dispatch(deleteSubscriptionPlan(plan.id)).unwrap();
      toast.success("Plan deleted successfully");
    } catch (error: any) {
      toast.error(error || "Failed to delete plan");
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await dispatch(
        updateSubscriptionPlan({
          planId: plan.id,
          data: editFormData,
        })
      ).unwrap();
      toast.success("Plan updated successfully");
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast.error(error || "Failed to update plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="flex flex-col relative overflow-hidden transition-all hover:shadow-lg border-t-4 border-t-primary/80">
        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Context menu or actions could go here */}
        </div>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold">
                {plan.plan_name}
              </CardTitle>
              <CardDescription className="mt-1">
                Created on {new Date(plan.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs bg-secondary/20">
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
            <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
            <span>Valid for {plan.validity_days} days from purchase</span>
          </div>
        </CardContent>
        <CardFooter className="pt-4 gap-2">
          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 gap-2 hover:bg-secondary/50"
              >
                <Edit2 className="h-4 w-4" /> Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Plan</DialogTitle>
                <DialogDescription>
                  Make changes to your subscription plan here. Click save when
                  you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="plan_name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="plan_name"
                    value={editFormData.plan_name}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        plan_name: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount (₹)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={editFormData.amount}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        amount: Number(e.target.value),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="validity" className="text-right">
                    Validity (Days)
                  </Label>
                  <Input
                    id="validity"
                    type="number"
                    value={editFormData.validity_days}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        validity_days: Number(e.target.value),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" onClick={handleUpdate} disabled={loading}>
                  {loading ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Alert */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex-1 gap-2">
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  subscription plan "{plan.plan_name}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </>
  );
};
