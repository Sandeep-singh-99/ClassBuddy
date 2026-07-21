import { useState, useMemo } from "react";
import { useAppSelector } from "@/hooks/hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ClipboardList, Search, Calendar, CheckCircle2, Clock, AlertTriangle, FileX } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AssignmentLists() {
  const { ownerAssignmentStats, loading } = useAppSelector(
    (state) => state.submissions
  );

  const [searchQuery, setSearchQuery] = useState("");

  const assignments = ownerAssignmentStats?.assignments || [];

  const filteredAssignments = useMemo(() => {
    if (!searchQuery.trim()) return assignments;
    const q = searchQuery.toLowerCase();
    return assignments.filter(
      (a: any) =>
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.group_name?.toLowerCase().includes(q)
    );
  }, [assignments, searchQuery]);

  return (
    <Card className="w-full border border-border/60 shadow-sm rounded-2xl bg-card overflow-hidden">
      <CardHeader className="p-6 pb-4 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              My Course Assignments
              <Badge
                variant="secondary"
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground"
              >
                {assignments.length} Total
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Overview of your submitted and upcoming course tasks
            </CardDescription>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search assignment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl border-border/80"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center items-center py-16 text-muted-foreground space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-xs font-medium">Loading assignments...</span>
          </div>
        ) : assignments.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground space-y-2">
            <FileX className="h-8 w-8 mx-auto opacity-50" />
            <p className="font-semibold text-sm text-foreground">No Assignments Found</p>
            <p className="text-xs text-muted-foreground">
              You haven't been assigned any tasks in your joined groups yet.
            </p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground space-y-1">
            <p className="font-medium text-sm text-foreground">No matching assignments</p>
            <p className="text-xs text-muted-foreground">
              No assignments matched your search query "{searchQuery}".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40 dark:bg-muted/20">
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted-foreground py-3 pl-6">
                    Title & Description
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground py-3">
                    Group
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground py-3">
                    Due Date
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground py-3">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground py-3 text-right pr-6">
                    Submitted At
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredAssignments.map((a: any) => {
                  const dueDate = a.due_date
                    ? new Date(a.due_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A";

                  const submittedDate = a.submitted_at
                    ? new Date(a.submitted_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—";

                  return (
                    <TableRow
                      key={a.id}
                      className="border-border/40 hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="py-3.5 pl-6">
                        <div className="space-y-0.5">
                          <span className="font-bold text-sm text-foreground block">
                            {a.title}
                          </span>
                          {a.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {a.description}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <Badge
                          variant="outline"
                          className="text-[11px] font-medium border-primary/20 bg-primary/5 text-primary"
                        >
                          {a.group_name || "General Group"}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 opacity-60" />
                          <span>{dueDate}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5">
                        {a.is_completed ? (
                          <Badge className="bg-emerald-500 text-white font-semibold text-[11px] hover:bg-emerald-600 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="h-3 w-3" /> Completed
                          </Badge>
                        ) : a.is_past_due ? (
                          <Badge variant="destructive" className="font-semibold text-[11px] flex items-center gap-1 w-fit">
                            <AlertTriangle className="h-3 w-3" /> Past Due
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="font-semibold text-[11px] flex items-center gap-1 w-fit">
                            <Clock className="h-3 w-3" /> Pending
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="py-3.5 text-right pr-6 text-xs text-muted-foreground font-mono">
                        {submittedDate}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
