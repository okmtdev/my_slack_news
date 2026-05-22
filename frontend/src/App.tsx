import { Routes, Route, Link, useLocation } from "react-router-dom";
import BotListPage from "./components/BotListPage";
import BotFormPage from "./components/BotFormPage";
import LogsPage from "./components/LogsPage";

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={`text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded transition-colors ${
        active
          ? "text-amber-400"
          : "text-zinc-400 hover:text-zinc-100"
      }`}
    >
      {children}
    </Link>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="w-2 h-2 rounded-full bg-amber-400 group-hover:bg-amber-300 transition-colors" />
            <span className="text-white font-bold text-sm tracking-widest uppercase">
              Slack News Bot
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/">Bots</NavLink>
            <NavLink to="/logs">ログ</NavLink>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <Routes>
          <Route path="/" element={<BotListPage />} />
          <Route path="/bots/new" element={<BotFormPage />} />
          <Route path="/bots/:id/edit" element={<BotFormPage />} />
          <Route path="/logs" element={<LogsPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-4 text-center">
        <span className="text-[11px] text-zinc-400 tracking-wide">Slack News Bot</span>
      </footer>
    </div>
  );
}
