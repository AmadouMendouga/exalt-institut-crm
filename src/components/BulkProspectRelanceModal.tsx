import React, { useEffect, useState } from 'react';
import { X, MessageCircle, MessageSquare, Check, SkipForward, Users, Handshake, Sparkles, Send } from 'lucide-react';
import { Prospect } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { PROSPECT_MESSAGE_TEMPLATES, ProspectMessageCategory, pickVariant } from '../data/prospectTemplates';
import { buildWaMeLink } from '../lib/whatsapp';
import { getTimeBasedGreeting } from '../lib/greeting';
import { Modal } from './ui/Modal';
import { StatefulButton } from './ui/StatefulButton';
import { CampaignMediaPanel, CampaignMediaItem } from './CampaignMediaPanel';
import { ProspectRelanceChannel } from './ProspectRelanceModal';

interface BulkProspectRelanceModalProps {
  prospects: Prospect[];
  isOpen: boolean;
  onClose: () => void;
  onSend: (prospect: Prospect, message: string, channel: ProspectRelanceChannel) => Promise<void>;
  onBulkSendSms: (items: { id: string; message: string }[]) => Promise<{ sentCount: number; failedCount: number }>;
  campaignMedia: Partial<Record<'photo' | 'video', CampaignMediaItem>>;
  onUploadCampaignMedia: (kind: 'photo' | 'video', file: File) => Promise<void>;
  onDeleteCampaignMedia: (kind: 'photo' | 'video') => Promise<void>;
}

// WhatsApp ne propose pas d'envoi automatique depuis un compte personnel, donc
// chaque message s'ouvre un par un dans un nouvel onglet (file d'attente active).
// Le SMS, lui, part entièrement côté serveur : pas besoin de cliquer prospect par
// prospect, un seul clic déclenche l'envoi groupé en coulisses.
export const BulkProspectRelanceModal: React.FC<BulkProspectRelanceModalProps> = ({
  prospects,
  isOpen,
  onClose,
  onSend,
  onBulkSendSms,
  campaignMedia,
  onUploadCampaignMedia,
  onDeleteCampaignMedia
}) => {
  const { language, t } = useLanguage();

  const [channel, setChannel] = useState<ProspectRelanceChannel>('WhatsApp');
  const [category, setCategory] = useState<ProspectMessageCategory>('first_contact');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [sentCount, setSentCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [sendStatus, setSendStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [smsSending, setSmsSending] = useState(false);
  const [smsResult, setSmsResult] = useState<{ sentCount: number; failedCount: number } | null>(null);

  const currentProspect: Prospect | undefined = prospects[currentIndex];
  const isFinished = channel === 'WhatsApp' ? currentIndex >= prospects.length : smsResult !== null;

  const categories: { id: ProspectMessageCategory; label: string; icon: React.ElementType }[] = [
    { id: 'first_contact', label: t.prospectCatFirstContact, icon: Handshake },
    { id: 'services_follow_up', label: t.prospectCatServicesFollowUp, icon: Sparkles }
  ];

  // "M."/"Mme" quand connu avec certitude ; sinon "M./Mme" générique plutôt que
  // le prénom seul (préférence explicite : toujours une civilité devant le nom).
  const formatForProspect = (raw: string, p: Prospect) =>
    raw
      .replace(/\bBonjour\b/g, getTimeBasedGreeting('fr'))
      .replace(/\bHello\b/g, getTimeBasedGreeting('en'))
      .replace(/\[Nom\]/gi, `${p.civility || (language === 'fr' ? 'M./Mme' : 'Mr/Ms')} ${p.name}`);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentIndex(0);
    setSentCount(0);
    setSkippedCount(0);
    setSendStatus('idle');
    setChannel('WhatsApp');
    setSmsSending(false);
    setSmsResult(null);
    // Si toute la file a déjà été relancée au moins une fois, on propose plutôt
    // le message "découvrir nos soins" par défaut.
    const allAlreadyContacted = prospects.length > 0 && prospects.every((p) => p.lastRelanceAt);
    setCategory(allAlreadyContacted ? 'services_follow_up' : 'first_contact');
  }, [isOpen, prospects]);

  useEffect(() => {
    if (!currentProspect) return;
    const raw = pickVariant(PROSPECT_MESSAGE_TEMPLATES[category][language] || PROSPECT_MESSAGE_TEMPLATES[category].fr);
    setCurrentMessage(formatForProspect(raw, currentProspect));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, currentProspect?.id, language, category]);

  const advance = () => setCurrentIndex((i) => i + 1);

  const handleSendToCurrent = () => {
    if (!currentProspect || sendStatus !== 'idle') return;
    window.open(buildWaMeLink(currentProspect.phone, currentMessage), '_blank', 'noopener');
    setSendStatus('loading');
    onSend(currentProspect, currentMessage, channel)
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

  const handleSendAllSms = () => {
    if (smsSending || prospects.length === 0) return;
    const items = prospects.map((p) => {
      const raw = pickVariant(PROSPECT_MESSAGE_TEMPLATES[category][language] || PROSPECT_MESSAGE_TEMPLATES[category].fr);
      return { id: p.id, message: formatForProspect(raw, p) };
    });
    setSmsSending(true);
    onBulkSendSms(items)
      .then((result) => setSmsResult(result))
      .finally(() => setSmsSending(false));
  };

  const smsPreview =
    prospects.length > 0
      ? formatForProspect(
          PROSPECT_MESSAGE_TEMPLATES[category][language]?.[0] || PROSPECT_MESSAGE_TEMPLATES[category].fr[0],
          prospects[0]
        )
      : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidthClassName="max-w-xl">
      <div className="px-6 py-4 bg-[var(--surface-alt)] border-b border-[var(--border-color)]/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--surface-highlight)]/50 flex items-center justify-center text-[var(--accent)]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-base text-[var(--text-primary)]">
              {t.bulkProspectModalTitle}
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
            <div className="space-y-1.5">
              <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                {t.dispatchChannel}
              </label>
              <div className="grid grid-cols-2 gap-2">
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
              </div>
              {channel === 'SMS' && (
                <p className="text-[11px] text-stone-400 dark:text-stone-500">
                  {language === 'fr'
                    ? "Envoi 100% automatique : un seul clic suffit, pas besoin de valider prospect par prospect."
                    : 'Fully automatic dispatch: one click sends to everyone, no need to confirm one by one.'}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                {t.messageTemplate}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      category === cat.id
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

            {channel === 'WhatsApp' ? (
              <>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono-code uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    <span>{t.bulkProgressLabel}</span>
                    <span>{currentIndex + 1} / {prospects.length}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent)] transition-all"
                      style={{ width: `${(currentIndex / prospects.length) * 100}%` }}
                    />
                  </div>
                </div>

                {currentProspect && (
                  <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-3.5 rounded-xl flex items-center justify-between text-xs">
                    <div className="font-semibold text-stone-800 dark:text-stone-100">
                      {t.bulkClientLabel} {currentIndex + 1}: {currentProspect.name}
                    </div>
                    <span className="text-stone-500 dark:text-stone-400">{currentProspect.phone}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t.previewCustomize}
                  </label>
                  <textarea
                    rows={7}
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    className="w-full rounded-xl p-3.5 text-xs sm:text-sm font-sans focus:ring-2 focus:outline-none leading-relaxed resize-y bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-600 text-stone-800 dark:text-stone-100 focus:ring-emerald-400 focus:dark:ring-emerald-500"
                  />
                </div>

                <CampaignMediaPanel
                  media={campaignMedia}
                  onUpload={onUploadCampaignMedia}
                  onDelete={onDeleteCampaignMedia}
                />
              </>
            ) : (
              <>
                <div className="bg-sky-50 dark:bg-sky-900/40 border border-sky-200 dark:border-sky-700 p-3.5 rounded-xl text-xs text-sky-800 dark:text-sky-100">
                  {language === 'fr'
                    ? `${prospects.length} prospect${prospects.length > 1 ? 's' : ''} recevront ce message par SMS, chacun avec son nom personnalisé.`
                    : `${prospects.length} prospect${prospects.length > 1 ? 's' : ''} will receive this message by SMS, each personalized with their name.`}
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {language === 'fr' ? `Aperçu (exemple : ${prospects[0]?.name ?? ''})` : `Preview (example: ${prospects[0]?.name ?? ''})`}
                  </label>
                  <div className="w-full rounded-xl p-3.5 text-xs sm:text-sm font-sans leading-relaxed bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {smsPreview}
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-8 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
              <Check className="w-7 h-7 text-emerald-600 dark:text-emerald-300" />
            </div>
            <h4 className="font-headline font-bold text-base text-[var(--text-primary)]">{t.bulkDoneTitle}</h4>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {channel === 'WhatsApp'
                ? `${sentCount} ${t.bulkDoneSent}${skippedCount > 0 ? ` · ${skippedCount} ${t.bulkDoneSkipped}` : ''}`
                : `${smsResult?.sentCount ?? 0} ${t.bulkDoneSent}${
                    smsResult && smsResult.failedCount > 0
                      ? ` · ${smsResult.failedCount} ${language === 'fr' ? 'échoués' : 'failed'}`
                      : ''
                  }`}
            </p>
          </div>
        )}
      </div>

      <div className="px-6 py-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between">
        {!isFinished ? (
          channel === 'WhatsApp' ? (
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
              onClick={handleSendAllSms}
              disabled={smsSending}
              className="ml-auto inline-flex items-center gap-1.5 text-white text-xs sm:text-sm font-semibold py-2 px-5 rounded-xl shadow-xs cursor-pointer bg-sky-600 dark:bg-sky-300 hover:bg-sky-700 hover:dark:bg-sky-200 ring-2 ring-sky-300 dark:ring-sky-600/60 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>
                {smsSending
                  ? (language === 'fr' ? 'Envoi en cours…' : 'Sending…')
                  : (language === 'fr' ? `Envoyer par SMS à tous (${prospects.length})` : `Send SMS to all (${prospects.length})`)}
              </span>
            </button>
          )
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
