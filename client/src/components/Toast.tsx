import { useState, useCallback } from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

const toastStore = {
  listeners: new Set<(toast: Toast) => void>(),
  subscribe(listener: (toast: Toast) => void) {
    toastStore.listeners.add(listener);
    return () => toastStore.listeners.delete(listener);
  },
  emit(toast: Toast) {
    toastStore.listeners.forEach(listener => listener(toast));
  }
};

export function showToast(message: string, type: ToastType = "info", duration = 3000) {
  const id = Math.random().toString(36).substr(2, 9);
  const toast: Toast = { id, message, type, duration };
  toastStore.emit(toast);
  return id;
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Toast) => {
    setToasts(prev => [...prev, toast]);
    
    if (toast.duration) {
      setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Subscribe to toast events
  useState(() => {
    return toastStore.subscribe(addToast);
  });

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "info":
      default:
        return <Info className="w-5 h-5 text-teal-600" />;
    }
  };

  const getBgColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "info":
      default:
        return "bg-teal-50 border-teal-200";
    }
  };

  const getTextColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      case "warning":
        return "text-yellow-800";
      case "info":
      default:
        return "text-teal-800";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg pointer-events-auto animate-in fade-in slide-in-from-right-4 ${getBgColor(toast.type)}`}
        >
          {getIcon(toast.type)}
          <span className={`text-sm font-medium ${getTextColor(toast.type)}`}>
            {toast.message}
          </span>
          <button
            onClick={() => removeToast(toast.id)}
            className={`ml-2 ${getTextColor(toast.type)} hover:opacity-70`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
