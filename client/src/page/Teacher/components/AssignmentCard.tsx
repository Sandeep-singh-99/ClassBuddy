import { Card, CardContent } from "@/components/ui/card";
import { NotebookIcon } from "lucide-react";
import AssignmentDelete from "./AssignmentDelete";
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
  return (
    <Card>
      <CardContent className="text-2xl font-semibold truncate flex justify-between items-center gap-3">
        <Link
          key={assignment.id}
          to={`/t-dashboard/assignments/${assignment.id}`}
          className="flex items-center gap-2"
        >
          <NotebookIcon className="w-6 h-6 text-blue-600" />
          {assignment.title}
        </Link>
        <AssignmentDelete id={assignment.id} />
      </CardContent>
    </Card>
  );
}