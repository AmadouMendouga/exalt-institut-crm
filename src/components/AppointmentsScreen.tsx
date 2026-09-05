import React, { useState } from 'react';
import { CalendarClock, Check, X, CheckCircle2, Trash2, Clock, Settings2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Appointment, AppointmentStatus, AvailabilityRule } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AppointmentsScreenProps {
  appointments: Appointment[];
  availability: AvailabilityRule[];
  onUpdateStatus: (appointment: Appointment, status: AppointmentStatus) => void;
  onDelete: (appointment: Appointment) => void;
  onSaveAvailability: (rules: AvailabilityRule[]) => void;
}

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  Pending: 'bg-amber-50 dark:bg-amber-900 text-amber-800 dark:text-amber-100',
  Confirmed: 'bg-emerald-50 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100',
  Declined: 'bg-rose-50 dark:bg-rose-900 text-rose-800 dark:text-rose-100',
  Completed: 'bg-sky-50 dark:bg-sky-900 text-sky-800 dark:text-sky-100',
  Cancelled: 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300',
};

const DAY_NAMES_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const DAY_NAMES_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function minutesToTimeStr(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function timeStrToMinutes(value: string): number {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
}

export const AppointmentsScreen: React.FC<AppointmentsScreenProps> = ({
  appointments,
  availability,
  onUpdateStatus,
  onDelete,
  onSaveAvailability,
}) => {
  const { language, t } = useLanguage();
  const [filter, setFilter] = useState<'Pending' | 'Confirmed' | 'All'>('Pending');
  const [hoursOpen, setHoursOpen] = useState(false);
  const [draftRules, setDraftRules] = useState<AvailabilityRule[]>(availability);

  React.useEffect(() => {
    setDraftRules(availability);
  }, [availability]);

  const filtered = appointments.filter((a) => filter === 'All' || a.status === filter);
  const dayNames = language === 'fr' ? DAY_NAMES_FR : DAY_NAMES_EN;
  const sortedRules = [...draftRules].sort((a, b) => a.weekday - b.weekday);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            {t.appointmentsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            {t.appointmentsSubtitle}
          </p>
        </div>
        <button
          onClick={() => setHoursOpen((v) => !v)}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--border-color)]/60 hover:bg-[var(--surface-alt)] text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-200 py-2 px-3.5 rounded-lg shadow-xs transition-all cursor-pointer"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>{t.appointmentsHoursBtn}</span>
        </button>
      </div>

      {hoursOpen && (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 p-4 sm:p-5 space-y-3 shadow-xs">
          <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            {t.appointmentsHoursTitle}
          </p>
          {sortedRules.map((rule) => (
            <div key={rule.weekday} className="flex flex-wrap items-center gap-3">
              <span className="w-24 text-sm font-medium text-[var(--text-primary)]">{dayNames[rule.weekday]}</span>
              <label className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!rule.isClosed}
                  onChange={(e) => {
                    const isClosed = !e.target.checked;
                    setDraftRules((prev) => prev.map((r) => (r.weekday === rule.weekday ? { ...r, isClosed } : r)));
                  }}
                />
                {t.appointmentsOpenLabel}
              </label>
              {!rule.isClosed && (
                <>
                  <input
                    type="time"
                    value={minutesToTimeStr(rule.openMinutes)}
                    onChange={(e) => {
                      const openMinutes = timeStrToMinutes(e.target.value);
                      setDraftRules((prev) => prev.map((r) => (r.weekday === rule.weekday ? { ...r, openMinutes } : r)));
                    }}
                    className="bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-2 py-1 text-xs text-stone-800 dark:text-stone-100 focus:outline-none"
                  />
                  <span className="text-xs text-stone-400">–</span>
                  <input
                    type="time"
                    value={minutesToTimeStr(rule.closeMinutes)}
                    onChange={(e) => {
                      const closeMinutes = timeStrToMinutes(e.target.value);
                      setDraftRules((prev) => prev.map((r) => (r.weekday === rule.weekday ? { ...r, closeMinutes } : r)));
                    }}
                    className="bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-2 py-1 text-xs text-stone-800 dark:text-stone-100 focus:outline-none"
                  />
                </>
              )}
            </div>
          ))}
          <button
            onClick={() => onSaveAvailability(draftRules)}
            className="mt-2 bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white text-xs font-semibold py-2 px-3.5 rounded-lg transition-all cursor-pointer"
          >
            {t.appointmentsSaveHoursBtn}
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        {(['Pending', 'Confirmed', 'All'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === f
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface)] border border-[var(--border-color)]/60 text-stone-600 dark:text-stone-300 hover:bg-[var(--surface-alt)]'
            }`}
          >
            {f === 'Pending' ? t.appointmentsFilterPending : f === 'Confirmed' ? t.appointmentsFilterConfirmed : t.appointmentsFilterAll}
          </button>
        ))}
      </div>

      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-stone-400 dark:text-stone-500">
            <CalendarClock className="w-8 h-8 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
            <p className="font-medium text-stone-600 dark:text-stone-300">{t.appointmentsEmpty}</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]/30">
            {filtered.map((appt) => {
              const dt = new Date(appt.startsAt);
              return (
                <div key={appt.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-[var(--text-primary)]">{appt.clientName}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_STYLES[appt.status]}`}>
                        {appt.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{appt.services.map((s) => s.name).join(', ')} · {appt.clientPhone}</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {dt.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'medium' })} · {dt.toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {appt.note && <p className="text-xs text-stone-500 dark:text-stone-400 italic">{appt.note}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {appt.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => onUpdateStatus(appt, 'Confirmed')}
                          className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 text-xs font-semibold py-1.5 px-2.5 rounded-lg hover:bg-emerald-100 hover:dark:bg-emerald-800 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> {t.appointmentsConfirmBtn}
                        </button>
                        <button
                          onClick={() => onUpdateStatus(appt, 'Declined')}
                          className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-900 text-rose-700 dark:text-rose-200 text-xs font-semibold py-1.5 px-2.5 rounded-lg hover:bg-rose-100 hover:dark:bg-rose-800 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> {t.appointmentsDeclineBtn}
                        </button>
                      </>
                    )}
                    {appt.status === 'Confirmed' && (
                      <button
                        onClick={() => onUpdateStatus(appt, 'Completed')}
                        className="inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-900 text-sky-700 dark:text-sky-200 text-xs font-semibold py-1.5 px-2.5 rounded-lg hover:bg-sky-100 hover:dark:bg-sky-800 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t.appointmentsCompleteBtn}
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(appt)}
                      aria-label={t.appointmentsDeleteBtn}
                      className="w-8 h-8 rounded-lg text-stone-500 dark:text-stone-400 hover:text-rose-600 hover:dark:text-rose-300 hover:bg-rose-50 hover:dark:bg-rose-900 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};
