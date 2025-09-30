import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import QuizFormComponents from "./QuizFormComponents";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { useEffect, useState } from "react";
import { GetAllInterviewPrep } from "@/redux/slice/interviewSlice";
import { format } from "date-fns";
import { Dialog, DialogContent } from "./ui/dialog";
import QuizResult from "./QuizResult";

export default function QuizList() {
  const dispatch = useAppDispatch();

  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const { data } = useAppSelector((state) => state.interview);

  useEffect(() => {
    dispatch(GetAllInterviewPrep());
  }, [dispatch]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="gradient-title text-3xl md:text-4xl">
                Recent Quizzes
              </CardTitle>
              <CardDescription>
                Review your past quiz performance
              </CardDescription>
            </div>
            <QuizFormComponents />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data && data.length > 0 ? (
              data.map((quiz, i) => (
                <Card key={quiz.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedQuiz(quiz)}>
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      {quiz.name}
                    </CardTitle>
                    <CardDescription className="flex justify-between w-full">
                      <div>
                        Score: {quiz.score.toFixed(1)}%
                      </div>

                      <div>
                        {format(new Date(quiz.created_at), "MMMM dd, yyyy HH:mm")}
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <p>No quizzes available.</p>
            )}
          </div>
          <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <QuizResult result={selectedQuiz} onStartNew={() => setSelectedQuiz(null)} />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </>
  );
}
