import { useState, useMemo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  FileText,
  ArrowRight,
  Search,
  Sparkles,
  Calendar,
  FolderX,
  RefreshCw,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import { studentJoinGroupNote } from "@/redux/slice/noteSlice";
import NoteCardSkeleton from "@/components/skeletons/NoteCardSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Notes() {
  const { notes, loading, error } = useAppSelector((state) => state.notes);
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = () => {
    dispatch(studentJoinGroupNote());
  };

  useEffect(() => {
    if (notes.length === 0) {
      loadData();
    }
  }, [dispatch, notes.length]);

  // Filter notes by title or content preview
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title?.toLowerCase().includes(q) ||
        note.id?.toString().toLowerCase().includes(q)
    );
  }, [notes, searchQuery]);

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* ── 1. Hero Header Banner ──────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-r from-card via-card/90 to-blue-500/10 dark:to-blue-500/20 p-6 sm:p-8 shadow-sm">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 dark:bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Study Repository</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Teacher Notes & Materials
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Read and review study guides, lecture summaries, and reference materials shared by your teachers.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={loadData}
              className="rounded-xl border-border/80 hover:bg-accent"
              title="Refresh Notes"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. Search & Controls Bar ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Available Notes ({filteredNotes.length})
          </h2>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search note by topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl border-border/80 text-xs h-9"
          />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Error loading notes: {error}</span>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && notes.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <NoteCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && notes.length === 0 && !error && (
        <Card className="border-dashed border-border/80 bg-muted/20 rounded-2xl">
          <CardContent className="py-16 text-center space-y-3">
            <div className="p-3 bg-muted rounded-full w-fit mx-auto text-muted-foreground">
              <FolderX className="h-8 w-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-semibold text-base text-foreground">No Notes Available</h3>
              <p className="text-xs text-muted-foreground">
                Your teachers haven't published study notes for your joined groups yet.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && filteredNotes.length === 0 && notes.length > 0 && (
        <Card className="border-dashed border-border/80 bg-muted/20 rounded-2xl">
          <CardContent className="py-12 text-center space-y-2">
            <p className="font-semibold text-sm text-foreground">No matching notes</p>
            <p className="text-xs text-muted-foreground">
              No study notes matched your search query "{searchQuery}".
            </p>
          </CardContent>
        </Card>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => {
          const createdDate = note.created_at
            ? new Date(note.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Recently";

          return (
            <Link key={note.id} to={`/view-notes/${note.id}`} className="group">
              <Card className="h-full flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card to-card/60 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

                <CardContent className="p-6 flex flex-col justify-between flex-1 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0 group-hover:scale-110 transition-transform">
                        <FileText className="h-5 w-5" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-semibold bg-secondary text-secondary-foreground"
                      >
                        Study Note
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                        {note.title || "Untitled Note"}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 opacity-60" />
                        <span>{createdDate}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      Click to open and read the full contents, code snippets, and study material.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary group-hover:underline">
                    <span className="flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" /> Read Full Note
                    </span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
