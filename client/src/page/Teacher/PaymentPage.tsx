import { useEffect } from "react";
import { CreateSubscriptionDialog } from "./components/CreateSubscriptionDialog";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { GroupJoinStudents } from "@/redux/slice/tSlice";
import {
  fetchSubscription,
  createSubscriptionPlan,
} from "@/redux/slice/subscriptionSlice";
import { SubscriptionCard } from "./components/SubscriptionCard";
import type { ISubscription } from "@/types/subscription";

export default function PaymentPage() {
  const dispatch = useAppDispatch();
  const { teachers } = useAppSelector((state) => state.teachers);
  const { plans, loading: plansLoading } = useAppSelector(
    (state) => state.subscription
  );

  useEffect(() => {
    dispatch(fetchSubscription());
  }, []);

  useEffect(() => {
    if (teachers.length === 0) {
      dispatch(GroupJoinStudents());
    }
  }, [dispatch, teachers.length]);

  const handleSavePlan = async (planData: {
    name: string;
    amount: string;
    validity: string;
  }) => {
    if (teachers.length === 0) return;

    const groupID = teachers[0].id; // Assuming the first group is the target
    const payload = {
      ...planData,
      plan_name: planData.name,
      amount: Number(planData.amount),
      validity: planData.validity,
    };

    await dispatch(createSubscriptionPlan({ groupID, data: payload }));
    dispatch(fetchSubscription()); // Refresh list
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
