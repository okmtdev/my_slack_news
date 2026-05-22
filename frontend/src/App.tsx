import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useLang } from "./i18n/LangContext";
import type { Lang } from "./i18n/translations";
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
        active ? "text-white bg-white/10" : "text-purple-200 hover:text-white hover:bg-white/10"
      }`}
    >
      {children}
    </Link>
  );
}

function LangToggle() {
  const { lang, setLang } = useLang();
  const other: Lang = lang === "ja" ? "en" : "ja";
  return (
    <button
      onClick={() => setLang(other)}
      className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest
                 text-purple-300 hover:text-white border border-purple-600 hover:border-purple-400
                 px-2 py-1 rounded transition-colors"
    >
      {other === "en" ? "EN" : "JA"}
    </button>
  );
}

export default function App() {
  const { t } = useLang();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Header — Slack purple */}
      <header style={{ backgroundColor: "#4A154B" }} className="border-b border-purple-900/60">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="w-2 h-2 rounded-full bg-amber-400 group-hover:bg-amber-300 transition-colors" />
            <span className="text-white font-bold text-sm tracking-widest uppercase">
              Slack News Bot
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/">Bots</NavLink>
            <NavLink to="/logs">{t.navLogs}</NavLink>
            <div className="w-px h-4 bg-purple-700 mx-2" />
            <LangToggle />
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
