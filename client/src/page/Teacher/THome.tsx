import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  FileText,
  PlusCircle,
  Users,
  ClipboardList,
  Sparkles,
  ArrowUpRight,
  FolderOpen,
  DollarSign,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { GroupJoinStudents } from "@/redux/slice/tSlice";
import StudentsList from "./components/StudentsList";
import { teacherNotes } from "@/redux/slice/noteSlice";
import NotesList from "./components/NotesList";
import { TotalAssignment } from "@/redux/slice/assignmentSlice";
import { Badge } from "@/components/ui/badge";

export default function THome() {
  const dispatch = useAppDispatch();

  const { teachers } = useAppSelector((state) => state.teachers);
  const { count } = useAppSelector((state) => state.notes);
  const { totalAssignments } = useAppSelector((state) => state.assignments);

  const studentsCount = teachers[0]?.students_count ?? 0;
  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    dispatch(GroupJoinStudents());
    dispatch(teacherNotes());
    dispatch(TotalAssignment());
  }, [dispatch]);

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* ── 1. Hero Welcome Banner ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-r from-card via-card/90 to-primary/10 dark:to-primary/20 p-6 sm:p-8 shadow-sm">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 dark:bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Teacher Workspace</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground flex items-center gap-1 font-normal">
                <Calendar className="h-3 w-3" />
                {currentDateFormatted}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Welcome back to ClassBuddy! 👋
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Manage your student roster, post class notes, assign coursework, and track earnings all from your unified teacher dashboard.
            </p>
          </div>

          {/* Quick Action CTA buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to="/t-dashboard/create-notes">
              <Button
                size="lg"
                className="rounded-xl gap-2 font-semibold shadow-md bg-primary text-primary-foreground transition-all duration-300 hover:shadow-lg"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create Notes</span>
              </Button>
            </Link>
            <Link to="/t-dashboard/assignments">
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl gap-2 font-semibold border-border/80 hover:bg-accent"
              >
                <ClipboardList className="h-4 w-4" />
                <span>Assignments</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. KPI Metrics Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Notes KPI */}
        <Card className="relative overflow-hidden border border-border/60 bg-gradient-to-br from-card via-card/90 to-emerald-500/5 dark:to-emerald-500/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Notes
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <FileText className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold tracking-tight text-foreground">
                {count}
              </div>
              <Link
                to="/t-dashboard/view-notes"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 hover:underline"
              >
                View All <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span>Published study materials</span>
            </p>
          </CardContent>
        </Card>

        {/* Students KPI */}
        <Card className="relative overflow-hidden border border-border/60 bg-gradient-to-br from-card via-card/90 to-blue-500/5 dark:to-blue-500/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Enrolled Students
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold tracking-tight text-foreground">
                {studentsCount}
              </div>
              <Badge variant="outline" className="text-[11px] font-semibold border-blue-500/30 text-blue-500">
                Active Batch
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Registered in your group
            </p>
          </CardContent>
        </Card>

        {/* Assignments KPI */}
        <Card className="relative overflow-hidden border border-border/60 bg-gradient-to-br from-card via-card/90 to-indigo-500/5 dark:to-indigo-500/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Assignments
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <ClipboardList className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold tracking-tight text-foreground">
                {totalAssignments}
              </div>
              <Link
                to="/t-dashboard/assignments"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 hover:underline"
              >
                Manage <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Coursework & assessments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. Quick Action Navigation Bar ──────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/t-dashboard/create-notes" className="group">
          <Card className="p-4 rounded-xl border border-border/60 bg-card hover:bg-accent/50 transition-all duration-300 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
              <PlusCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">New Note</p>
              <p className="text-[11px] text-muted-foreground">Publish material</p>
            </div>
          </Card>
        </Link>

        <Link to="/t-dashboard/assignments" className="group">
          <Card className="p-4 rounded-xl border border-border/60 bg-card hover:bg-accent/50 transition-all duration-300 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform">
              <ClipboardList className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Assignments</p>
              <p className="text-[11px] text-muted-foreground">Check tasks</p>
            </div>
          </Card>
        </Link>

        <Link to="/t-dashboard/docs" className="group">
          <Card className="p-4 rounded-xl border border-border/60 bg-card hover:bg-accent/50 transition-all duration-300 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
              <FolderOpen className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Resources</p>
              <p className="text-[11px] text-muted-foreground">Course files</p>
            </div>
          </Card>
        </Link>

        <Link to="/t-dashboard/payment" className="group">
          <Card className="p-4 rounded-xl border border-border/60 bg-card hover:bg-accent/50 transition-all duration-300 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Payments</p>
              <p className="text-[11px] text-muted-foreground">Plans & revenue</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* ── 4. Main Lists (Students Roster & Notes) ────────────────────── */}
      <div className="space-y-8">
        <StudentsList />
        <NotesList />
      </div>
    </main>
  );
}
