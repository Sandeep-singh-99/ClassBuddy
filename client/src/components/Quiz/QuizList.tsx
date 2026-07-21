import { Suspense, lazy, useState, useMemo } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Search,
  Clock,
  AlertCircle,
  Play,
  Trash2,
  Eye,
  Calendar,
  BookOpen,
  Award,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { DeleteInterviewPrep } from "@/redux/slice/interviewSlice";
import QuizResult from "./QuizResult";
import QuizCardSkeleton from "@/components/skeletons/QuizCardSkeleton";
import ButtonSkeleton from "@/components/skeletons/ButtonSkeleton";

const QuizFormComponents = lazy(() => import("./QuizFormComponents"));

type StatusFilter = "all" | "completed" | "generating" | "error";

export default function QuizList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((state) => state.interview);

  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter quizzes by search query & status
  const filteredQuizzes = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return data.filter((quiz) => {
      const matchesSearch =
        (quiz.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (quiz.description || "").toLowerCase().includes(searchQuery.toLowerCase());

      const status = quiz.status || "completed";
      const matchesStatus =
        statusFilter === "all" ? true : status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, statusFilter]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this quiz history?")) {
      setDeletingId(id);
      try {
        await dispatch(DeleteInterviewPrep(id)).unwrap();
        toast.success("Quiz deleted successfully.");
      } catch (err) {
        toast.error("Failed to delete quiz.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getScoreColor = (score: number) => {
    let normalized = score;
    if (score <= 2 && score > 0) normalized = score * 50;
    if (normalized >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (normalized >= 50) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-rose-500 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <>
      <Card className="w-full border-border/60 shadow-md bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                <BookOpen className="h-7 w-7 text-primary" />
                <span>Recent Quizzes</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm mt-1">
                Review past performance, retake quizzes, or trigger new AI assessments
              </CardDescription>
            </div>

            <Suspense fallback={<ButtonSkeleton />}>
              <QuizFormComponents />
            </Suspense>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by quiz title or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/80 border-border text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-primary h-9 text-sm"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-1 text-xs font-medium self-start sm:self-auto">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  statusFilter === "all"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("completed")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  statusFilter === "completed"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setStatusFilter("generating")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  statusFilter === "generating"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Generating
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              <QuizCardSkeleton />
              <QuizCardSkeleton />
            </div>
          ) : filteredQuizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredQuizzes.map((quiz: any) => {
                const isGenerating = quiz.status === "generating";
                const isError = quiz.status === "error";
                const isCompleted = quiz.status === "completed" || !quiz.status;

                let displayScore = quiz.score;
                if (displayScore <= 2 && displayScore > 0) displayScore = displayScore * 50;
                displayScore = Math.min(100, Math.max(0, Math.round(displayScore)));

                return (
                  <div
                    key={quiz.id}
                    className={`group relative rounded-xl border border-border/60 bg-background/60 hover:bg-muted/40 transition-all duration-200 p-5 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md ${
                      isGenerating ? "opacity-90 border-amber-500/40 bg-amber-500/5" : ""
                    }`}
                  >
                    {/* Header: Title & Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {quiz.name || "Untitled Quiz"}
                        </h3>
                        {quiz.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {quiz.description}
                          </p>
                        )}
                      </div>

                      {/* Status Badges */}
                      {isGenerating && (
                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1 animate-pulse font-medium text-xs">
                          <Clock className="h-3 w-3" /> Processing...
                        </Badge>
                      )}
                      {isError && (
                        <Badge variant="destructive" className="gap-1 font-medium text-xs">
                          <AlertCircle className="h-3 w-3" /> Error
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge variant="outline" className={`gap-1 font-semibold text-xs border ${getScoreColor(quiz.score)}`}>
                          <Award className="h-3.5 w-3.5" /> {displayScore}%
                        </Badge>
                      )}
                    </div>

                    {/* Score Progress Bar if Completed */}
                    {isCompleted && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-muted-foreground">Accuracy Score</span>
                          <span className="text-foreground font-bold">{displayScore}%</span>
                        </div>
                        <Progress value={displayScore} className="h-2 bg-muted" />
                      </div>
                    )}

                    {/* Footer: Date & Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>
                          {quiz.created_at
                            ? format(new Date(quiz.created_at), "MMM dd, yyyy · HH:mm")
                            : "Recent"}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        {isCompleted && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2.5 text-xs gap-1 hover:bg-primary/10 hover:text-primary"
                              onClick={() => setSelectedQuiz(quiz)}
                              title="View Quiz Results"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Results</span>
                            </Button>

                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 px-2.5 text-xs gap-1 bg-primary/10 text-primary hover:bg-primary/20"
                              onClick={() => navigate(`/dashboard-panel/mock/${quiz.id}`)}
                              title="Take / Retake Quiz"
                            >
                              <Play className="h-3.5 w-3.5" />
                              <span>Practice</span>
                            </Button>
                          </>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                          disabled={deletingId === quiz.id}
                          onClick={(e) => handleDelete(e, quiz.id)}
                          title="Delete Quiz"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/80 rounded-2xl bg-muted/10 space-y-3">
              <div className="p-3 bg-muted rounded-full text-muted-foreground">
                <BookOpen className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground text-base">No quizzes found</h4>
                <p className="text-xs text-muted-foreground max-w-sm">
                  {searchQuery
                    ? `No quiz matched "${searchQuery}". Try clearing your search query.`
                    : "You haven't generated any AI quizzes yet. Click 'Start New Quiz' above to generate one!"}
                </p>
              </div>
            </div>
          )}

          {/* Quiz Result Modal */}
          <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-border/80 bg-card text-card-foreground shadow-2xl rounded-2xl">
              {selectedQuiz && (
                <div className="p-6">
                  <QuizResult
                    result={selectedQuiz}
                    onStartNew={() => setSelectedQuiz(null)}
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </>
  );
}
