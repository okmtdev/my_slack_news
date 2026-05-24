import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "../api/client";
import { useLang } from "../i18n/LangContext";
import type { GeminiModelInfo } from "../types/bot";

interface Props {
  open: boolean;
  apiKey: string;
  onClose: () => void;
  onSelect: (modelName: string) => void;
}

const EXCLUDED_PATTERNS = [
  "tts",
  "image",
  "embedding",
  "aqa",
  "-1.0",
  "-1.5",
  "-2.0",
  "flash-lite",
  "flash-8b",
];

function isUsable(m: GeminiModelInfo): boolean {
  if (!m.supported_actions.includes("generateContent")) return false;
  const name = m.name.toLowerCase();
  return !EXCLUDED_PATTERNS.some((p) => name.includes(p));
}

export default function GeminiModelsModal({ open, apiKey, onClose, onSelect }: Props) {
  const { t } = useLang();

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

  const models = useMemo(() => {
    if (!data?.models) return [];
    return data.models.filter(isUsable);
  }, [data]);

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
        <div className="px-6 pt-6 pb-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900">{t.modelsModalTitle}</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ✕
          </button>
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
          {apiKey && data && models.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-8">{t.modelsModalEmpty}</p>
          )}
          {apiKey && data && models.length > 0 && (
            <div className="flex flex-col gap-2">
              {models.map((m) => (
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
