import React, { useEffect, useState } from 'react';
import { X, Send, Copy, Check, RotateCcw, User, Handshake, Sparkles, MessageCircle, MessageSquare } from 'lucide-react';
import { Prospect } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { buildWaMeLink } from '../lib/whatsapp';
import { getTimeBasedGreeting } from '../lib/greeting';
import { PROSPECT_MESSAGE_TEMPLATES, ProspectMessageCategory, pickVariant } from '../data/prospectTemplates';
import { Modal } from './ui/Modal';
import { StatefulButton } from './ui/StatefulButton';
import { CampaignMediaPanel, CampaignMediaItem } from './CampaignMediaPanel';

export type ProspectRelanceChannel = 'WhatsApp' | 'SMS';

interface ProspectRelanceModalProps {
  prospect: Prospect | null;
  isOpen: boolean;
  onClose: () => void;
  onSend: (prospect: Prospect, message: string, channel: ProspectRelanceChannel) => Promise<void>;
  campaignMedia: Partial<Record<'photo' | 'video', CampaignMediaItem>>;
  onUploadCampaignMedia: (kind: 'photo' | 'video', file: File) => Promise<void>;
  onDeleteCampaignMedia: (kind: 'photo' | 'video') => Promise<void>;
}

export const ProspectRelanceModal: React.FC<ProspectRelanceModalProps> = ({
  prospect,
  isOpen,
  onClose,
  onSend,
  campaignMedia,
  onUploadCampaignMedia,
  onDeleteCampaignMedia
}) => {
  const { language, t } = useLanguage();

  const [channel, setChannel] = useState<ProspectRelanceChannel>('WhatsApp');
  const [category, setCategory] = useState<ProspectMessageCategory>('first_contact');
  const [message, setMessage] = useState('');
  const [sendStatus, setSendStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [copied, setCopied] = useState(false);

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

  const populate = (cat: ProspectMessageCategory, p: Prospect) => {
    const raw = pickVariant(PROSPECT_MESSAGE_TEMPLATES[cat][language] || PROSPECT_MESSAGE_TEMPLATES[cat].fr);
    setMessage(formatForProspect(raw, p));
  };

  // Un prospect jamais relancé se voit proposer le message de premier contact ;
  // s'il a déjà été relancé une fois, on bascule par défaut sur la relance soins.
  useEffect(() => {
    if (!isOpen || !prospect) return;
    setSendStatus('idle');
    setChannel('WhatsApp');
    const defaultCategory: ProspectMessageCategory = prospect.lastRelanceAt ? 'services_follow_up' : 'first_contact';
    setCategory(defaultCategory);
    populate(defaultCategory, prospect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, prospect?.id]);

  const handleSelectCategory = (cat: ProspectMessageCategory) => {
    setCategory(cat);
    if (prospect) populate(cat, prospect);
  };

  const handleReset = () => {
    if (!prospect) return;
    populate(category, prospect);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendClick = () => {
    if (!prospect || sendStatus !== 'idle') return;
    if (channel === 'WhatsApp') {
      window.location.href = buildWaMeLink(prospect.phone, message);
    }
    setSendStatus('loading');
    onSend(prospect, message, channel)
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
      {prospect && (
        <>
          <div className="px-6 py-4 bg-[var(--surface-alt)] border-b border-[var(--border-color)]/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface-highlight)]/50 flex items-center justify-center text-[var(--accent)]">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-base text-[var(--text-primary)]">
                  {t.prospectRelanceModalTitle}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  {t.directSendTo} {prospect.name} • {prospect.phone}
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
            <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-3.5 rounded-xl flex items-center gap-2 text-xs">
              <User className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400 shrink-0" />
              <span className="font-semibold text-stone-800 dark:text-stone-100">{prospect.name}</span>
              {prospect.source && <span className="text-stone-400 dark:text-stone-500">— {prospect.source}</span>}
            </div>

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
                    onClick={() => handleSelectCategory(cat.id)}
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  {t.previewCustomize}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 text-[11px] text-[var(--accent)] hover:underline font-medium cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{language === 'fr' ? 'Réinitialiser modèle' : 'Reset template'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400 hover:text-stone-800 hover:dark:text-stone-100 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-300" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? (language === 'fr' ? 'Copié !' : 'Copied!') : (language === 'fr' ? 'Copier' : 'Copy')}</span>
                  </button>
                </div>
              </div>
              <textarea
                rows={7}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl p-3.5 text-xs sm:text-sm font-sans focus:ring-2 focus:outline-none leading-relaxed resize-y bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-600 text-stone-800 dark:text-stone-100 focus:ring-emerald-400 focus:dark:ring-emerald-500"
              />
            </div>

            <CampaignMediaPanel
              media={campaignMedia}
              onUpload={onUploadCampaignMedia}
              onDelete={onDeleteCampaignMedia}
            />
          </div>

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
              className="text-white text-xs sm:text-sm font-semibold py-2 px-5 rounded-xl shadow-xs cursor-pointer bg-emerald-600 dark:bg-emerald-300 hover:bg-emerald-700 hover:dark:bg-emerald-200 ring-2 ring-emerald-300 dark:ring-emerald-600/60"
            >
              <Send className="w-4 h-4" />
              <span>
                {channel === 'WhatsApp'
                  ? (language === 'fr' ? 'Envoyer sur WhatsApp' : 'Send via WhatsApp')
                  : (language === 'fr' ? 'Envoyer par SMS' : 'Send via SMS')}
              </span>
            </StatefulButton>
          </div>
        </>
      )}
    </Modal>
  );
};
