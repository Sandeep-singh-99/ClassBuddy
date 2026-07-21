import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/hooks/hooks";
import { Link } from "react-router-dom";
import DeleteBtn from "./DeleteBtn";
import {
  FileText,
  Search,
  Calendar,
  Eye,
  Edit,
  PlusCircle,
  FolderX,
} from "lucide-react";

export default function NotesList() {
  const { notes } = useAppSelector((state) => state.notes);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        n.title?.toLowerCase().includes(q) ||
        n.id?.toString().toLowerCase().includes(q)
    );
  }, [notes, searchQuery]);

  return (
    <Card className="mb-8 border border-border/60 shadow-sm rounded-2xl bg-card overflow-hidden">
      <CardHeader className="p-6 pb-4 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              Study Notes & Materials
              <Badge
                variant="secondary"
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground"
              >
                {notes.length} Total
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Manage study guides and notes created for your students
            </CardDescription>
          </div>
        </div>

        {/* Controls: Search & Create Note Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search note topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl border-border/80"
            />
          </div>

          <Link to="/t-dashboard/create-notes">
            <Button
              size="sm"
              className="rounded-xl gap-1.5 h-9 text-xs font-semibold shadow-xs"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Create Note</span>
            </Button>
          </Link>
        </div>
      </CardHeader>

      {!notes.length ? (
        <CardContent className="py-12 text-center text-muted-foreground space-y-3">
          <div className="p-3 bg-muted rounded-full w-fit mx-auto">
            <FolderX className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <p className="font-semibold text-sm text-foreground">No Notes Created Yet</p>
            <p className="text-xs text-muted-foreground">
              Create notes to share study material and summaries with your students.
            </p>
          </div>
          <Link to="/t-dashboard/create-notes" className="inline-block pt-2">
            <Button size="sm" variant="outline" className="rounded-xl gap-2">
              <PlusCircle className="h-4 w-4" /> Create First Note
            </Button>
          </Link>
        </CardContent>
      ) : filteredNotes.length === 0 ? (
        <CardContent className="py-10 text-center text-muted-foreground space-y-2">
          <p className="font-medium text-sm text-foreground">No matching notes</p>
          <p className="text-xs text-muted-foreground">
            No notes matched your search query "{searchQuery}".
          </p>
        </CardContent>
      ) : (
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40 dark:bg-muted/20">
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted-foreground py-3 pl-6">
                    Note Topic
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground py-3">
                    Created Date
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground py-3 text-right pr-6">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredNotes.map((note) => {
                  const createdDate = note.created_at
                    ? new Date(note.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Recently";

                  return (
                    <TableRow
                      key={note.id}
                      className="border-border/40 hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="py-3.5 pl-6 font-semibold text-sm text-foreground">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>{note.title}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 opacity-60 shrink-0" />
                          <span>{createdDate}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/view-notes/${note.id}`}>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 rounded-lg gap-1 text-xs font-medium hover:bg-secondary/80"
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </Button>
                          </Link>

                          <Link to={`/t-dashboard/update-note/${note.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-lg gap-1 text-xs font-medium border-border/70"
                            >
                              <Edit className="h-3.5 w-3.5" /> Update
                            </Button>
                          </Link>

                          <DeleteBtn noteId={note.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
