import React, { useEffect, useState } from 'react';
import { X, UserPlus, Pencil, MessageSquare, MessageCircle, Mail, Bell } from 'lucide-react';
import { Client, Gender, ClientStatus, ChannelType, Service } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Modal } from './ui/Modal';
import { StatefulButton } from './ui/StatefulButton';
import { ServicePicker } from './ui/ServicePicker';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => Promise<void>;
  editingClient?: Client | null;
  services: Service[];
}

// La date de naissance ne sert qu'à déclencher la relance d'anniversaire chaque
// année : on ne stocke donc que "MM-DD", jamais l'année (non demandée, non affichée).
// Les anciennes valeurs "YYYY-MM-DD" restent lisibles pour ne pas perdre les données existantes.
function parseBirthMonthDay(value?: string): { day: string; month: string } {
  if (!value) return { day: '', month: '' };
  const parts = value.split('-');
  // Number(...) puis String(...) élimine les zéros non significatifs ("08" → "8")
  // pour correspondre aux valeurs "1".."12" / "1".."31" des <option>.
  if (parts.length === 3) return { month: String(Number(parts[1])), day: String(Number(parts[2])) };
  if (parts.length === 2) return { month: String(Number(parts[0])), day: String(Number(parts[1])) };
  return { day: '', month: '' };
}

function monthNames(language: string): string[] {
  return Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i, 1).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'long' })
  );
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingClient,
  services
}) => {
  const { language, t } = useLanguage();

  const isEditing = Boolean(editingClient);

  const [name, setName] = useState('');
  const [prefix, setPrefix] = useState<'Mme.' | 'M.'>('Mme.');
  const [gender, setGender] = useState<Gender>('F');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+237 6 ');
  const [preferredChannel, setPreferredChannel] = useState<ChannelType>('WhatsApp');
  const [lastService, setLastService] = useState(language === 'fr' ? 'Soin Signature' : 'Signature Treatment');
  const [suggestedUpsell, setSuggestedUpsell] = useState(language === 'fr' ? 'Soin Protecteur' : 'Protective Treatment');
  const [status, setStatus] = useState<ClientStatus>('Follow-up Needed');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [nextReminderDate, setNextReminderDate] = useState('');
  const [nextReminderNote, setNextReminderNote] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Pré-remplit le formulaire avec le client en cours d'édition, ou repart sur
  // des valeurs par défaut pour une création.
  useEffect(() => {
    if (!isOpen) return;
    setSubmitStatus('idle');
    if (editingClient) {
      setName(editingClient.name);
      setPrefix(editingClient.prefix);
      setGender(editingClient.gender);
      setEmail(editingClient.email);
      setPhone(editingClient.phone);
      setPreferredChannel(editingClient.preferredChannel);
      setLastService(editingClient.lastService);
      setSuggestedUpsell(editingClient.suggestedUpsell);
      setStatus(editingClient.status);
      const { day, month } = parseBirthMonthDay(editingClient.birthDate);
      setBirthDay(day);
      setBirthMonth(month);
      setMarketingOptIn(editingClient.marketingOptIn);
      setNextReminderDate(editingClient.nextReminderDate || '');
      setNextReminderNote(editingClient.nextReminderNote || '');
    } else {
      setName('');
      setPrefix('Mme.');
      setGender('F');
      setEmail('');
      setPhone('+237 6 ');
      setPreferredChannel('WhatsApp');
      setLastService(language === 'fr' ? 'Soin Signature' : 'Signature Treatment');
      setSuggestedUpsell(language === 'fr' ? 'Soin Protecteur' : 'Protective Treatment');
      setStatus('Follow-up Needed');
      setBirthDay('');
      setBirthMonth('');
      setMarketingOptIn(true);
      setNextReminderDate('');
      setNextReminderNote('');
    }
  }, [isOpen, editingClient, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitStatus !== 'idle') return;

    const parts = name.trim().split(' ');
    const initials = parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
    const avatarBg = gender === 'F' ? 'bg-rose-100 dark:bg-rose-800 text-rose-800 dark:text-rose-100' : 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100';
    const birthDate = birthDay && birthMonth
      ? `${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`
      : undefined;

    let client: Client;
    if (editingClient) {
      // Ne touche qu'aux champs exposés dans le formulaire : l'historique
      // (dernière date de prestation, visites, dépenses, notes) reste inchangé.
      client = {
        ...editingClient,
        name: name.trim(),
        prefix,
        gender,
        initials,
        email: email || editingClient.email,
        phone: phone || editingClient.phone,
        preferredChannel,
        lastService,
        suggestedUpsell,
        status,
        avatarBg,
        birthDate,
        marketingOptIn,
        nextReminderDate: nextReminderDate || undefined,
        nextReminderNote: nextReminderNote || undefined
      };
    } else {
      const today = new Date();
      const formattedDate = language === 'fr'
        ? `${today.getDate()} Nov 2023`
        : `Nov ${today.getDate()}, 2023`;

      client = {
        id: `c-${Date.now()}`,
        name: name.trim(),
        prefix,
        gender,
        initials,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: phone || '+237 690 00 00 00',
        lastService,
        lastServiceDate: formattedDate,
        rawDate: today.toISOString().split('T')[0],
        status,
        suggestedUpsell,
        preferredChannel,
        totalVisits: 1,
        totalSpent: 75000,
        avatarBg,
        birthDate,
        marketingOptIn,
        nextReminderDate: nextReminderDate || undefined,
        nextReminderNote: nextReminderNote || undefined
      };
    }

    setSubmitStatus('loading');
    try {
      await onSave(client);
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
            {isEditing ? <Pencil className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          </div>
          <h3 className="font-headline font-bold text-base text-[var(--text-primary)]">
            {isEditing ? t.editClientModalTitle : t.addClientModalTitle}
          </h3>
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
        {/* Civilité / Genre */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
              {t.civility}
            </label>
            <select
              value={prefix}
              onChange={(e) => {
                const val = e.target.value as 'Mme.' | 'M.';
                setPrefix(val);
                setGender(val === 'Mme.' ? 'F' : 'M');
              }}
              className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-xs font-medium text-stone-800 dark:text-stone-100 focus:outline-none cursor-pointer"
            >
              <option value="Mme.">{t.genderFemale}</option>
              <option value="M.">{t.genderMale}</option>
            </select>
          </div>

          <div>
            <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
              {t.initialStatus}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ClientStatus)}
              className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-xs font-medium text-stone-800 dark:text-stone-100 focus:outline-none cursor-pointer"
            >
              <option value="Follow-up Needed">{t.statusFollowUpNeeded}</option>
              <option value="Up to date">{t.statusUpToDate}</option>
            </select>
          </div>
        </div>

        {/* Nom complet */}
        <div>
          <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
            {t.fullNameRequired} *
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Valérie Martin"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-[var(--surface-highlight)] focus:outline-none"
          />
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="client@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-xs text-stone-800 dark:text-stone-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
              {t.phone}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-xs text-stone-800 dark:text-stone-100 focus:outline-none"
            />
          </div>
        </div>

        {/* Preferred Channel */}
        <div>
          <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
            {t.dispatchChannel}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPreferredChannel('WhatsApp')}
              className={`py-1.5 px-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                preferredChannel === 'WhatsApp'
                  ? 'bg-emerald-50 dark:bg-emerald-900 border-emerald-500 dark:border-emerald-400 text-emerald-800 dark:text-emerald-100 font-bold ring-1 ring-emerald-500 dark:ring-emerald-400'
                  : 'bg-[var(--bg-page)] border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
              }`}
            >
              <MessageCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-300" />
              <span>WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={() => setPreferredChannel('SMS')}
              className={`py-1.5 px-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                preferredChannel === 'SMS'
                  ? 'bg-sky-50 dark:bg-sky-900 border-sky-500 dark:border-sky-400 text-sky-800 dark:text-sky-100 font-bold ring-1 ring-sky-500 dark:ring-sky-400'
                  : 'bg-[var(--bg-page)] border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
              }`}
            >
              <MessageSquare className="w-3 h-3 text-sky-600 dark:text-sky-300" />
              <span>SMS</span>
            </button>
            <button
              type="button"
              onClick={() => setPreferredChannel('Email')}
              className={`py-1.5 px-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                preferredChannel === 'Email'
                  ? 'bg-teal-50 dark:bg-teal-900 border-teal-500 dark:border-teal-400 text-teal-800 dark:text-teal-100 font-bold ring-1 ring-teal-500 dark:ring-teal-400'
                  : 'bg-[var(--bg-page)] border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
              }`}
            >
              <Mail className="w-3 h-3 text-teal-600 dark:text-teal-300" />
              <span>Email</span>
            </button>
          </div>
        </div>

        {/* Dernière Prestation & Upsell */}
        <div>
          <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
            {t.thLastService}
          </label>
          <ServicePicker
            services={services}
            value={lastService}
            onChange={setLastService}
            placeholder={t.searchServicePlaceholder}
          />
        </div>

        <div>
          <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
            {t.suggestedUpsellLabel}
          </label>
          <ServicePicker
            services={services}
            value={suggestedUpsell}
            onChange={setSuggestedUpsell}
            placeholder={t.searchServicePlaceholder}
          />
        </div>

        {/* Date de naissance : jour + mois seulement, l'année n'est ni demandée ni utile */}
        <div>
          <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
            {t.birthDateLabel}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={birthDay}
              onChange={(e) => setBirthDay(e.target.value)}
              className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-xs font-medium text-stone-800 dark:text-stone-100 focus:outline-none cursor-pointer"
            >
              <option value="">{t.birthDayPlaceholder}</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={String(d)}>{d}</option>
              ))}
            </select>
            <select
              value={birthMonth}
              onChange={(e) => setBirthMonth(e.target.value)}
              className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-xs font-medium text-stone-800 dark:text-stone-100 focus:outline-none cursor-pointer"
            >
              <option value="">{t.birthMonthPlaceholder}</option>
              {monthNames(language).map((name, i) => (
                <option key={name} value={String(i + 1)}>{name}</option>
              ))}
            </select>
          </div>
          <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">{t.birthDateOptionalHint}</p>
        </div>

        {/* Rappel de relance obligatoire : déclenche un popup persistant à la date choisie */}
        <div className="p-3 rounded-xl border border-[var(--surface-highlight)] bg-[var(--bg-page)] space-y-2">
          <label className="flex items-center gap-1.5 font-mono-code text-[11px] font-semibold text-[var(--accent-dark)] uppercase tracking-wider">
            <Bell className="w-3.5 h-3.5" />
            {t.reminderSectionLabel}
          </label>
          <div>
            <label className="block text-[11px] text-stone-500 dark:text-stone-400 mb-1">{t.reminderDateLabel} *</label>
            <input
              type="date"
              required
              value={nextReminderDate}
              onChange={(e) => setNextReminderDate(e.target.value)}
              className="w-full bg-[var(--surface)] border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-xs text-stone-800 dark:text-stone-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] text-stone-500 dark:text-stone-400 mb-1">{t.reminderNoteLabel}</label>
            <input
              type="text"
              placeholder={t.reminderNotePlaceholder}
              value={nextReminderNote}
              onChange={(e) => setNextReminderNote(e.target.value)}
              className="w-full bg-[var(--surface)] border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-xs text-stone-800 dark:text-stone-100 focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-stone-400 dark:text-stone-500">{t.reminderHint}</p>
        </div>

        {/* Consentement marketing : conditionne l'éligibilité aux automatisations */}
        <label className="flex items-center gap-2 text-xs font-medium text-stone-700 dark:text-stone-200 cursor-pointer">
          <input
            type="checkbox"
            checked={marketingOptIn}
            onChange={(e) => setMarketingOptIn(e.target.checked)}
            className="w-4 h-4 rounded border-stone-300 dark:border-stone-600 text-[var(--accent)] focus:ring-[var(--surface-highlight)] cursor-pointer"
          />
          <span>{t.marketingOptInLabel}</span>
        </label>

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
            {isEditing ? <Pencil className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
            <span>{t.saveClientSubmit}</span>
          </StatefulButton>
        </div>
      </form>
    </Modal>
  );
};
