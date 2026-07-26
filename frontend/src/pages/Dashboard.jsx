import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import api from "../utils/api";

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className={`bg-slate-900 border ${accent || "border-slate-800"} rounded-xl p-5`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {sub && <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">{sub}</span>}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-slate-400 text-sm">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user, getToken } = useAuth();
  const [rateLimit, setRateLimit] = useState({ used: 0, limit: 15 });
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        const [rl, hist] = await Promise.all([
          api.get("/analysis/rate-limit", token),
          api.get("/analysis/history", token),
        ]);
        if (!rl.error) setRateLimit(rl);
        if (!hist.error) setRecentHistory(hist.history?.slice(0, 3) || []);
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  const usedPct = Math.round((rateLimit.used / rateLimit.limit) * 100);

  return (
    <Layout>
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.displayName?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Here's your health analytics overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="🔬" label="Analyses today" value={rateLimit.used} sub={`${rateLimit.limit} limit`} />
          <StatCard icon="📋" label="Total reports" value={recentHistory.length} accent="border-slate-800" />
          <StatCard icon="🤖" label="AI Models" value="4" sub="Fallback chain" />
          <StatCard icon="🔒" label="Data security" value="End-to-end" accent="border-green-500/20" />
        </div>

        {/* Usage bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-medium text-sm">Daily Analysis Usage</span>
            <span className="text-slate-400 text-xs">{rateLimit.used}/{rateLimit.limit} used</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                usedPct > 80 ? "bg-red-500" : usedPct > 50 ? "bg-yellow-500" : "bg-cyan-500"
              }`}
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <p className="text-slate-500 text-xs mt-2">Resets every 24 hours</p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            to="/analysis"
            className="group bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl p-6 transition-all duration-200"
          >
            <div className="text-3xl mb-3">🔬</div>
            <h3 className="text-white font-semibold mb-1">New Analysis</h3>
            <p className="text-slate-400 text-sm">Upload a blood report PDF and get instant AI insights</p>
            <span className="text-cyan-400 text-xs mt-3 block group-hover:translate-x-1 transition-transform">
              Start now →
            </span>
          </Link>
        </div>

        {/* Recent analyses */}
        {recentHistory.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Recent Analyses</h2>
              <Link to="/history" className="text-cyan-400 text-xs hover:text-cyan-300">View all</Link>
            </div>
            <div className="space-y-3">
              {recentHistory.map((h) => (
                <div key={h.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{h.patient_name || "Unknown Patient"}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {new Date(h.created_at).toLocaleDateString()} · {h.model_used?.split("/").pop() || "AI"}
                    </p>
                  </div>
                  {h.health_score && (
                    <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                      h.health_score.score >= 70 ? "bg-green-500/10 text-green-400" :
                      h.health_score.score >= 50 ? "bg-yellow-500/10 text-yellow-400" :
                      "bg-red-500/10 text-red-400"
                    }`}>
                      {h.health_score.grade}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
