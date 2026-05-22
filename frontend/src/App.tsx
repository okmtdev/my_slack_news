import { Routes, Route, Link, useLocation } from "react-router-dom";
import BotListPage from "./components/BotListPage";
import BotFormPage from "./components/BotFormPage";
import LogsPage from "./components/LogsPage";

export default function App() {
  const location = useLocation();

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        location.pathname === to
          ? "bg-indigo-700 text-white"
          : "text-indigo-100 hover:bg-indigo-700"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-indigo-600 shadow">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-white font-bold text-lg flex items-center gap-2">
            📰 Slack News Bot
          </Link>
          <nav className="flex gap-2">
            {navLink("/", "Bots")}
            {navLink("/logs", "実行ログ")}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <Routes>
          <Route path="/" element={<BotListPage />} />
          <Route path="/bots/new" element={<BotFormPage />} />
          <Route path="/bots/:id/edit" element={<BotFormPage />} />
          <Route path="/logs" element={<LogsPage />} />
        </Routes>
      </main>

      <footer className="bg-white border-t py-4 text-center text-xs text-gray-400">
        Slack News Bot
      </footer>
    </div>
  );
}
