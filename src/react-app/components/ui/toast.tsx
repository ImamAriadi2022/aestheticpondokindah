import { useEffect, useMemo, useState } from "react";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  createdAt: number;
  durationMs: number;
};

type Listener = (toasts: ToastItem[]) => void;

const listeners = new Set<Listener>();
let store: ToastItem[] = [];

function emit() {
  for (const l of listeners) l(store);
}

export function toast(input: { title?: string; message: string; variant?: ToastVariant; durationMs?: number }) {
  const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const item: ToastItem = {
    id,
    title: input.title,
    message: input.message,
    variant: input.variant ?? "info",
    createdAt: Date.now(),
    durationMs: input.durationMs ?? 3200,
  };

  store = [item, ...store].slice(0, 3);
  emit();

  window.setTimeout(() => {
    store = store.filter((t) => t.id !== id);
    emit();
  }, item.durationMs);
}

export function ToastViewport() {
  const [toasts, setToasts] = useState<ToastItem[]>(store);

  useEffect(() => {
    const listener: Listener = (next) => setToasts(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const rendered = useMemo(() => {
    const getAccent = (variant: ToastVariant) => {
      if (variant === "success") return "border-[#c9a24a]/35 bg-white";
      if (variant === "error") return "border-red-200 bg-white";
      return "border-gray-200 bg-white";
    };

    const getDot = (variant: ToastVariant) => {
      if (variant === "success") return "bg-gradient-to-br from-[#c9a24a] to-[#a8843a]";
      if (variant === "error") return "bg-red-500";
      return "bg-gray-400";
    };

    const getTitleColor = (variant: ToastVariant) => {
      if (variant === "success") return "text-[#8a6b2b]";
      if (variant === "error") return "text-red-700";
      return "text-gray-900";
    };

    return toasts.map((t) => (
      <div
        key={t.id}
        className={`pointer-events-auto w-full max-w-[360px] sm:max-w-[420px] rounded-sm border shadow-lg ${getAccent(
          t.variant
        )}`}
        role="status"
        aria-live="polite"
      >
        <div className="p-3 sm:p-4 flex gap-3">
          <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${getDot(t.variant)}`} />
          <div className="min-w-0 flex-1">
            {t.title ? (
              <p className={`text-sm font-semibold ${getTitleColor(t.variant)} truncate`}>{t.title}</p>
            ) : null}
            <p className="text-sm text-gray-600 leading-relaxed break-words">{t.message}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              store = store.filter((x) => x.id !== t.id);
              emit();
            }}
            className="h-7 w-7 rounded-sm flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            aria-label="Tutup notifikasi"
          >
            <span className="text-base leading-none">×</span>
          </button>
        </div>
      </div>
    ));
  }, [toasts]);

  return (
    <div className="pointer-events-none fixed z-[9999] top-4 right-4 left-4 sm:left-auto flex flex-col gap-2 items-end">
      {rendered}
    </div>
  );
}
