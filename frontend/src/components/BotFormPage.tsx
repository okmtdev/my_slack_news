import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../api/client";
import { useLang } from "../i18n/LangContext";
import type { Bot, Day } from "../types/bot";
import GeminiModelsModal from "./GeminiModelsModal";

type FormValues = Omit<Bot, "id" | "created_at" | "updated_at">;

const DAYS: Day[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS_JA: Record<Day, string> = {
  monday: "月", tuesday: "火", wednesday: "水", thursday: "木",
  friday: "金", saturday: "土", sunday: "日",
};
const DAY_LABELS_EN: Record<Day, string> = {
  monday: "M", tuesday: "T", wednesday: "W", thursday: "T",
  friday: "F", saturday: "S", sunday: "S",
};

const GEMINI_MODELS: { value: string; label: string }[] = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
];
const TIMEZONES = ["Asia/Tokyo", "UTC", "America/New_York", "America/Los_Angeles", "Europe/London"];

const DEFAULT_VALUES: FormValues = {
  name: "",
  enabled: true,
  keywords: [],
  rss_feeds: [{ url: "", name: "" }],
  gemini_api_key: "",
  gemini_model: "gemini-2.5-flash",
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

function KeywordsField({ control, register }: { control: any; register: any }) {
  const { t } = useLang();
  const { fields, append, remove } = useFieldArray({ control, name: "keywords" });
  return (
    <div>
      <FieldLabel>{t.labelKeywordsField}</FieldLabel>
      <div className="flex flex-col gap-2">
        {fields.map((field, i) => (
          <div key={field.id} className="flex gap-2">
            <input {...register(`keywords.${i}` as const)}
              className="input-base flex-1" placeholder={t.phKeyword} />
            <button type="button" onClick={() => remove(i)}
              className="px-2 text-zinc-300 hover:text-red-400 transition-colors text-base leading-none">×</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => append("")}
        className="mt-2 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">
        {t.addKeyword}
      </button>
      <p className="text-xs text-zinc-400 mt-1.5">{t.keywordsHint}</p>
    </div>
  );
}

function RSSFeedsField({ control, register }: { control: any; register: any }) {
  const { t } = useLang();
  const { fields, append, remove } = useFieldArray({ control, name: "rss_feeds" });
  return (
    <div>
      <FieldLabel required>{t.labelRssFeeds}</FieldLabel>
      <div className="flex flex-col gap-2">
        {fields.map((field, i) => (
          <div key={field.id} className="flex gap-2">
            <input {...register(`rss_feeds.${i}.url` as const, { required: true })}
              className="input-base flex-1" placeholder={t.phRssUrl} />
            <input {...register(`rss_feeds.${i}.name` as const)}
              className="input-base w-32" placeholder={t.phFeedName} />
            {fields.length > 1 && (
              <button type="button" onClick={() => remove(i)}
                className="px-2 text-zinc-300 hover:text-red-400 transition-colors text-base leading-none">×</button>
            )}
          </div>
        ))}
      </div>
      <button type="button" onClick={() => append({ url: "", name: "" })}
        className="mt-2 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">
        {t.addFeed}
      </button>
    </div>
  );
}

function ScheduleEntriesField({ control, register }: { control: any; register: any }) {
  const { t, lang } = useLang();
  const dayLabels = lang === "en" ? DAY_LABELS_EN : DAY_LABELS_JA;
  const { fields, append, remove } = useFieldArray({ control, name: "schedule.entries" });
  return (
    <div>
      <FieldLabel required>{t.labelScheduleEntries}</FieldLabel>
      <div className="flex flex-col gap-3">
        {fields.map((field, i) => (
          <div key={field.id} className="border border-zinc-100 rounded-lg p-3 bg-zinc-50 flex flex-col gap-3">
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((d) => (
                <Controller key={d} control={control} name={`schedule.entries.${i}.days` as const}
                  render={({ field: f }) => {
                    const checked = (f.value as Day[]).includes(d);
                    return (
                      <button type="button"
                        onClick={() => {
                          const next = checked
                            ? (f.value as Day[]).filter((v) => v !== d)
                            : [...(f.value as Day[]), d];
                          f.onChange(next);
                        }}
                        className={`w-8 h-8 rounded text-xs font-bold transition-colors ${
                          checked
                            ? "text-white"
                            : "bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-400"
                        }`}
                        style={checked ? { backgroundColor: "#4A154B" } : {}}
                      >
                        {dayLabels[d]}
                      </button>
                    );
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="label-meta">{t.labelTime}</span>
              <input type="time" {...register(`schedule.entries.${i}.time` as const, { required: true })}
                className="input-base w-36 mono" />
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(i)}
                  className="ml-auto text-xs text-zinc-400 hover:text-red-500 transition-colors">
                  {t.removeSchedule}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => append({ days: ["monday"], time: "09:00" })}
        className="mt-2 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">
        {t.addSchedule}
      </button>
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
  const { t } = useLang();
  const isEdit = !!id;

  const { data: existing } = useQuery({
    queryKey: ["bots", id],
    queryFn: () => api.bots.get(id!),
    enabled: isEdit,
  });

  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } =
    useForm<FormValues>({ defaultValues: DEFAULT_VALUES });

  const currentApiKey = watch("gemini_api_key");
  const [modelsModalOpen, setModelsModalOpen] = useState(false);

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
      toast.success(t.toastCreated);
      navigate("/");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) => api.bots.update(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bots"] });
      toast.success(t.toastUpdated);
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
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)}
          className="text-zinc-400 hover:text-zinc-700 transition-colors text-xl leading-none">←</button>
        <h1 className="text-2xl font-bold text-zinc-900">
          {isEdit ? t.pageTitleEdit : t.pageTitleCreate}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        <Section title={t.sectionBasic}>
          <div>
            <FieldLabel required>{t.labelBotName}</FieldLabel>
            <input {...register("name", { required: t.errBotName })}
              className="input-base" placeholder={t.phBotName} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <KeywordsField control={control} register={register} />
          <RSSFeedsField control={control} register={register} />
          <div>
            <FieldLabel>{t.labelLookbackDays}</FieldLabel>
            <input type="number" min={1} max={30}
              {...register("lookback_days", { valueAsNumber: true, min: 1, max: 30 })}
              className="input-base w-24 mono" />
            <p className="text-xs text-zinc-400 mt-1">{t.lookbackHint}</p>
          </div>
        </Section>

        <Section title={t.sectionGemini}>
          <div>
            <FieldLabel required>{t.labelGeminiKey}</FieldLabel>
            <input type="password" {...register("gemini_api_key", { required: t.errGeminiKey })}
              className="input-base mono" placeholder={t.phGeminiKey} />
            {errors.gemini_api_key && <p className="text-red-500 text-xs mt-1">{errors.gemini_api_key.message}</p>}
          </div>
          <div>
            <FieldLabel>{t.labelGeminiModel}</FieldLabel>
            <div className="flex items-center gap-2">
              <input
                list="gemini-text-models"
                {...register("gemini_model")}
                className="input-base mono w-72"
                placeholder="gemini-2.5-flash"
              />
              <datalist id="gemini-text-models">
                {GEMINI_MODELS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </datalist>
              <button
                type="button"
                onClick={() => setModelsModalOpen(true)}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors whitespace-nowrap"
              >
                {t.btnShowGeminiModels}
              </button>
            </div>
          </div>
        </Section>

        <Section title={t.sectionSlack}>
          <div>
            <FieldLabel required>{t.labelSlackWebhook}</FieldLabel>
            <input {...register("slack_webhook_url", { required: t.errWebhook })}
              className="input-base mono" placeholder={t.phWebhook} />
            {errors.slack_webhook_url && <p className="text-red-500 text-xs mt-1">{errors.slack_webhook_url.message}</p>}
          </div>
        </Section>

        <Section title={t.sectionSchedule}>
          <div>
            <FieldLabel>{t.labelTimezone}</FieldLabel>
            <select {...register("schedule.timezone")} className="select-base w-56">
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <ScheduleEntriesField control={control} register={register} />
        </Section>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isPending}
            className="px-6 py-2.5 text-white text-sm font-bold rounded disabled:opacity-40 transition-colors"
            style={{ backgroundColor: "#4A154B" }}
            onMouseEnter={(e) => !isPending && (e.currentTarget.style.backgroundColor = "#611f69")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4A154B")}
          >
            {isPending ? t.btnSaving : isEdit ? t.btnUpdate : t.btnSave}
          </button>
          <button type="button" onClick={() => navigate(-1)}
            className="px-5 py-2.5 border border-zinc-200 rounded text-sm text-zinc-600 hover:bg-zinc-50 transition-colors">
            {t.btnCancel}
          </button>
        </div>
      </form>

      <GeminiModelsModal
        open={modelsModalOpen}
        apiKey={currentApiKey ?? ""}
        onClose={() => setModelsModalOpen(false)}
        onSelect={(modelName) => {
          setValue("gemini_model", modelName, { shouldDirty: true });
          setModelsModalOpen(false);
        }}
      />
    </div>
  );
}
