"use client";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function ChatMessage({ message, sources }) {
  const isUser = message.role === "user";

  return (
    <div className={`message ${message.role}`}>
      <div className="message-avatar">
        {isUser ? "👤" : "🤖"}
      </div>
      <div className="message-content">
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <>
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={nightOwl}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        borderRadius: "8px",
                        fontSize: "13px",
                        margin: "12px 0",
                      }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>

            {sources && sources.length > 0 && (
              <div className="message-sources">
                <div className="message-sources-title">📎 Source Files</div>
                {sources.map((src, i) => (
                  <span key={i} className="source-tag">
                    {src}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
