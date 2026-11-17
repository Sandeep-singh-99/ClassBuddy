import asyncio
from datetime import datetime
import inngest

from app.core.inngest import inngest_client
from app.config.db import SessionLocal
from app.models.InterviewPreparation import InterviewPrep, Status
from app.ai.interview_graph import graph
from langchain_core.messages import HumanMessage
from app.schemas.interviewpreparation import QuizPayload


async def interview_generation_failed(ctx: inngest.Context):
    prep_id = ctx.event.data["event"]["data"]["interview_prep_id"]
    def fail():
        with SessionLocal() as session:
            session.query(InterviewPrep).filter(InterviewPrep.id == prep_id, InterviewPrep.status != Status.COMPLETED).update({
                "status": Status.ERROR, "updated_at": datetime.utcnow(),
            })
            session.commit()
    await asyncio.to_thread(fail)


@inngest_client.create_function(
    fn_id="generate-interview-questions",
    trigger=inngest.TriggerEvent(event="interview/prep.create"),
    on_failure=interview_generation_failed,
    retries=2,
)
async def generate_interview_questions(ctx: inngest.Context):
    prep_id = ctx.event.data["interview_prep_id"]

    async def run_ai_generation():
        async with asyncio.timeout(120):
            state = await graph.ainvoke({"description": [HumanMessage(content=ctx.event.data["description"])]})
        return QuizPayload.model_validate_json(state["quiz"][-1].content).model_dump()

    payload = await ctx.step.run("ai-generate-questions", run_ai_generation)

    async def update_db():
        def persist():
            with SessionLocal() as session:
                prep = session.query(InterviewPrep).filter_by(id=prep_id).with_for_update().first()
                if not prep or prep.status == Status.COMPLETED:
                    return False
                prep.questions = payload["questions"]
                prep.status = Status.COMPLETED
                prep.updated_at = datetime.utcnow()
                session.commit()
                return True
        return await asyncio.to_thread(persist)

    saved = await ctx.step.run("db-update-questions", update_db)
    return {"status": "success" if saved else "skipped", "interview_prep_id": prep_id, "questions_generated": len(payload["questions"])}
