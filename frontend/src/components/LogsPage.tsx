import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Bot, ExecutionLog } from "../types/bot";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">実行ログ</h1>
        <select
          value={selectedBotId}
          onChange={(e) => setSelectedBotId(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">全ての Bot</option>
          {bots?.map((b: Bot) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {isLoading && <div className="text-center py-16 text-gray-400">読み込み中...</div>}

      {!isLoading && !logsData?.logs.length && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p>実行ログがありません</p>
        </div>
      )}

      {logsData?.logs && logsData.logs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Bot 名</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">ステータス</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">記事数</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">メッセージ</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">実行時刻</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logsData.logs.map((log: ExecutionLog) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{log.bot_name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      log.status === "success"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {log.status === "success" ? "成功" : "エラー"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{log.articles_count}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={log.message}>
                    {log.message}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
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
