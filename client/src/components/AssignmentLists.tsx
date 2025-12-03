import { useAppSelector } from "@/hooks/hooks";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function AssignmentLists() {
  const { ownerAssignmentStats, loading } = useAppSelector(
    (state) => state.submissions
  );

  const assignments = ownerAssignmentStats?.assignments || [];

  return (
    <div className="w-full text-foreground flex justify-center items-start">
      <Card className="w-full max-w-6xl shadow-lg border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            📚 My Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                Loading assignments...
              </span>
            </div>
          ) : assignments.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              No assignments found.
            </p>
          ) : (
            <Table>
              <TableCaption>
                A list of your submitted and pending assignments.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell>{a.description}</TableCell>
                    <TableCell>{a.group_name}</TableCell>
                    <TableCell>
                      {new Date(a.due_date).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell>
                      {a.is_completed ? (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          Completed
                        </Badge>
                      ) : a.is_past_due ? (
                        <Badge variant="destructive">Past Due</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {a.submitted_at
                        ? new Date(a.submitted_at).toLocaleString("en-IN")
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
