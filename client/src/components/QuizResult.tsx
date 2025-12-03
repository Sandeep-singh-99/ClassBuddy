import { Trophy, CheckCircle2, XCircle } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { Progress } from "./ui/progress";

interface QuizResultProps {
  result: {
    questions: {
      question: string;
      answer: string;
      options: string[];
      explanation: string;
    }[];
    user_answers: { [key: number]: string };
  };
  hideStartNew?: boolean;
  onStartNew?: () => void;
}

export default function QuizResult({ result }: QuizResultProps) {
  if (!result) return null;

  // Prepare derived data
  const totalQuestions = result.questions.length;
  const correctCount = result.questions.filter((q: any, idx: number) => {
    const userAns = result.user_answers[idx];
    return userAns && userAns.startsWith(q.answer);
  }).length;

  const quizScore = ((correctCount / totalQuestions) * 100).toFixed(1);

  const mappedQuestions = result.questions.map((q: any, idx: number) => {
    const userAnswer = result.user_answers[idx];
    const isCorrect = userAnswer?.startsWith(q.answer);
    return {
      question: q.question,
      userAnswer,
      answer: q.options.find((opt: string) => opt.startsWith(q.answer)),
      isCorrect,
      explanation: q.explanation,
    };
  });

  return (
    <div className="mx-auto">
      <h1 className="flex items-center gap-2 text-3xl gradient-title">
        <Trophy className="h-6 w-6 text-yellow-500" />
        Quiz Results
      </h1>

      <CardContent className="space-y-6">
        {/* Score Overview */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">{quizScore}%</h3>
          <p className="text-muted-foreground">
            {correctCount} / {totalQuestions} correct
          </p>
          <Progress value={parseFloat(quizScore)} className="w-full" />
        </div>

        {/* Questions Review */}
        <div className="space-y-4">
          <h3 className="font-medium">Question Review</h3>
          {mappedQuestions.map((q, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{q.question}</p>
                {q.isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Your answer: {q.userAnswer || "No answer given"}</p>
                {!q.isCorrect && <p>Correct answer: {q.answer}</p>}
              </div>
              <div className="text-sm bg-muted p-2 rounded">
                <p className="font-medium">Explanation:</p>
                <p>{q.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* {!hideStartNew && (
        <CardFooter>
          <Button onClick={onStartNew} className="w-full">
            Start New Quiz
          </Button>
        </CardFooter>
      )} */}
    </div>
  );
}
