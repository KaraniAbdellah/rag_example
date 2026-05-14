import os
import hashlib
import nltk

from dotenv import dotenv_values
import chromadb
from chromadb.utils import embedding_functions
from rank_bm25 import BM25Okapi

from google import genai
from google.genai import types

from groq import Groq


# =========================
# INIT
# =========================
config = dotenv_values(".env")

GROQ_API_KEY = config["GROQ_API_KEY"]
GEMINI_API_KEY = config["GEMENI_API_KEY"]

os.environ["GEMINI_API_KEY"] = GEMINI_API_KEY

gemini_client = genai.Client(api_key=GEMINI_API_KEY)
groq_client = Groq(api_key=GROQ_API_KEY)


# =========================
# HASHING FUNCTION
# =========================
def hash_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


# =========================
# EMBEDDING FUNCTION (VECTOR DB)
# =========================
google_ef = embedding_functions.GoogleGeminiEmbeddingFunction(
    model_name="gemini-embedding-001",
    task_type="RETRIEVAL_DOCUMENT",
    dimension=768,
)


# =========================
# CHROMA DB
# =========================
chroma_client = chromadb.PersistentClient(path="articles")

collection = chroma_client.get_or_create_collection(
    name="articles",
    embedding_function=google_ef
)


# =========================
# LOAD DATA
# =========================
def load_documents(directory):
    docs = []
    for f in os.listdir(directory):
        if f.endswith(".txt"):
            with open(os.path.join(directory, f), "r", encoding="utf-8") as file:
                docs.append({"id": f, "text": file.read()})
    return docs


# =========================
# CHUNKING
# =========================
def split_text(text, chunk_size=1000, overlap=50):
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap

    return chunks


# =========================
# BUILD DATASET
# =========================
docs = load_documents("./news_articles/")

chunks = []

for d in docs:
    for i, c in enumerate(split_text(d["text"])):
        chunks.append({
            "id": f"{d['id']}_chunk{i}",
            "text": c,
            "hash": hash_text(c)
        })

chunks = chunks[:50]


# =========================
# EMBEDDINGS + VECTOR STORE
# =========================
for c in chunks:
    c["embedding"] = gemini_client.models.embed_content(
        model="gemini-embedding-2",
        contents=c["text"],
        config=types.EmbedContentConfig(output_dimensionality=768),
    ).embeddings[0].values


for c in chunks:
    collection.upsert(
        ids=[c["id"]],
        documents=[c["text"]],
        embeddings=[c["embedding"]],
        metadatas=[{"hash": c["hash"]}]
    )


# =========================
# BM25 INDEX
# =========================
nltk.download("punkt")

corpus = [c["text"] for c in chunks]
tokenized_corpus = [nltk.word_tokenize(t.lower()) for t in corpus]

bm25 = BM25Okapi(tokenized_corpus)


# =========================
# BM25 RETRIEVAL
# =========================
def bm25_retrieval(question, k=10):
    tokens = nltk.word_tokenize(question.lower())
    scores = bm25.get_scores(tokens)

    top_idx = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:k]

    return [corpus[i] for i in top_idx]


# =========================
# VECTOR RETRIEVAL
# =========================
def vector_retrieval(question, k=10):
    res = collection.query(
        query_texts=[question],
        n_results=k
    )
    return res["documents"][0]


# =========================
# HYDE (HYPOTHETICAL DOC)
# =========================
def hyde(question):
    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "Write a short factual paragraph answering the question."
            },
            {"role": "user", "content": question}
        ],
        temperature=0.7,
        max_completion_tokens=200
    )

    return response.choices[0].message.content


# =========================
# HYDE + VECTOR (DM25 STYLE)
# =========================
def hyde_vector_retrieval(question, k=10):
    expanded = hyde(question)

    res = collection.query(
        query_texts=[expanded],
        n_results=k
    )

    return res["documents"][0]


# =========================
# FINAL RAG ANSWER
# =========================
def generate_answer(question, context):
    prompt = f"""
Use the context to answer briefly (max 3 sentences).

Context:
{context}
"""

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": question}
        ],
        temperature=0.5,
        max_completion_tokens=300
    )

    return response.choices[0].message.content


# =========================
# FULL COMPARISON PIPELINE
# =========================
def run_pipeline(question):
    print("\n================ QUESTION ================")
    print(question)

    bm25_results = bm25_retrieval(question, 5)
    vector_results = vector_retrieval(question, 5)
    hyde_results = hyde_vector_retrieval(question, 5)

    print("\n================ BM25 ================")
    # print("\n".join(bm25_results[:3]))

    print("\n================ VECTOR ================")
    # print("\n".join(vector_results[:3]))

    print("\n================ HYDE ================")
    # print("\n".join(hyde_results[:3]))

    # final answer using HYDE (best quality)
    context = "\n".join(hyde_results)
    answer = generate_answer(question, context)

    print("\n================ FINAL ANSWER ================")
    print(answer)


# =========================
# TEST
# =========================
run_pipeline("What is supply chain management?")