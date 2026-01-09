import { useState, useEffect } from "react";
import { CreateSubscriptionDialog } from "./components/CreateSubscriptionDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { GroupJoinStudents } from "@/redux/slice/tSlice";
import { createSubscriptionPlan } from "@/services/subscriptionService";
import { toast } from "react-toastify";
import { differenceInDays, parseISO } from "date-fns";

interface Plan {
  id: string;
  name: string;
  amount: string;
  validity: string;
}

export default function PaymentPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const dispatch = useAppDispatch();
  const { teachers } = useAppSelector((state) => state.teachers);
  const [loading, setLoading] = useState(false);

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

    const groupId = teachers[0].id;
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
      const newPlan: Plan = {
        id: response.id,
        name: response.plan_name,
        amount: response.amount.toString(),
        validity: planData.validity, // Keep the original date string for display
      };

      setPlans((prev) => [...prev, newPlan]);
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

      {plans.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            No subscription plans created yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  Valid until {new Date(plan.validity).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-3xl font-bold">${plan.amount}</div>
                <div className="flex items-center mt-4 text-sm text-muted-foreground">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>Expires on {plan.validity}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Edit Plan</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
