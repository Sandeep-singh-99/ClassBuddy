import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, PlusCircle, RatioIcon, User2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { GroupJoinStudents } from "@/redux/slice/tSlice";
import StudentsList from "./components/StudentsList";
import { teacherNotes } from "@/redux/slice/noteSlice";
import NotesList from "./components/NotesList";

export default function THome() {
  const dispatch = useAppDispatch();

  const { teachers } = useAppSelector((state) => state.teachers);

  const { count } = useAppSelector((state) => state.notes);

  useEffect(() => {
    dispatch(GroupJoinStudents());
    dispatch(teacherNotes());
  }, [dispatch]);

  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="">Welcome to your ClassBuddy dashboard</p>
        </div>

        <Link to={"/t-dashboard/create-notes"}>
          <Button>
            <PlusCircle className="h-4 w-4" />
            Create Notes
          </Button>
        </Link>
      </div>

      {/* Stats */}

      <div className="grid md:grid-cols-3 mb-8 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Notes</CardTitle>
            <FileText className="w-4 h-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{count}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +5 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Total Students
            </CardTitle>
            <User2 className="w-4 h-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers[0]?.students_count}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +5 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Quiz</CardTitle>
            <RatioIcon className="w-4 h-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Coming soon...</div>
            <p className="text-xs text-muted-foreground mt-1">
              +5 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Articles */}
      <StudentsList />
      <NotesList />
    </main>
  );
}
