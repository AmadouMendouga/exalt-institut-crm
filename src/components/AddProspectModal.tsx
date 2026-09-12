import React, { useEffect, useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { Prospect, ProspectCivility } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Modal } from './ui/Modal';
import { StatefulButton } from './ui/StatefulButton';

interface AddProspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; phone: string; prospectedDate: string; source: string | null; wave: string | null; civility: ProspectCivility | null; notes: string | null }) => Promise<void>;
  /** Dernière vague utilisée, proposée par défaut pour un ajout ponctuel. */
  defaultWave?: string;
}

function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

export const AddProspectModal: React.FC<AddProspectModalProps> = ({ isOpen, onClose, onSave, defaultWave }) => {
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+237 6 ');
  const [prospectedDate, setProspectedDate] = useState(todayIso());
  const [source, setSource] = useState('');
  const [wave, setWave] = useState('');
  const [civility, setCivility] = useState<ProspectCivility | null>(null);
  const [notes, setNotes] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    if (!isOpen) return;
    setSubmitStatus('idle');
    setName('');
    setPhone('+237 6 ');
    setProspectedDate(todayIso());
    setSource('');
    setWave(defaultWave || '');
    setCivility(null);
    setNotes('');
  }, [isOpen, defaultWave]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || submitStatus !== 'idle') return;

    setSubmitStatus('loading');
    try {
      await onSave({
        name: name.trim(),
        phone: phone.trim(),
        prospectedDate,
        source: source.trim() || null,
        wave: wave.trim() || null,
        civility,
        notes: notes.trim() || null
      });
      setSubmitStatus('success');
      setTimeout(() => {
        setSubmitStatus('idle');
        onClose();
      }, 500);
    } catch {
      setSubmitStatus('idle');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidthClassName="max-w-md">
      <div className="px-6 py-4 bg-[var(--surface-alt)] border-b border-[var(--border-color)]/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center font-bold">
            <UserPlus className="w-4 h-4" />
          </div>
          <h3 className="font-headline font-bold text-base text-[var(--text-primary)]">{t.addProspectModalTitle}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.closeBtn}
          className="w-8 h-8 rounded-lg text-stone-400 dark:text-stone-500 hover:text-stone-600 hover:dark:text-stone-300 flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-3.5 overflow-y-auto">
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <div>
            <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
              {t.prospectNameLabel} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-[var(--surface-highlight)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
              {t.prospectCivilityLabel}
            </label>
            <div className="flex items-center bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg p-0.5 h-[34px]">
              {([null, 'Mme', 'M.'] as const).map((option) => (
                <button
                  key={option ?? 'none'}
                  type="button"
                  onClick={() => setCivility(option)}
                  title={option === null ? t.prospectCivilityUnknown : option}
                  className={`px-2 h-full rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    civility === option
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 hover:dark:text-stone-100'
                  }`}
                >
                  {option === null ? '—' : option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
              {t.prospectPhoneLabel} *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-xs text-stone-800 dark:text-stone-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
              {t.prospectDateLabel}
            </label>
            <input
              type="date"
              value={prospectedDate}
              onChange={(e) => setProspectedDate(e.target.value)}
              className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-xs text-stone-800 dark:text-stone-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
              {t.prospectWaveLabel}
            </label>
            <input
              type="text"
              placeholder={t.prospectWavePlaceholder}
              value={wave}
              onChange={(e) => setWave(e.target.value)}
              className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-xs text-stone-800 dark:text-stone-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
              {t.prospectSourceLabel}
            </label>
            <input
              type="text"
              placeholder={t.prospectSourcePlaceholder}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-xs text-stone-800 dark:text-stone-100 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
            {t.prospectNotesLabel}
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-xs text-stone-800 dark:text-stone-100 focus:outline-none"
          />
        </div>

        <div className="pt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-800 hover:dark:text-stone-100 cursor-pointer"
          >
            {t.cancel}
          </button>
          <StatefulButton
            type="submit"
            status={submitStatus}
            className="bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t.saveServiceSubmit}</span>
          </StatefulButton>
        </div>
      </form>
    </Modal>
  );
};
