# Generated from: app.ipynb
# Converted at: 2026-05-14T14:29:56.293Z
# Next step (optional): refactor into modules & generate tests with RunCell
# Quick start: pip install runcell

import pandas as pd
from dotenv import dotenv_values
from openai import OpenAI
import chromadb
from chromadb.utils import embedding_functions
import os
from groq import Groq
from dotenv import dotenv_values
from pprint import pprint
from google import genai
from google.genai import types

# Load Env Varaibles + Import Function Help Us to Embeding Documents
config = dotenv_values(".env")
GROQ_API_KEY = config["GROQ_API_KEY"]
GEMENI_API_KEY = config["GEMENI_API_KEY"]

# try Gemeni Embedding Function
gemeni_client = genai.Client(api_key=GEMENI_API_KEY)
result = gemeni_client.models.embed_content(
        model="gemini-embedding-2",
        contents="What is the meaning of life?"
)
print(result.embeddings[0].values)

os.environ["GEMINI_API_KEY"] = GEMENI_API_KEY
google_ef = embedding_functions.GoogleGeminiEmbeddingFunction(
    model_name="gemini-embedding-001",
    task_type="RETRIEVAL_DOCUMENT",
    dimension=768,
)



# Init Chroma Vector Database
chroma_client = chromadb.PersistentClient(path="articles")
collecation_name = "articles"
collection = chroma_client.get_or_create_collection(name=collecation_name, embedding_function=google_ef)
print(collection)

# Function to load documents from a directory
def load_documents_from_directory(directory_path):
    documents = []
    for filename in os.listdir(directory_path):
        if filename.endswith(".txt"):
            with open(os.path.join(directory_path, filename), "r", encoding="utf-8") as file:
                documents.append({"id": filename, "text": file.read()})
    return documents

# Function to split text into chunks
def split_text(text, chunk_size=1000, chunk_overlap=20):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - chunk_overlap
    return chunks

# Load documents from the directory
directory_path = "./news_articles/"
documents = load_documents_from_directory(directory_path=directory_path)
print(f"Number Of Documents: {len(documents)}")

# Split documents into chunks
chunked_documents = []
for doc in documents:
    chunks = split_text(text=doc["text"])
    for i, chunk in enumerate(chunks):
        chunked_documents.append({"id": f"{doc["id"]}_chunk{i+1}", "text": chunk})
print(len(chunked_documents))

# Function to Generate embeddings for the document chunks - Doc2Vect
def get_gemeni_embedding(text):
    response = gemeni_client.models.embed_content(
        model="gemini-embedding-2",
        contents=text,
        config=types.EmbedContentConfig(
            output_dimensionality=768
        )
)
    embedding = response.embeddings[0].values
    return embedding

# Get Embedding Vectors
chunked_documents = chunked_documents[0:50]
for doc_chunk in chunked_documents:
    doc_chunk['embeddings'] = get_gemeni_embedding(doc_chunk["text"])


print(len(chunked_documents))

# Save Embedding Into Vector Database
for doc_chunk in chunked_documents:
    collection.upsert(ids=[doc_chunk["id"]], documents=[doc_chunk["text"]], embeddings=[doc_chunk["embeddings"]])

collection.get(ids=["05-06-amazon-launches-free-channels-check-marks-come-to-gmail-and-openai-raises-more-moolah.txt_chunk1"],
    include=["embeddings"])

# Function That Query Documents
'''
    collection.query(): find the documents most related to text
        - query_texts: the question or text you want to search with.
        - n_results: how many documents we want back.
'''
def query_documents(question, n_results=2):
    relevant_chunks = collection.query(
        query_texts=question,
        n_results=n_results
    )
    
    # Extract The Relevent Chunks
    relevant_chunks = [doc for sublist in relevant_chunks["documents"] for doc in sublist]
    return relevant_chunks

# query_documents("What is machine learning?", n_results=100)

client_groq = Groq(api_key=GROQ_API_KEY)
completion = client_groq.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=[
    {
        "role": "system",
        "content": "What Is Machine Learning ? You are an assistant for question-answering tasks. Use the following pieces of "
        "retrieved context to answer the question. If you don't know the answer, say that you " +
        "don't know. Use three sentences maximum and keep the answer concise." + "ogle Account users globally, roughly a year after the company — alongside Apple, Microsoft and the FIDO Alliance — announced a partnership to broadly advance passkey adoption. With passkeys, users authentication synchronizes across devices through the cloud using cryptographic key pairs, allowing them to sign in to websites and apps using the same biometrics or screen-lock PIN they use to unlock their devices.",
    },
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

print(type(res))
res = [s for s in res if s]
res = "".join(res)
print(res)

# Function That Generate Reponse
client_groq = Groq(api_key=GROQ_API_KEY)
def generate_reponse(question, relevant_chunks):
    context = "".join(relevant_chunks)
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

question = "What is supply chain ?"
relevant_chunks = query_documents(question, n_results=100)
response = generate_reponse(question=question, relevant_chunks=relevant_chunks)
print(response)

