import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Sparkles,
  Trophy,
  Loader2,
  Check,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { axiosClient } from "@/helper/axiosClient";
import { GetInterviewQuestion } from "@/redux/slice/interviewSlice";
import QuizResult from "@/components/Quiz/QuizResult";

export default function Mock() {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const { data } = useAppSelector((state) => state.interview);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [, setScore] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(GetInterviewQuestion(id));
    }
  }, [dispatch, id]);

  const questions = data?.questions;

  // Poll for question generation if generating
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (data?.status === "generating") {
      intervalId = setInterval(() => {
        if (id) {
          dispatch(GetInterviewQuestion(id));
        }
      }, 4000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [data?.status, id, dispatch]);

  // Quiz Timer counter
  useEffect(() => {
    if (!quizCompleted && data?.status === "completed" && questions?.length > 0) {
      const timer = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizCompleted, data?.status, questions]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // If questions are still generating
  if (!data || data.status === "generating") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center p-6">
        <div className="relative">
          <div className="p-5 rounded-3xl bg-primary/10 text-primary border border-primary/20 animate-pulse">
            <BrainCircuit className="h-12 w-12" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-primary-foreground shadow-md">
            <Sparkles className="h-4 w-4 animate-spin" />
          </div>
        </div>

        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Curating AI Quiz Questions...
          </h2>
          <p className="text-sm text-muted-foreground">
            Our AI engine is generating tailored interview questions for your practice session.
          </p>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-foreground">No questions available for this quiz.</p>
        <Link to="/dashboard-panel/interview-prep">
          <Button variant="outline">Back to Quiz Dashboard</Button>
        </Link>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);

  const handleSelect = (optionText: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionText,
    }));
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNextOrSubmit = async () => {
    // If not on last question, move to next
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      return;
    }

    // Submit Quiz logic
    setSubmitting(true);
    let correctAnswers = 0;

    questions.forEach((q: any, index: number) => {
      const ans = answers[index];
      if (ans && ans.startsWith(q.answer)) {
        correctAnswers++;
      }
    });

    const finalScore = Number(((correctAnswers / questions.length) * 100).toFixed(1));
    setScore(finalScore);
    setQuizCompleted(true);

    try {
      const response = await axiosClient.post("/interview-prep/submit-quiz", {
        id: data.id,
        score: finalScore,
        user_answers: answers,
      });
      toast.success(response.data.message || "Quiz submitted successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || error.message || "Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  const optionLabels = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between pb-2">
        <Link
          to="/dashboard-panel/interview-prep"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Quiz Dashboard</span>
        </Link>

        {!quizCompleted && (
          <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs border-border bg-card">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono font-bold">{formatTime(secondsElapsed)}</span>
          </Badge>
        )}
      </div>

      {!quizCompleted ? (
        <Card className="border-border/60 shadow-xl bg-card text-card-foreground overflow-hidden rounded-2xl">
          {/* Progress Indicator */}
          <div className="p-6 pb-4 border-b border-border/60 space-y-3 bg-muted/20">
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
              <span className="text-primary flex items-center gap-1.5">
                <BrainCircuit className="h-4 w-4" />
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-muted-foreground font-mono">{progressPercent}% Completed</span>
            </div>
            <Progress value={progressPercent} className="h-2 bg-muted" />
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Question Stem */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Options List */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {currentQuestion.options.map((option: string, i: number) => {
                const isSelected = answers[currentQuestionIndex] === option;
                const label = optionLabels[i % optionLabels.length];

                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => handleSelect(option)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/20 shadow-xs"
                        : "border-border/80 bg-background/80 text-foreground hover:bg-muted/60 hover:border-border"
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-muted text-muted-foreground border border-border/60"
                      }`}
                    >
                      {label}
                    </div>
                    <span className="text-sm sm:text-base font-medium flex-1 leading-snug">
                      {option}
                    </span>
                    {isSelected && <Check className="h-5 w-5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Bottom Nav Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-border/60">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="gap-2 border-border cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>

              <Button
                onClick={handleNextOrSubmit}
                disabled={!answers[currentQuestionIndex] || submitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 cursor-pointer shadow-md"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : currentQuestionIndex === questions.length - 1 ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Submit Quiz
                  </>
                ) : (
                  <>
                    Next Question <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Quiz Completed Result Screen */
        <Card className="border-border/60 shadow-xl bg-card text-card-foreground overflow-hidden rounded-2xl p-6 sm:p-8 space-y-6">
          <QuizResult
            result={{
              name: data?.name || "Quiz Session",
              questions,
              user_answers: answers,
            }}
          />

          <div className="pt-4 border-t border-border/60 flex justify-center">
            <Link to="/dashboard-panel/interview-prep">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-md">
                <Trophy className="h-4 w-4" /> Return to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
