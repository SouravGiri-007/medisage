import { useState, useEffect, useCallback, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Menu, X } from "lucide-react";

const NAV = [
  { to: "/dashboard", icon: "⚡", label: "Dashboard" },
  { to: "/analysis",  icon: "🔬", label: "New Analysis" },
  { to: "/history",   icon: "📋", label: "History" },
];

function DesktopSidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside
      className={`hidden lg:flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
        <span className="text-2xl">🧬</span>
        {!collapsed && (
          <div>
            <p className="text-white font-bold tracking-wide text-sm">MediSage</p>
            <p className="text-slate-500 text-xs">AI Health Analyst</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto text-slate-500 hover:text-white transition-colors text-xs"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {!collapsed && <span className="font-medium">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.displayName?.[0]?.toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.displayName || "User"}</p>
              <p className="text-slate-500 text-xs truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors text-xs" aria-label="Sign out">
              ⏻
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

function MobileHeader({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
      <button
        onClick={onMenuClick}
        className="text-slate-400 hover:text-white transition-colors p-1"
        aria-label="Open navigation menu"
      >
        <Menu size={24} />
      </button>

      <div className="flex items-center gap-2">
        <span className="text-xl">🧬</span>
        <span className="text-white font-bold tracking-wide text-sm">MediSage</span>
      </div>

      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
        {user?.displayName?.[0]?.toUpperCase() || "U"}
      </div>
    </header>
  );
}

function MobileDrawer({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const drawerRef = useRef(null);
  const previousFocusRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate("/login");
  };

  const handleNavClick = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement;
      document.body.style.overflow = "hidden";
      setTimeout(() => drawerRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const focusable = drawerRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            ref={drawerRef}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 left-0 z-50 h-full w-[280px] bg-slate-900 border-r border-slate-800 flex flex-col lg:hidden"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧬</span>
                <div>
                  <p className="text-white font-bold tracking-wide text-sm">MediSage</p>
                  <p className="text-slate-500 text-xs">AI Health Analyst</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-white transition-colors p-1"
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1 px-3">
              {NAV.map(({ to, icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`
                  }
                >
                  <span className="text-base">{icon}</span>
                  <span className="font-medium">{label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="border-t border-slate-800 p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {user?.displayName?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{user?.displayName || "User"}</p>
                  <p className="text-slate-500 text-xs truncate">{user?.email}</p>
                </div>
                <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors text-xs" aria-label="Sign out">
                  ⏻
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans">
      {/* Desktop sidebar */}
      <DesktopSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Mobile header */}
      <MobileHeader onMenuClick={() => setDrawerOpen(true)} />

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Main content */}
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
