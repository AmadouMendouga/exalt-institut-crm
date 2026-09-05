import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'center' | 'drawer';
  maxWidthClassName?: string;
  children: React.ReactNode;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  variant = 'center',
  maxWidthClassName = 'max-w-md',
  children,
}) => {
  const isDrawer = variant === 'drawer';
  const contentRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Ferme au clavier (Échap) et piège le focus à l'intérieur tant qu'elle est
  // ouverte, puis le rend à l'élément qui l'a ouverte — sans ça un utilisateur
  // clavier ou lecteur d'écran ne peut ni la fermer ni même savoir qu'elle existe.
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const container = contentRef.current;
    const focusables: HTMLElement[] = container
      ? Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      : [];
    (focusables[0] || container)?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !container) return;
      const nodes: HTMLElement[] = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-50 flex bg-stone-900/50 dark:bg-black/60 backdrop-blur-xs ${
            isDrawer ? 'justify-end' : 'items-center justify-center p-4'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <motion.div
            ref={contentRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className={
              isDrawer
                ? 'bg-[var(--surface)] w-full max-w-md h-full shadow-2xl border-l border-stone-200 dark:border-stone-700 flex flex-col outline-none'
                : `bg-[var(--surface)] w-full ${maxWidthClassName} rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden flex flex-col max-h-[90vh] outline-none`
            }
            initial={isDrawer ? { x: '100%' } : { opacity: 0, scale: 0.95, y: 12 }}
            animate={isDrawer ? { x: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isDrawer ? { x: '100%' } : { opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
