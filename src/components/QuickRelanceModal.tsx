import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Send,
  Mail,
  MessageSquare,
  MessageCircle,
  User,
  Tag,
  Copy,
  Check,
  RotateCcw,
  Star,
  Sparkles,
  Gift,
  Bell,
  Heart,
  Cake,
  Sun
} from 'lucide-react';
import { Client, ChannelType, RelanceType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { INITIAL_MESSAGE_TEMPLATES, pickVariant } from '../data/messageTemplates';
import { buildWaMeLink } from '../lib/whatsapp';
import { getTimeBasedGreeting } from '../lib/greeting';
import { Modal } from './ui/Modal';
import { StatefulButton } from './ui/StatefulButton';

interface QuickRelanceModalProps {
  client: Client | null;
  initialChannel?: ChannelType;
  /** Modèle brut (avec placeholders [Nom], [Prestation]…) à préremplir, ex. quand on
   * finalise un brouillon généré par une automatisation. */
  initialMessage?: string;
  /** Présent quand on finalise un brouillon existant plutôt que d'envoyer une nouvelle relance. */
  draftItemId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSend: (client: Client, channel: ChannelType, message: string, draftItemId?: string) => Promise<void>;
}

export const QuickRelanceModal: React.FC<QuickRelanceModalProps> = ({
  client,
  initialChannel = 'WhatsApp',
  initialMessage,
  draftItemId,
  isOpen,
  onClose,
  onSend
}) => {
  const { language, t } = useLanguage();

  const [channel, setChannel] = useState<ChannelType>(initialChannel || client?.preferredChannel || 'WhatsApp');
  const [selectedRelanceType, setSelectedRelanceType] = useState<RelanceType>('post_service');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [sendStatus, setSendStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [copied, setCopied] = useState(false);

  // Available relance categories for the selector
  const relanceCategories: { id: RelanceType; label: string; icon: React.ElementType }[] = [
    { id: 'post_service', label: t.tplQualityFollowUp, icon: Star },
    { id: 'upsell', label: t.tplUpsell, icon: Sparkles },
    { id: 'discount', label: t.tplDiscount, icon: Gift },
    { id: 'periodic_reminder', label: t.tplPeriodicReminder, icon: Bell },
    { id: 'reengagement', label: t.tplReengagement, icon: Heart },
    { id: 'birthday', label: t.tplBirthday, icon: Cake },
    { id: 'checkin', label: t.tplCheckin, icon: Sun }
  ];

  // Find matching template based on selected relance type and channel
  const currentTemplate = useMemo(() => {
    const found = INITIAL_MESSAGE_TEMPLATES.find(
      (tpl) => tpl.relanceType === selectedRelanceType && tpl.channel === channel
    );
    if (found) return found;
    // Fallback matching relance type
    return INITIAL_MESSAGE_TEMPLATES.find((tpl) => tpl.relanceType === selectedRelanceType) || INITIAL_MESSAGE_TEMPLATES[0];
  }, [selectedRelanceType, channel]);

  // Generate personalized text by interpolating client variables
  const formatTemplateForClient = (rawText: string) => {
    if (!client) return rawText;
    const nameVal = client.name || 'Dupont';
    const lastServiceVal = client.lastService || (language === 'fr' ? 'Soin Signature' : 'Signature Treatment');
    const nextServiceVal = client.suggestedUpsell || (language === 'fr' ? 'Soin Protecteur' : 'Protective Treatment');
    const dateVal = client.lastServiceDate || (language === 'fr' ? '12 Octobre' : 'October 12th');

    return rawText
      .replace(/Mme\/M\./g, client.prefix)
      .replace(/\bBonjour\b/g, getTimeBasedGreeting('fr'))
      .replace(/\bHello\b/g, getTimeBasedGreeting('en'))
      .replace(/\[Nom\]/gi, nameVal)
      .replace(/\[Name\]/gi, nameVal)
      .replace(/\[Prestation\]/gi, lastServiceVal)
      .replace(/\[Service\]/gi, lastServiceVal)
      .replace(/\[Prestation Précédente\]/gi, lastServiceVal)
      .replace(/\[Nouvelle Prestation\]/gi, nextServiceVal)
      .replace(/\[Suggested Service\]/gi, nextServiceVal)
      .replace(/\[Date\]/gi, dateVal)
      .replace(/https:\/\/exalt-beauty\.up\.railway\.app\/avis/g, `https://exalt-beauty.up.railway.app/avis?client=${client.id}`);
  };

  // Un brouillon fournit déjà son propre modèle (celui de sa campagne) : on ne
  // l'applique qu'une fois à l'ouverture, pour ne pas écraser les modifications
  // de l'utilisateur si celui-ci change ensuite de type/canal.
  const appliedInitialMessageRef = useRef(false);

  // Reset/populate message when client, template type, channel or language changes
  useEffect(() => {
    if (initialMessage && !appliedInitialMessageRef.current) {
      appliedInitialMessageRef.current = true;
      setCustomMessage(formatTemplateForClient(initialMessage));
      return;
    }
    if (currentTemplate) {
      const raw = pickVariant(currentTemplate.content[language] || currentTemplate.content.fr);
      setCustomMessage(formatTemplateForClient(raw));
    }
  }, [selectedRelanceType, channel, client, language, currentTemplate, initialMessage]);

  useEffect(() => {
    if (isOpen) {
      setSendStatus('idle');
      appliedInitialMessageRef.current = false;
    }
  }, [isOpen]);

  const handleResetToTemplate = () => {
    if (currentTemplate) {
      const raw = pickVariant(currentTemplate.content[language] || currentTemplate.content.fr);
      setCustomMessage(formatTemplateForClient(raw));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendClick = () => {
    if (!client || sendStatus !== 'idle') return;

    // Navigation directe (pas window.open) : sur certains navigateurs Android
    // (Samsung Internet notamment), le passage par un nouvel onglet avant le
    // transfert vers l'app WhatsApp corrompt les emojis hors plan de base
    // (👋, 💆…) dans le texte prérempli, alors que location.href transfère
    // le lien intact.
    if (channel === 'WhatsApp') {
      window.location.href = buildWaMeLink(client.phone, customMessage);
    }

    setSendStatus('loading');
    onSend(client, channel, customMessage, draftItemId)
      .then(() => {
        setSendStatus('success');
        setTimeout(() => {
          setSendStatus('idle');
          onClose();
        }, 500);
      })
      .catch(() => setSendStatus('idle'));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidthClassName="max-w-xl">
      {client && (
        <>
          {/* Modal Header */}
          <div className="px-6 py-4 bg-[var(--surface-alt)] border-b border-[var(--border-color)]/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface-highlight)]/50 flex items-center justify-center text-[var(--accent)]">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-base text-[var(--text-primary)]">
                  {draftItemId ? t.completeDraftTitle : t.quickRelanceTitle}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  {draftItemId ? t.completeDraftSubtitle : t.directSendTo} {client.prefix} {client.name} • {client.phone}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={t.closeBtn}
              className="w-8 h-8 rounded-lg text-stone-400 dark:text-stone-500 hover:text-stone-600 hover:dark:text-stone-300 hover:bg-[var(--surface)] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Client summary pill */}
            <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-3.5 rounded-xl flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400 shrink-0" />
                  <span>{client.prefix} {client.name}</span>
                </div>
                <div className="text-stone-500 dark:text-stone-400 mt-0.5 text-[11px]">
                  {t.thLastService}: <span className="font-medium text-stone-700 dark:text-stone-200">{client.lastService}</span> ({client.lastServiceDate})
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent-dark)] bg-[var(--surface-highlight)]/30 px-2.5 py-1 rounded-lg border border-[var(--surface-highlight)]">
                  <Tag className="w-3 h-3 text-[var(--accent)]" />
                  {client.suggestedUpsell}
                </span>
              </div>
            </div>

            {/* Channel Selector: WhatsApp, SMS, Email */}
            <div className="space-y-1.5">
              <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                {t.dispatchChannel}:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* WhatsApp */}
                <button
                  type="button"
                  onClick={() => setChannel('WhatsApp')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    channel === 'WhatsApp'
                      ? 'bg-emerald-50 dark:bg-emerald-900 border-emerald-500 dark:border-emerald-400 text-emerald-800 dark:text-emerald-100 shadow-2xs font-bold ring-1 ring-emerald-500 dark:ring-emerald-400'
                      : 'bg-[var(--surface)] border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 hover:dark:bg-stone-900'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
                  <span>WhatsApp</span>
                </button>

                {/* SMS */}
                <button
                  type="button"
                  onClick={() => setChannel('SMS')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    channel === 'SMS'
                      ? 'bg-sky-50 dark:bg-sky-900 border-sky-500 dark:border-sky-400 text-sky-800 dark:text-sky-100 shadow-2xs font-bold ring-1 ring-sky-500 dark:ring-sky-400'
                      : 'bg-[var(--surface)] border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 hover:dark:bg-stone-900'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-sky-600 dark:text-sky-300" />
                  <span>SMS</span>
                </button>

                {/* Email */}
                <button
                  type="button"
                  onClick={() => setChannel('Email')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    channel === 'Email'
                      ? 'bg-teal-50 dark:bg-teal-900 border-teal-500 dark:border-teal-400 text-teal-800 dark:text-teal-100 shadow-2xs font-bold ring-1 ring-teal-500 dark:ring-teal-400'
                      : 'bg-[var(--surface)] border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 hover:dark:bg-stone-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-teal-600 dark:text-teal-300" />
                  <span>Email</span>
                </button>
              </div>
              {channel !== 'WhatsApp' && (
                <p className="text-[11px] text-stone-400 dark:text-stone-500">
                  {language === 'fr'
                    ? 'Ce canal est enregistré dans le CRM mais aucun envoi réel n\'est déclenché (pas de fournisseur email/SMS connecté).'
                    : 'This channel is recorded in the CRM but no real dispatch is triggered (no email/SMS provider connected).'}
                </p>
              )}
            </div>

            {/* Relance Type Selector Grid */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  {t.messageTemplate} ({t.relanceTypeLabel}):
                </label>
                <button
                  type="button"
                  onClick={handleResetToTemplate}
                  className="inline-flex items-center gap-1 text-[11px] text-[var(--accent)] hover:underline font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{language === 'fr' ? 'Réinitialiser modèle' : 'Reset template'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {relanceCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedRelanceType(cat.id)}
                    className={`p-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      selectedRelanceType === cat.id
                        ? 'bg-[var(--surface-alt)] border-[var(--accent)] text-[var(--accent-dark)] font-bold shadow-2xs'
                        : 'bg-[var(--surface)] border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 hover:dark:bg-stone-900'
                    }`}
                  >
                    <cat.icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Content & Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>{t.previewCustomize}</span>
                  {channel === 'WhatsApp' && (
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 px-1.5 py-0.2 rounded font-semibold">
                      WhatsApp Formatted
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400 hover:text-stone-800 hover:dark:text-stone-100 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-300" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? (language === 'fr' ? 'Copié !' : 'Copied!') : (language === 'fr' ? 'Copier' : 'Copy')}</span>
                  </button>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono-code">
                    {customMessage.length} {t.characters}
                  </span>
                </div>
              </div>

              <textarea
                rows={6}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className={`w-full rounded-xl p-3.5 text-xs sm:text-sm font-sans focus:ring-2 focus:outline-none leading-relaxed resize-y ${
                  channel === 'WhatsApp'
                    ? 'bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-600 text-stone-800 dark:text-stone-100 focus:ring-emerald-400 focus:dark:ring-emerald-500'
                    : 'bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 text-stone-800 dark:text-stone-100 focus:ring-[var(--surface-highlight)]'
                }`}
              />
            </div>

            {/* Variable chips for quick insertion */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
              <span className="font-mono-code text-[10px] text-stone-400 dark:text-stone-500 uppercase">
                {t.variablesLabel}:
              </span>
              {['[Nom]', '[Prestation]', '[Nouvelle Prestation]', '[Date]'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setCustomMessage((prev) => `${prev} ${v}`)}
                  className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 hover:bg-[var(--surface-highlight)]/40 border border-stone-200 dark:border-stone-700 rounded font-mono-code text-[10px] text-[var(--accent-dark)] font-medium transition-colors cursor-pointer"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-800 hover:dark:text-stone-100 px-3 py-2 cursor-pointer"
            >
              {t.cancel}
            </button>

            <StatefulButton
              status={sendStatus}
              onClick={handleSendClick}
              loadingText={t.sendingInProgress}
              className={`text-white text-xs sm:text-sm font-semibold py-2 px-5 rounded-xl shadow-xs cursor-pointer ${
                channel === 'WhatsApp'
                  ? 'bg-emerald-600 dark:bg-emerald-300 hover:bg-emerald-700 hover:dark:bg-emerald-200 ring-2 ring-emerald-300 dark:ring-emerald-600/60'
                  : 'bg-[var(--accent)] hover:bg-[var(--accent-dark)]'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {channel === 'WhatsApp' ? (language === 'fr' ? 'Envoyer sur WhatsApp' : 'Send via WhatsApp') : t.sendRelanceSubmit}
              </span>
            </StatefulButton>
          </div>
        </>
      )}
    </Modal>
  );
};
