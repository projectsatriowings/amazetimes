import React, { useEffect } from 'react';
import { Info, CheckCircle2, AlertTriangle, XCircle, LogOut, Moon, Sun, BookmarkCheck, RefreshCw, Volume2 } from 'lucide-react';

export default function Toast({ toasts, onRemoveToast }) {
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none">
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

  const renderIcon = () => {
    switch (toast.icon) {
      case 'check':
      case 'bookmark_added':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />;
      case 'logout':
        return <LogOut className="w-4 h-4 text-slate-300 flex-shrink-0" />;
      case 'dark_mode':
        return <Moon className="w-4 h-4 text-amber-400 flex-shrink-0" />;
      case 'light_mode':
        return <Sun className="w-4 h-4 text-amber-300 flex-shrink-0" />;
      case 'refresh':
        return <RefreshCw className="w-4 h-4 text-sky-400 flex-shrink-0 animate-spin" />;
      case 'volume_up':
        return <Volume2 className="w-4 h-4 text-sky-400 flex-shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />;
    }
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs font-subtitle font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-2.5 pointer-events-auto transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
      {renderIcon()}
      <span className="leading-snug">{toast.message}</span>
    </div>
  );
}
