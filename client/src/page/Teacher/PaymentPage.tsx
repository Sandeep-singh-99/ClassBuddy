import { useEffect } from "react";
import { CreateSubscriptionDialog } from "./components/CreateSubscriptionDialog";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import {
  fetchSubscription,
  teacherSubscriptionStats,
  fetchSubscriptionAnalytics, // Import Thunk
} from "@/redux/slice/subscriptionSlice";
import { SubscriptionCard } from "./components/SubscriptionCard";

import { PaymentStats } from "./components/PaymentStats";
import { SubscriptionAnalytics } from "./components/SubscriptionAnalytics"; // Import Analytics

export default function PaymentPage() {
  const dispatch = useAppDispatch();
  const {
    plans,
    loading: plansLoading,
    stats,
    analytics, // Select analytics
  } = useAppSelector((state) => state.subscription);

  useEffect(() => {
    dispatch(fetchSubscription());
    dispatch(teacherSubscriptionStats());
    dispatch(fetchSubscriptionAnalytics()); // Dispatch Thunk
  }, []);

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
        <CreateSubscriptionDialog />
      </div>

      <PaymentStats stats={stats} />

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

      {/* Analytics Section */}
      <SubscriptionAnalytics analytics={analytics} />
    </div>
  );
}
