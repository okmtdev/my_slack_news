import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useLang } from "./i18n/LangContext";
import type { Lang } from "./i18n/translations";
import BotListPage from "./components/BotListPage";
import BotFormPage from "./components/BotFormPage";
import LogsPage from "./components/LogsPage";

function SlackIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg">
      {/* Teal — horizontal left */}
      <path fill="#36C5F0" d="M19.7 3.3c-2.3 0-4.1 1.8-4.1 4.1s1.8 4.1 4.1 4.1h4.1V7.4c0-2.3-1.8-4.1-4.1-4.1zm0 12.3H7.7c-2.3 0-4.1 1.8-4.1 4.1 0 2.3 1.8 4.1 4.1 4.1h12c2.3 0 4.1-1.8 4.1-4.1 0-2.2-1.8-4.1-4.1-4.1z"/>
      {/* Green — vertical top */}
      <path fill="#2EB67D" d="M50.3 19.7c0-2.3-1.8-4.1-4.1-4.1-2.3 0-4.1 1.8-4.1 4.1v4.1h4.1c2.3 0 4.1-1.8 4.1-4.1zm-12.2 0V7.7c0-2.3-1.8-4.1-4.1-4.1-2.3 0-4.1 1.8-4.1 4.1v12c0 2.3 1.8 4.1 4.1 4.1 2.3.1 4.1-1.7 4.1-4z"/>
      {/* Yellow — horizontal right */}
      <path fill="#ECB22E" d="M34.3 50.7c2.3 0 4.1-1.8 4.1-4.1s-1.8-4.1-4.1-4.1h-4.1v4.1c0 2.3 1.8 4.1 4.1 4.1zm0-12.3h12c2.3 0 4.1-1.8 4.1-4.1 0-2.3-1.8-4.1-4.1-4.1h-12c-2.3 0-4.1 1.8-4.1 4.1 0 2.3 1.8 4.1 4.1 4.1z"/>
      {/* Red — vertical bottom */}
      <path fill="#E01E5A" d="M3.7 34.3c0 2.3 1.8 4.1 4.1 4.1 2.3 0 4.1-1.8 4.1-4.1v-4.1H7.8c-2.2 0-4.1 1.8-4.1 4.1zm12.2 0v12c0 2.3 1.8 4.1 4.1 4.1 2.3 0 4.1-1.8 4.1-4.1v-12c0-2.3-1.8-4.1-4.1-4.1-2.3 0-4.1 1.8-4.1 4.1z"/>
    </svg>
  );
}

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
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <SlackIcon size={28} />
            <span className="text-white font-bold text-xl tracking-tight">
              ニュースラ
            </span>
            <span className="text-purple-300 text-xs font-medium hidden sm:inline">
              News × Slack
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
        <span className="text-[11px] text-zinc-400 tracking-wide">ニュースラ — News × Slack</span>
      </footer>
    </div>
  );
}
