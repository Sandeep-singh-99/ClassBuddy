import { useState, useMemo, useEffect } from "react";
import DocCardSkeleton from "@/components/skeletons/DocCardSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { DocsStudentFetch } from "@/redux/slice/docsSlice";
import {
  AlertCircle,
  FileText,
  Search,
  Sparkles,
  Calendar,
  FolderOpen,
  FolderX,
  RefreshCw,
  Eye,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DocView() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { docs, error, loading } = useAppSelector((state) => state.docs);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = () => {
    dispatch(DocsStudentFetch());
  };

  useEffect(() => {
    if (docs.length === 0) {
      loadData();
    }
  }, [dispatch, docs.length]);

  // Filter docs by filename or owner name
  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return docs;
    const q = searchQuery.toLowerCase();
    return docs.filter(
      (doc) =>
        doc.filename?.toLowerCase().includes(q) ||
        doc.owner?.full_name?.toLowerCase().includes(q) ||
        doc.id?.toString().toLowerCase().includes(q)
    );
  }, [docs, searchQuery]);

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
              <span>Resource Library</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Course Resources & Files
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Explore uploaded course materials, PDF handouts, slides, and reference files provided by your teachers.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={loadData}
              className="rounded-xl border-border/80 hover:bg-accent"
              title="Refresh Resources"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. Search & Controls Bar ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Available Documents ({filteredDocs.length})
          </h2>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by filename or teacher..."
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
          <span>Error loading documents: {error}</span>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && docs.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <DocCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && docs.length === 0 && !error && (
        <Card className="border-dashed border-border/80 bg-muted/20 rounded-2xl">
          <CardContent className="py-16 text-center space-y-3">
            <div className="p-3 bg-muted rounded-full w-fit mx-auto text-muted-foreground">
              <FolderX className="h-8 w-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-semibold text-base text-foreground">No Documents Found</h3>
              <p className="text-xs text-muted-foreground">
                Your teachers haven't uploaded resource files for your joined groups yet.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && filteredDocs.length === 0 && docs.length > 0 && (
        <Card className="border-dashed border-border/80 bg-muted/20 rounded-2xl">
          <CardContent className="py-12 text-center space-y-2">
            <p className="font-semibold text-sm text-foreground">No matching documents</p>
            <p className="text-xs text-muted-foreground">
              No documents matched your search query "{searchQuery}".
            </p>
          </CardContent>
        </Card>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => {
          const createdDate = doc.created_at
            ? new Date(doc.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Recently";

          const fileExt = doc.filename
            ? doc.filename.split(".").pop()?.toUpperCase() || "FILE"
            : "DOC";

          const ownerInitials = doc.owner?.full_name
            ? doc.owner.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : "TC";

          return (
            <Card
              key={doc.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card to-card/60 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              onClick={() => navigate(`/docs/${doc.id}`)}
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

              <CardContent className="p-6 flex flex-col justify-between flex-1 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0 group-hover:scale-110 transition-transform">
                      <FileText className="h-5 w-5" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-bold uppercase tracking-wider bg-secondary text-secondary-foreground"
                    >
                      {fileExt}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                      {doc.filename || "Untitled Document"}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 opacity-60" />
                      <span>{createdDate}</span>
                    </div>
                  </div>
                </div>

                {/* Teacher Owner Row */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 dark:bg-muted/20 border border-border/40">
                  <Avatar className="h-8 w-8 border border-border/60">
                    <AvatarImage src={doc.owner?.image_url} alt={doc.owner?.full_name} />
                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                      {ownerInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-xs text-foreground truncate">
                      {doc.owner?.full_name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Instructor</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary group-hover:underline">
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> View Resource
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
