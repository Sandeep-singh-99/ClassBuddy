import json
from langchain_core.messages import HumanMessage
from app.ai.interview_agent.state import InterviewState

async def finalizer_node(state: InterviewState) -> dict:
    """
    Finalizer Node: Formats the final validated quiz into a JSON string wrapped
    in HumanMessage for backward compatibility with Inngest workers and API routers.
    """
    quiz = state.get("quiz", [])
    description = state.get("description", "General Technical Interview Prep")

    # Fallback default questions if generator/evaluator failed completely
    if not quiz or not isinstance(quiz, list) or len(quiz) == 0:
        quiz = [
            {
                "question": f"What is a fundamental requirement when preparing for a {description} role?",
                "options": [
                    "A. Solid understanding of core concepts and design patterns",
                    "B. Memorizing answers without understanding",
                    "C. Ignoring practical problem-solving skills",
                    "D. Avoiding documentation and unit tests"
                ],
                "answer": "A. Solid understanding of core concepts and design patterns",
                "explanation": "Mastering core concepts, data structures, and practical application is key to succeeding in technical interviews."
            },
            {
                "question": "Which of the following best describes an effective technical interview strategy?",
                "options": [
                    "A. Communicating thought process clearly and writing clean code",
                    "B. Writing unformatted code without explaining logic",
                    "C. Remaining silent throughout the coding process",
                    "D. Guessing answers without asking clarifying questions"
                ],
                "answer": "A. Communicating thought process clearly and writing clean code",
                "explanation": "Clear communication of your problem-solving approach and writing structured code are top traits evaluated by interviewers."
            }
        ]

    formatted_payload = {"questions": quiz}
    json_str = json.dumps(formatted_payload)

    return {
        "quiz": [HumanMessage(content=json_str)]
    }
