import React, { useState } from "react";
import API from "../api";
import Layout from "./Layout";

function AIChatAssistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) {
      alert("Please type a question");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("ai-chat/", {
        question: question,
      });

      setMessages([
        ...messages,
        { type: "user", text: question },
        { type: "bot", text: res.data.answer },
      ]);

      setQuestion("");
    } catch (error) {
      console.log(error);
      alert("AI assistant failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page">
        <h1>AI Chat Assistant</h1>

        <div className="card chat-card">
          <div className="chat-box">
            {messages.length === 0 && (
              <p>Ask questions like: How many workers are present today?</p>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={msg.type === "user" ? "user-msg" : "bot-msg"}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <input
            type="text"
            placeholder="Ask: How many workers are present today?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                askQuestion();
              }
            }}
          />

          <button onClick={askQuestion} disabled={loading}>
            {loading ? "Thinking..." : "Ask Assistant"}
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default AIChatAssistant;