import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../api/client";
import { useLang } from "../i18n/LangContext";
import type { Bot } from "../types/bot";

const DAY_LABELS: Record<string, string> = {
  monday: "月", tuesday: "火", wednesday: "水", thursday: "木",
  friday: "金", saturday: "土", sunday: "日",
};
const DAY_LABELS_EN: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
};

function Toggle({ enabled, loading, onToggle }: {
  enabled: boolean;
  loading: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full
                  transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
        enabled ? "bg-emerald-500" : "bg-zinc-300"
      }`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow
                        transition-transform duration-200 ${
        enabled ? "translate-x-[18px]" : "translate-x-[3px]"
      }`} />
    </button>
  );
}

function BotCard({ bot }: { bot: Bot }) {
  const qc = useQueryClient();
  const { t, lang } = useLang();
  const dayLabels = lang === "en" ? DAY_LABELS_EN : DAY_LABELS;

  const toggleMutation = useMutation({
    mutationFn: () => api.bots.toggle(bot.id, !bot.enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bots"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.bots.delete(bot.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bots"] });
      toast.success(t.toastDeleted);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const runMutation = useMutation({
    mutationFn: () => api.bots.run(bot.id),
    onSuccess: (r) => {
      toast.success(t.toastRunSuccess(r.message));
      qc.invalidateQueries({ queryKey: ["logs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleDelete = () => {
    if (confirm(t.confirmDelete(bot.name))) deleteMutation.mutate();
  };

  return (
    <div
      className="bg-white rounded-lg flex flex-col overflow-hidden"
      style={{
        borderLeft: `3px solid ${bot.enabled ? "var(--color-active)" : "var(--color-inactive)"}`,
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
      }}
    >
      {/* Card header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-bold text-zinc-900 text-base leading-tight truncate">{bot.name}</h2>
          <span className={`text-[10px] font-semibold uppercase tracking-widest ${
            bot.enabled ? "text-emerald-600" : "text-zinc-400"
          }`}>
            {bot.enabled ? "active" : "inactive"}
          </span>
        </div>
        <Toggle
          enabled={bot.enabled}
          loading={toggleMutation.isPending}
          onToggle={() => toggleMutation.mutate()}
        />
      </div>

      <div className="h-px bg-zinc-100 mx-4" />

      {/* Body */}
      <div className="px-4 py-3 flex flex-col gap-3 flex-1">
        <div>
          <p className="label-meta mb-1.5">{t.labelKeywords}</p>
          <div className="flex flex-wrap gap-1">
            {bot.keywords.map((kw) => (
              <span key={kw} className="text-[11px] font-medium px-2 py-0.5 rounded"
                style={{ background: "#fef3c7", color: "#92400e" }}>
                {kw}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="label-meta mb-1.5">{t.labelSchedule}</p>
          {bot.schedule.entries.map((e, i) => (
            <p key={i} className="mono text-xs text-zinc-700">
              {e.days.map((d) => dayLabels[d] ?? d).join(" · ")}
              <span className="text-amber-500 font-semibold ml-2">{e.time}</span>
            </p>
          ))}
          <p className="mono text-[11px] text-zinc-400 mt-0.5">{bot.schedule.timezone}</p>
        </div>

        <div className="flex gap-4">
          <div>
            <p className="label-meta">{t.labelFeeds}</p>
            <p className="mono text-xs text-zinc-600">{bot.rss_feeds.length}</p>
          </div>
          <div>
            <p className="label-meta">{t.labelLookback}</p>
            <p className="mono text-xs text-zinc-600">{bot.lookback_days}d</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-zinc-100 flex items-center gap-2">
        <button
          onClick={() => runMutation.mutate()}
          disabled={runMutation.isPending}
          className="btn-primary flex-1"
        >
          {runMutation.isPending ? t.btnRunning : t.btnTestRun}
        </button>
        <Link to={`/bots/${bot.id}/edit`} className="flex-1 text-center text-xs font-semibold px-3 py-1.5 rounded bg-zinc-800 text-white hover:bg-zinc-700 transition-colors">
          {t.btnEdit}
        </Link>
        <button onClick={handleDelete} className="btn-ghost-danger" title="Delete">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function BotListPage() {
  const { data: bots, isLoading, error } = useQuery({
    queryKey: ["bots"],
    queryFn: api.bots.list,
  });
  const { t } = useLang();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex gap-1.5">
          {[0, 150, 300].map((delay) => (
            <span key={delay} className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
              style={{ animationDelay: `${delay}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-16 text-red-500 text-sm">{(error as Error).message}</div>;
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">News Bots</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{t.botsCount(bots?.length ?? 0)}</p>
        </div>
        <Link to="/bots/new"
          className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded
                     text-white transition-colors"
          style={{ backgroundColor: "#4A154B" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#611f69")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4A154B")}
        >
          {t.newBot}
        </Link>
      </div>

      {!bots?.length ? (
        <div className="text-center py-24 border-2 border-dashed border-zinc-200 rounded-xl">
          <p className="text-zinc-300 text-5xl mb-4 font-light">—</p>
          <p className="text-sm text-zinc-500">{t.emptyTitle}</p>
          <Link to="/bots/new"
            className="inline-block mt-4 text-xs font-semibold text-amber-600 hover:text-amber-700 underline underline-offset-2">
            {t.emptyAction}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => <BotCard key={bot.id} bot={bot} />)}
        </div>
      )}
    </div>
  );
}
