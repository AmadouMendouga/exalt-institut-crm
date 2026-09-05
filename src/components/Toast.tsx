import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ToastMessage } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  const { t } = useLanguage();
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="pointer-events-auto bg-[var(--text-primary)] text-white p-4 rounded-xl shadow-2xl border border-stone-700 dark:border-stone-200 flex items-start gap-3"
          >
            {toast.type === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-[var(--surface-highlight)] shrink-0 mt-0.5" />
            )}
            {toast.type === 'info' && (
              <Info className="w-5 h-5 text-sky-400 dark:text-sky-500 shrink-0 mt-0.5" />
            )}
            {toast.type === 'warning' && (
              <AlertCircle className="w-5 h-5 text-amber-400 dark:text-amber-500 shrink-0 mt-0.5" />
            )}

            <div className="flex-1 text-xs">
              <p className="font-semibold text-white">{toast.title}</p>
              {toast.description && (
                <p className="text-stone-300 dark:text-stone-600 mt-0.5 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label={t.closeBtn}
              className="text-stone-400 dark:text-stone-500 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
