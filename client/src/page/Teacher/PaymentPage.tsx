import { useState } from "react";
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

interface Plan {
  id: string;
  name: string;
  amount: string;
  validity: string;
}

export default function PaymentPage() {
  const [plans, setPlans] = useState<Plan[]>([]);

  const handleSavePlan = (planData: {
    name: string;
    amount: string;
    validity: string;
  }) => {
    const newPlan: Plan = {
      id: Math.random().toString(36).substr(2, 9),
      ...planData,
    };
    setPlans((prev) => [...prev, newPlan]);
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
