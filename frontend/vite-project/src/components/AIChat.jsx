import { useState } from "react";
import api from "../service/api";
import "./AIChat.css"

function AIChat() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const askAI = async (e) => {
        e.preventDefault();

        if (!question.trim()) {
            setError("Please enter a question");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setAnswer("");

            const response = await api.post("/ai/ask", {
                question: question.trim()
            });

            setAnswer(response.data.answer);
            setQuestion("");

        } catch (error) {
            console.error(error);
            setError("Failed to get AI response");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-chat">
            <h2>SOURAV AI 🤖</h2>

            <form onSubmit={askAI}>
                <input
                    type="text"
                    placeholder="Ask LifeOS AI..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Thinking..." : "Ask AI"}
                </button>
            </form>

            {error && <p>{error}</p>}

            {answer && (
                <div>
                    <h3>AI Answer</h3>
                    <p>{answer}</p>
                </div>
            )}
        </div>
    );
}

export default AIChat;