import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Upload, Brain, Activity, MessageCircle, Shield,
  ChevronDown, Star, Heart, Droplets, Wind, Thermometer,
  LineChart, Database, Zap, TrendingUp, Users, CheckCircle,
  Menu, X, ExternalLink, Mail, Clock, FileText, BarChart3,
  Search, Lock, Smartphone, AlertTriangle
} from "lucide-react";

// ─── Reusable ──────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Counter({ end, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { clearInterval(timer); setCount(end); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end]);
  return <span ref={ref}>{count}{suffix}</span>;
}

function GlassCard({ children, className = "" }) {
  return (
    <div className={`bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl ${className}`}>
      {children}
    </div>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Home", href: "#hero" },
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "AI Chat", href: "/analysis" },
    { label: "About", href: "#why" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🧬</span>
            <span className="text-lg font-bold text-white tracking-tight">MediSage</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map((l) =>
              l.href.startsWith("#") ? (
                <a key={l.label} href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">{l.label}</a>
              ) : (
                <Link key={l.label} to={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">{l.label}</Link>
              )
            )}
            <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Login</Link>
            <Link to="/signup" className="text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold px-4 py-2 rounded-lg transition-colors">Get Started</Link>
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden text-slate-400 hover:text-white p-2">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900 border-t border-slate-800"
          >
            <div className="px-4 py-4 space-y-3">
              {links.map((l) =>
                l.href.startsWith("#") ? (
                  <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="block text-sm text-slate-400 hover:text-white">{l.label}</a>
                ) : (
                  <Link key={l.label} to={l.href} onClick={() => setOpen(false)} className="block text-sm text-slate-400 hover:text-white">{l.label}</Link>
                )
              )}
              <Link to="/login" onClick={() => setOpen(false)} className="block text-sm text-slate-400 hover:text-white">Login</Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="block text-sm bg-cyan-500 text-slate-900 font-semibold px-4 py-2 rounded-lg text-center">Get Started</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section id="hero" className="relative min-h-screen pt-24 overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <Brain size={14} />
              AI-Powered Health Analysis
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              Understand Your{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Medical Reports</span>{" "}
              with AI
            </h1>

            <p className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
              Upload blood reports, receive AI-powered analysis, understand your health risks, and chat with an intelligent healthcare assistant.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/analysis"
                className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20"
              >
                Analyze Report <ArrowRight size={18} />
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl text-sm font-medium border border-slate-700 hover:border-slate-600 transition-all"
              >
                View Demo <BarChart3 size={18} />
              </a>
            </div>

            {/* Trust bar */}
            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-slate-800">
              <div className="flex -space-x-2">
                {["S", "M", "C", "E"].map((l, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold border-2 border-slate-950">{l}</div>
                ))}
              </div>
              <div>
                <p className="text-white text-sm font-medium">Trusted by healthcare professionals</p>
                <p className="text-slate-500 text-xs">Join 5,000+ active users</p>
              </div>
            </div>
          </motion.div>

          {/* Right — Dashboard Preview */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative">
            <GlassCard className="p-5 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-sm">🧬</div>
                  <div>
                    <p className="text-sm font-semibold text-white">Health Report</p>
                    <p className="text-xs text-slate-500">Analysis complete · 2 min ago</p>
                  </div>
                </div>
                <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full font-medium">Verified</span>
              </div>

              {/* Score + key metrics */}
              <div className="grid grid-cols-[1fr_1fr] gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 flex flex-col items-center">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                    <motion.circle cx="50" cy="50" r="42" fill="none" stroke="#22D3EE" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={264} initial={{ strokeDashoffset: 264 }} animate={{ strokeDashoffset: 264 * 0.28 }}
                      transition={{ duration: 1.5, delay: 0.8 }} />
                  </svg>
                  <div className="absolute mt-[-5.5rem] flex flex-col items-center">
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-2xl font-bold text-white">72</motion.span>
                    <span className="text-xs text-slate-500">Score</span>
                    <span className="text-xs text-cyan-400 font-medium">Grade B</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Blood Pressure", value: "120/80", status: "Normal" },
                    { label: "Glucose", value: "95 mg/dL", status: "Normal" },
                    { label: "HbA1c", value: "6.2%", status: "Elevated" },
                    { label: "LDL", value: "145 mg/dL", status: "High" },
                    { label: "HDL", value: "38 mg/dL", status: "Low" },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                      <span className="text-xs text-slate-400">{m.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white">{m.value}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          m.status === "Normal" ? "bg-green-500/10 text-green-400" :
                          m.status === "Elevated" ? "bg-yellow-500/10 text-yellow-400" :
                          m.status === "High" ? "bg-red-500/10 text-red-400" :
                          "bg-orange-500/10 text-orange-400"
                        }`}>{m.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Summary */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Brain size={14} className="text-cyan-400" />
                  <span className="text-xs font-medium text-white">AI Summary</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Moderate cardiovascular risk detected. Elevated LDL and HbA1c suggest lifestyle modifications. Schedule follow-up in 3 months.
                </p>
              </div>

              {/* Risk badges */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Diabetes Risk", level: "Moderate", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
                  { label: "Cardiovascular", level: "Elevated", color: "text-red-400 bg-red-500/10 border-red-500/20" },
                  { label: "Hypertension", level: "Low", color: "text-green-400 bg-green-500/10 border-green-500/20" },
                ].map((r) => (
                  <span key={r.label} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${r.color}`}>{r.label}: {r.level}</span>
                ))}
              </div>
            </GlassCard>

            {/* Floating AI assistant */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.8, type: "spring" }}
              className="absolute -bottom-4 -right-4 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-sm">🧬</div>
              <div>
                <p className="text-xs font-semibold text-white">AI Assistant</p>
                <p className="text-[11px] text-slate-400">Ask about your report</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats ─────────────────────────────────────────────────────────────

const STATS = [
  { icon: Database, value: 50, suffix: "+", label: "Medical Parameters" },
  { icon: Activity, value: 95, suffix: "%", label: "OCR Accuracy" },
  { icon: Clock, value: 10, suffix: " sec", label: "Avg. Analysis Time" },
  { icon: Brain, value: 4, suffix: "", label: "AI Engine (Llama 3.3)" },
];

function Stats() {
  return (
    <section className="relative py-14 border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <s.icon size={20} className="text-cyan-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white"><Counter end={s.value} suffix={s.suffix} /></div>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ──────────────────────────────────────────────────────────

const FEATURES = [
  { icon: FileText, title: "Smart PDF Analysis", desc: "Upload blood report PDFs with auto-extraction of all parameters, values, and reference ranges." },
  { icon: Brain, title: "AI Health Insights", desc: "Get easy-to-understand summaries, medical explanations, and personalized health recommendations." },
  { icon: AlertTriangle, title: "Disease Risk Prediction", desc: "Assess risk for diabetes, hypertension, and cardiovascular disease from your markers." },
  { icon: MessageCircle, title: "Interactive AI Chat", desc: 'Ask "What does HbA1c mean?" or "What diet should I follow?" and get instant answers.' },
  { icon: BarChart3, title: "Health Dashboard", desc: "Track your health score, browse past reports, and monitor progress with interactive charts." },
  { icon: Database, title: "Report History", desc: "All your analyses stored securely with full history, search, and expandable report views." },
  { icon: Lock, title: "Secure Authentication", desc: "Firebase Auth with encrypted storage. Your data is private and only accessible to you." },
  { icon: Smartphone, title: "Responsive Design", desc: "Fully responsive interface optimized for desktop, tablet, and mobile devices." },
];

const FEATURE_ICONS = [
  "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "bg-green-500/10 text-green-400 border-green-500/20",
  "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "bg-red-500/10 text-red-400 border-red-500/20",
  "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
];

function Features() {
  return (
    <section id="features" className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">Everything You Need</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">AI-powered tools to understand, track, and improve your health.</p>
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.05}>
              <GlassCard className="group p-5 h-full hover:border-cyan-500/30 transition-all duration-300 cursor-default">
                <div className={`w-10 h-10 rounded-lg border ${FEATURE_ICONS[i]} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <f.icon size={20} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ──────────────────────────────────────────────────────

const STEPS = [
  { icon: Upload, title: "Upload Report", desc: "Upload your PDF or use our sample report." },
  { icon: Search, title: "AI Extracts Data", desc: "We extract all parameters and values." },
  { icon: TrendingUp, title: "Health Score", desc: "Receive a 0-100 score with breakdown." },
  { icon: AlertTriangle, title: "Risk Prediction", desc: "Identify potential health risks." },
  { icon: MessageCircle, title: "Chat with AI", desc: "Ask anything about your report." },
  { icon: LineChart, title: "Track Progress", desc: "Monitor markers over time." },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">How It Works</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">From upload to insights in seconds.</p>
        </FadeIn>
        <div className="hidden lg:flex items-center justify-between gap-0 relative">
          <div className="absolute top-8 left-[8%] right-[8%] h-px bg-gradient-to-r from-cyan-500/0 via-cyan-500/40 to-cyan-500/0" />
          {STEPS.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.1} className="flex flex-col items-center text-center z-10 w-[15%]">
              <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center mb-3 group hover:border-cyan-500/50 transition-all">
                <s.icon size={22} className="text-cyan-400" />
              </div>
              <div className="absolute -top-1 w-6 h-6 rounded-full bg-cyan-500 text-slate-900 text-xs font-bold flex items-center justify-center">{i + 1}</div>
              <h3 className="text-sm font-semibold text-white mb-1">{s.title}</h3>
              <p className="text-xs text-slate-500">{s.desc}</p>
            </FadeIn>
          ))}
        </div>
        {/* Mobile timeline */}
        <div className="lg:hidden space-y-0">
          {STEPS.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.08}>
              <div className="flex gap-4 pb-8">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                    <s.icon size={18} className="text-cyan-400" />
                  </div>
                  {i < STEPS.length - 1 && <div className="w-px flex-1 bg-gradient-to-b from-cyan-500/30 to-transparent mt-2" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                    <h3 className="text-sm font-semibold text-white">{s.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{s.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Live Demo ─────────────────────────────────────────────────────────

const DEMO_MARKERS = [
  { label: "Health Score", value: "72", grade: "B", status: "good" },
  { label: "Blood Pressure", value: "120/80", status: "normal" },
  { label: "HbA1c", value: "6.2%", status: "elevated" },
  { label: "LDL", value: "145 mg/dL", status: "high" },
  { label: "HDL", value: "38 mg/dL", status: "low" },
  { label: "Glucose", value: "95 mg/dL", status: "normal" },
];

function LiveDemo() {
  return (
    <section id="demo" className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">Live Demo Preview</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">See what MediSage uncovers from a blood report.</p>
        </FadeIn>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Parameters */}
          <div className="lg:col-span-3 space-y-3">
            {DEMO_MARKERS.map((m, i) => (
              <FadeIn key={m.label} delay={i * 0.08}>
                <GlassCard className="flex items-center justify-between p-4 group hover:border-cyan-500/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      m.status === "good" || m.status === "normal" ? "bg-green-500" :
                      m.status === "elevated" ? "bg-yellow-500" :
                      m.status === "high" || m.status === "low" ? "bg-red-500" : "bg-slate-500"
                    }`} />
                    <span className="text-sm text-slate-300">{m.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {m.grade && (
                      <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">Grade {m.grade}</span>
                    )}
                    <span className="text-sm font-semibold text-white">{m.value}</span>
                  </div>
                </GlassCard>
              </FadeIn>
            ))}
          </div>

          {/* Risk + Summary */}
          <div className="lg:col-span-2 space-y-4">
            <FadeIn delay={0.2}>
              <GlassCard className="p-5">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-400" />
                  Risk Assessment
                </h3>
                <div className="space-y-3">
                  {[
                    { condition: "Type 2 Diabetes", risk: "Moderate", prob: "62%", color: "text-yellow-400 bg-yellow-500/10" },
                    { condition: "Cardiovascular", risk: "Elevated", prob: "45%", color: "text-red-400 bg-red-500/10" },
                    { condition: "Hypertension", risk: "Low", prob: "18%", color: "text-green-400 bg-green-500/10" },
                  ].map((r) => (
                    <div key={r.condition} className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{r.condition}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${r.color}`}>{r.prob}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </FadeIn>

            <FadeIn delay={0.3}>
              <GlassCard className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Brain size={16} className="text-cyan-400" />
                  <h3 className="text-sm font-semibold text-white">AI Summary</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Moderate cardiovascular risk. Elevated LDL (145 mg/dL) and HbA1c (6.2%) indicate prediabetic state and dyslipidemia. Recommend dietary modifications, increased physical activity, and follow-up testing in 3 months.
                </p>
              </GlassCard>
            </FadeIn>

            <FadeIn delay={0.4}>
              <Link to="/analysis" className="flex items-center justify-center gap-2 w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold px-5 py-3 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20">
                Try Demo Report <ArrowRight size={16} />
              </Link>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Why MediSage ──────────────────────────────────────────────────────

const REASONS = [
  { icon: Brain, title: "AI Powered", desc: "Llama 3.3 engine with 4-tier fallback for reliable analysis." },
  { icon: Zap, title: "Fast Analysis", desc: "Get results in under 10 seconds with automatic PDF extraction." },
  { icon: Heart, title: "Medical Insights", desc: "Comprehensive analysis of 50+ medical parameters and markers." },
  { icon: Lock, title: "Secure Data", desc: "Firebase Auth with encrypted storage and strict access controls." },
  { icon: FileText, title: "Personalized Reports", desc: "Tailored recommendations based on your specific results." },
  { icon: TrendingUp, title: "Health Tracking", desc: "Monitor changes over time with interactive trend charts." },
];

function WhyChoose() {
  return (
    <section id="why" className="relative py-20 border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">Why MediSage?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Built for accuracy, designed for clarity.</p>
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REASONS.map((r, i) => (
            <FadeIn key={r.title} delay={i * 0.08}>
              <GlassCard className="p-5 flex items-start gap-4 h-full hover:border-cyan-500/20 transition-all">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <r.icon size={18} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{r.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
                </div>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── AI Chat Preview ───────────────────────────────────────────────────

function ChatPreview() {
  const [typing, setTyping] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setTyping(true), 1200);
    const t2 = setTimeout(() => { setTyping(false); setShowResponse(true); }, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">Chat with Your Report</h2>
          <p className="text-slate-400">Ask questions and get intelligent answers powered by RAG.</p>
        </FadeIn>

        <FadeIn>
          <GlassCard className="overflow-hidden">
            <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs text-slate-500 ml-3">AI Chat Assistant</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex gap-3 justify-end">
                <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-xl rounded-br-sm px-4 py-2.5 max-w-[80%]">
                  <p className="text-sm text-white">What does my HbA1c mean?</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">U</div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xs flex-shrink-0">🧬</div>
                <div className="bg-slate-800 rounded-xl rounded-bl-sm px-4 py-2.5 max-w-[80%]">
                  {typing && !showResponse && (
                    <div className="flex items-center gap-1.5 py-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  )}
                  {showResponse && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                      <p className="text-sm text-slate-200 leading-relaxed">
                        Your HbA1c is slightly elevated at <span className="text-yellow-400 font-medium">6.2%</span>, suggesting prediabetes. Lifestyle changes and follow-up testing may help reduce future diabetes risk. I recommend consulting your doctor for a comprehensive management plan.
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Testimonials ──────────────────────────────────────────────────────

const TESTIMONIALS = [
  { name: "Sarah Johnson", role: "Patient", avatar: "S", text: "MediSage helped me understand my blood work in minutes. The AI chat answered every question clearly." },
  { name: "Dr. Michael Chen", role: "Physician", avatar: "M", text: "Excellent tool for patient education. The risk assessment features are clinically insightful." },
  { name: "Emily Rodriguez", role: "Health Coach", avatar: "E", text: "I recommend this to all my clients. The health tracking over time is invaluable." },
];

function Testimonials() {
  return (
    <section className="relative py-20 border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">Trusted by Users</h2>
          <p className="text-slate-400">See what our community says.</p>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.12}>
              <GlassCard className="p-5 h-full">
                <div className="flex items-center gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={14} className="fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ───────────────────────────────────────────────────────────────

const FAQS = [
  { q: "Is my data secure?", a: "Yes. We use Firebase Authentication and Firestore with strict security rules. Your reports are private and only accessible to you." },
  { q: "Can AI replace a doctor?", a: "No. MediSage provides informational insights only. Always consult a qualified healthcare professional for medical decisions." },
  { q: "Which reports are supported?", a: "Most PDF blood reports including CBC, lipid profile, metabolic panel, liver function, thyroid, and vitamins." },
  { q: "How accurate is the analysis?", a: "Our AI engine uses Llama 3.3 with 95% OCR accuracy. Always verify critical findings with your doctor." },
];

function FAQ() {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <section className="relative py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">Frequently Asked Questions</h2>
        </FadeIn>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <GlassCard key={i} className="overflow-hidden">
              <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                <span className="text-sm font-medium text-white">{faq.q}</span>
                <ChevronDown size={16} className={`text-slate-500 transition-transform duration-200 flex-shrink-0 ${openIdx === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {openIdx === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ─────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-cyan-950/30 to-slate-950" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">Take Control of Your Health Today</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">Upload your first report and discover what AI-powered health analysis can do for you.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/analysis" className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20">
              Analyze Report <ArrowRight size={18} />
            </Link>
            <Link to="/signup" className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl text-sm font-medium border border-slate-700 hover:border-slate-600 transition-all">
              Create Account <Users size={18} />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────

const FOOTER_LINKS = {
  Platform: [
    { label: "Home", href: "#hero" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Analyze Report", href: "/analysis" },
    { label: "AI Chat", href: "/analysis" },
    { label: "History", href: "/history" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

function Footer() {
  return (
    <footer className="border-t border-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🧬</span>
              <span className="text-lg font-bold text-white tracking-tight">MediSage</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">AI-powered health analysis platform. Understand your medical reports with artificial intelligence.</p>
          </div>
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-sm font-semibold text-white mb-3">{heading}</h4>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith("http") || l.href.startsWith("mailto") ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors">{l.label}</a>
                    ) : l.href.startsWith("#") ? (
                      <a href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">{l.label}</a>
                    ) : (
                      <Link to={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Connect</h4>
            <div className="flex items-center gap-3">
              <a href="https://github.com/SouravGiri-007" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-all">
                <ExternalLink size={16} />
              </a>
              <a href="souravgiri.dev@gmail.com" className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-all">
                <Mail size={16} />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} MediSage. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050B1A] font-sans">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <LiveDemo />
      <WhyChoose />
      <ChatPreview />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}