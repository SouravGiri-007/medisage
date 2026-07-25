import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import ChatWindow from "../components/ChatWindow";
import api from "../utils/api";
import ReactMarkdown from "react-markdown";

const STEPS = ["Upload Report", "Patient Info", "AI Analysis", "Chat with AI"];

export default function Analysis() {
  const { getToken } = useAuth();
  const [step, setStep] = useState(0);
  const [useSample, setUseSample] = useState(false);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [patient, setPatient] = useState({ name: "", age: "", gender: "Male" });
  const [result, setResult] = useState(null);
  const [reportText, setReportText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f || f.type !== "application/pdf") return setError("Please upload a valid PDF file.");
    if (f.size > 20 * 1024 * 1024) return setError("File must be under 20MB.");
    setFile(f);
    setError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const form = new FormData();
      form.append("patient_name", patient.name || "Unknown");
      form.append("age", patient.age || "Unknown");
      form.append("gender", patient.gender);
      form.append("use_sample", useSample ? "true" : "false");
      if (!useSample && file) form.append("file", file);

      const data = await api.postForm("/analysis/analyze", form, token);

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setResult(data);
      setReportText(data.report_text || "");

      // Get health score
      try {
        const scoreData = await api.post("/health/score", { analysis: data.analysis }, token);
        if (!scoreData.error) setResult(prev => ({ ...prev, health_score: scoreData.score }));
      } catch (_) { }

      setStep(2);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const scoreColor = (score) => {
    if (score >= 75) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const scoreBg = (score) => {
    if (score >= 75) return "bg-green-500/10 border-green-500/30";
    if (score >= 50) return "bg-yellow-500/10 border-yellow-500/30";
    return "bg-red-500/10 border-red-500/30";
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">New Analysis</h1>
          <p className="text-slate-400 mt-1 text-sm">Upload your blood report and get AI-powered insights</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-shrink-0">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${i === step ? "bg-cyan-500 text-slate-900" :
                  i < step ? "bg-cyan-500/20 text-cyan-400" :
                    "bg-slate-800 text-slate-500"
                }`}>
                <span>{i < step ? "✓" : i + 1}</span>
                <span>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`w-6 h-px ${i < step ? "bg-cyan-500/50" : "bg-slate-700"}`} />}
            </div>
          ))}
        </div>

        {/* ── Step 0: Upload ── */}
        {step === 0 && (
          <div className="space-y-6">
            {/* Toggle */}
            <div className="flex gap-3">
              {["Upload PDF", "Use Sample"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setUseSample(opt === "Use Sample"); setFile(null); setError(""); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${(opt === "Use Sample") === useSample
                      ? "bg-cyan-500 text-slate-900"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {useSample ? (
              <div className="bg-slate-900 border border-cyan-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="text-white font-medium">Sample Blood Report</p>
                    <p className="text-slate-400 text-xs">Pre-loaded demo report for testing</p>
                  </div>
                </div>
                <p className="text-slate-500 text-xs">
                  This sample contains CBC, Lipid Profile, Metabolic Panel, LFT, Thyroid, and Vitamins data.
                </p>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${dragOver ? "border-cyan-500 bg-cyan-500/5" :
                    file ? "border-green-500/50 bg-green-500/5" :
                      "border-slate-700 hover:border-slate-600 bg-slate-900"
                  }`}
              >
                <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                {file ? (
                  <>
                    <div className="text-4xl mb-3">✅</div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-slate-400 text-xs mt-1">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-3">📤</div>
                    <p className="text-white font-medium">Drop your PDF here</p>
                    <p className="text-slate-400 text-xs mt-1">or click to browse · Max 20MB</p>
                  </>
                )}
              </div>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={() => { if (!useSample && !file) return setError("Please upload a PDF."); setStep(1); }}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              Continue →
            </button>
          </div>
        )}

        {/* ── Step 1: Patient Info ── */}
        {step === 1 && (
          <div className="space-y-6 max-w-lg">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h2 className="text-white font-semibold">Patient Details</h2>
              <p className="text-slate-400 text-xs">Optional — helps the AI personalize the analysis</p>

              <div>
                <label className="text-slate-400 text-xs uppercase tracking-wider block mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={patient.name}
                  onChange={e => { const v = e.target.value; setPatient(p => ({ ...p, name: v })); }}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs uppercase tracking-wider block mb-1.5">Age</label>
                  <input
                    type="number" min="1" max="120"
                    value={patient.age}
                    onChange={e => { const v = e.target.value; setPatient(p => ({ ...p, age: v })); }}
                    placeholder="e.g. 35"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs uppercase tracking-wider block mb-1.5">Gender</label>
                  <select
                    value={patient.gender}
                    onChange={e => { const v = e.target.value; setPatient(p => ({ ...p, gender: v })); }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg text-sm transition-colors">
                ← Back
              </button>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-900 font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    Analyzing report...
                  </>
                ) : "🔬 Analyze Report"}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Results ── */}
        {step === 2 && result && (
          <div className="space-y-6">
            {/* Health Score Card */}
            {result.health_score && (
              <div className={`border rounded-xl p-5 flex items-center gap-5 ${scoreBg(result.health_score.score)}`}>
                <div className="text-center">
                  <div className={`text-4xl font-black ${scoreColor(result.health_score.score)}`}>
                    {result.health_score.score}
                  </div>
                  <div className={`text-xs font-bold ${scoreColor(result.health_score.score)}`}>
                    Grade {result.health_score.grade}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{result.health_score.summary}</p>
                  {result.health_score.risk_areas?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {result.health_score.risk_areas.map(r => (
                        <span key={r} className="text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded-full">{r}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-400">
                  Model: <span className="text-slate-300">{result.model_used?.split("/").pop()}</span>
                  <br />
                  Uses: <span className="text-slate-300">{result.analyses_used}/{result.analyses_limit}</span>
                </div>
              </div>
            )}

            {/* Analysis Output */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-4">AI Analysis</h2>
              <div className="prose prose-invert prose-sm max-w-none
                prose-headings:text-white prose-headings:font-semibold
                prose-p:text-slate-300 prose-li:text-slate-300
                prose-strong:text-white prose-table:text-sm
                prose-th:text-slate-300 prose-td:text-slate-400
                prose-blockquote:text-slate-400 prose-blockquote:border-l-cyan-500">
                <ReactMarkdown>{result.analysis}</ReactMarkdown>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                💬 Chat about this report →
              </button>
              <button
                onClick={() => { setStep(0); setResult(null); setFile(null); setError(""); }}
                className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg text-sm transition-colors"
              >
                New Analysis
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Chat ── */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold">Chat with MediSage</h2>
                <p className="text-slate-400 text-xs mt-0.5">Ask anything about your report</p>
              </div>
              <button
                onClick={() => setStep(2)}
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                ← Back to analysis
              </button>
            </div>
            <ChatWindow reportText={reportText} sessionId={sessionId} />
          </div>
        )}
      </div>
    </Layout>
  );
}