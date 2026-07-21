import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  FileText,
  AlertCircle,
  ArrowRight,
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
  Calendar,
  Edit3,
  Trash2,
  Eye,
  RotateCw,
  Sparkles,
  BookOpen,
  Clock,
  ArrowUpDown,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { teacherNotes, deleteNoteById } from "@/redux/slice/noteSlice";
import NoteCardSkeleton from "@/components/skeletons/NoteCardSkeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

export default function ViewNotes() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notes, loading, error } = useAppSelector((state) => state.notes);

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(teacherNotes());
  }, [dispatch]);

  // Strip markdown tags for clean card excerpt preview
  const getCleanSnippet = (content?: string) => {
    if (!content) return "No content preview available.";
    const clean = content
      .replace(/#+\s?/g, "") // remove headers
      .replace(/(\*\*|__)(.*?)\1/g, "$2") // remove bold
      .replace(/(\*|_)(.*?)\1/g, "$2") // remove italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // remove links
      .replace(/`{1,3}.*?`{1,3}/gs, "") // remove code blocks
      .trim();
    return clean.length > 140 ? clean.substring(0, 140) + "..." : clean;
  };

  // Filter and sort notes
  const processedNotes = useMemo(() => {
    if (!notes || !Array.isArray(notes)) return [];

    let filtered = notes.filter((note) => {
      const titleMatch = (note.title || "").toLowerCase().includes(searchQuery.toLowerCase());
      const contentMatch = (note.content || "").toLowerCase().includes(searchQuery.toLowerCase());
      return titleMatch || contentMatch;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
      if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return 0;
    });
  }, [notes, searchQuery, sortBy]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      setDeletingId(id);
      try {
        await dispatch(deleteNoteById(id)).unwrap();
        toast.success("Note deleted successfully.");
      } catch (err: any) {
        toast.error(err || "Failed to delete note.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const latestNoteDate = useMemo(() => {
    if (!notes || notes.length === 0) return null;
    const sorted = [...notes].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
    return sorted[0]?.created_at ? format(new Date(sorted[0].created_at), "MMM dd, yyyy") : null;
  }, [notes]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <FileText className="h-7 w-7" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
              My Teaching Notes
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Manage, publish, and organize your educational notes and study materials.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => dispatch(teacherNotes())}
            title="Refresh Notes"
            className="border-border hover:bg-muted"
          >
            <RotateCw className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`} />
          </Button>

          <Link to="/t-dashboard/create-notes">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md shadow-primary/20 gap-2 cursor-pointer">
              <Plus className="h-4 w-4" />
              <span>Create New Note</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 bg-card/80 backdrop-blur-sm shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Published Notes</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{notes?.length || 0}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 backdrop-blur-sm shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Latest Update</p>
              <h3 className="text-lg font-bold text-foreground mt-1">
                {latestNoteDate || "No notes yet"}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 backdrop-blur-sm shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Status</p>
              <Badge variant="outline" className="mt-1 border-primary/20 bg-primary/5 text-primary font-semibold">
                <Sparkles className="h-3 w-3 mr-1" /> Ready for Students
              </Badge>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search, Filter & View Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/80 border-border text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-primary h-9 text-sm"
          />
        </div>

        {/* Sort & Layout Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 border-border text-xs font-medium">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span>Sort: {sortBy === "newest" ? "Newest" : sortBy === "oldest" ? "Oldest" : "Title A-Z"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card text-card-foreground border-border shadow-md">
              <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("oldest")}>Oldest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("title")}>Title (A-Z)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode Switcher */}
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

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">Error loading notes: {error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {Array.from({ length: 6 }).map((_, index) => (
            <NoteCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && processedNotes.length === 0 && (
        <Card className="border-dashed border-border/80 bg-card/40 p-12 text-center flex flex-col items-center justify-center space-y-4 rounded-2xl">
          <div className="p-4 rounded-full bg-primary/10 text-primary">
            <BookOpen className="h-10 w-10" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-lg font-bold text-foreground">No notes found</h3>
            <p className="text-xs text-muted-foreground">
              {searchQuery
                ? `No notes matched "${searchQuery}". Try clearing your search query.`
                : "You haven't created any notes yet. Create your first note to share materials with students."}
            </p>
          </div>
          <Link to="/t-dashboard/create-notes">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 cursor-pointer shadow-md">
              <Plus className="h-4 w-4" /> Create New Note
            </Button>
          </Link>
        </Card>
      )}

      {/* Notes Display */}
      {!loading && processedNotes.length > 0 && (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {processedNotes.map((note) => {
            const cleanExcerpt = getCleanSnippet(note.content);

            if (viewMode === "list") {
              return (
                <div
                  key={note.id}
                  onClick={() => navigate(`/view-notes/${note.id}`)}
                  className="group cursor-pointer rounded-xl border border-border/60 bg-card/80 hover:bg-muted/40 transition-all duration-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:shadow-md"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">
                        {note.title || "Untitled Note"}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 pl-7">
                      {cleanExcerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40 text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {note.created_at ? format(new Date(note.created_at), "MMM dd, yyyy") : "Recent"}
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs gap-1 hover:bg-primary/10 hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/view-notes/${note.id}`);
                        }}
                        title="View Note"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs gap-1 hover:bg-primary/10 hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/t-dashboard/update-note/${note.id}`);
                        }}
                        title="Edit Note"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                        disabled={deletingId === note.id}
                        onClick={(e) => handleDelete(e, note.id)}
                        title="Delete Note"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Card
                key={note.id}
                onClick={() => navigate(`/view-notes/${note.id}`)}
                className="group relative cursor-pointer rounded-2xl border-border/60 bg-card/80 backdrop-blur-sm hover:bg-muted/30 transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md overflow-hidden"
              >
                <CardHeader className="p-5 pb-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>

                    <Badge variant="outline" className="text-[10px] font-normal border-border bg-background text-muted-foreground gap-1">
                      <Calendar className="h-3 w-3" />
                      {note.created_at ? format(new Date(note.created_at), "MMM dd, yyyy") : "Recent"}
                    </Badge>
                  </div>

                  <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug pt-1">
                    {note.title || "Untitled Note"}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-4 flex-1 flex flex-col justify-between">
                  <CardDescription className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {cleanExcerpt}
                  </CardDescription>

                  <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
                    <span className="text-primary font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Read Note <ArrowRight className="h-3.5 w-3.5" />
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/t-dashboard/update-note/${note.id}`);
                        }}
                        title="Edit Note"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                        disabled={deletingId === note.id}
                        onClick={(e) => handleDelete(e, note.id)}
                        title="Delete Note"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
