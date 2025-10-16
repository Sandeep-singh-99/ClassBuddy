import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarClock } from "lucide-react";
import { Link } from "react-router-dom";

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
    <Card className="w-full max-w-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold truncate flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-blue-600" />
          {assignment.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="text-sm text-gray-600 flex items-center justify-between">
        <span
          className={
            isPastDue
              ? "text-red-500 font-medium"
              : "text-green-600 font-medium"
          }
        >
          {isPastDue ? "Deadline passed" : getTimeLeft()}
        </span>
        <span className="text-xs text-white">
          {dueDate.toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </CardContent>

      <CardFooter className="flex justify-end">
       {
        !isPastDue ? (
           <Link
          key={assignment.id}
          to={`/dashboard-panel/assignments/${assignment.id}`}
        >
          <Button
            variant="outline"
            size="sm"
            className="hover:scale-[1.02] transition-transform"
          >
            View Assignment
          </Button>
        </Link>
        ) : (
          <Link key={assignment.id} to={`/dashboard-panel/assignments-details/${assignment.id}`}>
            <Button variant={"outline"} size={"sm"} className="hover:scale-[1.02] transition-transform">
              View Details
            </Button>
          </Link>
        )
       }
      </CardFooter>
    </Card>
  );
}
