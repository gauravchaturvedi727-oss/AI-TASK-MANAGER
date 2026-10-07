from flask import Flask, request, jsonify
from transformers import pipeline
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np


app = Flask(__name__)


# ==========================================
# 1. LOAD QWEN
# ==========================================

print("Loading Qwen...")

llm = pipeline(
    "text-generation",
    model="Qwen/Qwen2.5-0.5B-Instruct"
)

print("Qwen loaded!")


# ==========================================
# 2. LOAD EMBEDDING MODEL
# ==========================================

print("Loading embedding model...")

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

print("Embedding model loaded!")


# ==========================================
# 3. CREATE TASK RETRIEVER
# ==========================================

def retrieve_tasks(question, tasks, k=3):

    if not tasks:
        return []

    # --------------------------------------
    # Convert MongoDB tasks into text
    # --------------------------------------

    task_texts = []

    for task in tasks:

        task_text = f"""
Title: {task.get("title", "")}
Description: {task.get("description", "")}
Completed: {task.get("completed", False)}
"""

        task_texts.append(task_text.strip())


    # --------------------------------------
    # Create embeddings for tasks
    # --------------------------------------

    task_embeddings = embedding_model.encode(
        task_texts,
        normalize_embeddings=True
    )

    task_embeddings = np.array(
        task_embeddings
    ).astype("float32")


    # --------------------------------------
    # Create FAISS index
    # --------------------------------------

    dimension = task_embeddings.shape[1]

    index = faiss.IndexFlatIP(dimension)

    index.add(task_embeddings)


    # --------------------------------------
    # Create question embedding
    # --------------------------------------

    question_embedding = embedding_model.encode(
        [question],
        normalize_embeddings=True
    )

    question_embedding = np.array(
        question_embedding
    ).astype("float32")


    # --------------------------------------
    # Search similar tasks
    # --------------------------------------

    number_of_results = min(k, len(tasks))

    scores, indices = index.search(
        question_embedding,
        number_of_results
    )


    # --------------------------------------
    # Get relevant tasks
    # --------------------------------------

    relevant_tasks = []

    for index_value in indices[0]:

        if index_value < len(task_texts):

            relevant_tasks.append(
                task_texts[index_value]
            )


    return relevant_tasks


# ==========================================
# 4. GENERATE ANSWER
# ==========================================

def generate_answer(question, context):

    prompt = f"""
You are LifeOS AI, a helpful personal productivity assistant.

Use the following tasks as context.

Tasks:
{context}

User Question:
{question}

Give a helpful and concise answer based only on the available tasks.

Answer:
"""

    result = llm(
        prompt,
        max_new_tokens=150,
        temperature=0.7,
        do_sample=True
    )

    generated_text = result[0]["generated_text"]

    answer = generated_text[len(prompt):].strip()

    return answer


# ==========================================
# 5. HOME
# ==========================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "success": True,
        "message": "LifeOS AI RAG service is running"
    })


# ==========================================
# 6. ASK
# ==========================================

@app.route("/ask", methods=["POST"])
def ask():

    try:

        data = request.get_json()

        question = data.get("question")

        tasks = data.get("tasks", [])


        if not question:

            return jsonify({
                "success": False,
                "message": "Question is required"
            }), 400


        # ----------------------------------
        # Retrieve relevant tasks
        # ----------------------------------

        relevant_tasks = retrieve_tasks(
            question,
            tasks,
            k=3
        )


        # ----------------------------------
        # Create context
        # ----------------------------------

        context = "\n\n".join(
            relevant_tasks
        )


        # ----------------------------------
        # Generate AI answer
        # ----------------------------------

        answer = generate_answer(
            question,
            context
        )


        return jsonify({

            "success": True,

            "question": question,

            "relevant_tasks": relevant_tasks,

            "answer": answer

        })


    except Exception as error:

        print("AI Error:", error)

        return jsonify({

            "success": False,

            "message": "AI service failed",

            "error": str(error)

        }), 500


# ==========================================
# 7. RUN
# ==========================================

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5001
    )