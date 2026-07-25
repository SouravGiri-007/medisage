import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, Brain, FileText, Cloud, Activity } from "lucide-react";

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[10%] -left-[10%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
      <div className="absolute bottom-[20%] -right-[5%] w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="absolute top-[40%] left-[30%] w-[200px] h-[200px] bg-cyan-400/3 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "10s" }} />
    </div>
  );
}

function FeaturePill({ icon, label }) {
  return (
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-slate-300 backdrop-blur-sm">
      <span className="text-cyan-400">{icon}</span>
      {label}
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="relative mt-8">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400 tracking-wide">LIVE DASHBOARD</span>
          </div>
          <div className="flex -space-x-1">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-[10px] text-cyan-400">AI</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-3xl font-bold text-white">85</div>
            <div className="text-xs text-slate-500">Health Score</div>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
              <circle cx="32" cy="32" r="28" fill="none" stroke="#22D3EE" strokeWidth="4" strokeDasharray={`${(85/100)*176} 176`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-cyan-400">85%</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "BP", value: "120/80", color: "text-emerald-400" },
            { label: "HbA1c", value: "5.7%", color: "text-cyan-400" },
            { label: "Glucose", value: "95", color: "text-blue-400" },
            { label: "LDL", value: "100", color: "text-amber-400" },
            { label: "HDL", value: "55", color: "text-emerald-400" },
            { label: "HR", value: "72", color: "text-rose-400" },
          ].map((m, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-2 border border-white/[0.06]">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">{m.label}</div>
              <div className={`text-sm font-semibold ${m.color}`}>{m.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-lg p-3 flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px] text-cyan-400 shrink-0 mt-0.5">AI</div>
          <div>
            <div className="text-xs text-cyan-300 font-medium">Health Insight</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Your biomarkers show positive trends this month.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustBadge({ icon, label }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
      <span className="text-slate-600">{icon}</span>
      {label}
    </div>
  );
}

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.code === "auth/invalid-credential" ? "Invalid email or password." : err.code === "auth/user-not-found" ? "No account found with this email." : err.code === "auth/wrong-password" ? "Incorrect password." : err.code === "auth/too-many-requests" ? "Too many attempts. Please try again later." : "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050B1A] flex">
      <FloatingOrbs />

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[60%] relative overflow-hidden bg-gradient-to-br from-[#050B1A] via-[#080F24] to-[#0A1628]">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-10 left-10 w-40 h-40 border border-cyan-400 rounded-full" />
          <div className="absolute bottom-20 right-20 w-60 h-60 border border-blue-400 rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-20 h-20 border border-cyan-400 rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 flex flex-col justify-center p-12 lg:p-16 xl:p-20 w-full"
        >
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">M</div>
            <div>
              <div className="text-white font-bold text-lg tracking-tight">MediSage</div>
              <div className="text-[11px] text-slate-500 tracking-widest uppercase">AI Health Platform</div>
            </div>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
            Understand Your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Health with AI</span>
          </h1>

          <p className="text-slate-400 text-base max-w-lg leading-relaxed mb-8">
            Upload your blood reports, receive AI-powered analysis, predict health risks, and chat with an intelligent healthcare assistant — all in one secure platform.
          </p>

          <div className="grid grid-cols-2 gap-2.5 mb-6 max-w-lg">
            {[
              { icon: <Brain size={14} />, label: "AI Blood Analysis" },
              { icon: <Activity size={14} />, label: "Disease Risk Prediction" },
              { icon: <FileText size={14} />, label: "AI Health Assistant" },
              { icon: <span className="text-[10px]">📊</span>, label: "Health Dashboard" },
              { icon: <Cloud size={14} />, label: "Secure Cloud Storage" },
              { icon: <span className="text-[10px]">📈</span>, label: "Health History Tracking" },
            ].map((f, i) => (
              <FeaturePill key={i} icon={f.icon} label={f.label} />
            ))}
          </div>

          <DashboardPreview />
        </motion.div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-6 lg:p-10 relative">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-blue-500/3 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">M</div>
            <div className="text-white font-bold">MediSage</div>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="text-slate-400 text-sm mt-1">Sign in to your MediSage account</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-5"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handle} className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email" required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"} required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/30 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-slate-400">Remember me</span>
                </label>
              </div>

              <button
                type="submit" disabled={loading || googleLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 group shadow-lg shadow-cyan-500/20"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>Sign In <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></>
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#050B1A] px-3 text-slate-500">or continue with</span>
              </div>
            </div>

            <button
              type="button" onClick={handleGoogle} disabled={loading || googleLoading}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-3"
            >
              {googleLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              Continue with Google
            </button>

            <p className="text-slate-500 text-sm text-center mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Create one
              </Link>
            </p>

            <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-white/5">
              <TrustBadge icon={<ShieldCheck size={12} />} label="Secure & Encrypted" />
              <TrustBadge icon={<Brain size={12} />} label="AI Powered" />
              <TrustBadge icon={<FileText size={12} />} label="Private Reports" />
              <TrustBadge icon={<Cloud size={12} />} label="Cloud Sync" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
