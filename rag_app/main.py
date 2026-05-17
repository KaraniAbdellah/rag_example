# Generated from: main.ipynb
# Converted at: 2026-05-17T20:25:15.852Z
# Next step (optional): refactor into modules & generate tests with RunCell
# Quick start: pip install runcell

# # 🔍 Local RAG Pipeline
# 
# A local Retrieval-Augmented Generation (RAG) pipeline using:
# - **ChromaDB** for vector storage
# - **SentenceTransformers** (`all-MiniLM-L6-v2`) for embeddings
# - **Groq / LLaMA 3** as the language model
# - **BM25** for keyword-based pre-filtering (HyDE technique)
# - **pdfplumber** for PDF text extraction


# ## 1. Import Packages


import os
import re

import pandas as pd
import requests
from pprint import pprint
from dotenv import dotenv_values

from groq import Groq
from google import genai
from google.genai import types
from openai import OpenAI

import chromadb
from chromadb.utils import embedding_functions
from sentence_transformers import SentenceTransformer

import pdfplumber
from pypdf import PdfReader
from rank_bm25 import BM25Okapi
from sklearn.metrics.pairwise import cosine_similarity

import numpy as np

# ## 2. Configuration
# 
# Load API keys and secrets from the `.env` file.


# Load environment variables
config = dotenv_values(".env")

GROQ_API_KEY  = config["GROQ_API_KEY"]
GEMINI_API_KEY = config["GEMINI_API_KEY"]
HF_TOKEN      = config.get("HF_TOKEN")

# Make HuggingFace token available to the transformers library
os.environ["HF_TOKEN"] = HF_TOKEN

# ## 3. Embedding Model
# 
# Load `all-MiniLM-L6-v2` from SentenceTransformers. This model converts text into 384-dimensional vectors.


model = SentenceTransformer("all-MiniLM-L6-v2")

# Quick sanity check
sample_sentence = "What is the Meaning of Life?"
sample_embedding = model.encode(sample_sentence)
print(f"Embedding shape: {sample_embedding.shape}")

# ## 4. Vector Database (ChromaDB)
# 
# Initialize a persistent ChromaDB collection. Documents will be stored on disk under `./course/`.


chroma_client    = chromadb.PersistentClient(path="course")
collection_name  = "course"
embedding_fn     = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

collection = chroma_client.get_or_create_collection(
    name=collection_name,
    embedding_function=embedding_fn
)
print(collection)

# ## 5. PDF Text Extraction
# 
# Read a PDF file page by page, clean the extracted text, and return a list of page documents.


def get_text_from_pdf(path):
    documents = []
    with pdfplumber.open(path) as pdf:
        print(f"Number of pages: {len(pdf.pages)}")

        for i, page in enumerate(pdf.pages):
            text = page.extract_text()

            if text:
                # Remove leading/trailing whitespace
                text = text.strip()

                # Fix soft line breaks inside paragraphs
                text = re.sub(r'(?<!\n)\n(?!\n)', ' ', text)

                # Normalize multiple spaces / newlines
                text = re.sub(r'\s+', ' ', text)

                documents.append({"id": i, "text": text})

    return documents

documents = get_text_from_pdf("cover_letter.pdf")
print(f"Total pages loaded: {len(documents)}")

documents[0]

# ## 6. Text Chunking
# 
# Split each page's text into overlapping fixed-size chunks so that long pages fit within embedding/LLM context limits.


def split_text(text, chunk_size=1000, chunk_overlap=30):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - chunk_overlap
    return chunks

# Preview the first document
documents[0]

# Split all documents into chunks
def split_doc_chunks(documents):
    chunked_documents = []
    for doc in documents:
        chunks = split_text(doc["text"])
        for i, chunk in enumerate(chunks):
            chunked_documents.append({
                "id"  : f"{doc['id']}_chunk{i + 1}",
                "text": chunk
            })
    return chunked_documents

# ## 7. Embedding Generation
# 
# Encode each text chunk into a dense vector using the SentenceTransformer model.


def get_embedding(text):
    """Return the embedding vector for a given text string."""
    embeddings = model.encode(text)
    return embeddings

# Generate and attach embeddings to every chunk
def generate_embedding_doc(chunked_documents):
    for doc_chunk in chunked_documents:
        doc_chunk["embeddings"] = get_embedding(doc_chunk["text"])
    return chunked_documents

# ## 8. Index Chunks into ChromaDB
# 
# Upsert all chunks (text + embedding) into the persistent vector store.


def store_document_into_vdb(chunked_documents, collection):
    for doc_chunk in chunked_documents:
        collection.upsert(
            ids       =[doc_chunk["id"]],
            documents =[doc_chunk["text"]],
            embeddings=[doc_chunk["embeddings"]]
        )
print("Indexing complete.")

# ## 9. LLM Integration (Groq / LLaMA 3)
# 
# Use the Groq API with `llama-3.1-8b-instant` to generate a hypothetical document for a user question (HyDE — Hypothetical Document Embeddings).


client_groq = Groq(api_key=GROQ_API_KEY)

def get_llm_documents(question):
    """Generate a short hypothetical documentation passage for `question`."""
    completion = client_groq.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role"   : "system",
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
        stop=None
    )

    res = [chunk.choices[0].delta.content for chunk in completion]
    res = [s for s in res if s]
    return "".join(res)

# Test HyDE document generation
response = get_llm_documents(question="What is AI?")
print(response)

# ## 10. LLM Document Splitting & Embedding
# 
# Break the hypothetical LLM response into paragraph-level chunks and embed them.


def split_text_llm(text):
    """Split LLM-generated text by newlines, keeping only substantive paragraphs."""
    chunks = []
    for i, paragraph in enumerate(text.split("\n")):
        paragraph = paragraph.strip()
        if len(paragraph) > 50:
            chunks.append({
                "id"       : f"chunk_{i}",
                "text"     : paragraph,
                "embedding": None
            })
    return chunks

def get_llm_embedding(response):
    """Split and embed an LLM-generated response."""
    llm_documents = split_text_llm(response)
    for doc_chunk in llm_documents:
        doc_chunk["embeddings"] = get_embedding(doc_chunk["text"])
    return llm_documents

# ## 11. BM25 Keyword Search
# 
# `collection.query()` does semantic (dense) search. Here we add a BM25 (sparse) keyword pass to pre-filter candidates before re-ranking by cosine similarity.


def bm25_search(bm25, question, chunked_documents, top_k=2):
    """
    Return the top-k chunks most relevant to `question` using BM25 scoring.

    Parameters
    ----------
    bm25             : BM25Okapi  — pre-built BM25 index
    question         : str        — user query
    chunked_documents: list[dict] — original chunk list (text + embeddings)
    top_k            : int        — number of results to return
    """
    tokenized_query = question.split()
    scores          = bm25.get_scores(tokenized_query)
    top_indices     = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:top_k]

    return [
        {
            "text"      : chunked_documents[i]["text"],
            "embeddings": chunked_documents[i]["embeddings"],
            "score"     : scores[i]
        }
        for i in top_indices
    ]

# ## 12. Full Retrieval Pipeline (HyDE + Hybrid Search)
# 
# Combine HyDE (Hypothetical Document Embeddings) with BM25 keyword filtering:
# 
# 1. Generate a hypothetical answer with the LLM  
# 2. Embed the hypothetical answer  
# 3. Use BM25 to filter the most keyword-relevant corpus chunks


# This for keyword Search
def rerank_with_bm25(hyde_embeddings, bm25_chunks, top_k=2):
    """
        Compare the reel filtred chunks that generated by BM25
        with the embeddings hypothetical HyDE.
        return chunks classed by similarity.
    """
    # Extract Vectors HyDE  (shape: [n_hyde, 384])
    hyde_vecs = np.array([doc["embeddings"] for doc in hyde_embeddings])

    results = []
    for chunk in bm25_chunks:
        chunk_vec = np.array(chunk["embeddings"]).reshape(1, -1)

        # Cosine similarity with with this chunk and each vecor in hyde vectors
        scores = cosine_similarity(chunk_vec, hyde_vecs)
        best_score = float(scores.max())  # get max score

        results.append({
            "text" : chunk["text"],
            "score": best_score
        })

    # Sort by Score
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_k]

# Re-Rank with hybrid search
'''
    - hybrid search with AI responses by combining keyword search with semantic.
    - which looks for exact words) and semantic search (which looks for meaning).
'''
def hybrid_search(question, chunked_documents, collection, top_k=5, k_rrf=60):
    
    # Keyword Search by BM25
    corpus      = [doc["text"].split() for doc in chunked_documents]
    bm25        = BM25Okapi(corpus)
    bm25_scores = bm25.get_scores(question.split())
    bm25_ranked = sorted(range(len(bm25_scores)), key=lambda i: bm25_scores[i], reverse=True)

    # Semantic Search (ChromaDB)
    chroma_results = collection.query(query_texts=[question], n_results=top_k)
    chroma_ids     = chroma_results["ids"][0]

    # Merge the Two (RRF) [Reciprocal Rank Fusion]
    rrf_scores = {}

    for rank, idx in enumerate(bm25_ranked[:top_k]):
        doc_id = chunked_documents[idx]["id"]
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0) + 1 / (k_rrf + rank + 1)

    for rank, doc_id in enumerate(chroma_ids):
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0) + 1 / (k_rrf + rank + 1)

    sorted_ids = sorted(rrf_scores, key=rrf_scores.get, reverse=True)[:top_k]

    # Return Result as Chunks With Embedding
    id_to_chunk = {doc["id"]: doc for doc in chunked_documents}
    return [id_to_chunk[doc_id] for doc_id in sorted_ids if doc_id in id_to_chunk]

# Check Similarity of HyDE vectors vs Real Chunks
def rerank_with_hyde(hyde_embeddings, hybrid_chunks, top_k=3):
    """
    Compare HyDE embeddings with real chunk embeddings using cosine similarity.
    Return the top_k most similar chunks.
    """
    hyde_vecs = np.array([doc["embeddings"] for doc in hyde_embeddings])

    results = []
    for chunk in hybrid_chunks:
        chunk_vec  = np.array(chunk["embeddings"]).reshape(1, -1)
        scores     = cosine_similarity(chunk_vec, hyde_vecs)
        best_score = float(scores.max())

        results.append({
            "text" : chunk["text"],
            "score": best_score
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_k]

def get_context_from_chunks(relevant_chunks):
    context = [c["text"] for c in relevant_chunks]
    return " ".join(context)

# Function That Generate Reponse
client_groq = Groq(api_key=GROQ_API_KEY)
def generate_response(question, context):
    sys_prompt = f"""
        You are an assistant for question-answering tasks. Use the following pieces of 
        retrieved context to answer the question. If you don't know the answer, say that you
        don't know. Use three sentences maximum and keep the answer concise.
            Instructions:
            - Be helpful and answer questions concisely. If you don't know the answer, say 'I don't know'
            - Utilize the context provided for accurate and specific information.
            - Incorporate your preexisting knowledge to enhance the depth and relevance of your response.
            - Cite your sources
        Context :{context}
        """
    completion = client_groq.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
        {
            "role": "system",
            "content": sys_prompt,
        },
        {
            "role": "user",
            "content": question
        }
        ],
        temperature=1,
        max_completion_tokens=1024,
        top_p=1,
        stream=True,
        stop=None
    )

    res = []
    for chunk in completion:
        res.append(chunk.choices[0].delta.content)

    res = [s for s in res if s]
    res = "".join(res)
    return res

# Step 0: Get Documents From PDF
path = "cover_letter.pdf"
documents = get_text_from_pdf(path=path)
chunked_documents = split_doc_chunks(documents=documents)
chunked_documents = generate_embedding_doc(chunked_documents=chunked_documents)
store_document_into_vdb(chunked_documents=chunked_documents,collection=collection)

chunked_documents[0]

question = "tell Me something about Abdellah karani ?"

# Step 1: Generate a hypothetical answer (HyDE)
hyde_doc = get_llm_documents(question)

# Step 2: Embed the hypothetical answer
hyde_doc_embedding = get_llm_embedding(hyde_doc)
# print("HyDE embeddings:", hyde_doc_embedding)

# Step 3: Hybrid Search (KeyWord Search + Semantic Search)
filtered_chunks = hybrid_search(question, chunked_documents, collection, top_k=5, k_rrf=60)
# print("\nBM25 top chunks:", filtered_chunks)

# Step 4: Check Similiarity of Two Vector 
top_chunks = rerank_with_hyde(hyde_doc_embedding, filtered_chunks, top_k=3)

# Step 5: Build Context from Top Chunks
context = get_context_from_chunks(top_chunks)

# Step 6: Generate Final Response
response = generate_response(question=question, context=context)
print(response)