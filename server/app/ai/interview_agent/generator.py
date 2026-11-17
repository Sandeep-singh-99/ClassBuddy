import os
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from app.ai.interview_agent.state import InterviewState

load_dotenv()


def get_fallback_llm():
    if os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY"):
        return ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3, timeout=45, max_retries=0, max_output_tokens=3000)
    if os.getenv("GROQ_API_KEY"):
        return ChatGroq(model="groq/compound", temperature=0.3, timeout=45, max_retries=0, max_tokens=3000)
    raise ValueError("Configure a Gemini or Groq API key for quiz generation")


async def generator_node(state: InterviewState) -> dict:
    """
    Generator Node: Uses the configured Gemini or Groq model to generate structured
    multiple choice interview questions based on job description & Tavily research.
    """
    description = state.get("description", "")
    research = state.get("research", "No research data available.")

    prompt = f"""
You are an expert AI Interviewer and Technical Assessor.

Generate 5 high-quality, practical multiple choice interview preparation questions based on:

Job Description / Topic:
{description}

Tavily Research Context:
{research}

REQUIREMENTS:
1. Generate exactly 5 questions.
2. Each question MUST have 4 option strings: ["A. Option text", "B. Option text", "C. Option text", "D. Option text"].
3. The `answer` MUST be the full text of the correct option (e.g., "A. Option text") or option key ("A").
4. Provide a clear, educational `explanation` for why the answer is correct.
5. Return ONLY a single raw valid JSON object without markdown formatting (` ```json `).

JSON Output Schema:
{{
  "questions": [
    {{
      "question": "Clear and realistic interview question stem?",
      "options": [
        "A. First plausible choice",
        "B. Second plausible choice",
        "C. Third plausible choice",
        "D. Fourth plausible choice"
      ],
      "answer": "A. First plausible choice",
      "explanation": "Detailed explanation of why this answer is correct."
    }}
  ]
}}
"""

    llm = get_fallback_llm()
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    return {"raw_quiz_output": response.content.strip().replace("```json", "").replace("```", "").strip()}
