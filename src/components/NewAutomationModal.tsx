import React, { useState } from 'react';
import { X, Plus, Zap, Mail, MessageSquare, MessageCircle } from 'lucide-react';
import { AutomationCampaign, ChannelType, RelanceType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { INITIAL_MESSAGE_TEMPLATES, pickVariant } from '../data/messageTemplates';
import { Modal } from './ui/Modal';
import { StatefulButton } from './ui/StatefulButton';

interface NewAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (campaign: AutomationCampaign) => Promise<void>;
}

export const NewAutomationModal: React.FC<NewAutomationModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const { language, t } = useLanguage();

  const [name, setName] = useState(language === 'fr' ? 'Nouvelle Relance Fidélité & Upsell' : 'New Loyalty & Upsell Follow-up');
  const [category, setCategory] = useState(language === 'fr' ? 'Saisonnier' : 'Seasonal');
  const [actionEvent, setActionEvent] = useState('After a Service');
  const [delayTime, setDelayTime] = useState(14);
  const [delayUnit, setDelayUnit] = useState<'Days' | 'Weeks' | 'Hours'>('Days');
  const [channel, setChannel] = useState<ChannelType>('WhatsApp');
  const [selectedRelanceType, setSelectedRelanceType] = useState<RelanceType>('post_service');
  const [subjectLine, setSubjectLine] = useState(language === 'fr' ? 'Offre fidélité Exalt Institut' : 'Loyalty Offer - Exalt Institute');
  const [messageBody, setMessageBody] = useState(
    language === 'fr'
      ? `👋 Bonjour Mme/M. *[Nom]* !\n\nVotre récente prestation (*[Prestation]*) a été effectuée chez Exalt Institut.\n\nProfitez de 10% de remise spéciale sur votre prochain [Nouvelle Prestation] ! ✨\n👉 Réservez en ligne : https://exalt-beauty.up.railway.app/rdv`
      : `👋 Hello Mr/Ms *[Nom]*!\n\nYour recent service (*[Prestation]*) was completed at Exalt Institute.\n\nEnjoy an exclusive 10% discount on your next [Nouvelle Prestation]! ✨\n👉 Book online: https://exalt-beauty.up.railway.app/rdv`
  );

  // Quick preset template loader
  const handlePresetSelect = (relType: RelanceType) => {
    setSelectedRelanceType(relType);
    const found = INITIAL_MESSAGE_TEMPLATES.find(
      (tpl) => tpl.relanceType === relType && tpl.channel === channel
    ) || INITIAL_MESSAGE_TEMPLATES.find((tpl) => tpl.relanceType === relType);

    if (found) {
      if (found.subject) {
        setSubjectLine(found.subject[language] || found.subject.fr || '');
      }
      setMessageBody(pickVariant(found.content[language] || found.content.fr));
    }
  };

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitStatus !== 'idle') return;

    const newCamp: AutomationCampaign = {
      id: `camp-${Date.now()}`,
      name,
      category,
      actionEvent,
      delayTime,
      delayUnit,
      channel,
      subjectLine,
      messageBody,
      ctaText: language === 'fr' ? 'Prendre Rendez-vous' : 'Book Appointment',
      ctaUrl: 'https://exalt-beauty.up.railway.app/rdv',
      status: 'active',
      targetAudience: `Clients suite à ${actionEvent}`,
      lastTriggered: language === 'fr' ? 'À l\'instant' : 'Just now',
      stats: {
        sent: 1,
        opened: 1,
        clicked: 0,
        converted: 0
      }
    };

    setSubmitStatus('loading');
    try {
      await onCreate(newCamp);
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
    <Modal isOpen={isOpen} onClose={onClose} maxWidthClassName="max-w-lg">
      <div className="px-6 py-4 bg-[var(--surface-alt)] border-b border-[var(--border-color)]/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-[var(--text-primary)]">
                {t.newWorkflowBtn}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {language === 'fr' ? 'Configurez votre déclencheur et modèle de relance' : 'Configure your trigger and automated follow-up template'}
              </p>
            </div>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200 uppercase tracking-wider mb-1">
              {t.workflowName}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-sm text-stone-900 dark:text-stone-50 focus:ring-2 focus:ring-[var(--surface-highlight)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200 uppercase tracking-wider mb-1">
                {t.actionEvent}
              </label>
              <select
                value={actionEvent}
                onChange={(e) => setActionEvent(e.target.value)}
                className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 text-xs font-medium text-stone-800 dark:text-stone-100 focus:outline-none cursor-pointer"
              >
                <option value="After a Service">{t.afterService}</option>
                <option value="New Client Registration">{t.newClientReg}</option>
                <option value="Inactivity Period">{t.inactivityPeriod}</option>
                <option value="Birthday">{t.birthdayEvent}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200 uppercase tracking-wider mb-1">
                {t.delayTime}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={delayTime}
                  onChange={(e) => setDelayTime(Number(e.target.value))}
                  className="w-16 bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-2 py-2 text-xs font-semibold text-stone-800 dark:text-stone-100"
                />
                <select
                  value={delayUnit}
                  onChange={(e) => setDelayUnit(e.target.value as any)}
                  className="flex-1 bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-2 py-2 text-xs font-medium text-stone-800 dark:text-stone-100 cursor-pointer"
                >
                  <option value="Days">{t.days}</option>
                  <option value="Weeks">{t.weeks}</option>
                  <option value="Hours">{t.hours}</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3 Channels: WhatsApp, SMS, Email */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200 uppercase tracking-wider mb-1">
              {t.dispatchChannel}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChannel('WhatsApp')}
                className={`py-2 px-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                  channel === 'WhatsApp'
                    ? 'bg-emerald-50 dark:bg-emerald-900 border-emerald-600 dark:border-emerald-300 text-emerald-800 dark:text-emerald-100 font-bold ring-1 ring-emerald-500 dark:ring-emerald-400'
                    : 'bg-[var(--surface)] border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('SMS')}
                className={`py-2 px-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                  channel === 'SMS'
                    ? 'bg-sky-50 dark:bg-sky-900 border-sky-600 dark:border-sky-300 text-sky-800 dark:text-sky-100 font-bold ring-1 ring-sky-500 dark:ring-sky-400'
                    : 'bg-[var(--surface)] border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>SMS</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('Email')}
                className={`py-2 px-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                  channel === 'Email'
                    ? 'bg-teal-50 dark:bg-teal-900 border-teal-600 dark:border-teal-300 text-teal-800 dark:text-teal-100 font-bold ring-1 ring-teal-500 dark:ring-teal-400'
                    : 'bg-[var(--surface)] border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </button>
            </div>
          </div>

          {/* Quick Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200 uppercase tracking-wider mb-1">
              {t.messageTemplate} ({t.relanceTypeLabel})
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'post_service', label: t.tplQualityFollowUp },
                { id: 'upsell', label: t.tplUpsell },
                { id: 'discount', label: t.tplDiscount },
                { id: 'periodic_reminder', label: t.tplPeriodicReminder },
                { id: 'reengagement', label: t.tplReengagement },
                { id: 'birthday', label: t.tplBirthday },
                { id: 'checkin', label: t.tplCheckin }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetSelect(p.id as RelanceType)}
                  className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium text-center truncate transition-all cursor-pointer ${
                    selectedRelanceType === p.id
                      ? 'bg-[var(--surface-alt)] border-[var(--accent)] text-[var(--accent-dark)] font-bold'
                      : 'bg-[var(--surface)] border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 hover:dark:bg-stone-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200 uppercase tracking-wider mb-1">
              {t.messageContent}
            </label>
            <textarea
              rows={4}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg p-2.5 text-xs text-stone-800 dark:text-stone-100 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
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
              <Plus className="w-3.5 h-3.5" />
              <span>{t.createWorkflowSubmit}</span>
            </StatefulButton>
          </div>
        </form>
    </Modal>
  );
};
