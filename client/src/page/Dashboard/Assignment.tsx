import { useState, useMemo, useEffect } from "react";
import AssignmentViewCard from "@/components/Assignment/AssignmentViewCard";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { fetchAssignments } from "@/redux/slice/assignmentSlice";
import {
  AlertCircle,
  ClipboardList,
  Search,
  Sparkles,
  RefreshCw,
  FolderX,
} from "lucide-react";
import AssignmentCardSkeleton from "@/components/skeletons/AssignmentCardSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Assignment() {
  const dispatch = useAppDispatch();
  const { assignments, loading, error } = useAppSelector(
    (state) => state.assignments
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all");

  const loadData = () => {
    dispatch(fetchAssignments());
  };

  useEffect(() => {
    if (assignments.length === 0) {
      loadData();
    }
  }, [dispatch, assignments.length]);

  // Filter assignments by search query and active vs closed status
  const filteredAssignments = useMemo(() => {
    const now = new Date();
    return assignments.filter((assignment) => {
      const matchesSearch = assignment.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      const dueDate = new Date(assignment.due_date);
      const isPastDue = dueDate < now;

      if (filterTab === "open") return !isPastDue;
      if (filterTab === "closed") return isPastDue;
      return true;
    });
  }, [assignments, searchQuery, filterTab]);

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* ── 1. Hero Header Banner ──────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-r from-card via-card/90 to-indigo-500/10 dark:to-indigo-500/20 p-6 sm:p-8 shadow-sm">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Assessment Hub</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Coursework & Assignments
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Track active coursework, complete questions in interactive markdown format, and review AI-graded feedback.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={loadData}
              className="rounded-xl border-border/80 hover:bg-accent"
              title="Refresh Assignments"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. Search & Filter Bar ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Assignments ({filteredAssignments.length})
          </h2>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search assignment title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-border/80 text-xs h-9"
            />
          </div>

          <Tabs value={filterTab} onValueChange={setFilterTab} className="h-9">
            <TabsList className="rounded-xl h-9 p-1 bg-muted/60">
              <TabsTrigger value="all" className="text-xs rounded-lg px-3 py-1">
                All
              </TabsTrigger>
              <TabsTrigger value="open" className="text-xs rounded-lg px-3 py-1">
                Open
              </TabsTrigger>
              <TabsTrigger value="closed" className="text-xs rounded-lg px-3 py-1">
                Closed
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Error loading assignments: {error}</span>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && assignments.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <AssignmentCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && assignments.length === 0 && !error && (
        <Card className="border-dashed border-border/80 bg-muted/20 rounded-2xl">
          <CardContent className="py-16 text-center space-y-3">
            <div className="p-3 bg-muted rounded-full w-fit mx-auto text-muted-foreground">
              <FolderX className="h-8 w-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-semibold text-base text-foreground">No Assignments Found</h3>
              <p className="text-xs text-muted-foreground">
                Your teachers haven't published assignments for your joined groups yet.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && filteredAssignments.length === 0 && assignments.length > 0 && (
        <Card className="border-dashed border-border/80 bg-muted/20 rounded-2xl">
          <CardContent className="py-12 text-center space-y-2">
            <p className="font-semibold text-sm text-foreground">No matching assignments</p>
            <p className="text-xs text-muted-foreground">
              No assignments matched your search query or selected status filter.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssignments.map((assignment) => (
          <AssignmentViewCard key={assignment.id} assignment={assignment} />
        ))}
      </div>
    </div>
  );
}
