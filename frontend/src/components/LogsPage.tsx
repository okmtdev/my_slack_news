import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { useLang } from "../i18n/LangContext";
import type { Bot, ExecutionLog, LogStep, StepStatus } from "../types/bot";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_DOT: Record<StepStatus, string> = {
  success: "bg-emerald-500",
  error: "bg-red-500",
  skipped: "bg-zinc-300",
};

function StepDot({ status }: { status: StepStatus }) {
  return <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />;
}

function StepDetail({ step }: { step: LogStep }) {
  const { t } = useLang();
  const statusLabel =
    step.status === "success"
      ? t.stepStatusSuccess
      : step.status === "error"
      ? t.stepStatusError
      : t.stepStatusSkipped;
  return (
    <div className="flex items-start gap-3 py-2">
      <StepDot status={step.status} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-zinc-800">{step.label}</span>
          <span
            className={`text-[10px] font-bold uppercase tracking-widest ${
              step.status === "success"
                ? "text-emerald-600"
                : step.status === "error"
                ? "text-red-600"
                : "text-zinc-400"
            }`}
          >
            {statusLabel}
          </span>
          {step.duration_ms > 0 && (
            <span className="mono text-[11px] text-zinc-400 ml-auto">
              {t.durationMs(step.duration_ms)}
            </span>
          )}
        </div>
        {step.message && (
          <p className="text-xs text-zinc-500 mt-0.5 break-words">{step.message}</p>
        )}
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: ExecutionLog["run_type"] }) {
  const { t } = useLang();
  if (type === "test_message") {
    return (
      <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
        {t.runTypeTestMessage}
      </span>
    );
  }
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded text-white"
      style={{ backgroundColor: "#4A154B" }}
    >
      {t.runTypeFullRun}
    </span>
  );
}

function LogRow({ log }: { log: ExecutionLog }) {
  const { t } = useLang();
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-zinc-50 transition-colors cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-5 py-3 font-semibold text-zinc-800">{log.bot_name}</td>
        <td className="px-5 py-3"><TypeBadge type={log.run_type} /></td>
        <td className="px-5 py-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                log.status === "success" ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            <span className={log.status === "success" ? "text-emerald-700" : "text-red-600"}>
              {log.status === "success" ? t.stepStatusSuccess : t.stepStatusError}
            </span>
          </span>
        </td>
        <td className="px-5 py-3">
          <div className="flex items-center gap-1.5">
            {(log.steps ?? []).map((s, i) => (
              <span key={i} className="flex items-center gap-1" title={`${s.label}: ${s.message}`}>
                <StepDot status={s.status} />
              </span>
            ))}
            {(!log.steps || log.steps.length === 0) && (
              <span className="text-[11px] text-zinc-300">—</span>
            )}
          </div>
        </td>
        <td className="px-5 py-3 mono text-xs text-zinc-400 whitespace-nowrap">
          {formatDate(log.executed_at)}
        </td>
        <td className="px-3 py-3 text-zinc-300 text-xs select-none">
          {expanded ? "▾" : "▸"}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} className="px-5 py-4 bg-zinc-50/60 border-y border-zinc-100">
            <div className="max-w-3xl">
              <p className="text-xs text-zinc-500 mb-3">{log.message}</p>
              <div className="bg-white rounded-md border border-zinc-100 divide-y divide-zinc-100 px-3">
                {(log.steps ?? []).map((s, i) => <StepDetail key={i} step={s} />)}
                {(!log.steps || log.steps.length === 0) && (
                  <p className="text-xs text-zinc-400 py-3">No step details</p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function LogsPage() {
  const [selectedBotId, setSelectedBotId] = useState<string>("");
  const { t } = useLang();

  const { data: bots } = useQuery({ queryKey: ["bots"], queryFn: api.bots.list });
  const { data: logsData, isLoading } = useQuery({
    queryKey: ["logs", selectedBotId],
    queryFn: () => api.logs.list(selectedBotId || undefined, 100),
  });

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{t.pageLogsTitle}</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {logsData?.total ?? "—"} entries
          </p>
        </div>
        <select
          value={selectedBotId}
          onChange={(e) => setSelectedBotId(e.target.value)}
          className="select-base w-48 text-sm"
        >
          <option value="">{t.allBots}</option>
          {bots?.map((b: Bot) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="flex gap-1.5">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading && !logsData?.logs.length && (
        <div className="text-center py-24 border-2 border-dashed border-zinc-200 rounded-xl">
          <p className="text-zinc-300 text-5xl mb-4 font-light">—</p>
          <p className="text-sm text-zinc-500">{t.emptyLogs}</p>
        </div>
      )}

      {logsData?.logs && logsData.logs.length > 0 && (
        <div
          className="bg-white rounded-lg overflow-hidden"
          style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.06)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="px-5 py-3 text-left label-meta">{t.colBot}</th>
                <th className="px-5 py-3 text-left label-meta">{t.colType}</th>
                <th className="px-5 py-3 text-left label-meta">{t.colStatus}</th>
                <th className="px-5 py-3 text-left label-meta">{t.colSteps}</th>
                <th className="px-5 py-3 text-left label-meta">{t.colTime}</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {logsData.logs.map((log: ExecutionLog) => <LogRow key={log.id} log={log} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
