import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Bot, ExecutionLog } from "../types/bot";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LogsPage() {
  const [selectedBotId, setSelectedBotId] = useState<string>("");

  const { data: bots } = useQuery({ queryKey: ["bots"], queryFn: api.bots.list });
  const { data: logsData, isLoading } = useQuery({
    queryKey: ["logs", selectedBotId],
    queryFn: () => api.logs.list(selectedBotId || undefined, 100),
  });

  return (
    <div>
      {/* Page header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">実行ログ</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {logsData?.total ?? "—"} 件
          </p>
        </div>
        <select
          value={selectedBotId}
          onChange={(e) => setSelectedBotId(e.target.value)}
          className="select-base w-48 text-sm"
        >
          <option value="">全ての Bot</option>
          {bots?.map((b: Bot) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}

      {!isLoading && !logsData?.logs.length && (
        <div className="text-center py-24 border-2 border-dashed border-zinc-200 rounded-xl">
          <p className="text-zinc-300 text-5xl mb-4 font-light">—</p>
          <p className="text-sm text-zinc-500">実行ログがありません</p>
        </div>
      )}

      {logsData?.logs && logsData.logs.length > 0 && (
        <div className="bg-white rounded-lg overflow-hidden"
          style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="px-5 py-3 text-left label-meta">Bot</th>
                <th className="px-5 py-3 text-left label-meta">ステータス</th>
                <th className="px-5 py-3 text-left label-meta">記事数</th>
                <th className="px-5 py-3 text-left label-meta">メッセージ</th>
                <th className="px-5 py-3 text-left label-meta">実行時刻</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {logsData.logs.map((log: ExecutionLog) => (
                <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-zinc-800">{log.bot_name}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        log.status === "success" ? "bg-emerald-500" : "bg-red-500"
                      }`} />
                      <span className={log.status === "success" ? "text-emerald-700" : "text-red-600"}>
                        {log.status === "success" ? "success" : "error"}
                      </span>
                    </span>
                  </td>
                  <td className="px-5 py-3 mono text-zinc-500">{log.articles_count}</td>
                  <td className="px-5 py-3 text-zinc-500 max-w-xs truncate" title={log.message}>
                    {log.message}
                  </td>
                  <td className="px-5 py-3 mono text-xs text-zinc-400 whitespace-nowrap">
                    {formatDate(log.executed_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
