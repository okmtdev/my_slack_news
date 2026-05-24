import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { useLang } from "../i18n/LangContext";
import type { GeminiModelInfo } from "../types/bot";

type Filter = "all" | "text" | "image";

interface Props {
  open: boolean;
  apiKey: string;
  initialFilter?: Filter;
  onClose: () => void;
  onSelect: (modelName: string) => void;
}

function isImageModel(m: GeminiModelInfo): boolean {
  return m.name.includes("image") ||
    m.supported_actions.some((a) => a.toLowerCase().includes("image"));
}

function isTextModel(m: GeminiModelInfo): boolean {
  return m.supported_actions.includes("generateContent") && !isImageModel(m);
}

export default function GeminiModelsModal({
  open,
  apiKey,
  initialFilter = "all",
  onClose,
  onSelect,
}: Props) {
  const { t } = useLang();
  const [filter, setFilter] = useState<Filter>(initialFilter);

  useEffect(() => {
    if (open) setFilter(initialFilter);
  }, [open, initialFilter]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["gemini-models", apiKey],
    queryFn: () => api.gemini.listModels(apiKey),
    enabled: open && !!apiKey,
    staleTime: 60_000,
  });

  const filteredModels = useMemo(() => {
    if (!data?.models) return [];
    if (filter === "all") return data.models;
    if (filter === "image") return data.models.filter(isImageModel);
    return data.models.filter(isTextModel);
  }, [data, filter]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 border-b border-zinc-100">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-lg font-bold text-zinc-900">{t.modelsModalTitle}</h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 transition-colors text-lg leading-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="flex gap-1">
            {(["all", "text", "image"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs font-semibold px-3 py-1.5 rounded transition-colors ${
                  filter === f
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {f === "all" ? t.modelsModalFilterAll
                  : f === "text" ? t.modelsModalFilterText
                  : t.modelsModalFilterImage}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!apiKey && (
            <p className="text-sm text-zinc-500 text-center py-8">{t.modelsModalEnterKey}</p>
          )}
          {apiKey && isLoading && (
            <p className="text-sm text-zinc-500 text-center py-8">{t.modelsModalFetching}</p>
          )}
          {apiKey && error && (
            <p className="text-sm text-red-500 text-center py-8">{(error as Error).message}</p>
          )}
          {apiKey && data && filteredModels.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-8">{t.modelsModalEmpty}</p>
          )}
          {apiKey && data && filteredModels.length > 0 && (
            <div className="flex flex-col gap-2">
              {filteredModels.map((m) => (
                <button
                  key={m.name}
                  onClick={() => onSelect(m.name)}
                  className="text-left p-3 rounded-lg border border-zinc-200 hover:border-amber-500 hover:bg-amber-50/30 transition-colors"
                >
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <span className="font-semibold text-sm text-zinc-900">{m.display_name}</span>
                    <code className="mono text-[11px] text-zinc-500 shrink-0">{m.name}</code>
                  </div>
                  {m.description && (
                    <p className="text-xs text-zinc-500 mb-1.5 line-clamp-2">{m.description}</p>
                  )}
                  {m.supported_actions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-widest mr-1">
                        {t.modelsModalSupports}:
                      </span>
                      {m.supported_actions.map((a) => (
                        <span key={a} className="mono text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
