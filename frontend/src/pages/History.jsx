import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import api from "../utils/api";
import ReactMarkdown from "react-markdown";

export default function History() {
  const { getToken } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        const data = await api.get("/analysis/history", token);
        if (!data.error) setHistory(data.history || []);
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  const scoreColor = (score) => {
    if (!score) return "text-slate-400";
    if (score >= 75) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Analysis History</h1>
          <p className="text-slate-400 mt-1 text-sm">All your past blood report analyses</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-white font-medium">No analyses yet</p>
            <p className="text-slate-400 text-sm mt-1">Upload your first blood report to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((h) => (
              <div key={h.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                {/* Header row */}
                <button
                  onClick={() => setExpanded(expanded === h.id ? null : h.id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium">{h.patient_name || "Unknown Patient"}</span>
                      {h.health_score && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 ${scoreColor(h.health_score.score)}`}>
                          {h.health_score.grade} · {h.health_score.score}/100
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-slate-500 text-xs">
                        {new Date(h.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                      {h.age && <span className="text-slate-600 text-xs">·</span>}
                      {h.age && <span className="text-slate-500 text-xs">Age {h.age}</span>}
                      {h.gender && <span className="text-slate-600 text-xs">·</span>}
                      {h.gender && <span className="text-slate-500 text-xs">{h.gender}</span>}
                      <span className="text-slate-600 text-xs">·</span>
                      <span className="text-slate-500 text-xs">{h.model_used?.split("/").pop() || "AI"}</span>
                    </div>
                  </div>
                  <span className="text-slate-500 text-xs">{expanded === h.id ? "▲ Collapse" : "▼ View"}</span>
                </button>

                {/* Expanded analysis */}
                {expanded === h.id && (
                  <div className="border-t border-slate-800 p-5">
                    {h.health_score?.summary && (
                      <div className="bg-slate-800/50 rounded-lg px-4 py-3 mb-4 text-slate-300 text-sm">
                        💡 {h.health_score.summary}
                      </div>
                    )}
                    <div className="prose prose-invert prose-sm max-w-none
                      prose-headings:text-white prose-p:text-slate-300
                      prose-li:text-slate-300 prose-strong:text-white
                      prose-table:text-sm prose-th:text-slate-300 prose-td:text-slate-400
                      prose-blockquote:border-l-cyan-500 prose-blockquote:text-slate-400">
                      <ReactMarkdown>{h.analysis_text}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
