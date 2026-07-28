import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info" | "loading";

export type ToastOptions = {
  id?: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export type ToastItem = ToastOptions & {
  id: string;
  createdAt: number;
  durationMs: number;
};

type Listener = (toasts: ToastItem[]) => void;

const listeners = new Set<Listener>();
let store: ToastItem[] = [];
const MAX_VISIBLE_TOASTS = 3;
const recentMessages = new Map<string, number>();

function emit() {
  for (const l of listeners) l(store);
}

export function toast(input: ToastOptions): string {
  const messageKey = `${input.variant || 'info'}_${input.message}`;
  const now = Date.now();

  // Deduplication check: ignore identical toasts within 2 seconds
  if (recentMessages.has(messageKey)) {
    const lastTime = recentMessages.get(messageKey)!;
    if (now - lastTime < 2000) {
      return store.find((t) => t.message === input.message)?.id || "";
    }
  }
  recentMessages.set(messageKey, now);

  const id = input.id || `toast_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const item: ToastItem = {
    ...input,
    id,
    variant: input.variant ?? "info",
    createdAt: now,
    durationMs: input.durationMs ?? (input.variant === "loading" ? 0 : 3500),
  };

  // Remove existing toast with same id if any
  store = store.filter((t) => t.id !== id);
  store = [item, ...store].slice(0, MAX_VISIBLE_TOASTS);
  emit();

  if (item.durationMs > 0) {
    window.setTimeout(() => {
      toast.dismiss(id);
    }, item.durationMs);
  }

  return id;
}

toast.dismiss = (id: string) => {
  store = store.filter((t) => t.id !== id);
  emit();
};

toast.success = (message: string, options?: Omit<ToastOptions, "message" | "variant">) =>
  toast({ message, variant: "success", title: "Berhasil", ...options });

toast.error = (message: string, options?: Omit<ToastOptions, "message" | "variant">) =>
  toast({ message, variant: "error", title: "Gagal", ...options });

toast.warning = (message: string, options?: Omit<ToastOptions, "message" | "variant">) =>
  toast({ message, variant: "warning", title: "Peringatan", ...options });

toast.info = (message: string, options?: Omit<ToastOptions, "message" | "variant">) =>
  toast({ message, variant: "info", title: "Informasi", ...options });

toast.loading = (message: string, options?: Omit<ToastOptions, "message" | "variant">) =>
  toast({ message, variant: "loading", title: "Memuat...", ...options });

toast.promise = async <T,>(
  promise: Promise<T>,
  messages: { loading: string; success: string; error: string }
): Promise<T> => {
  const loadingId = toast.loading(messages.loading);
  try {
    const result = await promise;
    toast.dismiss(loadingId);
    toast.success(messages.success);
    return result;
  } catch (err) {
    toast.dismiss(loadingId);
    toast.error(messages.error);
    throw err;
  }
};

export function ToastViewport() {
  const [toasts, setToasts] = useState<ToastItem[]>(store);

  useEffect(() => {
    const listener: Listener = (next) => setToasts([...next]);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const rendered = useMemo(() => {
    const getVariantStyles = (variant: ToastVariant) => {
      switch (variant) {
        case "success":
          return {
            bg: "bg-white border-[#C59E3F]/40 shadow-xl",
            icon: <CheckCircle2 className="w-5 h-5 text-[#C59E3F] shrink-0" />,
            title: "text-[#2C2416]",
          };
        case "error":
          return {
            bg: "bg-white border-red-200 shadow-xl",
            icon: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
            title: "text-red-900",
          };
        case "warning":
          return {
            bg: "bg-white border-amber-200 shadow-xl",
            icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
            title: "text-amber-900",
          };
        case "loading":
          return {
            bg: "bg-white border-blue-200 shadow-xl",
            icon: <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />,
            title: "text-blue-900",
          };
        default:
          return {
            bg: "bg-white border-gray-200 shadow-xl",
            icon: <Info className="w-5 h-5 text-gray-500 shrink-0" />,
            title: "text-gray-900",
          };
      }
    };

    return toasts.map((t) => {
      const styles = getVariantStyles(t.variant);

      return (
        <div
          key={t.id}
          className={`pointer-events-auto w-full max-w-[360px] sm:max-w-[420px] rounded-2xl border p-4 transition-all duration-300 transform translate-y-0 ${styles.bg}`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            {styles.icon}
            <div className="min-w-0 flex-1">
              {t.title && (
                <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${styles.title}`}>
                  {t.title}
                </p>
              )}
              <p className="text-xs text-[#5C5546] leading-relaxed break-words font-medium">{t.message}</p>
              {t.action && (
                <button
                  onClick={() => {
                    t.action?.onClick();
                    toast.dismiss(t.id);
                  }}
                  className="mt-2 text-xs font-bold text-[#C59E3F] hover:underline block"
                >
                  {t.action.label}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    });
  }, [toasts]);

  return (
    <div className="pointer-events-none fixed z-[9999] top-4 right-4 left-4 sm:left-auto flex flex-col gap-2 items-end">
      {rendered}
    </div>
  );
}
