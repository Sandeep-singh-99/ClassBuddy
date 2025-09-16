import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";


export default function QuizList() {
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
            <Link to={"/dashboard-panel/mock"}>
              <Button>
                Start New Quiz
              </Button>
            </Link>
          </div>
        </CardHeader>
    </Card>
    </>
  )
}
