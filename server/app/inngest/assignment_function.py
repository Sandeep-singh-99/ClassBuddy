import asyncio
import json
import inngest
from langchain_core.messages import HumanMessage
from pydantic import TypeAdapter

from app.core.inngest import inngest_client
from app.config.db import SessionLocal
from app.models.assignment import Assignment, AssignmentQuestion
from app.ai.assignment_graph import graph
from app.schemas.ai_evaluation import EvaluationQuestion


async def assignment_generation_failed(ctx: inngest.Context):
    assignment_id = ctx.event.data["event"]["data"]["assignment_id"]
    def reset():
        with SessionLocal() as session:
            session.query(Assignment).filter_by(id=assignment_id).update({"is_generating": False})
            session.commit()
    await asyncio.to_thread(reset)


@inngest_client.create_function(
    fn_id="generate-assignment-questions",
    trigger=inngest.TriggerEvent(event="assignment/question.generate"),
    on_failure=assignment_generation_failed,
    retries=2,
)
async def generate_assignment_questions(ctx: inngest.Context):
    assignment_id = ctx.event.data["assignment_id"]

    async def run_ai_generation():
        async with asyncio.timeout(120):
            state = await graph.ainvoke({"des": [HumanMessage(content=ctx.event.data["description"])], "research": [], "question": []})
        questions = TypeAdapter(list[EvaluationQuestion]).validate_json(state["question"][-1].content)
        if not questions or len(questions) > 50 or len({q.id for q in questions}) != len(questions):
            raise ValueError("Invalid generated question count or IDs")
        return [q.model_dump() for q in questions]

    questions = await ctx.step.run("ai-generate-assignment-questions", run_ai_generation)

    async def update_db():
        def persist():
            with SessionLocal() as session:
                assignment = session.query(Assignment).filter_by(id=assignment_id).with_for_update().first()
                if not assignment:
                    return False
                if not session.query(AssignmentQuestion).filter_by(assignment_id=assignment_id).first():
                    session.add(AssignmentQuestion(assignment_id=assignment_id, question_text=json.dumps(questions)))
                assignment.is_generating = False
                session.commit()
                return True
        return await asyncio.to_thread(persist)

    saved = await ctx.step.run("db-update-assignment-questions", update_db)
    return {"status": "success" if saved else "skipped", "assignment_id": assignment_id, "questions_generated": len(questions)}
