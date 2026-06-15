'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

// ── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

// ── Single Toast Item ────────────────────────────────────────────────────────
const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

const COLORS: Record<ToastType, string> = {
  success: 'bg-[#1a1d27] border-green-500/40 text-green-400',
  error:   'bg-[#1a1d27] border-red-500/40   text-red-400',
  info:    'bg-[#1a1d27] border-cyan-500/40   text-cyan-400',
};

const ICON_COLORS: Record<ToastType, string> = {
  success: 'bg-green-500/15 text-green-400',
  error:   'bg-red-500/15   text-red-400',
  info:    'bg-cyan-500/15  text-cyan-400',
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl
        min-w-[260px] max-w-[380px] w-full
        animate-in slide-in-from-right-full duration-300
        ${COLORS[toast.type]}
      `}
    >
      {/* Icon */}
      <div
        className={`
          w-7 h-7 rounded-full flex items-center justify-center
          text-sm font-bold shrink-0
          ${ICON_COLORS[toast.type]}
        `}
      >
        {ICONS[toast.type]}
      </div>

      {/* Message */}
      <span className="text-sm text-white font-medium flex-1 leading-snug">
        {toast.message}
      </span>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-500 hover:text-gray-300 transition-colors text-lg leading-none shrink-0 ml-1"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = ++counterRef.current;
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container — fixed bottom-right */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
