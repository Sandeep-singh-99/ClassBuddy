import { useEffect, useMemo } from "react";
import {
  BrainCircuit,
  Trophy,
  Sparkles,
  Target,
  BookOpen,
  Zap,
} from "lucide-react";
import PerformanceChart from "@/components/Quiz/PerformanceChart";
import QuizList from "@/components/Quiz/QuizList";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { GetAllInterviewPrep } from "@/redux/slice/interviewSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function InterviewPerPage() {
  const dispatch = useAppDispatch();
  const { data } = useAppSelector((state) => state.interview);

  useEffect(() => {
    dispatch(GetAllInterviewPrep());
  }, [dispatch]);

  const stats = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { totalQuizzes: 0, avgScore: 0, topScore: 0, completedCount: 0 };
    }

    const completed = data.filter((q) => typeof q.score === "number" && !isNaN(q.score));
    const scores = completed.map((q) => {
      let s = q.score;
      if (s <= 2 && s > 0) s = s * 50;
      return Math.min(100, Math.max(0, Math.round(s)));
    });

    const totalQuizzes = data.length;
    const completedCount = completed.length;
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const topScore = scores.length > 0 ? Math.max(...scores) : 0;

    return { totalQuizzes, avgScore, topScore, completedCount };
  }, [data]);

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <BrainCircuit className="h-7 w-7" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
              Interview Preparation & Quizzes
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Level up your subject mastery with AI-generated quizzes, performance analytics, and structured feedback.
          </p>
        </div>

        <Badge variant="outline" className="self-start md:self-auto gap-1.5 px-3 py-1.5 text-xs font-semibold border-primary/30 bg-primary/5 text-primary">
          <Sparkles className="h-3.5 w-3.5" /> AI Quiz Companion
        </Badge>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/60 bg-card/70 backdrop-blur-sm shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Quizzes</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{stats.totalQuizzes}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70 backdrop-blur-sm shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Completed</p>
              <h3 className="text-2xl font-bold text-emerald-500 mt-1">{stats.completedCount}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Zap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70 backdrop-blur-sm shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Average Score</p>
              <h3 className="text-2xl font-bold text-indigo-500 mt-1">{stats.avgScore}%</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Target className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70 backdrop-blur-sm shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Personal Best</p>
              <h3 className="text-2xl font-bold text-amber-500 mt-1">{stats.topScore}%</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Trophy className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Components */}
      <div className="space-y-8">
        <PerformanceChart />
        <QuizList />
      </div>
    </div>
  );
}
