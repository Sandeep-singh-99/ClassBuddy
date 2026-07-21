import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  File,
  FileText,
  FileCode,
  Image as ImageIcon,
  FolderKanban,
  Search,
  LayoutGrid,
  List as ListIcon,
  Calendar,
  Eye,
  ExternalLink,
  RotateCw,
  Sparkles,
  ArrowUpDown,
  User,
  Clock,
  HardDrive,
} from "lucide-react";

import DocsForm from "./components/DocsForm";
import DocsDeleteBtn from "./components/DocsDeleteBtn";
import DocCardSkeleton from "@/components/skeletons/DocCardSkeleton";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { DocsFetch } from "@/redux/slice/docsSlice";
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
type SortOption = "newest" | "oldest" | "name";

export default function Docs() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { docs, loading } = useAppSelector((state) => state.docs);

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  useEffect(() => {
    dispatch(DocsFetch());
  }, [dispatch]);

  // Helper to determine file extension & badge style
  const getFileTypeInfo = (filename?: string) => {
    if (!filename) return { ext: "DOC", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", icon: FileText };
    const ext = filename.split(".").pop()?.toUpperCase() || "DOC";

    if (["PDF"].includes(ext)) {
      return { ext, color: "bg-rose-500/10 text-rose-500 border-rose-500/20", icon: FileText };
    }
    if (["DOC", "DOCX"].includes(ext)) {
      return { ext, color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: FileText };
    }
    if (["PNG", "JPG", "JPEG", "SVG", "WEBP"].includes(ext)) {
      return { ext, color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: ImageIcon };
    }
    if (["JS", "TS", "PY", "HTML", "CSS", "JSON", "CPP", "JAVA"].includes(ext)) {
      return { ext, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: FileCode };
    }
    return { ext, color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", icon: File };
  };

  // Filter & sort docs
  const processedDocs = useMemo(() => {
    if (!docs || !Array.isArray(docs)) return [];

    let filtered = docs.filter((doc) => {
      const nameMatch = (doc.filename || "").toLowerCase().includes(searchQuery.toLowerCase());
      const ownerMatch = (doc.owner?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatch || ownerMatch;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
      if (sortBy === "name") {
        return (a.filename || "").localeCompare(b.filename || "");
      }
      return 0;
    });
  }, [docs, searchQuery, sortBy]);

  const latestDocDate = useMemo(() => {
    if (!docs || docs.length === 0) return null;
    const sorted = [...docs].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
    return sorted[0]?.created_at ? format(new Date(sorted[0].created_at), "MMM dd, yyyy") : null;
  }, [docs]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <FolderKanban className="h-7 w-7" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
              Documents Library
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Upload, manage, and share reference documents, slides, and learning materials.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => dispatch(DocsFetch())}
            title="Refresh Documents"
            className="border-border hover:bg-muted"
          >
            <RotateCw className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`} />
          </Button>

          <DocsForm />
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 bg-card/80 backdrop-blur-sm shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Documents</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{docs?.length || 0}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <File className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 backdrop-blur-sm shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Latest Upload</p>
              <h3 className="text-lg font-bold text-foreground mt-1">
                {latestDocDate || "No files yet"}
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
              <p className="text-xs font-medium text-muted-foreground">Cloud Sync</p>
              <Badge variant="outline" className="mt-1 border-primary/20 bg-primary/5 text-primary font-semibold">
                <HardDrive className="h-3 w-3 mr-1" /> Active Storage
              </Badge>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search, Sort & View Mode Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents by name or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/80 border-border text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-primary h-9 text-sm"
          />
        </div>

        {/* Sort & Layout Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 border-border text-xs font-medium">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span>Sort: {sortBy === "newest" ? "Newest" : sortBy === "oldest" ? "Oldest" : "Name A-Z"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card text-card-foreground border-border shadow-md">
              <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("oldest")}>Oldest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name")}>Name (A-Z)</DropdownMenuItem>
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

      {/* Loading Skeleton */}
      {loading && (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {Array.from({ length: 6 }).map((_, index) => (
            <DocCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && processedDocs.length === 0 && (
        <Card className="border-dashed border-border/80 bg-card/40 p-12 text-center flex flex-col items-center justify-center space-y-4 rounded-2xl">
          <div className="p-4 rounded-full bg-primary/10 text-primary">
            <FolderKanban className="h-10 w-10" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-lg font-bold text-foreground">No documents found</h3>
            <p className="text-xs text-muted-foreground">
              {searchQuery
                ? `No document matched "${searchQuery}". Try clearing your search query.`
                : "You haven't uploaded any documents yet. Click 'Upload Document' to upload course files."}
            </p>
          </div>
          <DocsForm />
        </Card>
      )}

      {/* Document Grid & List Views */}
      {!loading && processedDocs.length > 0 && (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {processedDocs.map((doc) => {
            const { ext, color, icon: FileTypeIcon } = getFileTypeInfo(doc.filename);

            if (viewMode === "list") {
              return (
                <div
                  key={doc.id}
                  onClick={() => navigate(`/docs/${doc.id}`)}
                  className="group cursor-pointer rounded-xl border border-border/60 bg-card/80 hover:bg-muted/40 transition-all duration-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`p-2.5 rounded-xl border shrink-0 ${color}`}>
                      <FileTypeIcon className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">
                        {doc.filename || "Untitled Document"}
                      </h3>
                      {doc.owner?.full_name && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" /> {doc.owner.full_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40 text-xs">
                    <Badge variant="outline" className={`text-[10px] font-bold border ${color}`}>
                      {ext}
                    </Badge>

                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {doc.created_at ? format(new Date(doc.created_at), "MMM dd, yyyy") : "Recent"}
                    </span>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Link to={`/docs/${doc.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs gap-1 hover:bg-primary/10 hover:text-primary"
                          title="View Document Details"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>
                      </Link>

                      {doc.file_url && (
                        <a href={doc.file_url} target="_blank" rel="noreferrer">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs gap-1 hover:bg-primary/10 hover:text-primary"
                            title="Open File"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Open
                          </Button>
                        </a>
                      )}

                      <DocsDeleteBtn docId={doc.id} />
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Card
                key={doc.id}
                onClick={() => navigate(`/docs/${doc.id}`)}
                className="group relative cursor-pointer rounded-2xl border-border/60 bg-card/80 backdrop-blur-sm hover:bg-muted/30 transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md overflow-hidden"
              >
                <CardHeader className="p-5 pb-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`p-2.5 rounded-xl border shrink-0 ${color}`}>
                      <FileTypeIcon className="h-6 w-6" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className={`text-[10px] font-bold border ${color}`}>
                        {ext}
                      </Badge>
                      <div onClick={(e) => e.stopPropagation()}>
                        <DocsDeleteBtn docId={doc.id} />
                      </div>
                    </div>
                  </div>

                  <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {doc.filename || "Untitled Document"}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-4 flex-1 flex flex-col justify-between">
                  <CardDescription className="text-xs text-muted-foreground flex flex-col gap-1.5">
                    {doc.owner?.full_name && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" /> Owner: {doc.owner.full_name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" /> Uploaded:{" "}
                      {doc.created_at ? format(new Date(doc.created_at), "MMM dd, yyyy · HH:mm") : "Recent"}
                    </span>
                  </CardDescription>

                  <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
                    <Link
                      to={`/docs/${doc.id}`}
                      className="text-primary font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Details <Eye className="h-3.5 w-3.5" />
                    </Link>

                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
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
