import React from 'react';
import { Check } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

type ButtonStatus = 'idle' | 'loading' | 'success';

interface StatefulButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  status?: ButtonStatus;
  children: React.ReactNode;
  loadingText?: string;
  successText?: string;
}

export const StatefulButton: React.FC<StatefulButtonProps> = ({
  status = 'idle',
  children,
  loadingText,
  successText,
  className = '',
  disabled,
  ...rest
}) => {
  return (
    <button
      {...rest}
      disabled={disabled || status !== 'idle'}
      className={`relative inline-flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed disabled:opacity-80 ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {status === 'loading' ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-2"
          >
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {loadingText && <span>{loadingText}</span>}
          </motion.span>
        ) : status === 'success' ? (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 400 }}
            className="inline-flex items-center gap-2"
          >
            <Check className="w-3.5 h-3.5" />
            {successText && <span>{successText}</span>}
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-2"
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};
