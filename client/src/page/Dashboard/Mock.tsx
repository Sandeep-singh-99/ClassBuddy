import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { axiosClient } from "@/helper/axiosClient";
import { toast } from "react-toastify";
import { Link, useParams } from "react-router-dom";
import { GetInterviewQuestion } from "@/redux/slice/interviewSlice";

export default function Mock() {
  const { data } = useAppSelector((state) => state.interview);
  const dispatch = useAppDispatch();

  const { id } = useParams();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(GetInterviewQuestion(id));
    }
  }, [dispatch, id]);

  const questions = data?.questions;

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (data?.status === "generating") {
      intervalId = setInterval(() => {
        if (id) {
          dispatch(GetInterviewQuestion(id));
        }
      }, 5000); 
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [data?.status, id, dispatch]);

  if (!data || data.status === "generating") {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="text-lg font-medium text-gray-300">
          Generating your interview questions...
        </p>
        <p className="text-sm text-gray-500">This may take a few moments.</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return <div>No questions available.</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  // Selecting an option
  const handleSelect = (value: string) => {
    setAnswers({ ...answers, [currentQuestionIndex]: value });
  };

  // Next or Submit button
  const handleNext = async () => {
    const selectedAnswer = answers[currentQuestionIndex];

    // ✅ Fix score check using .startsWith
    if (selectedAnswer && selectedAnswer.startsWith(currentQuestion.answer)) {
      setScore((prev) => prev + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizCompleted(true);
      try {
        const response = await axiosClient.post("/interview-prep/submit-quiz", {
          id: data.id,
          score: score,
          user_answers: answers,
        });

        toast.success(response.data.message);
      } catch (error: any) {
        toast.error(error.response?.data?.detail || error.message);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {!quizCompleted ? (
        <Card className="border p-4">
          <h2 className="font-semibold mb-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <p className="mb-4">{currentQuestion.question}</p>

          <div className="flex flex-col space-y-2">
            {currentQuestion.options.map((opt: string, i: number) => (
              <label
                key={i}
                className={`flex items-center space-x-2 cursor-pointer rounded-lg p-2 border ${
                  answers[currentQuestionIndex] === opt
                    ? "border-indigo-400 "
                    : "border-gray-700"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  value={opt}
                  checked={answers[currentQuestionIndex] === opt}
                  onChange={() => handleSelect(opt)}
                  className="accent-indigo-500"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>

          <div className="mt-4 flex justify-between">
            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestionIndex]}
            >
              {currentQuestionIndex === questions.length - 1
                ? "Submit"
                : "Next"}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="border p-4">
          <h2 className="font-bold text-xl mb-4 text-center">
            Quiz Completed 🎉
          </h2>
          <p className="mb-6 text-center">
            Your Score: <span className="font-semibold">{score}</span> /{" "}
            {questions.length}
          </p>

          {/* Accordion for explanations */}
          <Accordion type="single" collapsible className="w-full">
            {questions.map((q: any, idx: number) => {
              const userAnswer = answers[idx];
              const correctOptionText = q.options.find((opt: string) =>
                opt.startsWith(q.answer),
              );
              const isCorrect = userAnswer && userAnswer.startsWith(q.answer);

              return (
                <AccordionItem
                  key={idx}
                  value={`question-${idx}`}
                  className="border-b"
                >
                  <AccordionTrigger>
                    <div className="flex justify-between w-full text-left">
                      <span className="font-medium">
                        {idx + 1}. {q.question}
                      </span>
                      <span
                        className={`ml-4 ${
                          isCorrect ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isCorrect ? "✅ Correct" : "❌ Incorrect"}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 p-3">
                      <p>
                        <strong>Your Answer:</strong>{" "}
                        <span
                          className={
                            isCorrect ? "text-green-600" : "text-red-600"
                          }
                        >
                          {userAnswer || "Not answered"}
                        </span>
                      </p>
                      <p>
                        <strong>Correct Answer:</strong>{" "}
                        <span className="text-green-600">
                          {correctOptionText}
                        </span>
                      </p>
                      <div className="p-3 rounded-md border">
                        <strong>Explanation:</strong>
                        <p className="mt-2 text-gray-100">{q.explanation}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          <Link
            to={"/dashboard-panel/interview-prep"}
            className="text-center mt-6"
          >
            <Button>Dashboard</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
