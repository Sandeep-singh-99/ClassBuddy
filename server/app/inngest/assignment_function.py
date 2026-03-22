import inngest
from app.core import inngest as core_inngest
from app.config.db import SessionLocal
from app.models.assignment import AssignmentQuestion
from app.ai.assignment_graph import graph
from langchain_core.messages import HumanMessage
import json


@core_inngest.inngest_client.create_function(
    fn_id="generate-assignment-questions",
    trigger=inngest.TriggerEvent(event="assignment/question.generate"),
)
async def generate_assignment_questions(ctx: inngest.Context):

    assignment_id = ctx.event.data["assignment_id"]
    description = ctx.event.data["description"]

    # AI Generation Step
    async def run_ai_generation():
        inputs = {
            "des": [HumanMessage(content=description)],
            "research": [],
            "question": [],
        }
        final_state = await graph.ainvoke(inputs)
        generated_content = final_state["question"][-1].content
        # Extract JSON
        return json.loads(generated_content)

    quiz_json = await ctx.step.run("ai-generate-assignment-questions", run_ai_generation)

    # DB Update Step
    def update_db():
        with SessionLocal() as session:
            # Check if an AssignmentQuestion already exists to prevent duplicates
            existing = (
                session.query(AssignmentQuestion)
                .filter(AssignmentQuestion.assignment_id == assignment_id)
                .first()
            )
            if existing:
                return False

            question = AssignmentQuestion(
                assignment_id=assignment_id,
                question_text=json.dumps(quiz_json, indent=2),
            )
            session.add(question)
            session.commit()
            return True

    try:
        success = await ctx.step.run("db-update-assignment-questions", update_db)
    except Exception as e:
        # We don't have a status on Assignment Question so just raise 
        # (could add logging here if needed)
        raise e

    return {
        "status": "success",
        "assignment_id": assignment_id,
        "questions_generated": len(quiz_json) if isinstance(quiz_json, list) else 1,
    }
