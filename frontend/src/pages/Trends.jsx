import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import api from "../utils/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from "recharts";

const MARKER_LABELS = {
  hemoglobin: "Hemoglobin (g/dL)",
  glucose: "Glucose (mg/dL)",
  cholesterol: "Total Cholesterol (mg/dL)",
  triglycerides: "Triglycerides (mg/dL)",
  hdl: "HDL (mg/dL)",
  ldl: "LDL (mg/dL)",
  wbc: "WBC (cells/uL)",
  rbc: "RBC (million/uL)",
  creatinine: "Creatinine (mg/dL)",
  "vitamin d": "Vitamin D (ng/mL)",
  "vitamin b12": "Vitamin B12 (pg/mL)",
  hba1c: "HbA1c (%)",
};

const NORMAL_RANGES = {
  hemoglobin: { min: 13.5, max: 17.5 },
  glucose: { min: 70, max: 100 },
  cholesterol: { max: 200 },
  triglycerides: { max: 150 },
  hdl: { min: 40 },
  ldl: { max: 100 },
  creatinine: { min: 0.7, max: 1.3 },
  hba1c: { max: 5.7 },
  "vitamin d": { min: 30, max: 100 },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="text-cyan-400 font-bold">{payload[0]?.value}</p>
      </div>
    );
  }
  return null;
};

export default function Trends() {
  const { getToken } = useAuth();
  const [trends, setTrends] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        const data = await api.get("/health/trends", token);
        if (!data.error && data.trends?.length) {
          setTrends(data.trends);
          setSelected(data.trends[0].marker);
        }
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  const selectedTrend = trends.find((t) => t.marker === selected);
  const chartData = selectedTrend?.dates.map((d, i) => ({
    date: d,
    value: selectedTrend.values[i],
  })) || [];

  const range = NORMAL_RANGES[selected];

  const trendIcon = (trend) => {
    if (trend === "up") return "↑";
    if (trend === "down") return "↓";
    return "→";
  };

  const trendColor = (trend, marker) => {
    const r = NORMAL_RANGES[marker];
    if (!r) return "text-slate-400";
    if (trend === "up" && r.max) return "text-red-400";
    if (trend === "down" && r.min) return "text-red-400";
    return "text-green-400";
  };

  return (
    <Layout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Health Trends</h1>
          <p className="text-slate-400 mt-1 text-sm">Track how your key health markers change over time</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : trends.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📈</div>
            <p className="text-white font-medium">No trend data yet</p>
            <p className="text-slate-400 text-sm mt-1">
              Run at least 2 analyses to start seeing health trends
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Marker list */}
            <div className="space-y-2">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Tracked Markers</p>
              {trends.map((t) => (
                <button
                  key={t.marker}
                  onClick={() => setSelected(t.marker)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all ${
                    selected === t.marker
                      ? "bg-cyan-500/20 border border-cyan-500/40 text-white"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  }`}
                >
                  <span className="capitalize font-medium">{t.marker}</span>
                  <span className={`text-base font-bold ${trendColor(t.trend, t.marker)}`}>
                    {trendIcon(t.trend)}
                  </span>
                </button>
              ))}
            </div>

            {/* Chart */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
              {selectedTrend && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-white font-semibold capitalize">{selectedTrend.marker}</h2>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {MARKER_LABELS[selectedTrend.marker] || selectedTrend.marker}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs">Latest</p>
                      <p className="text-white font-bold text-lg">
                        {selectedTrend.values[selectedTrend.values.length - 1]}
                      </p>
                    </div>
                  </div>

                  {chartData.length >= 2 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        {range?.max && (
                          <ReferenceLine y={range.max} stroke="#ef444450" strokeDasharray="4 4"
                            label={{ value: "Max", fill: "#ef4444", fontSize: 10 }} />
                        )}
                        {range?.min && (
                          <ReferenceLine y={range.min} stroke="#f59e0b50" strokeDasharray="4 4"
                            label={{ value: "Min", fill: "#f59e0b", fontSize: 10 }} />
                        )}
                        <Line
                          type="monotone" dataKey="value"
                          stroke="#22d3ee" strokeWidth={2}
                          dot={{ fill: "#22d3ee", r: 4 }}
                          activeDot={{ r: 6, fill: "#06b6d4" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[260px] flex items-center justify-center">
                      <p className="text-slate-500 text-sm">Need at least 2 data points to show a chart</p>
                    </div>
                  )}

                  {range && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {range.min && (
                        <span className="text-xs bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full">
                          Min: {range.min}
                        </span>
                      )}
                      {range.max && (
                        <span className="text-xs bg-red-500/10 text-red-400 px-3 py-1 rounded-full">
                          Max: {range.max}
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
