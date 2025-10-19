import PerformanceChart from "@/components/PerformanceChart";
import QuizList from "@/components/QuizList";
import { useAppDispatch } from "@/hooks/hooks";
import { GetAllInterviewPrep } from "@/redux/slice/interviewSlice";
import { useEffect } from "react";

export default function InterviewPerPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(GetAllInterviewPrep())
  }, [dispatch]);
  
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title">
          Interview Preparation
        </h1>
      </div>
      <div className="space-y-6">
        {/* <StatsCards assessments={assessments} /> */}
        <PerformanceChart />
        <QuizList />
      </div>
    </div>
  );
}
