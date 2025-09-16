import QuizList from "@/components/QuizList";

export default function InterviewPerPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title">
          Interview Preparation
        </h1>
      </div>
      <div className="space-y-6">
        {/* <StatsCards assessments={assessments} />
        <PerformanceChart assessments={assessments} />
        <QuizList assessments={assessments} /> */}
        <QuizList />
      </div>
    </div>
  );
}
