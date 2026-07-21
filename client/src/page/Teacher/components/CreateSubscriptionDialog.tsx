import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch } from "@/hooks/hooks";
import { createSubscriptionPlan, fetchSubscription } from "@/redux/slice/subscriptionSlice";
import type { ICreatePlan } from "@/types/subscription";
import { Loader2, Plus, Sparkles, IndianRupee, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const VALIDITY_PRESETS = [
  { label: "1 Month", days: 30 },
  { label: "3 Months", days: 90 },
  { label: "6 Months", days: 180 },
  { label: "1 Year", days: 365 },
];

export function CreateSubscriptionDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ICreatePlan>({
    plan_name: "",
    amount: 0,
    validity_days: 30,
  });
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSelectPreset = (days: number) => {
    setFormData((prev) => ({ ...prev, validity_days: days }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.plan_name.trim()) {
      toast.error("Please enter a plan name");
      return;
    }
    if (formData.amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (formData.validity_days <= 0) {
      toast.error("Please enter valid validity days");
      return;
    }

    setLoading(true);
    try {
      const response = await dispatch(createSubscriptionPlan(formData)).unwrap();
      setFormData({ plan_name: "", amount: 0, validity_days: 30 });
      toast.success(response.message || "Subscription plan created!");
      dispatch(fetchSubscription());
      setOpen(false);
    } catch (error: any) {
      const errorMessage =
        typeof error === "string" ? error : "Failed to create plan";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="rounded-xl gap-2 font-semibold shadow-md hover:shadow-lg bg-primary text-primary-foreground transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
          <span>Create Plan</span>
          <Sparkles className="h-3.5 w-3.5 opacity-70" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] rounded-2xl border-border/80 p-0 overflow-hidden">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-primary/10 via-blue-500/10 to-indigo-500/10 p-6 pb-4 border-b border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <div className="p-2 rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              Create Subscription Plan
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Design a subscription package for your students.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Plan Name */}
          <div className="space-y-1.5">
            <Label htmlFor="plan_name_create" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Plan Name
            </Label>
            <Input
              id="plan_name_create"
              name="plan_name"
              value={formData.plan_name}
              onChange={handleChange}
              placeholder="e.g. Gold Quarterly Batch"
              className="rounded-xl border-border/80"
              required
            />
          </div>

          {/* Amount & Preset Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="amount_create" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Price (₹)
              </Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="amount_create"
                  name="amount"
                  type="number"
                  min={1}
                  value={formData.amount || ""}
                  onChange={handleChange}
                  placeholder="e.g. 499"
                  className="pl-9 rounded-xl border-border/80"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="validity_create" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Validity (Days)
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="validity_create"
                  name="validity_days"
                  type="number"
                  min={1}
                  value={formData.validity_days || ""}
                  onChange={handleChange}
                  placeholder="30"
                  className="pl-9 rounded-xl border-border/80"
                  required
                />
              </div>
            </div>
          </div>

          {/* Validity Quick Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-muted-foreground block">
              Quick Validity Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {VALIDITY_PRESETS.map((preset) => (
                <Badge
                  key={preset.days}
                  variant={formData.validity_days === preset.days ? "default" : "outline"}
                  className="cursor-pointer rounded-lg px-2.5 py-1 text-xs transition-all hover:scale-105"
                  onClick={() => handleSelectPreset(preset.days)}
                >
                  {preset.label} ({preset.days}d)
                </Badge>
              ))}
            </div>
          </div>

          {/* Live Mini Preview Box */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground block">
              Live Card Preview
            </span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground text-sm">
                {formData.plan_name || "Untitled Plan"}
              </span>
              <Badge variant="secondary" className="text-[10px]">
                {formData.validity_days || 0} Days
              </Badge>
            </div>
            <div className="flex items-baseline gap-1 text-primary font-bold">
              <span className="text-xl">₹{formData.amount || 0}</span>
              <span className="text-xs text-muted-foreground font-normal">
                total
              </span>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl gap-2 min-w-[130px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Save Plan
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
