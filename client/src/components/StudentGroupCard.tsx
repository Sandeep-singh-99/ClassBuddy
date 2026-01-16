import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen } from "lucide-react";
import type { IStudentGroupSubscription } from "@/types/subscription";
import { SubscriptionPlansDialog } from "./SubscriptionPlansDialog";

interface StudentGroupCardProps {
  data: IStudentGroupSubscription;
}

export function StudentGroupCard({ data }: StudentGroupCardProps) {
  const { group, teacher, plans, subscription } = data;

  const getDaysLeft = () => {
    if (!subscription) return 0;
    const today = new Date();
    const validTill = new Date(subscription.valid_till);
    const diffTime = validTill.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const isSubscribed = subscription && subscription.is_active;
  const daysLeft = isSubscribed ? getDaysLeft() : 0;

  const activePlanName = isSubscribed
    ? plans.find((p) => p.id === subscription?.plan_id)?.plan_name ||
      "Custom Plan"
    : null;

  return (
    <Card
      className={`flex flex-col h-full overflow-hidden transition-all duration-300 border-zinc-200 dark:border-zinc-800 ${
        isSubscribed
          ? "border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)] ring-1 ring-green-500/20"
          : "hover:shadow-lg"
      }`}
    >
      {/* Image Section */}
      <div className="relative w-full aspect-video bg-zinc-100 dark:bg-zinc-900 overflow-hidden group">
        {group.image_url ? (
          <img
            src={group.image_url}
            alt={group.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-indigo-300 dark:text-indigo-900/40">
            <BookOpen className="h-16 w-16" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-white text-sm font-medium">{teacher.name}</p>
        </div>

        {/* Active Badge */}
        {isSubscribed && (
          <div className="absolute top-3 right-3 bg-green-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm shadow-sm z-10 flex flex-col items-end">
            <span>PAID</span>
            <span className="text-[10px] font-medium opacity-90">
              ₹{subscription?.amount}
            </span>
          </div>
        )}
      </div>

      <CardHeader className="">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-bold line-clamp-1 text-zinc-900 dark:text-zinc-50">
            {group.name}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-grow ">
        {/* Simple clean teacher row */}
        <div className="flex items-center space-x-3 text-sm text-zinc-600 dark:text-zinc-400">
          <Avatar className="h-8 w-8 border border-zinc-200 dark:border-zinc-700">
            <AvatarImage src={teacher.image_url} alt={teacher.name} />
            <AvatarFallback className="text-xs">
              {teacher.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-zinc-900 dark:text-zinc-200">
              {teacher.name}
            </span>
            <span className="text-xs truncate max-w-[180px]">
              {teacher.email}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-4 px-6">
        {isSubscribed ? (
          <div className="w-full flex items-center justify-between bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-lg p-3">
            <div className="flex flex-col">
              <span className="text-xs text-green-600 dark:text-green-400 font-medium uppercase tracking-wider">
                {activePlanName}
              </span>
              <span className="text-sm font-bold text-green-700 dark:text-green-300">
                {daysLeft} days left
              </span>
            </div>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        ) : (
          <SubscriptionPlansDialog plans={plans} groupName={group.name} />
        )}
      </CardFooter>
    </Card>
  );
}
