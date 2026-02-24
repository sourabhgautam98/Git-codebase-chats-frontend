"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ChatMessage from "@/components/ChatMessage";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ;

const SUGGESTION_QUESTIONS = [
  "What is the overall architecture of this project?",
  "What are the main entry points?",
  "Explain the key data models",
  "What external dependencies does this project use?",
];

export default function ChatPage() {
  const { sessionId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [lastSources, setLastSources] = useState({});
  const messagesEndRef = useRef(null);

  // Fetch session list + chat history
  useEffect(() => {
    fetchSessions();
    fetchHistory();
  }, [sessionId]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/chat/sessions`);
      if (res.ok) setSessions(await res.json());
    } catch {}
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/chat/history/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setSessionInfo({ repoName: data.repoName, repoUrl: data.repoUrl, status: data.status });
        setMessages(data.messages || []);
      }
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput("");

    // Optimistic add user message
    setMessages((prev) => [
      ...prev,
      { role: "user", content: question, timestamp: new Date().toISOString() },
    ]);

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, question }),
      });

      const data = await res.json();

      if (res.ok) {
        const assistantMsg = {
          role: "assistant",
          content: data.answer,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        // Store sources for the last assistant message index
        setLastSources((prev) => ({
          ...prev,
          [messages.length + 1]: data.sources,
        }));
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `⚠️ Error: ${data.error || "Failed to get response"}`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Failed to connect to server. Make sure the backend is running.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (q) => {
    setInput(q);
  };

  return (
    <div className="app-layout">
      <Sidebar
        sessions={sessions}
        activeSessionId={sessionId}
        onNewChat={() => (window.location.href = "/")}
      />

      <main className="main-content">
        <div className="chat-container">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-icon">💻</div>
            <div className="chat-header-info">
              <h3>{sessionInfo?.repoName || "Loading..."}</h3>
              <span>{sessionInfo?.repoUrl}</span>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 && !loading ? (
              <div className="empty-chat">
                <div className="empty-chat-icon">💬</div>
                <h3>Ask anything about this codebase</h3>
                <p>
                  The AI has analyzed the source code. Try asking about
                  architecture, functions, patterns, or anything else.
                </p>
                <div className="suggestion-chips">
                  {SUGGESTION_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      className="suggestion-chip"
                      onClick={() => handleSuggestion(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <ChatMessage
                    key={i}
                    message={msg}
                    sources={lastSources[i] || null}
                  />
                ))}

                {loading && (
                  <div className="message assistant">
                    <div className="message-avatar">🤖</div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-wrapper">
            <form className="chat-input-form" onSubmit={handleSubmit}>
              <textarea
                className="chat-input"
                placeholder="Ask about the codebase..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={loading || sessionInfo?.status !== "ready"}
                rows={1}
              />
              <button
                type="submit"
                className="chat-send-btn"
                disabled={loading || !input.trim()}
              >
                ➤
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
