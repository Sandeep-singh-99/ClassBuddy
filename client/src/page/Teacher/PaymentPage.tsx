import { useState, useEffect } from "react";
import { CreateSubscriptionDialog } from "./components/CreateSubscriptionDialog";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { GroupJoinStudents } from "@/redux/slice/tSlice";
import { createSubscriptionPlan } from "@/services/subscriptionService";
import { toast } from "react-toastify";
import { differenceInDays, parseISO } from "date-fns";
import { fetchSubscription, addPlan } from "@/redux/slice/subscriptionSlice";
import { SubscriptionCard } from "./components/SubscriptionCard";
import type { IPlan } from "@/types/subscription";

export default function PaymentPage() {
  const dispatch = useAppDispatch();
  const { teachers } = useAppSelector((state) => state.teachers);
  const { plans, loading: plansLoading } = useAppSelector(
    (state) => state.subscription
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchSubscription());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Fetch teachers (groups) if not already available
    if (teachers.length === 0) {
      dispatch(GroupJoinStudents());
    }
  }, [dispatch, teachers.length]);

  const handleSavePlan = async (planData: {
    name: string;
    amount: string;
    validity: string;
  }) => {
    if (teachers.length === 0) {
      toast.error("No group found to create plan for.");
      return;
    }

    const group = teachers[0];
    const groupId = group.id;
    const validityDate = parseISO(planData.validity);
    const today = new Date();
    const validityDays = differenceInDays(validityDate, today);

    if (validityDays <= 0) {
      toast.error("Validity date must be in the future.");
      return;
    }

    setLoading(true);
    try {
      const response = await createSubscriptionPlan(groupId, {
        plan_name: planData.name,
        amount: Number(planData.amount),
        validity_days: validityDays,
      });

      // Map API response back to local Plan format for display
      const newPlan: IPlan = {
        id: response.id,
        group_id: response.group_id,
        group_name: group.group_name || "",
        plan_name: response.plan_name,
        amount: response.amount,
        validity_days: response.validity_days,
        created_at: response.created_at,
      };

      dispatch(addPlan(newPlan));
      toast.success("Subscription plan created successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create subscription plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Subscription Plans
          </h1>
          <p className="text-muted-foreground">
            Manage and create subscription plans for your students.
          </p>
        </div>
        <CreateSubscriptionDialog onSave={handleSavePlan} />
      </div>

      {plansLoading && plans.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Loading plans...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            No subscription plans created yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <SubscriptionCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
