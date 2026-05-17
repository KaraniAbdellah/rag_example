"""
main.py — FastAPI RAG Application
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
from typing import Annotated, Optional

import chromadb
from chromadb.utils import embedding_functions
from dotenv import dotenv_values
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel

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

@app.get("/")
def hello():
    return {"message": "Hello World"}


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
    answer: Optional[str] = None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
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
