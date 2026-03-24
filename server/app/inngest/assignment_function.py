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
            try:
                # Check if an AssignmentQuestion already exists to prevent duplicates
                existing = (
                    session.query(AssignmentQuestion)
                    .filter(AssignmentQuestion.assignment_id == assignment_id)
                    .first()
                )
                if not existing:
                    question = AssignmentQuestion(
                        assignment_id=assignment_id,
                        question_text=json.dumps(quiz_json, indent=2),
                    )
                    session.add(question)
                
                # Update assignment status
                from app.models.assignment import Assignment
                assignment = session.query(Assignment).filter(Assignment.id == assignment_id).first()
                if assignment:
                    assignment.is_generating = False
                    
                session.commit()
                return True
            except Exception as e:
                session.rollback()
                raise e

    try:
        success = await ctx.step.run("db-update-assignment-questions", update_db)
    except Exception as e:
        # Fallback to reset generating state on ultimate failure
        def reset_generating_state():
            with SessionLocal() as session:
                from app.models.assignment import Assignment
                assignment = session.query(Assignment).filter(Assignment.id == assignment_id).first()
                if assignment:
                    assignment.is_generating = False
                    session.commit()
        await ctx.step.run("reset-generating-state-on-error", reset_generating_state)
        raise e

    return {
        "status": "success",
        "assignment_id": assignment_id,
        "questions_generated": len(quiz_json) if isinstance(quiz_json, list) else 1,
    }
