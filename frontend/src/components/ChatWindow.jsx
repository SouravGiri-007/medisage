import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import ReactMarkdown from "react-markdown";

const SUGGESTIONS = [
  "What are my critical findings?",
  "Is my cholesterol level concerning?",
  "What lifestyle changes do you recommend?",
  "Explain my hemoglobin levels",
  "Do I need to see a specialist?",
];

export default function ChatWindow({ reportText, sessionId }) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I've analyzed your report. Ask me anything about your results, what the values mean, or what steps you should take next.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const token = await getToken();
      const res = await api.post("/chat/message", {
        session_id: sessionId,
        message: msg,
        report_text: reportText,
        chat_history: messages,
      }, token);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.response || "Sorry, I couldn't process that." },
      ]);
    } catch (_) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again." },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[580px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
              msg.role === "assistant"
                ? "bg-gradient-to-br from-cyan-400 to-blue-600 text-white"
                : "bg-slate-700 text-white"
            }`}>
              {msg.role === "assistant" ? "🧬" : "U"}
            </div>
            <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
              msg.role === "user"
                ? "bg-cyan-500/20 text-white border border-cyan-500/30"
                : "bg-slate-800 text-slate-200"
            }`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-li:my-0.5">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xs flex-shrink-0">🧬</div>
            <div className="bg-slate-800 rounded-xl px-4 py-3 flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-full transition-colors border border-slate-700"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-800 p-4 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about your report..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-900 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
