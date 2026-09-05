import React, { useEffect, useState } from 'react';
import { Bell, X, Send, CheckCircle2, Clock, CalendarClock } from 'lucide-react';
import { Client } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Modal } from './ui/Modal';
import { addDaysISO, getReminderLeadHours } from '../lib/reminderSettings';

// "Temps convenable" avant que le popup ne réapparaisse s'il est simplement
// fermé sans être traité — le rappel est volontairement nuisible tant qu'il
// n'est ni relancé ni marqué comme fait.
const SNOOZE_MINUTES = 15;
const SNOOZE_STORAGE_KEY = 'crm-reminder-snooze-until';
const CHECK_INTERVAL_MS = 60 * 1000;

interface ReminderPopupProps {
  clients: Client[];
  onQuickRelance: (client: Client) => void;
  onMarkDone: (client: Client) => void;
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function readStoredSnooze(): number {
  try {
    const stored = localStorage.getItem(SNOOZE_STORAGE_KEY);
    return stored ? Number(stored) : 0;
  } catch {
    return 0;
  }
}

export const ReminderPopup: React.FC<ReminderPopupProps> = ({ clients, onQuickRelance, onMarkDone }) => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [snoozeUntil, setSnoozeUntil] = useState<number>(readStoredSnooze);

  const [dueClients, setDueClients] = useState<Client[]>([]);

  // Ré-évalue régulièrement s'il faut (re)montrer le popup — c'est ce qui le
  // rend nuisible : il revient tout seul tant qu'un rappel n'est pas traité.
  // Le délai d'anticipation (réglable via l'en-tête) est relu à chaque
  // vérification pour prendre en compte un changement de réglage sans reload.
  useEffect(() => {
    const check = () => {
      const leadDays = Math.round(getReminderLeadHours() / 24);
      const threshold = addDaysISO(todayISO(), leadDays);
      const due = clients.filter((c) => c.nextReminderDate && c.nextReminderDate <= threshold);
      setDueClients(due);
      if (due.length === 0) {
        setIsOpen(false);
        return;
      }
      setIsOpen(Date.now() >= snoozeUntil);
    };
    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [clients, snoozeUntil]);

  const snooze = () => {
    const until = Date.now() + SNOOZE_MINUTES * 60 * 1000;
    setSnoozeUntil(until);
    try {
      localStorage.setItem(SNOOZE_STORAGE_KEY, String(until));
    } catch {
      // stockage indisponible (navigation privée…) : le popup reviendra simplement plus tôt
    }
    setIsOpen(false);
  };

  if (dueClients.length === 0) return null;

  return (
    <Modal isOpen={isOpen} onClose={snooze} maxWidthClassName="max-w-lg">
      <div className="px-6 py-4 bg-[#ffdad6] border-b border-[#ba1a1a]/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#93000a] text-white flex items-center justify-center font-bold">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-base text-[var(--text-primary)]">
              {t.reminderPopupTitle}
            </h3>
            <p className="text-xs text-[#93000a]">{t.reminderPopupSubtitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={snooze}
          aria-label={t.reminderSnoozeBtn}
          className="w-8 h-8 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-800 hover:dark:text-stone-100 hover:bg-[var(--surface)]/60 flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-2.5 overflow-y-auto max-h-[60vh]">
        {dueClients.map((client) => {
          const today = todayISO();
          const isOverdue = (client.nextReminderDate as string) < today;
          const daysUntil = isOverdue
            ? 0
            : Math.round(
                (new Date(`${client.nextReminderDate}T00:00:00`).getTime() - new Date(`${today}T00:00:00`).getTime())
                  / (1000 * 60 * 60 * 24)
              );
          const isUpcoming = !isOverdue && daysUntil > 0;
          return (
            <div key={client.id} className="p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-[var(--surface)] space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm text-stone-800 dark:text-stone-100">
                    {client.prefix} {client.name}
                  </p>
                  {client.nextReminderNote && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{client.nextReminderNote}</p>
                  )}
                </div>
                {isOverdue && (
                  <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase text-[#93000a] bg-[#ffdad6] px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3" />
                    {t.reminderOverdueBadge}
                  </span>
                )}
                {isUpcoming && (
                  <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase text-[var(--accent-dark)] bg-[var(--surface-highlight)] px-2 py-0.5 rounded-full">
                    <CalendarClock className="w-3 h-3" />
                    {language === 'fr'
                      ? `Dans ${daysUntil} j${daysUntil > 1 ? 's' : ''}`
                      : `In ${daysUntil} day${daysUntil > 1 ? 's' : ''}`}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    snooze();
                    onQuickRelance(client);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white text-xs font-semibold py-1.5 px-3 rounded-lg cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.reminderRelanceBtn}</span>
                </button>
                <button
                  onClick={() => onMarkDone(client)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 hover:dark:bg-stone-900 text-stone-700 dark:text-stone-200 text-xs font-semibold py-1.5 px-3 rounded-lg cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.reminderMarkDoneBtn}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-3 bg-stone-50 dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3">
        <p className="text-[11px] text-stone-400 dark:text-stone-500">{t.reminderSnoozeHint}</p>
        <button
          onClick={snooze}
          className="shrink-0 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-800 hover:dark:text-stone-100 px-3 py-1.5 cursor-pointer"
        >
          {t.reminderSnoozeBtn}
        </button>
      </div>
    </Modal>
  );
};
