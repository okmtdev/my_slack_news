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

const GEMINI_MODELS = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"];
const TIMEZONES = ["Asia/Tokyo", "UTC", "America/New_York", "America/Los_Angeles", "Europe/London"];

const DEFAULT_VALUES: FormValues = {
  name: "",
  enabled: true,
  keywords: [""],
  rss_feeds: [{ url: "", name: "" }],
  gemini_api_key: "",
  gemini_model: "gemini-1.5-flash",
  slack_webhook_url: "",
  schedule: { timezone: "Asia/Tokyo", entries: [{ days: ["monday"], time: "09:00" }] },
  lookback_days: 1,
};

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block label-meta mb-2">
      {children}{required && <span className="text-amber-500 ml-0.5">*</span>}
    </label>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
    >
      {label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2 text-zinc-300 hover:text-red-400 transition-colors text-base leading-none"
    >
      ×
    </button>
  );
}

function KeywordsField({ control, register }: { control: any; register: any }) {
  const { fields, append, remove } = useFieldArray({ control, name: "keywords" });
  return (
    <div>
      <FieldLabel required>キーワード</FieldLabel>
      <div className="flex flex-col gap-2">
        {fields.map((field, i) => (
          <div key={field.id} className="flex gap-2">
            <input
              {...register(`keywords.${i}` as const, { required: true })}
              className="input-base flex-1"
              placeholder="例: AI, LLM, 機械学習"
            />
            {fields.length > 1 && <RemoveButton onClick={() => remove(i)} />}
          </div>
        ))}
      </div>
      <AddButton onClick={() => append("")} label="+ キーワードを追加" />
    </div>
  );
}

function RSSFeedsField({ control, register }: { control: any; register: any }) {
  const { fields, append, remove } = useFieldArray({ control, name: "rss_feeds" });
  return (
    <div>
      <FieldLabel required>RSSフィード</FieldLabel>
      <div className="flex flex-col gap-2">
        {fields.map((field, i) => (
          <div key={field.id} className="flex gap-2">
            <input
              {...register(`rss_feeds.${i}.url` as const, { required: true })}
              className="input-base flex-1"
              placeholder="https://example.com/feed.rss"
            />
            <input
              {...register(`rss_feeds.${i}.name` as const)}
              className="input-base w-32"
              placeholder="フィード名"
            />
            {fields.length > 1 && <RemoveButton onClick={() => remove(i)} />}
          </div>
        ))}
      </div>
      <AddButton onClick={() => append({ url: "", name: "" })} label="+ フィードを追加" />
    </div>
  );
}

function ScheduleEntriesField({ control, register }: { control: any; register: any }) {
  const { fields, append, remove } = useFieldArray({ control, name: "schedule.entries" });
  return (
    <div>
      <FieldLabel required>投稿スケジュール</FieldLabel>
      <div className="flex flex-col gap-3">
        {fields.map((field, i) => (
          <div key={field.id} className="border border-zinc-100 rounded-lg p-3 bg-zinc-50 flex flex-col gap-3">
            <div className="flex flex-wrap gap-1.5">
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
                        className={`w-8 h-8 rounded text-xs font-bold transition-colors ${
                          checked
                            ? "bg-zinc-900 text-white"
                            : "bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-400"
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="label-meta">時刻</span>
              <input
                type="time"
                {...register(`schedule.entries.${i}.time` as const, { required: true })}
                className="input-base w-36 mono"
              />
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="ml-auto text-xs text-zinc-400 hover:text-red-500 transition-colors"
                >
                  削除
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <AddButton
        onClick={() => append({ days: ["monday"], time: "09:00" })}
        label="+ スケジュールを追加"
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="label-meta">{title}</span>
        <div className="flex-1 h-px bg-zinc-100" />
      </div>
      <div className="flex flex-col gap-4">{children}</div>
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
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-zinc-400 hover:text-zinc-700 transition-colors text-xl leading-none"
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            {isEdit ? "Bot を編集" : "新規 Bot 作成"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        {/* Basic */}
        <Section title="基本情報">
          <div>
            <FieldLabel required>Bot 名</FieldLabel>
            <input
              {...register("name", { required: "Bot名は必須です" })}
              className="input-base"
              placeholder="例: AI ニュース Bot"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <KeywordsField control={control} register={register} />
          <RSSFeedsField control={control} register={register} />
          <div>
            <FieldLabel>過去何日分を取得</FieldLabel>
            <input
              type="number"
              min={1}
              max={30}
              {...register("lookback_days", { valueAsNumber: true, min: 1, max: 30 })}
              className="input-base w-24 mono"
            />
            <p className="text-xs text-zinc-400 mt-1">週次実行なら 7 を推奨</p>
          </div>
        </Section>

        {/* Gemini */}
        <Section title="Gemini API">
          <div>
            <FieldLabel required>API キー</FieldLabel>
            <input
              type="password"
              {...register("gemini_api_key", { required: "Gemini API キーは必須です" })}
              className="input-base mono"
              placeholder="AIzaSy..."
            />
          </div>
          <div>
            <FieldLabel>モデル</FieldLabel>
            <select {...register("gemini_model")} className="select-base w-56">
              {GEMINI_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </Section>

        {/* Slack */}
        <Section title="Slack">
          <div>
            <FieldLabel required>Incoming Webhook URL</FieldLabel>
            <input
              {...register("slack_webhook_url", { required: "Webhook URL は必須です" })}
              className="input-base mono"
              placeholder="https://hooks.slack.com/services/..."
            />
          </div>
        </Section>

        {/* Schedule */}
        <Section title="スケジュール">
          <div>
            <FieldLabel>タイムゾーン</FieldLabel>
            <select {...register("schedule.timezone")} className="select-base w-56">
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <ScheduleEntriesField control={control} register={register} />
        </Section>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 bg-zinc-900 text-white text-sm font-bold rounded
                       hover:bg-zinc-700 disabled:opacity-40 transition-colors"
          >
            {isPending ? "保存中..." : isEdit ? "更新する" : "作成する"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 border border-zinc-200 rounded text-sm text-zinc-600
                       hover:bg-zinc-50 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
