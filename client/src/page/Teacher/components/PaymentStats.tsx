import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ITeacherSubscriptionStats } from "@/types/subscription";
import { IndianRupee, Users, CreditCard } from "lucide-react";

interface PaymentStatsProps {
  stats: ITeacherSubscriptionStats | null;
}

export const PaymentStats = ({ stats }: PaymentStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Total Earnings Card */}
      <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Earnings
          </CardTitle>
          <IndianRupee className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{stats?.total_earnings.toLocaleString() ?? 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Lifetime revenue</p>
        </CardContent>
      </Card>

      {/* Students Stats Card */}
      <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Student Subscriptions
          </CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-2xl font-bold">
                {stats?.paid_students ?? 0}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  / {stats?.total_students ?? 0}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Paid vs Total Students
              </p>
            </div>
            {/* Optional visual indicator */}
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
