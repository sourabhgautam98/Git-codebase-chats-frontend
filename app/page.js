"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ;

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); 
  const [sessions, setSessions] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/chat/sessions`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch {
    }
  };

  const handleIngest = async (e) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setLoading(true);
    setStatus({ type: "loading", message: "🔄 Cloning repository and processing code files... This may take a minute." });

    try {
      const res = await fetch(`${API_BASE}/repo/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: repoUrl.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({
          type: "success",
          message: `✅ ${data.message}${data.stats ? ` — ${data.stats.vectorsStored} code chunks embedded.` : ""}`,
        });
        setRepoUrl("");
        fetchSessions();

    
        setTimeout(() => {
          router.push(`/chat/${data.sessionId}`);
        }, 1500);
      } else {
        setStatus({ type: "error", message: `❌ ${data.error || "Ingestion failed"}` });
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: `❌ Failed to connect to server. Make sure the backend is running on port 5000.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        sessions={sessions}
        activeSessionId={null}
        onNewChat={() => {
          setStatus(null);
          setRepoUrl("");
        }}
      />

      <main className="main-content">
        <div className="landing">
          <div className="landing-hero">
            <div className="landing-icon">💬</div>
            <h2>Chat with Any Codebase</h2>
            <p>
              Paste a GitHub repository URL and start asking questions about the code.
              AI-powered by Gemini with context from the actual source files.
            </p>

            <form className="repo-input-wrapper" onSubmit={handleIngest}>
              <input
                type="url"
                className="repo-input"
                placeholder="https://github.com/owner/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                disabled={loading}
                required
              />
              <button type="submit" className="ingest-btn" disabled={loading || !repoUrl.trim()}>
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Processing
                  </>
                ) : (
                  <>🚀 Ingest</>
                )}
              </button>
            </form>

            {status && (
              <div className={`status-message ${status.type}`}>
                {status.message}
              </div>
            )}

            <div className="landing-features">
              <div className="feature-card">
                <div className="feature-card-icon">📂</div>
                <h4>Clone & Parse</h4>
                <p>Automatically clones and parses code files</p>
              </div>
              <div className="feature-card">
                <div className="feature-card-icon">🧠</div>
                <h4>Smart Embeddings</h4>
                <p>Google AI embeds code for semantic search</p>
              </div>
              <div className="feature-card">
                <div className="feature-card-icon">💡</div>
                <h4>Contextual Answers</h4>
                <p>Gemini answers with actual code context</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
