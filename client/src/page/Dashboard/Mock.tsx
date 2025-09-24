import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/hooks/hooks";

export default function Mock() {
  // Get quiz data from Redux store
  const {data} = useAppSelector((state) => state.interview);

  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showExplanation, setShowExplanation] = useState<{ [key: number]: boolean }>({});

  if (!data || !data.questions) {
    return <div>No quiz data available</div>;
  }

  const questions = data.questions.questions;

  const handleSelect = (qIndex: number, value: string) => {
    setAnswers({ ...answers, [qIndex]: value });
    setShowExplanation({ ...showExplanation, [qIndex]: true });
  };

  return (
    <div className="p-6 space-y-6">
      {questions.map((q, idx) => (
        <Card key={idx} className="border p-4">
          <h2 className="font-semibold mb-2">
            Q{idx + 1}: {q.question}
          </h2>

          <div className="flex flex-col space-y-2">
            {q.options.map((opt, i) => (
              <label key={i} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${idx}`}
                  value={opt}
                  checked={answers[idx] === opt}
                  onChange={() => handleSelect(idx, opt)}
                  className="accent-indigo-500"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>

          {showExplanation[idx] && (
            <div className="mt-2 p-2  rounded">
              <strong>Answer:</strong> {q.answer} <br />
              <strong>Explanation:</strong> {q.explanation}
            </div>
          )}
        </Card>
      ))}

      <Button
        className="mt-4"
        onClick={() => alert("Submit functionality not implemented")}
      >
        Submit Quiz
      </Button>
    </div>
  );
}
