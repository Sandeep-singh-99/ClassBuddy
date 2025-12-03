import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { fetchAllStudentSubmissions } from "@/redux/slice/submissionSlice";
import { useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AssignmentMarksCardProps {
  id: string;
}

export default function AssignmentMarksCard({
  id: assignmentId,
}: AssignmentMarksCardProps) {
  const dispatch = useAppDispatch();
  const { studentData, loading, error } = useAppSelector(
    (state) => state.submissions
  );

  useEffect(() => {
    if (assignmentId) {
      dispatch(fetchAllStudentSubmissions(assignmentId));
    }
  }, [assignmentId, dispatch]);

  if (loading) {
    return (
      <Card className="w-full max-w-3xl mx-auto p-6 flex justify-center items-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-3xl mx-auto p-6 text-center text-destructive">
        Failed to load marks: {error}
      </Card>
    );
  }

  if (!studentData || !studentData.students?.length) {
    return (
      <Card className="w-full max-w-3xl mx-auto p-6 text-center text-muted-foreground">
        No student submissions found for this assignment.
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-5xl mx-auto border border-border bg-card text-foreground">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Assignment</CardTitle>
        <CardDescription className="text-muted-foreground">
          Assignment ID: {studentData.assignment_id}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[400px] rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Feedback</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {studentData.students.map((student: any, index: number) => (
                <TableRow key={student.student_id}>
                  <TableCell className="text-muted-foreground">
                    {index + 1}
                  </TableCell>

                  {/* Student Image + Name */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-border">
                        <img
                          src={student.student_image_url}
                          alt={student.student_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {student.student_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student.student_email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Grade */}
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className={`text-sm px-3 ${
                        student.grade >= 7
                          ? "bg-green-500/20 text-green-400"
                          : student.grade >= 4
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {student.grade ?? "N/A"}
                    </Badge>
                  </TableCell>

                  {/* Submission Status */}
                  <TableCell className="text-center">
                    {student.submitted ? (
                      <div className="flex items-center justify-center text-green-400 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Submitted
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-red-400 text-xs">
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Pending
                      </div>
                    )}
                  </TableCell>

                  {/* Feedback Dialog */}
                  <TableCell className="text-center">
                    {student.feedback ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="text-blue-400 hover:text-blue-300 text-xs flex items-center mx-auto">
                            <MessageSquare className="w-3.5 h-3.5 mr-1" />
                            View
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg bg-card border border-border">
                          <DialogHeader>
                            <DialogTitle className="text-foreground">
                              Feedback for {student.student_name}
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground text-sm">
                              Instructor remarks on assignment performance.
                            </DialogDescription>
                          </DialogHeader>
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                            {student.feedback}
                          </p>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
