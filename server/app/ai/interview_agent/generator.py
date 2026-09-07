import os
import json
import re
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage
from app.ai.interview_agent.state import InterviewState

load_dotenv()

# List of popular active HuggingFace models for Serverless Inference API
HF_CANDIDATE_MODELS = [
    "Qwen/Qwen2.5-Coder-32B-Instruct",
    "mistralai/Mistral-7B-Instruct-v0.3",
    "HuggingFaceH4/zephyr-7b-beta",
    "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
    "meta-llama/Meta-Llama-3-8B-Instruct",
]

def get_huggingface_llm(model_index=0):
    """
    Attempts to initialize a HuggingFace AI model instance.
    """
    hf_token = os.getenv("HUGGINGFACEHUB_API_TOKEN") or os.getenv("HUGGINGFACE_API_KEY")
    if not hf_token:
        return None

    try:
        from langchain_huggingface import HuggingFaceEndpoint, ChatHuggingFace
        
        custom_model = os.getenv("HUGGINGFACE_MODEL")
        if custom_model:
            model_id = custom_model
        else:
            model_id = HF_CANDIDATE_MODELS[min(model_index, len(HF_CANDIDATE_MODELS) - 1)]

        endpoint = HuggingFaceEndpoint(
            repo_id=model_id,
            huggingfacehub_api_token=hf_token,
            task="text-generation",
            temperature=0.3,
            max_new_tokens=2048,
        )
        return ChatHuggingFace(llm=endpoint)
    except Exception as e:
        print(f"HuggingFace model initialization warning for index {model_index}: {e}")
        return None


def get_fallback_llm():
    """
    Returns fallback LLM (Google Gemini or Groq).
    """
    google_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if google_key:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            return ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3)
        except Exception as e:
            print(f"Gemini fallback init error: {e}")

    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        try:
            from langchain_groq import ChatGroq
            return ChatGroq(model="groq/compound", temperature=0.3)
        except Exception as e:
            print(f"Groq fallback init error: {e}")

    from langchain_google_genai import ChatGoogleGenerativeAI
    return ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3)


async def generator_node(state: InterviewState) -> dict:
    """
    Generator Node: Uses Hugging Face AI Model (or fallback) to generate structured
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

    messages = [HumanMessage(content=prompt)]
    content = None

    # Try Hugging Face models first if token is available
    hf_token = os.getenv("HUGGINGFACEHUB_API_TOKEN") or os.getenv("HUGGINGFACE_API_KEY")
    if hf_token:
        for idx in range(len(HF_CANDIDATE_MODELS)):
            llm = get_huggingface_llm(model_index=idx)
            if not llm:
                continue
            try:
                print(f"Invoking HuggingFace AI Model candidate {idx}...")
                response = await llm.ainvoke(messages)
                if response and response.content:
                    content = response.content.strip()
                    break
            except Exception as e:
                print(f"HuggingFace model candidate {idx} failed: {e}. Trying next option...")

    # If Hugging Face did not produce content, invoke fallback LLM (Gemini / Groq)
    if not content:
        print("Invoking Fallback LLM (Gemini/Groq)...")
        fallback_llm = get_fallback_llm()
        response = await fallback_llm.ainvoke(messages)
        content = response.content.strip()

    # Clean markdown block wrappers
    clean_content = content.replace("```json", "").replace("```", "").strip()

    return {
        "raw_quiz_output": clean_content
    }
