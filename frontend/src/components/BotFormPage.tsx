import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../api/client";
import type { Bot, Day } from "../types/bot";

type FormValues = Omit<Bot, "id" | "created_at" | "updated_at">;

const DAYS: { value: Day; label: string }[] = [
  { value: "monday", label: "月" },
  { value: "tuesday", label: "火" },
  { value: "wednesday", label: "水" },
  { value: "thursday", label: "木" },
  { value: "friday", label: "金" },
  { value: "saturday", label: "土" },
  { value: "sunday", label: "日" },
];

const GEMINI_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash",
];

const TIMEZONES = [
  "Asia/Tokyo",
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
];

const DEFAULT_VALUES: FormValues = {
  name: "",
  enabled: true,
  keywords: [""],
  rss_feeds: [{ url: "", name: "" }],
  gemini_api_key: "",
  gemini_model: "gemini-1.5-flash",
  slack_webhook_url: "",
  schedule: {
    timezone: "Asia/Tokyo",
    entries: [{ days: ["monday"], time: "09:00" }],
  },
  lookback_days: 1,
};

function KeywordsField({ control, register }: { control: any; register: any }) {
  const { fields, append, remove } = useFieldArray({ control, name: "keywords" });
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">キーワード *</label>
      <div className="flex flex-col gap-2">
        {fields.map((field, i) => (
          <div key={field.id} className="flex gap-2">
            <input
              {...register(`keywords.${i}` as const, { required: true })}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="例: AI, LLM, 機械学習"
            />
            {fields.length > 1 && (
              <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 px-2">✕</button>
            )}
          </div>
        ))}
      </div>
      <button type="button" onClick={() => append("")} className="mt-2 text-xs text-indigo-600 hover:underline">
        + キーワードを追加
      </button>
    </div>
  );
}

function RSSFeedsField({ control, register }: { control: any; register: any }) {
  const { fields, append, remove } = useFieldArray({ control, name: "rss_feeds" });
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">RSSフィード *</label>
      <div className="flex flex-col gap-3">
        {fields.map((field, i) => (
          <div key={field.id} className="flex gap-2">
            <input
              {...register(`rss_feeds.${i}.url` as const, { required: true })}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://example.com/feed.rss"
            />
            <input
              {...register(`rss_feeds.${i}.name` as const)}
              className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="フィード名"
            />
            {fields.length > 1 && (
              <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 px-2">✕</button>
            )}
          </div>
        ))}
      </div>
      <button type="button" onClick={() => append({ url: "", name: "" })} className="mt-2 text-xs text-indigo-600 hover:underline">
        + フィードを追加
      </button>
    </div>
  );
}

function ScheduleEntriesField({ control, register }: { control: any; register: any }) {
  const { fields, append, remove } = useFieldArray({ control, name: "schedule.entries" });
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">投稿スケジュール *</label>
      <div className="flex flex-col gap-3">
        {fields.map((field, i) => (
          <div key={field.id} className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2">
            <div className="flex flex-wrap gap-1">
              {DAYS.map((d) => (
                <Controller
                  key={d.value}
                  control={control}
                  name={`schedule.entries.${i}.days` as const}
                  render={({ field: f }) => {
                    const checked = (f.value as Day[]).includes(d.value);
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          const next = checked
                            ? (f.value as Day[]).filter((v) => v !== d.value)
                            : [...(f.value as Day[]), d.value];
                          f.onChange(next);
                        }}
                        className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                          checked ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">時刻:</label>
              <input
                type="time"
                {...register(`schedule.entries.${i}.time` as const, { required: true })}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(i)} className="ml-auto text-red-400 hover:text-red-600 text-xs">削除</button>
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => append({ days: ["monday"], time: "09:00" })}
        className="mt-2 text-xs text-indigo-600 hover:underline"
      >
        + スケジュールを追加
      </button>
    </div>
  );
}

export default function BotFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!id;

  const { data: existing } = useQuery({
    queryKey: ["bots", id],
    queryFn: () => api.bots.get(id!),
    enabled: isEdit,
  });

  const { register, control, handleSubmit, reset, formState: { errors } } =
    useForm<FormValues>({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (existing) {
      const { id: _id, created_at: _c, updated_at: _u, ...rest } = existing;
      reset(rest);
    }
  }, [existing, reset]);

  const createMutation = useMutation({
    mutationFn: api.bots.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bots"] });
      toast.success("Bot を作成しました");
      navigate("/");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) => api.bots.update(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bots"] });
      toast.success("Bot を更新しました");
      navigate("/");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = (data: FormValues) => {
    const cleaned = {
      ...data,
      keywords: data.keywords.filter(Boolean),
      rss_feeds: data.rss_feeds.filter((f) => f.url),
    };
    if (isEdit) updateMutation.mutate(cleaned);
    else createMutation.mutate(cleaned);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-lg">←</button>
        <h1 className="text-xl font-bold text-gray-800">{isEdit ? "Bot を編集" : "新規 Bot 作成"}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border p-6 flex flex-col gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bot 名 *</label>
          <input
            {...register("name", { required: "Bot名は必須です" })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="例: AI ニュース Bot"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <KeywordsField control={control} register={register} />
        <RSSFeedsField control={control} register={register} />

        {/* Gemini */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Gemini API キー *</label>
            <input
              type="password"
              {...register("gemini_api_key", { required: "Gemini API キーは必須です" })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="AIzaSy..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gemini モデル</label>
            <select
              {...register("gemini_model")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {GEMINI_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">過去何日分を取得</label>
            <input
              type="number"
              min={1}
              max={30}
              {...register("lookback_days", { valueAsNumber: true, min: 1, max: 30 })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Slack */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slack Incoming Webhook URL *</label>
          <input
            {...register("slack_webhook_url", { required: "Webhook URL は必須です" })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="https://hooks.slack.com/services/..."
          />
        </div>

        {/* Schedule */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タイムゾーン</label>
            <select
              {...register("schedule.timezone")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <ScheduleEntriesField control={control} register={register} />
        </div>

        {/* Enabled */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="enabled"
            {...register("enabled")}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="enabled" className="text-sm font-medium text-gray-700">有効にする</label>
        </div>

        <div className="flex gap-3 pt-2 border-t">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? "保存中..." : isEdit ? "更新する" : "作成する"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
