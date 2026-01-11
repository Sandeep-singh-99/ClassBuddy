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
import { createSubscriptionPlan } from "@/redux/slice/subscriptionSlice";
import type { ICreatePlan } from "@/types/subscription";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";

export function CreateSubscriptionDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ICreatePlan>({
    plan_name: "",
    amount: 0,
    validity_days: 0,
  });
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      setOpen(false);
      const response = await dispatch(createSubscriptionPlan(formData)).unwrap();
      setFormData({ plan_name: "", amount: 0, validity_days: 0 });
      toast.success(response.message);
      setLoading(false);
    } catch (error) {
      const axiosError = error as AxiosError<{ detail: string }>;
      const errorMessage =
        axiosError.response?.data?.detail || "Invalid Credentials";
      toast.error(errorMessage);
      setOpen(true);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Create Subscription Plan</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Subscription Plan</DialogTitle>
          <DialogDescription>
            Enter the details for the new subscription plan. Click save when
            you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plan_name" className="text-right">
                Plan Name
              </Label>
              <Input
                id="plan_name"
                name="plan_name"
                value={formData.plan_name}
                onChange={handleChange}
                placeholder="e.g. Gold Plan"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g. 99"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="validity_days" className="text-right">
                Validity Days
              </Label>
              <Input
                id="validity_days"
                name="validity_days"
                type="number"
                value={formData.validity_days}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
