from fastapi import APIRouter, Response, HTTPException, Request, UploadFile, File, Depends, Form
import os, shutil, tempfile
from dotenv import load_dotenv
from app.models.auth import User
from app.dependencies.dependencies import get_current_user
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langgraph.graph import StateGraph, END
from typing import TypedDict, List

from fastapi.responses import StreamingResponse

router = APIRouter()

load_dotenv()

class GraphState(TypedDict):
    question: str
    context: List[str]
    answer: str


def create_graph(db: Chroma):
    retriever = db.as_retriever(search_type="similarity", search_kwargs={"k": 3})
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", streaming=True)

    def retrieve(State: GraphState):
        docs = retriever.invoke(State["question"])
        return {"context": [doc.page_content for doc in docs]}
    
    def generate(state: GraphState):
        context = "\n".join(state["context"])
        prompt = f"Answer the question based on the context.\n\nContext:\n{context}\n\nQuestion: {state['question']}"
        response = llm.stream(prompt)
        return {"answer": response}
    
    workflow = StateGraph(StateGraph)
    workflow.add_node("retrieve", retrieve)
    workflow.add_node("generate", generate)
    workflow.set_entry_point("retrieve")
    workflow.add_edge("retrieve", "generate")
    workflow.add_edge("generate", END)

    return workflow.compile()


@router.post("/chat-with-pdf")
async def chat_with_pdf(file: UploadFile = File(...), userPrompt: str = Form(...), current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        shutil.copyfileobj(file.file, tmp)
        temp_file_path = tmp.name

    current_dir = os.path.dirname(os.path.abspath(__file__))
    persistent_directory = os.path.join(current_dir, "db", "chroma_db")
    os.makedirs(persistent_directory, exist_ok=True)

    loader = PyMuPDFLoader(temp_file_path)
    documents = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1024, chunk_overlap=20)
    docs = text_splitter.split_documents(documents)

    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    db = Chroma.from_documents(docs, embeddings, persistent_directory=persistent_directory)

    app = create_graph(db)

    # Stream Response
    async def event_stream():
        state = {"question": userPrompt, "context": [], "answer": ""}
        for output in app.run(state):
            if "generate" in output:
                for chunk in output["generate"]["answer"]:
                    yield chunk.text

    return StreamingResponse(event_stream(), media_type="text/plain")