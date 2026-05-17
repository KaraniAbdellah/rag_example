"""
helpers.py — RAG Pipeline utility functions
Extracted from the local RAG notebook.
"""

import re
import os
import numpy as np
import pdfplumber
from rank_bm25 import BM25Okapi
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from groq import Groq

# ---------------------------------------------------------------------------
# Shared model instances (loaded once at import time)
# ---------------------------------------------------------------------------

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")


# ---------------------------------------------------------------------------
# 1. PDF Extraction
# ---------------------------------------------------------------------------

def get_text_from_pdf(path: str) -> list[dict]:
    """
    Extract text from every page of a PDF.

    Returns
    -------
    list[dict]
        Each dict has ``{"id": int, "text": str}``.
    """
    documents = []
    with pdfplumber.open(path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                text = text.strip()
                # Fix soft line-breaks inside paragraphs
                text = re.sub(r'(?<!\n)\n(?!\n)', ' ', text)
                # Collapse multiple spaces / newlines
                text = re.sub(r'\s+', ' ', text)
                documents.append({"id": i, "text": text})
    return documents


# ---------------------------------------------------------------------------
# 2. Chunking
# ---------------------------------------------------------------------------

def split_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 30) -> list[str]:
    """Split a string into overlapping fixed-size chunks."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - chunk_overlap
    return chunks


def split_doc_chunks(documents: list[dict]) -> list[dict]:
    """
    Split every document into text chunks.

    Returns
    -------
    list[dict]
        Each dict has ``{"id": str, "text": str}``.
    """
    chunked = []
    for doc in documents:
        for i, chunk in enumerate(split_text(doc["text"])):
            chunked.append({"id": f"{doc['id']}_chunk{i + 1}", "text": chunk})
    return chunked


# ---------------------------------------------------------------------------
# 3. Embeddings
# ---------------------------------------------------------------------------

def get_embedding(text: str) -> np.ndarray:
    """Return the 384-dim embedding vector for *text*."""
    return embedding_model.encode(text)


def generate_embedding_doc(chunked_documents: list[dict]) -> list[dict]:
    """Attach an ``"embeddings"`` key to every chunk dict (in-place + return)."""
    for chunk in chunked_documents:
        chunk["embeddings"] = get_embedding(chunk["text"])
    return chunked_documents


# ---------------------------------------------------------------------------
# 4. Vector Store (ChromaDB)
# ---------------------------------------------------------------------------

def store_document_into_vdb(chunked_documents: list[dict], collection) -> None:
    """Upsert all chunks into a ChromaDB collection."""
    for chunk in chunked_documents:
        collection.upsert(
            ids=[chunk["id"]],
            documents=[chunk["text"]],
            embeddings=[chunk["embeddings"]],
        )


# ---------------------------------------------------------------------------
# 5. HyDE  (Hypothetical Document Embeddings via Groq)
# ---------------------------------------------------------------------------

def get_llm_documents(question: str, groq_api_key: str) -> str:
    """
    Ask the LLM to write a short hypothetical documentation passage that
    would answer *question*. Used for HyDE retrieval.
    """
    client = Groq(api_key=groq_api_key)
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": (
                    f"You are a technical documentation writer. "
                    f"Write one clear, structured documentation for: {question}. "
                    f"Use simple English words, be brief, and stay on topic."
                ),
            }
        ],
        temperature=1,
        max_completion_tokens=1024,
        top_p=1,
        stream=True,
    )
    chunks = [c.choices[0].delta.content for c in completion]
    return "".join(s for s in chunks if s)


def split_text_llm(text: str) -> list[dict]:
    """Split LLM output by newline, keeping substantive paragraphs (>50 chars)."""
    chunks = []
    for i, paragraph in enumerate(text.split("\n")):
        paragraph = paragraph.strip()
        if len(paragraph) > 50:
            chunks.append({"id": f"chunk_{i}", "text": paragraph, "embedding": None})
    return chunks


def get_llm_embedding(response: str) -> list[dict]:
    """Split and embed an LLM-generated response."""
    llm_docs = split_text_llm(response)
    for doc in llm_docs:
        doc["embeddings"] = get_embedding(doc["text"])
    return llm_docs


# ---------------------------------------------------------------------------
# 6. Hybrid Search  (BM25 + ChromaDB + RRF)
# ---------------------------------------------------------------------------

def hybrid_search(
    question: str,
    chunked_documents: list[dict],
    collection,
    top_k: int = 5,
    k_rrf: int = 60,
) -> list[dict]:
    """
    Reciprocal Rank Fusion of BM25 (keyword) and ChromaDB (semantic) results.

    Returns
    -------
    list[dict]
        Top-k chunk dicts, each with ``id``, ``text``, and ``embeddings``.
    """
    # --- BM25 ---
    corpus = [doc["text"].split() for doc in chunked_documents]
    bm25 = BM25Okapi(corpus)
    bm25_scores = bm25.get_scores(question.split())
    bm25_ranked = sorted(range(len(bm25_scores)), key=lambda i: bm25_scores[i], reverse=True)

    # --- Semantic (ChromaDB) ---
    chroma_results = collection.query(query_texts=[question], n_results=top_k)
    chroma_ids = chroma_results["ids"][0]

    # --- RRF merge ---
    rrf_scores: dict[str, float] = {}
    for rank, idx in enumerate(bm25_ranked[:top_k]):
        doc_id = chunked_documents[idx]["id"]
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0) + 1 / (k_rrf + rank + 1)
    for rank, doc_id in enumerate(chroma_ids):
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0) + 1 / (k_rrf + rank + 1)

    sorted_ids = sorted(rrf_scores, key=rrf_scores.get, reverse=True)[:top_k]
    id_to_chunk = {doc["id"]: doc for doc in chunked_documents}
    return [id_to_chunk[doc_id] for doc_id in sorted_ids if doc_id in id_to_chunk]


# ---------------------------------------------------------------------------
# 7. Re-ranking with HyDE embeddings
# ---------------------------------------------------------------------------

def rerank_with_hyde(
    hyde_embeddings: list[dict],
    hybrid_chunks: list[dict],
    top_k: int = 3,
) -> list[dict]:
    """
    Score each hybrid chunk against all HyDE vectors (cosine similarity).
    Returns the *top_k* chunks sorted by best cosine score.
    """
    hyde_vecs = np.array([doc["embeddings"] for doc in hyde_embeddings])
    results = []
    for chunk in hybrid_chunks:
        chunk_vec = np.array(chunk["embeddings"]).reshape(1, -1)
        scores = cosine_similarity(chunk_vec, hyde_vecs)
        results.append({"text": chunk["text"], "score": float(scores.max())})
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_k]


# ---------------------------------------------------------------------------
# 8. Context assembly
# ---------------------------------------------------------------------------

def get_context_from_chunks(relevant_chunks: list[dict]) -> str:
    """Join the text of all relevant chunks into one context string."""
    return " ".join(c["text"] for c in relevant_chunks)


# ---------------------------------------------------------------------------
# 9. Final answer generation
# ---------------------------------------------------------------------------

def generate_response(question: str, context: str, groq_api_key: str) -> str:
    """
    Generate a concise answer to *question* grounded in *context*.
    Uses Groq / LLaMA 3.1-8b-instant.
    """
    sys_prompt = f"""
You are an assistant for question-answering tasks. Use the following pieces of
retrieved context to answer the question. If you don't know the answer, say that you
don't know. Use three sentences maximum and keep the answer concise.

Instructions:
- Be helpful and answer questions concisely. If you don't know the answer, say 'I don't know'.
- Utilize the context provided for accurate and specific information.
- Incorporate your preexisting knowledge to enhance the depth and relevance of your response.
- Cite your sources.

Context: {context}
"""
    client = Groq(api_key=groq_api_key)
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": question},
        ],
        temperature=1,
        max_completion_tokens=1024,
        top_p=1,
        stream=True,
    )
    res = [c.choices[0].delta.content for c in completion]
    return "".join(s for s in res if s)


# ---------------------------------------------------------------------------
# 10. End-to-end RAG pipeline
# ---------------------------------------------------------------------------

def run_rag_pipeline(
    question: str,
    chunked_documents: list[dict],
    collection,
    groq_api_key: str,
    top_k: int = 5,
    rerank_top_k: int = 3,
) -> str:
    """
    Full RAG pipeline:
      1. HyDE  — generate & embed a hypothetical answer
      2. Hybrid search  — BM25 + ChromaDB + RRF
      3. Re-rank  — cosine similarity vs HyDE vectors
      4. Generate  — final LLM answer grounded in top chunks

    Returns
    -------
    str
        The LLM-generated answer.
    """
    # Step 1 — HyDE
    hyde_doc = get_llm_documents(question, groq_api_key)
    hyde_embeddings = get_llm_embedding(hyde_doc)

    # Step 2 — Hybrid search
    hybrid_chunks = hybrid_search(question, chunked_documents, collection, top_k=top_k)

    # Step 3 — Re-rank
    top_chunks = rerank_with_hyde(hyde_embeddings, hybrid_chunks, top_k=rerank_top_k)

    # Step 4 — Build context & answer
    context = get_context_from_chunks(top_chunks)
    return generate_response(question, context, groq_api_key)

