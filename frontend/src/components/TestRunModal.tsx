import { useEffect } from "react";
import { useLang } from "../i18n/LangContext";

interface Props {
  open: boolean;
  onClose: () => void;
  onSendTest: () => void;
  onFullRun: () => void;
  running: boolean;
}

export default function TestRunModal({ open, onClose, onSendTest, onFullRun, running }: Props) {
  const { t } = useLang();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !running) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, running, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 px-4"
      onClick={() => !running && onClose()}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">{t.modalTestRunTitle}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{t.modalTestRunSubtitle}</p>
          </div>
          <button
            onClick={onClose}
            disabled={running}
            className="text-zinc-400 hover:text-zinc-700 transition-colors text-lg leading-none disabled:opacity-30"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onSendTest}
            disabled={running}
            className="text-left p-4 rounded-lg border-2 border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-bold text-sm text-zinc-900">{t.optionSendTestTitle}</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">{t.optionSendTestDesc}</p>
          </button>

          <button
            onClick={onFullRun}
            disabled={running}
            className="text-left p-4 rounded-lg border-2 border-zinc-200 hover:border-purple-700 hover:bg-purple-50/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#4A154B" }} />
              <span className="font-bold text-sm text-zinc-900">{t.optionFullRunTitle}</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">{t.optionFullRunDesc}</p>
          </button>
        </div>
      </div>
    </div>
  );
}
