import React from 'react';
import {
  X,
  Send,
  Phone,
  Mail,
  Calendar,
  Clock,
  Tag,
  CheckCircle2,
  AlertCircle,
  Wallet,
  RotateCw,
  Sparkles,
  MessageSquare,
  Cake,
  ShieldCheck,
  ShieldOff,
  Pencil,
  Bell
} from 'lucide-react';
import { Client } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Modal } from './ui/Modal';

// Affiche jour + mois uniquement (aucune année n'est demandée ni stockée pour
// la date de naissance) ; reste compatible avec d'anciennes valeurs "YYYY-MM-DD".
function formatBirthDate(value: string, language: string): string {
  const parts = value.split('-');
  const [month, day] = parts.length === 3 ? [parts[1], parts[2]] : parts;
  const monthIndex = Number(month) - 1;
  if (Number.isNaN(monthIndex) || !day) return value;
  const monthName = new Date(2000, monthIndex, 1).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
    month: 'long'
  });
  return `${Number(day)} ${monthName}`;
}

interface ClientDetailDrawerProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onQuickRelance: (client: Client) => void;
  onToggleStatus: (client: Client) => void;
  onToggleOptIn: (client: Client) => void;
  onEdit: (client: Client) => void;
}

export const ClientDetailDrawer: React.FC<ClientDetailDrawerProps> = ({
  client,
  isOpen,
  onClose,
  onQuickRelance,
  onToggleStatus,
  onToggleOptIn,
  onEdit
}) => {
  const { language, t } = useLanguage();

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="drawer">
      {client && (
        <>
        {/* Drawer Header */}
        <div className="p-6 bg-[var(--surface-alt)] border-b border-[var(--border-color)]/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono-code font-bold text-base shadow-sm ${client.avatarBg || 'bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-100'}`}>
              {client.initials}
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-[var(--text-primary)]">
                {client.prefix} {client.name}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-mono-code">
                ID: {client.id} • {client.gender === 'F' ? t.genderFemale : t.genderMale}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeBtn}
            className="w-8 h-8 rounded-lg text-stone-400 dark:text-stone-500 hover:text-stone-600 hover:dark:text-stone-300 hover:bg-[var(--surface)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm">
          {/* Quick Actions Bar */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                onClose();
                onQuickRelance(client);
              }}
              className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.sendRelanceBtn}</span>
            </button>

            <button
              onClick={() => onToggleStatus(client)}
              className="px-3 py-2 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 hover:dark:bg-stone-900 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
              <span>{t.toggleStatusBtn}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(client);
              }}
              className="px-3 py-2 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 hover:dark:bg-stone-900 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
              <span>{t.editClientBtn}</span>
            </button>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 bg-stone-50 dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-700">
            <h4 className="font-mono-code text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              {t.contactDetails}
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-stone-700 dark:text-stone-200">
                <Mail className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                <span className="font-medium">{client.email}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700 dark:text-stone-200">
                <Phone className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                <span className="font-medium">{client.phone}</span>
              </div>
              {client.birthDate && (
                <div className="flex items-center gap-2 text-stone-700 dark:text-stone-200">
                  <Cake className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                  <span className="font-medium">
                    {t.birthDateDisplayLabel} : {formatBirthDate(client.birthDate, language)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Consentement marketing : conditionne l'éligibilité aux automatisations */}
          <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-[var(--surface)] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300">
              {client.marketingOptIn ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
              ) : (
                <ShieldOff className="w-4 h-4 text-stone-400 dark:text-stone-500" />
              )}
              <span>{t.marketingOptInStatusLabel}</span>
              <span className={`font-semibold ${client.marketingOptIn ? 'text-emerald-700 dark:text-emerald-200' : 'text-stone-500 dark:text-stone-400'}`}>
                {client.marketingOptIn ? t.marketingOptInOn : t.marketingOptInOff}
              </span>
            </div>
            <button
              onClick={() => onToggleOptIn(client)}
              className="text-[11px] font-semibold text-[var(--accent)] hover:underline cursor-pointer"
            >
              {t.toggleOptInBtn}
            </button>
          </div>

          {/* Rappel de relance obligatoire en cours, s'il y en a un */}
          {client.nextReminderDate && (
            <div className="p-3 rounded-xl border border-[var(--surface-highlight)] bg-[var(--bg-page)] flex items-center gap-2 text-xs">
              <Bell className="w-4 h-4 text-[var(--accent)] shrink-0" />
              <div>
                <span className="font-semibold text-[var(--accent-dark)]">
                  {t.reminderDateLabel} : {client.nextReminderDate}
                </span>
                {client.nextReminderNote && (
                  <p className="text-stone-500 dark:text-stone-400 text-[11px] mt-0.5">{client.nextReminderNote}</p>
                )}
              </div>
            </div>
          )}

          {/* Current Status & Suggested Upsell */}
          <div className="space-y-3">
            <h4 className="font-mono-code text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              {t.marketingStatusUpsell}
            </h4>
            
            <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-700 space-y-2 bg-[var(--surface)]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500 dark:text-stone-400">{t.currentStatusLabel}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono-code font-semibold ${
                  client.status === 'Follow-up Needed'
                    ? 'bg-[#ffdad6] text-[#93000a]'
                    : 'bg-[#dce9ff] text-[var(--text-primary)]'
                }`}>
                  {client.status === 'Follow-up Needed' ? t.statusFollowUpNeeded : t.statusUpToDate}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
                <span className="text-xs text-stone-500 dark:text-stone-400">{t.recommendedUpsellLabel}</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-dark)] bg-[var(--surface-highlight)]/30 px-2 py-0.5 rounded">
                  <Tag className="w-3 h-3 text-[var(--accent)]" />
                  {client.suggestedUpsell}
                </span>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="space-y-3">
            <h4 className="font-mono-code text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              {t.serviceHistory}
            </h4>
            <div className="space-y-2">
              <div className="p-3 bg-[var(--surface)] border border-stone-200 dark:border-stone-700 rounded-xl space-y-1">
                <div className="flex items-center justify-between font-semibold text-xs text-stone-800 dark:text-stone-100">
                  <span>{client.lastService}</span>
                  <span className="text-stone-400 dark:text-stone-500 font-mono-code">{client.lastServiceDate}</span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {language === 'fr' 
                    ? "Prestation enregistrée par l'institut. Contrôle qualité validé."
                    : "Service logged by the institute. Quality assurance validated."}
                </p>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl space-y-1">
                <div className="flex items-center justify-between font-semibold text-xs text-stone-600 dark:text-stone-300">
                  <span>{language === 'fr' ? 'Diagnostic Initial & Contrôle' : 'Initial Inspection & Diagnostic'}</span>
                  <span className="text-stone-400 dark:text-stone-500 font-mono-code">{language === 'fr' ? '15 Août 2023' : 'Aug 15, 2023'}</span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {language === 'fr' 
                    ? "Premier contact client. Satisfaction notée 5/5."
                    : "First client visit. Rated satisfaction 5/5."}
                </p>
              </div>
            </div>
          </div>

          {/* Financial summary */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-center">
              <span className="block text-[10px] font-mono-code text-stone-400 dark:text-stone-500 uppercase">{t.visitsCount}</span>
              <span className="font-headline font-bold text-lg text-stone-800 dark:text-stone-100">{client.totalVisits}</span>
            </div>
            <div className="p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-center">
              <span className="block text-[10px] font-mono-code text-stone-400 dark:text-stone-500 uppercase">{t.totalSpent}</span>
              <span className="font-headline font-bold text-base text-emerald-700 dark:text-emerald-200">{client.totalSpent.toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>
        </>
      )}
    </Modal>
  );
};
