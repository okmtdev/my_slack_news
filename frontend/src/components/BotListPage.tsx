import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../api/client";
import type { Bot } from "../types/bot";

const DAY_LABELS: Record<string, string> = {
  monday: "月", tuesday: "火", wednesday: "水", thursday: "木",
  friday: "金", saturday: "土", sunday: "日",
};

function BotCard({ bot }: { bot: Bot }) {
  const qc = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: () => api.bots.toggle(bot.id, !bot.enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bots"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.bots.delete(bot.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bots"] });
      toast.success("Bot を削除しました");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const runMutation = useMutation({
    mutationFn: () => api.bots.run(bot.id),
    onSuccess: (r) => {
      toast.success(r.message);
      qc.invalidateQueries({ queryKey: ["logs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleDelete = () => {
    if (confirm(`「${bot.name}」を削除しますか？`)) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-5 flex flex-col gap-3 ${!bot.enabled ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold text-gray-900 text-base">{bot.name}</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bot.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {bot.enabled ? "有効" : "無効"}
          </span>
        </div>
        <button
          onClick={() => toggleMutation.mutate()}
          className="text-xs px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {bot.enabled ? "無効化" : "有効化"}
        </button>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1">キーワード</p>
        <div className="flex flex-wrap gap-1">
          {bot.keywords.map((kw) => (
            <span key={kw} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
              {kw}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1">スケジュール ({bot.schedule.timezone})</p>
        {bot.schedule.entries.map((e, i) => (
          <p key={i} className="text-sm text-gray-700">
            {e.days.map((d) => DAY_LABELS[d] ?? d).join("・")} {e.time}
          </p>
        ))}
      </div>

      <div>
        <p className="text-xs text-gray-500">
          RSSフィード: {bot.rss_feeds.length}件 / 過去{bot.lookback_days}日分
        </p>
      </div>

      <div className="flex gap-2 pt-1 border-t">
        <button
          onClick={() => runMutation.mutate()}
          disabled={runMutation.isPending}
          className="flex-1 text-xs px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {runMutation.isPending ? "実行中..." : "▶ テスト実行"}
        </button>
        <Link
          to={`/bots/${bot.id}/edit`}
          className="flex-1 text-xs px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-center"
        >
          ✏️ 編集
        </Link>
        <button
          onClick={handleDelete}
          className="text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-md hover:bg-red-50 transition-colors"
          title="削除"
        >
          🗑️
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

  if (isLoading) {
    return <div className="text-center py-16 text-gray-400">読み込み中...</div>;
  }
  if (error) {
    return <div className="text-center py-16 text-red-500">エラー: {(error as Error).message}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">News Bots</h1>
        <Link
          to="/bots/new"
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + 新規作成
        </Link>
      </div>

      {!bots?.length ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>Botがまだありません。「新規作成」から追加してください。</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => (
            <BotCard key={bot.id} bot={bot} />
          ))}
        </div>
      )}
    </div>
  );
}
