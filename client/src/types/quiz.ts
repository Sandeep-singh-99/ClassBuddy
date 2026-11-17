export interface PublicQuizQuestion {
  question: string;
  options: string[];
}

export interface ReviewedQuizQuestion extends PublicQuizQuestion {
  answer: string;
  explanation: string;
}

export interface QuizReview {
  id: string;
  name: string;
  questions: ReviewedQuizQuestion[];
  score: number;
  user_answers: Record<string, string>;
}

export interface QuizSubmissionResult extends QuizReview {
  message: string;
  quiz_id: string;
}
