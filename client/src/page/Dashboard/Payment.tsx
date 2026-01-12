import { useEffect } from "react";
import { fetchStudentSubscriptionPlans } from "@/redux/slice/subscriptionSlice";
import { StudentGroupCard } from "./components/StudentGroupCard";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";

export default function Payment() {
  const dispatch = useAppDispatch();
  const { studentGroups, loading, error } = useAppSelector(
    (state) => state.subscription
  );

  useEffect(() => {
    dispatch(fetchStudentSubscriptionPlans());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
          Subscription Plans
        </h1>
        <p className="text-muted-foreground">
          Manage subscriptions for your joined groups.
        </p>
      </div>

      {studentGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 rounded-lg border-2 border-dashed bg-gray-50/50 dark:bg-gray-900/20">
          <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
            <Loader2 className="h-8 w-8 text-gray-400" />{" "}
            {/* Placeholder icon */}
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">No Groups Found</h3>
            <p className="text-muted-foreground max-w-sm">
              You haven't joined any groups yet, or your groups don't have
              subscription plans active.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studentGroups.map((item, index) => (
            <StudentGroupCard key={`${item.group.id}-${index}`} data={item} />
          ))}
        </div>
      )}
    </div>
  );
}
