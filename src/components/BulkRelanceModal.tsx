import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  MessageCircle,
  Star,
  Sparkles,
  Gift,
  Bell,
  Heart,
  Cake,
  Sun,
  Check,
  SkipForward,
  Users
} from 'lucide-react';
import { Client, RelanceType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { INITIAL_MESSAGE_TEMPLATES, pickVariant } from '../data/messageTemplates';
import { buildWaMeLink } from '../lib/whatsapp';
import { getTimeBasedGreeting } from '../lib/greeting';
import { Modal } from './ui/Modal';
import { StatefulButton } from './ui/StatefulButton';

interface BulkRelanceModalProps {
  clients: Client[];
  isOpen: boolean;
  onClose: () => void;
  /** Même signature que l'envoi individuel : réutilisée pour chaque client de la file. */
  onSend: (client: Client, channel: 'WhatsApp', message: string) => Promise<void>;
}

// WhatsApp ne propose pas d'envoi groupé natif depuis un compte personnel : chaque
// message reste envoyé un par un (fenêtre WhatsApp pré-remplie par client), mais le
// modèle et la personnalisation sont préparés à l'avance pour enchaîner rapidement.
export const BulkRelanceModal: React.FC<BulkRelanceModalProps> = ({ clients, isOpen, onClose, onSend }) => {
  const { language, t } = useLanguage();

  const [selectedRelanceType, setSelectedRelanceType] = useState<RelanceType>('checkin');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [sentCount, setSentCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [sendStatus, setSendStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const relanceCategories: { id: RelanceType; label: string; icon: React.ElementType }[] = [
    { id: 'checkin', label: t.tplCheckin, icon: Sun },
    { id: 'post_service', label: t.tplQualityFollowUp, icon: Star },
    { id: 'upsell', label: t.tplUpsell, icon: Sparkles },
    { id: 'discount', label: t.tplDiscount, icon: Gift },
    { id: 'periodic_reminder', label: t.tplPeriodicReminder, icon: Bell },
    { id: 'reengagement', label: t.tplReengagement, icon: Heart },
    { id: 'birthday', label: t.tplBirthday, icon: Cake }
  ];

  const currentClient: Client | undefined = clients[currentIndex];
  const isFinished = currentIndex >= clients.length;

  const currentTemplate = useMemo(
    () => INITIAL_MESSAGE_TEMPLATES.find((tpl) => tpl.relanceType === selectedRelanceType && tpl.channel === 'WhatsApp'),
    [selectedRelanceType]
  );

  const formatTemplateForClient = (rawText: string, client: Client) => {
    const nameVal = client.name || 'Dupont';
    const lastServiceVal = client.lastService || (language === 'fr' ? 'Soin Signature' : 'Signature Treatment');
    const nextServiceVal = client.suggestedUpsell || (language === 'fr' ? 'Soin Protecteur' : 'Protective Treatment');
    const dateVal = client.lastServiceDate || (language === 'fr' ? '12 Octobre' : 'October 12th');

    return rawText
      .replace(/Mme\/M\./g, client.prefix)
      .replace(/\bBonjour\b/g, getTimeBasedGreeting('fr'))
      .replace(/\bHello\b/g, getTimeBasedGreeting('en'))
      .replace(/\[Nom\]/gi, nameVal)
      .replace(/\[Prestation\]/gi, lastServiceVal)
      .replace(/\[Nouvelle Prestation\]/gi, nextServiceVal)
      .replace(/\[Date\]/gi, dateVal)
      .replace(/https:\/\/exalt-beauty\.up\.railway\.app\/avis/g, `https://exalt-beauty.up.railway.app/avis?client=${client.id}`);
  };

  // Reset complet à chaque ouverture, ou dès que la liste de clients change
  // (nouvelle sélection depuis l'écran Clients).
  useEffect(() => {
    if (!isOpen) return;
    setCurrentIndex(0);
    setSentCount(0);
    setSkippedCount(0);
    setSendStatus('idle');
  }, [isOpen, clients]);

  // Repopule le message quand on change de client ou de catégorie de modèle.
  useEffect(() => {
    if (!currentClient || !currentTemplate) return;
    const raw = pickVariant(currentTemplate.content[language] || currentTemplate.content.fr);
    setCurrentMessage(formatTemplateForClient(raw, currentClient));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, selectedRelanceType, currentClient?.id, currentTemplate, language]);

  const advance = () => setCurrentIndex((i) => i + 1);

  const handleSendToCurrent = () => {
    if (!currentClient || sendStatus !== 'idle') return;
    // Contrairement à l'envoi individuel (location.href, pour éviter la corruption
    // d'emoji sur Android/Samsung Internet), l'envoi groupé doit préserver la file
    // d'attente entre deux clients : chaque message s'ouvre donc dans un nouvel
    // onglet plutôt que de remplacer la page du CRM. Ce flux est un usage desktop
    // (admin qui enchaîne plusieurs clients), pas mobile, donc ce bug n'applique pas.
    window.open(buildWaMeLink(currentClient.phone, currentMessage), '_blank', 'noopener');
    setSendStatus('loading');
    onSend(currentClient, 'WhatsApp', currentMessage)
      .then(() => {
        setSentCount((n) => n + 1);
        setSendStatus('idle');
        advance();
      })
      .catch(() => setSendStatus('idle'));
  };

  const handleSkip = () => {
    setSkippedCount((n) => n + 1);
    advance();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidthClassName="max-w-xl">
      <div className="px-6 py-4 bg-[var(--surface-alt)] border-b border-[var(--border-color)]/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--surface-highlight)]/50 flex items-center justify-center text-[var(--accent)]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-base text-[var(--text-primary)]">
              {t.bulkModalTitle}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {t.bulkModalSubtitle}
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

      <div className="p-6 space-y-4 overflow-y-auto flex-1">
        {!isFinished ? (
          <>
            {/* Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono-code uppercase tracking-wider text-stone-500 dark:text-stone-400">
                <span>{t.bulkProgressLabel}</span>
                <span>{currentIndex + 1} / {clients.length}</span>
              </div>
              <div className="h-1.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <div
                  className="h-full bg-[var(--accent)] transition-all"
                  style={{ width: `${((currentIndex) / clients.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Current client */}
            {currentClient && (
              <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-3.5 rounded-xl flex items-center justify-between text-xs">
                <div className="font-semibold text-stone-800 dark:text-stone-100">
                  {t.bulkClientLabel} {currentIndex + 1}: {currentClient.prefix} {currentClient.name}
                </div>
                <span className="text-stone-500 dark:text-stone-400">{currentClient.phone}</span>
              </div>
            )}

            {/* Template category */}
            <div className="space-y-1.5">
              <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                {t.messageTemplate} ({t.relanceTypeLabel}):
              </label>
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

            {/* Message preview/edit */}
            <div className="space-y-1.5">
              <label className="font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                {t.previewCustomize}
              </label>
              <textarea
                rows={6}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                className="w-full rounded-xl p-3.5 text-xs sm:text-sm font-sans focus:ring-2 focus:outline-none leading-relaxed resize-y bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-600 text-stone-800 dark:text-stone-100 focus:ring-emerald-400 focus:dark:ring-emerald-500"
              />
            </div>
          </>
        ) : (
          <div className="text-center py-8 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
              <Check className="w-7 h-7 text-emerald-600 dark:text-emerald-300" />
            </div>
            <h4 className="font-headline font-bold text-base text-[var(--text-primary)]">{t.bulkDoneTitle}</h4>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {sentCount} {t.bulkDoneSent}{skippedCount > 0 ? ` · ${skippedCount} ${t.bulkDoneSkipped}` : ''}
            </p>
          </div>
        )}
      </div>

      <div className="px-6 py-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between">
        {!isFinished ? (
          <>
            <button
              type="button"
              onClick={handleSkip}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-800 hover:dark:text-stone-100 px-3 py-2 cursor-pointer"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>{t.bulkSkipClient}</span>
            </button>
            <StatefulButton
              status={sendStatus}
              onClick={handleSendToCurrent}
              className="text-white text-xs sm:text-sm font-semibold py-2 px-5 rounded-xl shadow-xs cursor-pointer bg-emerald-600 dark:bg-emerald-300 hover:bg-emerald-700 hover:dark:bg-emerald-200 ring-2 ring-emerald-300 dark:ring-emerald-600/60"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t.bulkSendToClient}</span>
            </StatefulButton>
          </>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white text-xs sm:text-sm font-semibold py-2 px-5 rounded-xl shadow-xs cursor-pointer"
          >
            {t.bulkFinishBtn}
          </button>
        )}
      </div>
    </Modal>
  );
};
