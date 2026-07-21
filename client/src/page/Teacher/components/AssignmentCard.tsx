import { Link } from "react-router-dom";
import { format } from "date-fns";
import { BookOpenText, Calendar, ArrowRight, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AssignmentDelete from "./AssignmentDelete";

interface AssignmentCardProps {
  assignment: {
    id: string;
    title: string;
    description: string;
    due_date: string;
    created_at?: string;
  };
}

export default function AssignmentCard({ assignment }: AssignmentCardProps) {
  const isPastDue = assignment.due_date
    ? new Date(assignment.due_date).getTime() < new Date().getTime()
    : false;

  return (
    <Card className="group relative cursor-pointer rounded-2xl border-border/60 bg-card/80 backdrop-blur-sm hover:bg-muted/30 transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md overflow-hidden">
      <CardHeader className="p-5 pb-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <BookOpenText className="h-5 w-5" />
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {assignment.due_date && (
              <Badge
                variant="outline"
                className={`text-[10px] font-medium gap-1 ${
                  isPastDue
                    ? "border-rose-500/30 bg-rose-500/10 text-rose-500"
                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                }`}
              >
                <Clock className="h-3 w-3" />
                {isPastDue ? "Past Due" : "Active"}
              </Badge>
            )}
            <AssignmentDelete id={assignment.id} />
          </div>
        </div>

        <Link to={`/t-dashboard/assignments/${assignment.id}`} className="block">
          <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug pt-1">
            {assignment.title || "Untitled Assignment"}
          </CardTitle>
        </Link>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-4 flex-1 flex flex-col justify-between">
        <CardDescription className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {assignment.description || "No description provided."}
        </CardDescription>

        <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Due: {assignment.due_date ? format(new Date(assignment.due_date), "MMM dd, yyyy") : "N/A"}
          </span>

          <Link
            to={`/t-dashboard/assignments/${assignment.id}`}
            className="text-primary font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            View Submissions <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}