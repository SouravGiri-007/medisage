import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/dashboard", icon: "⚡", label: "Dashboard" },
  { to: "/analysis",  icon: "🔬", label: "New Analysis" },
  { to: "/history",   icon: "📋", label: "History" },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
          <span className="text-2xl">🧬</span>
          {!collapsed && (
            <div>
              <p className="text-white font-bold tracking-wide text-sm">MediSage</p>
              <p className="text-slate-500 text-xs">AI Health Analyst</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-slate-500 hover:text-white transition-colors text-xs"
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* Nav */}
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

        {/* User */}
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
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors text-xs">
                ⏻
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
