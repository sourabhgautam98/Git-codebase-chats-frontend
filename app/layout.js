import "./globals.css";

export const metadata = {
  title: "AI Codebase Chat — Understand Any Repository",
  description:
    "Upload a GitHub repository and chat with its codebase using AI. Powered by Gemini, Pinecone, and LangChain.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
