"use client";

import { useRouter } from "next/navigation";

export default function Sidebar({ sessions, activeSessionId, onNewChat }) {
  const router = useRouter();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <a href="/" className="sidebar-logo">
          <div className="sidebar-logo-icon">⚡</div>
          <div>
            <h1>CodeChat AI</h1>
            <span>RAG-powered code assistant</span>
          </div>
        </a>
      </div>

      {/* New Chat */}
      <button className="sidebar-new-btn" onClick={onNewChat}>
        <span>＋</span> New Repository
      </button>

      {/* Sessions */}
      <div className="sidebar-sessions">
        <div className="sidebar-section-title">Recent Repositories</div>
        {(!sessions || sessions.length === 0) && (
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              padding: "12px 8px",
            }}
          >
            No repositories ingested yet.
          </p>
        )}
        {sessions?.map((session) => (
          <div
            key={session._id}
            className={`session-item ${
              activeSessionId === session._id ? "active" : ""
            }`}
            onClick={() => router.push(`/chat/${session._id}`)}
          >
            <div className="session-item-name">{session.repoName}</div>
            <div className="session-item-meta">
              <span
                className={`session-status ${session.status}`}
              ></span>
              {session.status === "ready" ? "Ready" : session.status === "ingesting" ? "Ingesting..." : "Error"}
              <span>·</span>
              <span>
                {new Date(session.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
