
export default function Mock() {
  return (
    <div className="container mx-auto space-y-4 px-6 py-6">
      <div className="flex flex-col space-y-2 mx-2">
        {/* <Link to={"/dashboard-panel/quiz-per"}>
          <Button variant={"link"} className={"gap-2 pl-0"}>
            <ArrowLeft className="h-4 w-4" />
            Back to Interview Preparation
          </Button>
        </Link> */}

        <div>
          <h1 className="text-6xl font-bold gradient-title">Mock Interview</h1>
          <p className="text-muted-foreground">
            Test your knowledge with a mock interview. This feature generates
            realistic interview questions based on your profile and allows you
            to practice your responses.
          </p>
        </div>
      </div>

      {/* <Quiz/> */}
    </div>
  )
}
