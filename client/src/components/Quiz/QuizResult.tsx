import { useState, useMemo } from "react";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Sparkles,
  Award,
  RotateCcw,
  Check,
  X,
  BookOpen,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface QuizResultProps {
  result: {
    id?: string;
    name?: string;
    questions?: {
      question: string;
      answer: string;
      options: string[];
      explanation: string;
    }[];
    user_answers?: { [key: number]: string };
  };
  hideStartNew?: boolean;
  onStartNew?: () => void;
}

type FilterType = "all" | "correct" | "incorrect";

export default function QuizResult({ result, onStartNew }: QuizResultProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  const { totalQuestions, correctCount, incorrectCount, quizScore, mappedQuestions } =
    useMemo(() => {
      if (!result || !result.questions || !Array.isArray(result.questions)) {
        return {
          totalQuestions: 0,
          correctCount: 0,
          incorrectCount: 0,
          quizScore: "0",
          mappedQuestions: [],
        };
      }

      const userAnswers = result.user_answers || {};
      const questions = result.questions;
      const total = questions.length;

      let correct = 0;
      const mapped = questions.map((q, idx) => {
        const userAnswer = userAnswers[idx];
        // Check matching answer
        const isCorrect = userAnswer ? userAnswer.startsWith(q.answer) : false;
        if (isCorrect) correct++;

        const correctAnswerText =
          q.options?.find((opt) => opt.startsWith(q.answer)) || q.answer;

        return {
          id: idx,
          question: q.question,
          options: q.options || [],
          userAnswer: userAnswer || null,
          correctAnswer: correctAnswerText,
          answerKey: q.answer,
          isCorrect,
          explanation: q.explanation,
        };
      });

      const scorePercent = total > 0 ? ((correct / total) * 100).toFixed(1) : "0";

      return {
        totalQuestions: total,
        correctCount: correct,
        incorrectCount: total - correct,
        quizScore: scorePercent,
        mappedQuestions: mapped,
      };
    }, [result]);

  const filteredQuestions = useMemo(() => {
    if (filter === "correct") return mappedQuestions.filter((q) => q.isCorrect);
    if (filter === "incorrect") return mappedQuestions.filter((q) => !q.isCorrect);
    return mappedQuestions;
  }, [mappedQuestions, filter]);

  if (!result || !result.questions || result.questions.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No result data available for this quiz.
      </div>
    );
  }

  const scoreNum = parseFloat(quizScore);
  const getBadgeStyle = () => {
    if (scoreNum >= 80) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (scoreNum >= 50) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-rose-500/10 text-rose-500 border-rose-500/20";
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Trophy className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Quiz Results & Performance
            </h2>
            <p className="text-sm text-muted-foreground">
              {result.name || "Assessment Summary"}
            </p>
          </div>
        </div>

        <Badge variant="outline" className={`text-base font-extrabold px-3.5 py-1.5 rounded-xl border ${getBadgeStyle()}`}>
          <Award className="h-4 w-4 mr-1.5" /> Score: {quizScore}%
        </Badge>
      </div>

      {/* Overview Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Score Card */}
        <div className="rounded-xl border border-border/60 bg-background/60 p-4 space-y-2 text-center flex flex-col items-center justify-center">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Overall Accuracy
          </span>
          <span className="text-3xl font-extrabold text-foreground">{quizScore}%</span>
          <Progress value={scoreNum} className="w-full h-2 bg-muted mt-2" />
        </div>

        {/* Correct Card */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex flex-col items-center justify-center text-center space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-500 font-semibold text-xs uppercase tracking-wider">
            <CheckCircle2 className="h-4 w-4" /> Correct Answers
          </div>
          <span className="text-3xl font-extrabold text-emerald-500">
            {correctCount} <span className="text-sm font-normal text-muted-foreground">/ {totalQuestions}</span>
          </span>
        </div>

        {/* Incorrect Card */}
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 flex flex-col items-center justify-center text-center space-y-1">
          <div className="flex items-center gap-1.5 text-rose-500 font-semibold text-xs uppercase tracking-wider">
            <XCircle className="h-4 w-4" /> Incorrect Answers
          </div>
          <span className="text-3xl font-extrabold text-rose-500">
            {incorrectCount} <span className="text-sm font-normal text-muted-foreground">/ {totalQuestions}</span>
          </span>
        </div>
      </div>

      {/* Question Filter Tabs */}
      <div className="flex items-center justify-between pt-2">
        <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" /> Question Review
        </h3>

        <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-1 text-xs font-medium">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filter === "all"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({totalQuestions})
          </button>
          <button
            onClick={() => setFilter("correct")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filter === "correct"
                ? "bg-background text-emerald-500 shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Correct ({correctCount})
          </button>
          <button
            onClick={() => setFilter("incorrect")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filter === "incorrect"
                ? "bg-background text-rose-500 shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Incorrect ({incorrectCount})
          </button>
        </div>
      </div>

      {/* Question Cards List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => (
          <div
            key={q.id}
            className={`rounded-2xl border p-5 space-y-4 transition-all ${
              q.isCorrect
                ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10"
                : "border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10"
            }`}
          >
            {/* Question Title & Badge */}
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-bold text-base text-foreground leading-snug">
                <span className="text-muted-foreground mr-1.5">Q{idx + 1}.</span>
                {q.question}
              </h4>

              {q.isCorrect ? (
                <Badge className="bg-emerald-500 text-white border-0 gap-1 shrink-0">
                  <Check className="h-3 w-3" /> Correct
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1 shrink-0">
                  <X className="h-3 w-3" /> Incorrect
                </Badge>
              )}
            </div>

            {/* Answer Options Details */}
            <div className="grid grid-cols-1 gap-2 pt-1 text-sm">
              {q.options && q.options.length > 0 ? (
                q.options.map((opt, optionIdx) => {
                  const isUserSelected = q.userAnswer === opt;
                  const isRightAnswer = opt.startsWith(q.answerKey);

                  let optionStyle = "border-border/50 bg-background/50 text-muted-foreground";

                  if (isRightAnswer) {
                    optionStyle = "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold";
                  } else if (isUserSelected && !q.isCorrect) {
                    optionStyle = "border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold line-through";
                  }

                  return (
                    <div
                      key={optionIdx}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs sm:text-sm ${optionStyle}`}
                    >
                      <span>{opt}</span>
                      {isRightAnswer && (
                        <Badge variant="outline" className="text-[10px] border-emerald-500 text-emerald-500 bg-emerald-500/10">
                          Correct Answer
                        </Badge>
                      )}
                      {isUserSelected && !isRightAnswer && (
                        <Badge variant="outline" className="text-[10px] border-rose-500 text-rose-500 bg-rose-500/10">
                          Your Choice
                        </Badge>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-muted-foreground">
                  <p>Your Answer: <span className="font-semibold">{q.userAnswer || "Not answered"}</span></p>
                  {!q.isCorrect && <p>Correct Answer: <span className="font-semibold">{q.correctAnswer}</span></p>}
                </div>
              )}
            </div>

            {/* Explanation box */}
            {q.explanation && (
              <div className="rounded-xl bg-card border border-border/80 p-3.5 space-y-1 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> Explanation
                </div>
                <p className="text-muted-foreground leading-relaxed">{q.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {onStartNew && (
        <div className="pt-4 flex justify-end">
          <Button onClick={onStartNew} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" /> Close Results
          </Button>
        </div>
      )}
    </div>
  );
}
