import { useEffect } from "react";
import { useLang } from "../i18n/LangContext";

type ActiveRun = "sendTest" | "fullRun" | null;

interface Props {
  open: boolean;
  onClose: () => void;
  onSendTest: () => void;
  onFullRun: () => void;
  activeRun: ActiveRun;
}

function Spinner({ color }: { color: string }) {
  return (
    <svg className="animate-spin w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke={color} strokeWidth="4" />
      <path className="opacity-75" fill={color}
        d="M4 12a8 8 0 018-8V0C5.373 0 22 6.477 22 12h-4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export default function TestRunModal({ open, onClose, onSendTest, onFullRun, activeRun }: Props) {
  const { t } = useLang();
  const running = activeRun !== null;

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
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">{t.modalTestRunTitle}</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {running ? t.btnRunning : t.modalTestRunSubtitle}
              </p>
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
            {/* 送信テスト */}
            <button
              onClick={onSendTest}
              disabled={running}
              className={`text-left p-4 rounded-lg border-2 transition-all ${
                activeRun === "sendTest"
                  ? "border-emerald-500 bg-emerald-50/50"
                  : running
                  ? "border-zinc-100 bg-zinc-50 opacity-40 cursor-not-allowed"
                  : "border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {activeRun === "sendTest"
                  ? <Spinner color="#10b981" />
                  : <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                }
                <span className="font-bold text-sm text-zinc-900">
                  {activeRun === "sendTest" ? t.btnSending : t.optionSendTestTitle}
                </span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">{t.optionSendTestDesc}</p>
            </button>

            {/* 本実行 */}
            <button
              onClick={onFullRun}
              disabled={running}
              className={`text-left p-4 rounded-lg border-2 transition-all ${
                activeRun === "fullRun"
                  ? "border-purple-700 bg-purple-50/50"
                  : running
                  ? "border-zinc-100 bg-zinc-50 opacity-40 cursor-not-allowed"
                  : "border-zinc-200 hover:border-purple-700 hover:bg-purple-50/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {activeRun === "fullRun"
                  ? <Spinner color="#4A154B" />
                  : <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#4A154B" }} />
                }
                <span className="font-bold text-sm text-zinc-900">
                  {activeRun === "fullRun" ? t.btnRunning : t.optionFullRunTitle}
                </span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">{t.optionFullRunDesc}</p>
            </button>
          </div>

          {/* Loading indicator */}
          {running && (
            <div className="mt-5 flex items-center justify-center gap-2">
              <div className="flex gap-1">
                {[0, 150, 300].map((delay) => (
                  <span key={delay} className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"
                    style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
              <span className="text-xs text-zinc-400">{t.btnRunning}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
