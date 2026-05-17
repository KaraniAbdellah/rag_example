"""
app.p
----------------------------------
Endpoints:
  GET  /               → Hello World health-check
  POST /upload-pdf     → Upload a PDF, index it, and ask a question
  POST /query          → Query an already-indexed collection
"""

import os
import shutil
import tempfile
from contextlib import asynccontextmanager
from typing import Annotated

import chromadb
from chromadb.utils import embedding_functions
from dotenv import dotenv_values
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


from helpers import (
    generate_embedding_doc,
    get_text_from_pdf,
    run_rag_pipeline,
    split_doc_chunks,
    store_document_into_vdb,
)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------



config = dotenv_values(".env")
GROQ_API_KEY = config.get("GROQ_API_KEY", os.getenv("GROQ_API_KEY", ""))

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is missing. Add it to your .env file.")

# ---------------------------------------------------------------------------
# ChromaDB — shared persistent client
# ---------------------------------------------------------------------------

chroma_client = chromadb.PersistentClient(path="chroma_store")
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

def get_collection(name: str = "rag_default"):
    """Get or create a named ChromaDB collection."""
    return chroma_client.get_or_create_collection(
        name=name,
        embedding_function=embedding_fn,
    )

# In-memory store for chunked documents per collection
# { collection_name: list[dict] }
chunked_store: dict[str, list[dict]] = {}


# ---------------------------------------------------------------------------
# Lifespan (startup / shutdown logging)
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("✅  RAG API started — ChromaDB ready.")
    yield
    print("🛑  RAG API shutting down.")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Local RAG API",
    description="HyDE + Hybrid Search (BM25 + ChromaDB) powered by Groq / LLaMA 3",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class QueryRequest(BaseModel):
    question: str
    collection_name: str = "rag_default"
    top_k: int = 5
    rerank_top_k: int = 3


class QueryResponse(BaseModel):
    question: str
    answer: str
    collection_name: str


class UploadResponse(BaseModel):
    message: str
    collection_name: str
    pages_extracted: int
    chunks_indexed: int
    answer: str | None = None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"])
def hello_world():
    """
    Health-check endpoint.
    Returns a friendly greeting and API status.
    """
    return {
        "message": "👋 Hello from the RAG API!",
        "status": "ok",
        "docs": "/docs",
    }


@app.post("/upload-pdf", response_model=UploadResponse, tags=["RAG"])
async def upload_pdf(
    file: Annotated[UploadFile, File(description="PDF file to index")],
    question: Annotated[
        str | None,
        Form(description="Optional question to answer immediately after indexing"),
    ] = None,
    collection_name: Annotated[
        str,
        Form(description="ChromaDB collection name (default: rag_default)"),
    ] = "rag_default",
):
    """
    Upload a PDF, extract & chunk its text, embed and index it in ChromaDB.

    Optionally pass a **question** in the form body to get an immediate RAG
    answer after indexing.
    """
    print("Upload File", file)
    # --- Validate file type ---
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    # --- Save upload to a temp file ---
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        # --- Extract text ---
        documents = get_text_from_pdf(tmp_path)
        if not documents:
            raise HTTPException(status_code=422, detail="No readable text found in the PDF.")

        # --- Chunk + embed ---
        chunked_documents = split_doc_chunks(documents)
        chunked_documents = generate_embedding_doc(chunked_documents)

        # --- Index into ChromaDB ---
        collection = get_collection(collection_name)
        store_document_into_vdb(chunked_documents, collection)

        # --- Persist chunks in memory for query endpoint ---
        chunked_store[collection_name] = chunked_documents

        # --- Optional immediate query ---
        answer = None
        if question:
            answer = run_rag_pipeline(
                question=question,
                chunked_documents=chunked_documents,
                collection=collection,
                groq_api_key=GROQ_API_KEY,
            )

        return UploadResponse(
            message="PDF indexed successfully.",
            collection_name=collection_name,
            pages_extracted=len(documents),
            chunks_indexed=len(chunked_documents),
            answer=answer,
        )

    finally:
        os.unlink(tmp_path)  # clean up temp file


@app.post("/query", response_model=QueryResponse, tags=["RAG"])
def query(req: QueryRequest):
    """
    Ask a question against an already-indexed PDF collection.

    The collection must have been created via ``POST /upload-pdf`` first.
    """
    if req.collection_name not in chunked_store:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Collection '{req.collection_name}' not found. "
                "Please upload a PDF first via POST /upload-pdf."
            ),
        )

    collection = get_collection(req.collection_name)
    chunked_documents = chunked_store[req.collection_name]

    answer = run_rag_pipeline(
        question=req.question,
        chunked_documents=chunked_documents,
        collection=collection,
        groq_api_key=GROQ_API_KEY,
        top_k=req.top_k,
        rerank_top_k=req.rerank_top_k,
    )

    return QueryResponse(
        question=req.question,
        answer=answer,
        collection_name=req.collection_name,
    )


