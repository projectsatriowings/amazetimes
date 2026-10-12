import React, { useEffect } from 'react';

export default function Toast({ toasts, onRemoveToast }) {
  return (
    <div class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemoveToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div class="bg-slate-900 text-white text-xs font-subtitle font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 pointer-events-auto transform transition-all duration-300">
      <span class="material-symbols-outlined text-[18px] text-amber-400">
        {toast.icon || 'info'}
      </span>
      <span>{toast.message}</span>
    </div>
  );
}
