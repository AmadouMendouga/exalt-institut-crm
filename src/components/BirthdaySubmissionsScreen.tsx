import React, { useState } from 'react';
import { Cake, Check, X, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { BirthdaySubmission, BirthdaySubmissionStatus } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface BirthdaySubmissionsScreenProps {
  submissions: BirthdaySubmission[];
  onUpdateStatus: (submission: BirthdaySubmission, status: BirthdaySubmissionStatus) => void;
  onDelete: (submission: BirthdaySubmission) => void;
}

const STATUS_STYLES: Record<BirthdaySubmissionStatus, string> = {
  Pending: 'bg-amber-50 dark:bg-amber-900 text-amber-800 dark:text-amber-100',
  Approved: 'bg-emerald-50 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100',
  Rejected: 'bg-rose-50 dark:bg-rose-900 text-rose-800 dark:text-rose-100',
};

function formatBirthDate(value: string, language: string): string {
  const [month, day] = value.split('-').map(Number);
  if (!month || !day) return value;
  return new Date(2000, month - 1, day).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'long',
  });
}

export const BirthdaySubmissionsScreen: React.FC<BirthdaySubmissionsScreenProps> = ({
  submissions,
  onUpdateStatus,
  onDelete,
}) => {
  const { language, t } = useLanguage();
  const [filter, setFilter] = useState<'Pending' | 'Approved' | 'All'>('Pending');

  const filtered = submissions.filter((s) => filter === 'All' || s.status === filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
          {t.birthdaySubmissionsTitle}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
          {t.birthdaySubmissionsSubtitle}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {(['Pending', 'Approved', 'All'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === f
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface)] border border-[var(--border-color)]/60 text-stone-600 dark:text-stone-300 hover:bg-[var(--surface-alt)]'
            }`}
          >
            {f === 'Pending' ? t.birthdaySubmissionsFilterPending : f === 'Approved' ? t.birthdaySubmissionsFilterApproved : t.appointmentsFilterAll}
          </button>
        ))}
      </div>

      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-stone-400 dark:text-stone-500">
            <Cake className="w-8 h-8 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
            <p className="font-medium text-stone-600 dark:text-stone-300">{t.birthdaySubmissionsEmpty}</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]/30">
            {filtered.map((sub) => (
              <div key={sub.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-[var(--text-primary)]">{sub.name}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_STYLES[sub.status]}`}>
                      {sub.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{sub.phone}</p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-1">
                    <Cake className="w-3 h-3" />
                    {formatBirthDate(sub.birthDate, language)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {sub.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => onUpdateStatus(sub, 'Approved')}
                        className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 text-xs font-semibold py-1.5 px-2.5 rounded-lg hover:bg-emerald-100 hover:dark:bg-emerald-800 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> {t.birthdaySubmissionsApproveBtn}
                      </button>
                      <button
                        onClick={() => onUpdateStatus(sub, 'Rejected')}
                        className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-900 text-rose-700 dark:text-rose-200 text-xs font-semibold py-1.5 px-2.5 rounded-lg hover:bg-rose-100 hover:dark:bg-rose-800 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> {t.birthdaySubmissionsRejectBtn}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onDelete(sub)}
                    aria-label={t.birthdaySubmissionsDeleteBtn}
                    className="w-8 h-8 rounded-lg text-stone-500 dark:text-stone-400 hover:text-rose-600 hover:dark:text-rose-300 hover:bg-rose-50 hover:dark:bg-rose-900 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
