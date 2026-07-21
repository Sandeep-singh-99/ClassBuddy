import { useEffect, useState, useMemo } from "react";
import {
  BookOpenText,
  AlertCircle,
  Search,
  LayoutGrid,
  List as ListIcon,
  RotateCw,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpDown,
} from "lucide-react";

import AssignmentForm from "./components/AssignmentForm";
import AssignmentCard from "./components/AssignmentCard";
import AssignmentCardSkeleton from "@/components/skeletons/AssignmentCardSkeleton";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { fetchTeacherAssignments } from "@/redux/slice/assignmentSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ViewMode = "grid" | "list";
type SortOption = "newest" | "oldest" | "title";

export default function TAssignment() {
  const dispatch = useAppDispatch();
  const { assignments, loading, error } = useAppSelector(
    (state) => state.assignments
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  useEffect(() => {
    dispatch(fetchTeacherAssignments());
  }, [dispatch]);

  // Filter and sort assignments
  const processedAssignments = useMemo(() => {
    if (!assignments || !Array.isArray(assignments)) return [];

    let filtered = assignments.filter((item) => {
      const titleMatch = (item.title || "").toLowerCase().includes(searchQuery.toLowerCase());
      const descMatch = (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      return titleMatch || descMatch;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.due_date || b.created_at || 0).getTime() - new Date(a.due_date || a.created_at || 0).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.due_date || a.created_at || 0).getTime() - new Date(b.due_date || b.created_at || 0).getTime();
      }
      if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return 0;
    });
  }, [assignments, searchQuery, sortBy]);

  const activeCount = useMemo(() => {
    if (!assignments) return 0;
    const now = new Date().getTime();
    return assignments.filter((a) => a.due_date && new Date(a.due_date).getTime() >= now).length;
  }, [assignments]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <BookOpenText className="h-7 w-7" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
              Assignment Dashboard
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Create course assignments, track student submissions, and manage AI-generated questions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => dispatch(fetchTeacherAssignments())}
            title="Refresh Assignments"
            className="border-border hover:bg-muted"
          >
            <RotateCw className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`} />
          </Button>

          <AssignmentForm />
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 bg-card/80 backdrop-blur-sm shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Assignments</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{assignments?.length || 0}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <BookOpenText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 backdrop-blur-sm shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active Due Dates</p>
              <h3 className="text-2xl font-bold text-emerald-500 mt-1">{activeCount}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 backdrop-blur-sm shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Evaluation Status</p>
              <Badge variant="outline" className="mt-1 border-primary/20 bg-primary/5 text-primary font-semibold">
                <Sparkles className="h-3 w-3 mr-1" /> Active Grading
              </Badge>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search, Filter & Layout Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/80 border-border text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-primary h-9 text-sm"
          />
        </div>

        {/* Sort & View Mode Switcher */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 border-border text-xs font-medium">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span>Sort: {sortBy === "newest" ? "Newest Due" : sortBy === "oldest" ? "Oldest Due" : "Title A-Z"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card text-card-foreground border-border shadow-md">
              <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest Due Date</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("oldest")}>Oldest Due Date</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("title")}>Title (A-Z)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={() => setViewMode("list")}
              title="List View"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">Error loading assignments: {error}</span>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {Array.from({ length: 6 }).map((_, index) => (
            <AssignmentCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && processedAssignments.length === 0 && (
        <Card className="border-dashed border-border/80 bg-card/40 p-12 text-center flex flex-col items-center justify-center space-y-4 rounded-2xl">
          <div className="p-4 rounded-full bg-primary/10 text-primary">
            <BookOpenText className="h-10 w-10" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-lg font-bold text-foreground">No assignments found</h3>
            <p className="text-xs text-muted-foreground">
              {searchQuery
                ? `No assignment matched "${searchQuery}". Try clearing your search query.`
                : "You haven't created any course assignments yet. Click 'Create Assignment' to publish one."}
            </p>
          </div>
          <AssignmentForm />
        </Card>
      )}

      {/* Assignments Display Grid / List */}
      {!loading && processedAssignments.length > 0 && (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {processedAssignments.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      )}
    </div>
  );
}
