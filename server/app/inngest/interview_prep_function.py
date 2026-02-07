import inngest
from app.core import inngest as core_inngest
from app.config import db
from app.models.InterviewPreparation import InterviewPrep
from app.ai.interview_graph import graph
from langchain_core.messages import HumanMessage
import json
from datetime import datetime


@core_inngest.inngest_client.create_function(
    fn_id="generate-interview-questions",
    trigger=inngest.TriggerEvent(event="interview/prep.create"),
)
async def generate_interview_questions(ctx: inngest.Context):

    interview_prep_id = ctx.event.data["interview_prep_id"]
    description = ctx.event.data["description"]

    # AI Generation Step
    async def run_ai_generation():
        inputs = {"description": [HumanMessage(content=description)]}
        final_state = await graph.ainvoke(inputs)
        quiz_raw = final_state["quiz"][-1].content
        return json.loads(quiz_raw)

    quiz_json = await ctx.step.run("ai-generate-questions", run_ai_generation)

    # DB Update Step
    def update_db():
        with db.SessionLocal() as session:
            interview_prep = (
                session.query(InterviewPrep)
                .filter(InterviewPrep.id == interview_prep_id)
                .first()
            )
            if interview_prep:
                interview_prep.questions = quiz_json["questions"]
                interview_prep.status = "completed"
                interview_prep.updated_at = datetime.utcnow()
                session.commit()
                return True
            return False

    try:
        success = await ctx.step.run("db-update-questions", update_db)
    except Exception as e:

        def update_error():
            with db.SessionLocal() as session:
                interview_prep = (
                    session.query(InterviewPrep)
                    .filter(InterviewPrep.id == interview_prep_id)
                    .first()
                )
                if interview_prep:
                    interview_prep.status = "error"
                    session.commit()

        await ctx.step.run("db-update-error", update_error)
        raise e

    return {
        "status": "success",
        "interview_prep_id": interview_prep_id,
        "questions_generated": len(quiz_json.get("questions", [])),
        "questions": quiz_json.get("questions", []),
    }
