import {
  Card,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, CheckCircle2, ShieldCheck, Mail } from "lucide-react";
import type { IStudentGroupSubscription } from "@/types/subscription";
import { SubscriptionPlansDialog } from "./SubscriptionPlansDialog";
import { Badge } from "@/components/ui/badge";

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

  const daysLeft = getDaysLeft();
  const isSubscribed = subscription && subscription.is_active && daysLeft > 0;

  const activePlanName = isSubscribed
    ? plans.find((p) => p.id === subscription?.plan_id)?.plan_name ||
      "Active Subscription"
    : null;

  const teacherInitials = teacher?.name
    ? teacher.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "TC";

  return (
    <Card
      className={`group relative flex flex-col justify-between h-full overflow-hidden rounded-2xl border transition-all duration-300 ${
        isSubscribed
          ? "border-emerald-500/50 dark:border-emerald-500/40 bg-gradient-to-b from-card to-emerald-500/5 dark:to-emerald-500/10 shadow-md ring-1 ring-emerald-500/20"
          : "border-border/60 bg-card hover:shadow-xl hover:-translate-y-1"
      }`}
    >
      {/* Top Media / Banner Section */}
      <div className="relative w-full aspect-video bg-muted overflow-hidden">
        {group.image_url ? (
          <img
            src={group.image_url}
            alt={group.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-primary/10 via-indigo-500/10 to-violet-500/10 text-primary/60">
            <BookOpen className="h-12 w-12 opacity-80" />
            <span className="text-xs font-semibold mt-2 text-muted-foreground">
              {group.name}
            </span>
          </div>
        )}

        {/* Hover overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-white text-xs font-semibold flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Teacher: {teacher.name}</span>
          </p>
        </div>

        {/* Active Subscription Badge */}
        {isSubscribed && (
          <div className="absolute top-3 right-3 bg-emerald-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-xl backdrop-blur-md shadow-md z-10 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span>PAID</span>
            <span className="text-[10px] font-normal opacity-90 border-l border-white/30 pl-1.5">
              ₹{subscription?.amount}
            </span>
          </div>
        )}
      </div>

      {/* Card Header & Content */}
      <div className="p-6 pb-2 space-y-4">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold line-clamp-1 text-foreground tracking-tight">
            {group.name}
          </CardTitle>
          {group.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {group.description}
            </p>
          )}
        </div>

        {/* Teacher Info Row */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 dark:bg-muted/20 border border-border/40">
          <Avatar className="h-9 w-9 border border-border/60">
            <AvatarImage src={teacher.image_url} alt={teacher.name} />
            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
              {teacherInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs text-foreground truncate">
              {teacher.name}
            </span>
            <span className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
              <Mail className="h-3 w-3 shrink-0" />
              {teacher.email}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer Action */}
      <CardFooter className="p-6 pt-3">
        {isSubscribed ? (
          <div className="w-full flex items-center justify-between bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-3">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {activePlanName}
              </span>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mt-0.5">
                {daysLeft} days remaining
              </span>
            </div>
            <Badge variant="secondary" className="text-[10px] bg-emerald-500 text-white font-bold">
              Active
            </Badge>
          </div>
        ) : (
          <SubscriptionPlansDialog plans={plans} groupName={group.name} />
        )}
      </CardFooter>
    </Card>
  );
}
