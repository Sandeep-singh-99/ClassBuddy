import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from pypdf import PdfReader
from dotenv import load_dotenv

from langgraph.graph import StateGraph, MessagesState
from langgraph.checkpoint.memory import MemorySaver

from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter

# --- Load env ---
load_dotenv()
GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")

# --- FastAPI App ---
router = APIRouter()

# --- LLM + Embeddings ---
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", model_kwargs={"streaming": True})
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=GOOGLE_API_KEY)

# --- LangGraph State Node ---
def chat_node(state: MessagesState):
    query = state["messages"][-1]["content"]
    retriever = state.get("retriever")

    docs = retriever.get_relevant_documents(query)
    context = "\n\n".join([d.page_content for d in docs])

    prompt = f"Context from PDF:\n{context}\n\nUser Query: {query}"

    response = llm.stream(prompt)  # streaming response
    return {"response": response}

builder = StateGraph(MessagesState)
builder.add_node("chat", chat_node)
builder.set_entry_point("chat")
memory = MemorySaver()
graph = builder.compile(checkpointer=memory)


# --- Utility: Extract + Index PDF ---
def build_retriever(file: UploadFile):
    try:
        pdf = PdfReader(file.file)
        text = ""
        for page in pdf.pages:
            text += page.extract_text() or ""

        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        docs = splitter.create_documents([text])

        vectorstore = FAISS.from_documents(docs, embeddings)
        return vectorstore.as_retriever()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"PDF processing failed: {str(e)}")


# --- Chat Route with Streaming ---
@router.post("/chat-pdf")
async def chat_with_pdf(file: UploadFile = File(...), query: str = ""):
    if not file or not query:
        raise HTTPException(status_code=400, detail="File and query required")

    retriever = build_retriever(file)

    async def event_stream():
        inputs = {
            "messages": [{"role": "user", "content": query}],
            "retriever": retriever
        }
        thread = {"configurable": {"thread_id": "user-session"}}

        for event in graph.stream(inputs, thread):
            if "response" in event:
                for chunk in event["response"]:
                    yield chunk.content

    return StreamingResponse(event_stream(), media_type="text/plain")
