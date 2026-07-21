import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarClock, ArrowRight, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface AssignmentCardProps {
  assignment: {
    id: string;
    title: string;
    description: string;
    due_date: string;
  };
}

export default function AssignmentCard({ assignment }: AssignmentCardProps) {
  const dueDate = new Date(assignment.due_date);
  const now = new Date();
  const isPastDue = dueDate < now;

  const getTimeLeft = () => {
    const diff = dueDate.getTime() - now.getTime();
    if (diff <= 0) return "Deadline passed";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} left`;
    return `${minutes} minute${minutes > 1 ? "s" : ""} left`;
  };

  return (
    <Card className="group relative flex flex-col justify-between h-full overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card to-card/60 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className={`h-1.5 w-full ${isPastDue ? "bg-amber-500" : "bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"}`} />

      <div>
        <CardHeader className="p-6 pb-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0 group-hover:scale-110 transition-transform">
              <CalendarClock className="h-5 w-5" />
            </div>

            <Badge
              variant="outline"
              className={`text-[11px] font-semibold ${
                isPastDue
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {isPastDue ? "Closed" : "Open"}
            </Badge>
          </div>

          <CardTitle className="text-lg font-bold text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
            {assignment.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 pt-0 space-y-3">
          {assignment.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {assignment.description}
            </p>
          )}

          <div className="p-3 rounded-xl bg-muted/40 dark:bg-muted/20 border border-border/40 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold">
              {isPastDue ? (
                <>
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400">Deadline Passed</span>
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">{getTimeLeft()}</span>
                </>
              )}
            </span>

            <span className="text-muted-foreground text-[11px]">
              Due: {dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        </CardContent>
      </div>

      <CardFooter className="p-6 pt-0">
        {!isPastDue ? (
          <Link
            to={`/dashboard-panel/assignments/${assignment.id}`}
            className="w-full"
          >
            <Button
              className="w-full rounded-xl gap-2 font-semibold shadow-xs bg-primary text-primary-foreground hover:opacity-95 transition-all"
            >
              <span>View Assignment</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Link
            to={`/dashboard-panel/assignments-details/${assignment.id}`}
            className="w-full"
          >
            <Button
              variant="outline"
              className="w-full rounded-xl gap-2 font-semibold border-border/80 hover:bg-accent"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>View Grade & Feedback</span>
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
