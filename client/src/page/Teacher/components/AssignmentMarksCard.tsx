import { useEffect } from "react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Users,
  Award,
  User,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { fetchAllStudentSubmissions } from "@/redux/slice/submissionSlice";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AssignmentMarksCardProps {
  id: string;
}

export default function AssignmentMarksCard({ id: assignmentId }: AssignmentMarksCardProps) {
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
      <Card className="w-full border-border/60 bg-card/80 p-8 flex flex-col items-center justify-center space-y-3 rounded-2xl">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Loading student submissions...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-destructive/30 bg-destructive/5 text-destructive p-6 text-center text-sm font-medium rounded-2xl">
        Failed to load submissions: {error}
      </Card>
    );
  }

  if (!studentData || !studentData.students?.length) {
    return (
      <Card className="w-full border-border/60 bg-card/80 p-8 text-center flex flex-col items-center justify-center space-y-3 rounded-2xl">
        <div className="p-3 bg-muted rounded-full text-muted-foreground">
          <Users className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold text-foreground text-base">No Submissions Yet</h4>
          <p className="text-xs text-muted-foreground max-w-sm">
            Student submissions will appear here automatically once students turn in their assignments.
          </p>
        </div>
      </Card>
    );
  }

  const studentsList = studentData.students;
  const submittedCount = studentsList.filter((s: any) => s.submitted).length;

  return (
    <Card className="w-full border-border/60 shadow-md bg-card/80 backdrop-blur-sm text-card-foreground rounded-2xl overflow-hidden">
      <CardHeader className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Student Submissions & Grades
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
            Review student responses, graded scores, and feedback for this assignment
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold border-primary/20 bg-primary/5 text-primary">
            Submissions: {submittedCount} / {studentsList.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-4">
        <ScrollArea className="h-[380px] rounded-xl border border-border/60">
          <Table>
            <TableHeader className="bg-muted/40 sticky top-0 backdrop-blur-md z-10">
              <TableRow className="border-border/60">
                <TableHead className="w-[50px] text-xs font-semibold text-muted-foreground">#</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Student</TableHead>
                <TableHead className="text-center text-xs font-semibold text-muted-foreground">Grade</TableHead>
                <TableHead className="text-center text-xs font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="text-center text-xs font-semibold text-muted-foreground">Feedback</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {studentsList.map((student: any, index: number) => {
                const gradeNum = student.grade ?? 0;
                let gradeStyle = "bg-muted text-muted-foreground border-border";
                if (gradeNum >= 7) gradeStyle = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                else if (gradeNum >= 4) gradeStyle = "bg-amber-500/10 text-amber-500 border-amber-500/20";
                else if (gradeNum > 0) gradeStyle = "bg-rose-500/10 text-rose-500 border-rose-500/20";

                return (
                  <TableRow key={student.student_id || index} className="border-border/40 hover:bg-muted/30">
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {index + 1}
                    </TableCell>

                    {/* Student Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0">
                          {student.student_image_url ? (
                            <img
                              src={student.student_image_url}
                              alt={student.student_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-semibold text-sm text-foreground">
                            {student.student_name || "Unknown Student"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {student.student_email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Grade */}
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`text-xs font-bold px-2.5 py-0.5 border ${gradeStyle}`}>
                        <Award className="h-3 w-3 mr-1" />
                        {student.grade !== undefined && student.grade !== null ? `${student.grade}/10` : "N/A"}
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      {student.submitted ? (
                        <Badge variant="outline" className="text-xs border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-medium gap-1">
                          <CheckCircle2 className="w-3 w-3" /> Submitted
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs border-rose-500/30 bg-rose-500/10 text-rose-500 font-medium gap-1">
                          <XCircle className="w-3 w-3" /> Pending
                        </Badge>
                      )}
                    </TableCell>

                    {/* Feedback Modal */}
                    <TableCell className="text-center">
                      {student.feedback ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-primary hover:bg-primary/10 gap-1">
                              <MessageSquare className="w-3.5 h-3.5" /> View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg border-border/80 bg-card text-card-foreground shadow-2xl rounded-2xl">
                            <DialogHeader className="space-y-1 text-left">
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                  <MessageSquare className="h-5 w-5" />
                                </div>
                                <DialogTitle className="text-xl font-bold text-foreground">
                                  Feedback for {student.student_name}
                                </DialogTitle>
                              </div>
                              <DialogDescription className="text-xs text-muted-foreground">
                                Instructor remarks and evaluation notes.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="p-4 rounded-xl border border-border/60 bg-muted/30 text-sm text-foreground leading-relaxed whitespace-pre-line">
                              {student.feedback}
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
