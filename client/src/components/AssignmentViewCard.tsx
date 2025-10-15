import { Link } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { NotebookIcon } from "lucide-react";


interface AssignmentCardProps {
  assignment: {
    id: string;
    title: string;
    description: string;
    due_date: string;
  };
}


export default function AssignmentViewCard({ assignment }: AssignmentCardProps) {
  return (
    <Card>
      <CardContent className="text-xl font-semibold truncate flex justify-between items-center gap-3">
        <Link
          key={assignment.id}
          to={`/dashboard-panel/assignments/${assignment.id}`}
          className="flex items-center gap-2"
        >
          <NotebookIcon className="w-6 h-6 text-blue-600" />
          {assignment.title}
        </Link>
        
      </CardContent>
    </Card>
  )
}
