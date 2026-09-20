import React, { useState, useMemo } from 'react';
import { 
  Zap,
  Mail,
  MessageSquare,
  MessageCircle,
  Bold, 
  Italic, 
  Link as LinkIcon, 
  Save, 
  X, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  Eye, 
  Clock, 
  ArrowRight,
  Plus,
  Play,
  Pause,
  Edit3,
  Trash2,
  BookOpen,
  Copy,
  Check,
  RotateCcw,
  Smartphone
} from 'lucide-react';
import { motion } from 'motion/react';
import { AutomationCampaign, Client, ChannelType, RelanceType, MessageTemplate } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { INITIAL_MESSAGE_TEMPLATES, pickVariant } from '../data/messageTemplates';
import { AnimatedTabs } from './ui/AnimatedTabs';
import { StatefulButton } from './ui/StatefulButton';
import { SpotlightCard } from './ui/SpotlightCard';

interface AutomationsScreenProps {
  campaigns: AutomationCampaign[];
  clients: Client[];
  onSaveCampaign: (campaign: AutomationCampaign) => Promise<void>;
  onNewCampaign: () => void;
  onTriggerNow: (campaign: AutomationCampaign) => void;
}

export const AutomationsScreen: React.FC<AutomationsScreenProps> = ({
  campaigns,
  clients,
  onSaveCampaign,
  onNewCampaign,
  onTriggerNow
}) => {
  const { language, t } = useLanguage();
  
  // Navigation Tabs: 'editor' | 'list' | 'templates'
  const [currentTab, setCurrentTab] = useState<'editor' | 'list' | 'templates'>('editor');

  // Currently editing campaign (default to first active one)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns[0]?.id || 'camp-1');

  const activeCampaign: AutomationCampaign = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0] || {
    id: '', name: '', category: 'Post-Service', actionEvent: 'After a Service',
    delayTime: 3, delayUnit: 'Days', channel: 'WhatsApp', subjectLine: '', messageBody: '',
    ctaText: '', ctaUrl: '', status: 'draft', targetAudience: '',
    stats: { sent: 0, opened: 0, clicked: 0, converted: 0 }
  };

  // Local draft states for live editing
  const [actionEvent, setActionEvent] = useState(activeCampaign.actionEvent);
  const [delayTime, setDelayTime] = useState(activeCampaign.delayTime);
  const [delayUnit, setDelayUnit] = useState(activeCampaign.delayUnit);
  const [channel, setChannel] = useState<ChannelType>(activeCampaign.channel || 'WhatsApp');
  const [subjectLine, setSubjectLine] = useState(activeCampaign.subjectLine);
  const [messageBody, setMessageBody] = useState(activeCampaign.messageBody);
  const [ctaText, setCtaText] = useState(activeCampaign.ctaText);

  // Template base state (allows customization)
  const [templates, setTemplates] = useState<MessageTemplate[]>(INITIAL_MESSAGE_TEMPLATES);
  const [templateFilterRelance, setTemplateFilterRelance] = useState<string>('All');
  const [templateFilterChannel, setTemplateFilterChannel] = useState<string>('All');
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);

  // Preview test client selector
  const [previewClientIndex, setPreviewClientIndex] = useState<number>(0);
  const previewClient = clients[previewClientIndex] || clients[0];

  // When active campaign switches, update local states
  const handleSelectCampaignToEdit = (camp: AutomationCampaign) => {
    setSelectedCampaignId(camp.id);
    setActionEvent(camp.actionEvent);
    setDelayTime(camp.delayTime);
    setDelayUnit(camp.delayUnit);
    setChannel(camp.channel);
    setSubjectLine(camp.subjectLine);
    setMessageBody(camp.messageBody);
    setCtaText(camp.ctaText);
    setCurrentTab('editor');
  };

  // Apply a template from the library into the current editor
  const handleApplyTemplateToEditor = (tpl: MessageTemplate) => {
    setChannel(tpl.channel);
    if (tpl.subject) {
      setSubjectLine(tpl.subject[language] || tpl.subject.fr || '');
    }
    setMessageBody(pickVariant(tpl.content[language] || tpl.content.fr));
    if (tpl.ctaText) {
      setCtaText(tpl.ctaText[language] || tpl.ctaText.fr);
    }
    setCurrentTab('editor');
  };

  // Variable inserter into textarea
  const insertVariable = (varName: string) => {
    setMessageBody((prev) => `${prev} [${varName}]`);
  };

  // Quick AI Assistant Generator with FCFA & WhatsApp aware generation
  const handleAIAssist = () => {
    if (channel === 'WhatsApp') {
      if (language === 'fr') {
        setMessageBody(`👋 Bonjour Mme/M. *[Nom]* !\n\nSuite à votre prestation *[Prestation]* chez Exalt Institut, profitez d'une offre privilège de *15% de remise* sur *[Nouvelle Prestation]* avec le code *PROMO15*.\n\n👉 Réservez en un clic : https://exalt-beauty.up.railway.app/rdv\n\nÀ très vite,\n_L'équipe Exalt_`);
        setSubjectLine('Offre WhatsApp exclusive Exalt Institut');
      } else {
        setMessageBody(`👋 Hello Mr/Ms *[Nom]*!\n\nFollowing your recent *[Prestation]* at Exalt Institute, enjoy an exclusive *15% discount* on *[Nouvelle Prestation]* with code *PROMO15*.\n\n👉 Book in one click: https://exalt-beauty.up.railway.app/rdv\n\nBest regards,\n_The Exalt Team_`);
        setSubjectLine('Exclusive Exalt Institute WhatsApp Offer');
      }
    } else if (channel === 'SMS') {
      if (language === 'fr') {
        setMessageBody(`Exalt Institut : Bonjour [Nom], votre [Prestation] a été réalisée avec succès. Profitez de 10 000 FCFA de remise sur votre prochain [Nouvelle Prestation] ! RDV: https://exalt-beauty.up.railway.app/rdv`);
        setSubjectLine('Offre SMS Exalt Institut');
      } else {
        setMessageBody(`Exalt Institute: Hello [Nom], your [Prestation] was completed smoothly. Enjoy 10 000 FCFA off your next [Nouvelle Prestation]! Book: https://exalt-beauty.up.railway.app/rdv`);
        setSubjectLine('Exalt Institute SMS Offer');
      }
    } else {
      if (language === 'fr') {
        setSubjectLine('Votre dernier passage chez Exalt Institut - Votre avis & offre personnalisée');
        setMessageBody(`Bonjour Mme/M. [Nom],

Nous espérons que votre [Prestation] vous a donné entière satisfaction.

Pour prolonger les bienfaits de votre soin, nous vous recommandons : [Nouvelle Prestation].

Profitez d'un tarif préférentiel exclusif (remise de 15 000 FCFA) en réservant cette semaine.

À très bientôt,
L'équipe Exalt`);
      } else {
        setSubjectLine('Your recent visit at Exalt Institute - Feedback & Exclusive Offer');
        setMessageBody(`Dear [Nom],

We hope you were delighted with your recent [Prestation].

To extend the benefits of your treatment, our team recommends: [Nouvelle Prestation].

Enjoy an exclusive 15 000 FCFA savings voucher when scheduling your next visit this week.

Warm regards,
The Exalt Team`);
      }
    }
  };

  // Save handler
  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const handleSave = async () => {
    if (saveStatus !== 'idle') return;
    const updated: AutomationCampaign = {
      ...activeCampaign,
      actionEvent,
      delayTime,
      delayUnit,
      channel,
      subjectLine,
      messageBody,
      ctaText,
      status: 'active'
    };
    setSaveStatus('loading');
    try {
      await onSaveCampaign(updated);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 1200);
    } catch {
      setSaveStatus('idle');
    }
  };

  // Render dynamic live preview text
  const renderedPreviewBody = useMemo(() => {
    const nameVal = previewClient ? previewClient.name : 'Dupont';
    const lastServiceVal = previewClient ? previewClient.lastService : (language === 'fr' ? 'Soin Signature' : 'Signature Treatment');
    const nextServiceVal = previewClient ? previewClient.suggestedUpsell : (language === 'fr' ? 'Soin Protecteur' : 'Protective Treatment');
    const dateVal = previewClient ? previewClient.lastServiceDate : (language === 'fr' ? '12 Octobre' : 'October 12th');

    return messageBody
      .replace(/Mme\/M\./g, previewClient ? previewClient.prefix : 'Mme/M.')
      .replace(/\[Nom\]/gi, nameVal)
      .replace(/\[Name\]/gi, nameVal)
      .replace(/\[Prestation\]/gi, lastServiceVal)
      .replace(/\[Service\]/gi, lastServiceVal)
      .replace(/\[Prestation Précédente\]/gi, lastServiceVal)
      .replace(/\[Nouvelle Prestation\]/gi, nextServiceVal)
      .replace(/\[Suggested Service\]/gi, nextServiceVal)
      .replace(/\[Date\]/gi, dateVal);
  }, [messageBody, previewClient, language]);

  // Filtered templates list for the library tab
  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      const matchRelance = templateFilterRelance === 'All' || tpl.relanceType === templateFilterRelance;
      const matchChannel = templateFilterChannel === 'All' || tpl.channel === templateFilterChannel;
      return matchRelance && matchChannel;
    });
  }, [templates, templateFilterRelance, templateFilterChannel]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* View Switcher Tabs (Campaign Editor vs List of Automations vs Template Library) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border-color)]/50 pb-3 gap-3">
        <AnimatedTabs
          layoutId="automations-view-tab"
          activeId={currentTab}
          onChange={(id) => setCurrentTab(id as any)}
          className="bg-transparent p-0 gap-2 flex-wrap"
          tabs={[
            { id: 'editor', label: t.campaignEditorTab },
            { id: 'list', label: `${t.allAutomationsTab} (${campaigns.length})` },
            { id: 'templates', label: `${t.navTemplates} (${templates.length})` }
          ]}
        />

        <button
          onClick={onNewCampaign}
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[var(--accent)] text-white px-3 py-1.5 rounded-lg hover:bg-[var(--accent-dark)] transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.newWorkflowBtn}</span>
        </button>
      </div>

      {/* ======================= TAB 1: TEMPLATE LIBRARY ======================= */}
      {currentTab === 'templates' && (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-headline text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                {t.templateLibraryTitle}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                {t.templateLibrarySub}
              </p>
            </div>
          </div>

          {/* Filters Bar: Relance Type & Channel */}
          <div className="flex flex-col sm:flex-row gap-3 bg-[var(--surface)] p-3.5 rounded-xl border border-[var(--border-color)]/60 shadow-2xs">
            <div className="flex-1">
              <label className="block text-[11px] font-mono-code uppercase text-stone-500 dark:text-stone-400 font-semibold mb-1">
                {t.filterByRelanceType}:
              </label>
              <select
                value={templateFilterRelance}
                onChange={(e) => setTemplateFilterRelance(e.target.value)}
                className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-1.5 text-xs font-medium text-stone-800 dark:text-stone-100 focus:outline-none cursor-pointer"
              >
                <option value="All">{t.allRelanceTypes} ⌵</option>
                <option value="post_service">{t.tplQualityFollowUp}</option>
                <option value="upsell">{t.tplUpsell}</option>
                <option value="discount">{t.tplDiscount}</option>
                <option value="periodic_reminder">{t.tplPeriodicReminder}</option>
                <option value="reengagement">{t.tplReengagement}</option>
                <option value="birthday">{t.tplBirthday}</option>
                <option value="checkin">{t.tplCheckin}</option>
              </select>
            </div>

            <div className="w-full sm:w-56">
              <label className="block text-[11px] font-mono-code uppercase text-stone-500 dark:text-stone-400 font-semibold mb-1">
                {t.filterByChannel}:
              </label>
              <select
                value={templateFilterChannel}
                onChange={(e) => setTemplateFilterChannel(e.target.value)}
                className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-1.5 text-xs font-medium text-stone-800 dark:text-stone-100 focus:outline-none cursor-pointer"
              >
                <option value="All">{t.allChannels} ⌵</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="SMS">SMS</option>
                <option value="Email">Email</option>
              </select>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((tpl) => {
              const title = tpl.title[language] || tpl.title.fr;
              const content = (tpl.content[language] || tpl.content.fr)[0];
              const isCopied = copiedTemplateId === tpl.id;

              return (
                <SpotlightCard
                  key={tpl.id}
                  className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 p-4.5 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header badge with channel & category */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono-code font-semibold ${
                        tpl.channel === 'WhatsApp'
                          ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-700'
                          : tpl.channel === 'Email'
                          ? 'bg-teal-100 dark:bg-teal-800 text-teal-800 dark:text-teal-100 border border-teal-200 dark:border-teal-700'
                          : 'bg-sky-100 dark:bg-sky-800 text-sky-800 dark:text-sky-100 border border-sky-200 dark:border-sky-700'
                      }`}>
                        {tpl.channel === 'WhatsApp' ? (
                          <><MessageCircle className="w-3 h-3" /> WhatsApp</>
                        ) : tpl.channel === 'SMS' ? (
                          <><MessageSquare className="w-3 h-3" /> SMS</>
                        ) : (
                          <><Mail className="w-3 h-3" /> Email</>
                        )}
                      </span>

                      <span className="text-[10px] font-mono-code text-stone-400 dark:text-stone-500 uppercase">
                        {tpl.relanceType.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="font-headline font-bold text-sm text-[var(--text-primary)] mb-2 line-clamp-1">
                      {title}
                    </h3>

                    {tpl.subject && (
                      <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-2 italic line-clamp-1 bg-stone-50 dark:bg-stone-900 px-2 py-1 rounded">
                        Obj: {tpl.subject[language] || tpl.subject.fr}
                      </div>
                    )}

                    <div className="bg-[var(--bg-page)] p-3 rounded-lg border border-stone-100 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-200 font-mono-code whitespace-pre-line line-clamp-4 leading-relaxed mb-3">
                      {content}
                    </div>
                  </div>

                  {/* Actions: Apply to editor or copy */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800 gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(content);
                        setCopiedTemplateId(tpl.id);
                        setTimeout(() => setCopiedTemplateId(null), 2000);
                      }}
                      className="inline-flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 hover:dark:text-stone-100 cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? (language === 'fr' ? 'Copié !' : 'Copied!') : (language === 'fr' ? 'Copier' : 'Copy')}</span>
                    </button>

                    <button
                      onClick={() => handleApplyTemplateToEditor(tpl)}
                      className="inline-flex items-center gap-1 text-xs font-semibold bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{t.useThisTemplate}</span>
                    </button>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================= TAB 2: ALL AUTOMATIONS LIST ======================= */}
      {currentTab === 'list' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((camp) => (
              <SpotlightCard
                key={camp.id}
                className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 p-5 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono-code font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--surface-alt)] text-[var(--accent-dark)]">
                      {camp.category}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      camp.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                    }`}>
                      ● {camp.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-headline font-bold text-base text-[var(--text-primary)] mb-1">
                    {camp.name}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mb-3">
                    {camp.subjectLine}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-stone-600 dark:text-stone-300 mb-4 bg-stone-50 dark:bg-stone-900 p-2.5 rounded-lg border border-stone-100 dark:border-stone-800 font-mono-code">
                    <div>
                      <span className="text-stone-400 dark:text-stone-500 block text-[10px]">{language === 'fr' ? 'Délai:' : 'Delay:'}</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-100">{camp.delayTime} {camp.delayUnit}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 dark:text-stone-500 block text-[10px]">{language === 'fr' ? 'Canal:' : 'Channel:'}</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-200 inline-flex items-center gap-1">
                        {camp.channel === 'WhatsApp' ? <><MessageCircle className="w-3 h-3" /> WA</> : camp.channel}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 dark:text-stone-500 block text-[10px]">{language === 'fr' ? 'Envoyés:' : 'Dispatched:'}</span>
                      <span className="font-semibold text-[var(--accent)]">{camp.stats.sent}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 dark:text-stone-500 block text-[10px]">{language === 'fr' ? 'Conversion:' : 'Conversion:'}</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-300">
                        {camp.stats.sent > 0 ? Math.round((camp.stats.converted / camp.stats.sent) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
                  <button
                    onClick={() => onTriggerNow(camp)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-[var(--accent)] cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{t.runTestBtn}</span>
                  </button>

                  <button
                    onClick={() => handleSelectCampaignToEdit(camp)}
                    className="inline-flex items-center gap-1 text-xs font-semibold bg-[var(--surface-highlight)]/40 hover:bg-[var(--surface-highlight)] text-[var(--accent-dark)] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t.editWorkflowBtn}</span>
                  </button>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB 3: WORKFLOW CAMPAIGN EDITOR ======================= */}
      {currentTab === 'editor' && (
        <div className="space-y-5">
          {/* Breadcrumb & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-mono-code text-xs text-stone-500 dark:text-stone-400 mb-1 flex items-center gap-1.5">
                <span>Automations</span>
                <span>&gt;</span>
                <span className="text-[var(--text-primary)] font-semibold">{activeCampaign.name}</span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                {t.campaignEditorTitle}
              </h1>
            </div>

            {/* Top Action Buttons: Discard & Save & Activate */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <button
                id="btn-discard-campaign"
                onClick={() => {
                  setSubjectLine(activeCampaign.subjectLine);
                  setMessageBody(activeCampaign.messageBody);
                }}
                className="bg-[var(--surface)] border border-[var(--border-color)]/70 hover:bg-stone-50 hover:dark:bg-stone-900 text-stone-700 dark:text-stone-200 font-semibold text-xs sm:text-sm py-2 px-4 rounded-lg transition-all cursor-pointer shadow-2xs"
              >
                {t.discardBtn}
              </button>

              <StatefulButton
                id="btn-save-activate-campaign"
                status={saveStatus}
                onClick={handleSave}
                className="bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white font-semibold text-xs sm:text-sm py-2 px-4 rounded-lg shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{t.saveActivateBtn}</span>
              </StatefulButton>
            </div>
          </div>

          {/* Main Grid: Left Editor Column & Right Live Preview matching Image 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (7 cols): Trigger Logic & Message Content */}
            <div className="lg:col-span-7 space-y-5">
              {/* Trigger Logic Card */}
              <div className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
                  <div className="w-7 h-7 rounded-lg bg-[var(--surface-highlight)]/30 flex items-center justify-center text-[var(--accent)]">
                    <Zap className="w-4 h-4 fill-current text-[var(--accent)]" />
                  </div>
                  <h3 className="font-headline font-bold text-base text-[var(--text-primary)]">
                    {t.triggerLogic}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Action Event */}
                  <div>
                    <label className="block font-mono-code text-[11px] text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
                      {t.actionEvent}
                    </label>
                    <div className="relative">
                      <select
                        value={actionEvent}
                        onChange={(e) => setActionEvent(e.target.value)}
                        className="w-full bg-[var(--bg-page)] border border-[var(--border-color)]/70 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-[var(--surface-highlight)] focus:outline-none cursor-pointer"
                      >
                        <option value="After a Service">{t.afterService} →</option>
                        <option value="New Client Registration">{t.newClientReg} →</option>
                        <option value="Inactivity Period">{t.inactivityPeriod} →</option>
                        <option value="Birthday">{t.birthdayEvent} →</option>
                      </select>
                    </div>
                  </div>

                  {/* Delay Time */}
                  <div>
                    <label className="block font-mono-code text-[11px] text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
                      {t.delayTime}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={delayTime}
                        onChange={(e) => setDelayTime(Number(e.target.value))}
                        className="w-20 bg-[var(--bg-page)] border border-[var(--border-color)]/70 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-[var(--surface-highlight)] focus:outline-none"
                      />
                      <select
                        value={delayUnit}
                        onChange={(e) => setDelayUnit(e.target.value as any)}
                        className="flex-1 bg-[var(--bg-page)] border border-[var(--border-color)]/70 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-[var(--surface-highlight)] focus:outline-none cursor-pointer"
                      >
                        <option value="Days">{t.days} ⌵</option>
                        <option value="Weeks">{t.weeks} ⌵</option>
                        <option value="Hours">{t.hours} ⌵</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 pt-1">
                  <Info className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0" />
                  <span>
                    {language === 'fr' 
                      ? `Le message sera envoyé exactement ${delayTime} ${delayUnit.toLowerCase()} après la dernière date de prestation enregistrée.`
                      : `Message will be dispatched exactly ${delayTime} ${delayUnit.toLowerCase()} after the last recorded service date.`}
                  </span>
                </div>
              </div>

              {/* Message Content Card */}
              <div className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--surface-alt)] flex items-center justify-center text-stone-700 dark:text-stone-200">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <h3 className="font-headline font-bold text-base text-[var(--text-primary)]">
                      {t.messageContent}
                    </h3>
                  </div>

                  {/* Channel Switcher [WhatsApp] [SMS] [Email] */}
                  <div className="flex items-center bg-[var(--bg-page)] p-1 rounded-lg border border-[var(--border-color)]/50 gap-1">
                    <button
                      type="button"
                      onClick={() => setChannel('WhatsApp')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                        channel === 'WhatsApp'
                          ? 'bg-emerald-600 dark:bg-emerald-300 text-white shadow-2xs'
                          : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 hover:dark:text-stone-50'
                      }`}
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel('SMS')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                        channel === 'SMS'
                          ? 'bg-[var(--accent)] text-white shadow-2xs'
                          : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 hover:dark:text-stone-50'
                      }`}
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>SMS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel('Email')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                        channel === 'Email'
                          ? 'bg-indigo-700 dark:bg-indigo-200 text-white shadow-2xs'
                          : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 hover:dark:text-stone-50'
                      }`}
                    >
                      <Mail className="w-3 h-3" />
                      <span>Email</span>
                    </button>
                  </div>
                </div>

                {/* Subject Line (if Email or WhatsApp header) */}
                <div>
                  <label className="block font-mono-code text-[11px] text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
                    {t.subjectLine}
                  </label>
                  <input
                    type="text"
                    value={subjectLine}
                    onChange={(e) => setSubjectLine(e.target.value)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)]/70 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-[var(--surface-highlight)] focus:outline-none"
                  />
                </div>

                {/* Body Toolbar & Variables Insertion */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <label className="font-mono-code text-[11px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      {channel === 'WhatsApp' ? 'Message WhatsApp (*gras*, _italique_)' : channel === 'Email' ? t.emailBody : t.smsBody}
                    </label>

                    <button
                      type="button"
                      onClick={handleAIAssist}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)] hover:text-[var(--accent-dark)] bg-[var(--surface-highlight)]/30 px-2 py-0.5 rounded transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{t.generateWithAI}</span>
                    </button>
                  </div>

                  {/* Toolbar Row */}
                  <div className="bg-[var(--bg-page)] border border-[var(--border-color)]/70 border-b-0 rounded-t-lg px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                      <button
                        type="button"
                        onClick={() => setMessageBody(prev => channel === 'WhatsApp' ? `*${prev}*` : `**${prev}**`)}
                        className="p-1 hover:bg-[var(--surface)] rounded font-bold cursor-pointer"
                        title="Gras / Bold"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessageBody(prev => `_${prev}_`)}
                        className="p-1 hover:bg-[var(--surface)] rounded italic cursor-pointer"
                        title="Italique / Italic"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessageBody(prev => `${prev} https://exalt-beauty.up.railway.app/rdv`)}
                        className="p-1 hover:bg-[var(--surface)] rounded cursor-pointer"
                        title="Lien / Link"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Dynamic Variable Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono-code text-[10px] text-stone-400 dark:text-stone-500 uppercase">
                        {t.variablesLabel}:
                      </span>
                      {['Nom', 'Prestation', 'Nouvelle Prestation', 'Date'].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => insertVariable(v)}
                          className="px-2 py-0.5 bg-[var(--surface)] hover:bg-[var(--surface-highlight)]/50 border border-stone-200 dark:border-stone-700 rounded font-mono-code text-[11px] text-[var(--accent-dark)] font-medium transition-colors cursor-pointer"
                        >
                          [{v}]
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Textarea */}
                  <textarea
                    rows={7}
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)]/70 rounded-b-lg p-3.5 text-xs sm:text-sm font-sans text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-[var(--surface-highlight)] focus:outline-none leading-relaxed resize-y"
                  />
                </div>

                {/* Call to action setting */}
                <div className="pt-2">
                  <label className="block font-mono-code text-[11px] text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
                    {t.ctaBtnLabel}
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Texte du bouton, ex: Prendre Rendez-vous"
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)]/70 rounded-lg px-3.5 py-1.5 text-xs font-medium text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-[var(--surface-highlight)] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Live Preview matching Image 3 & WhatsApp/SMS/Email Simulation */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 overflow-hidden shadow-sm">
                {/* Header of Live Preview Frame */}
                <div className="px-4 py-3 bg-[var(--surface-alt)]/60 border-b border-[var(--border-color)]/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[var(--accent)]" />
                    <span className="font-headline font-bold text-sm text-[var(--text-primary)]">
                      {t.livePreviewTitle} ({channel})
                    </span>
                  </div>

                  {/* 3 browser dots */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-stone-300 dark:bg-stone-600" />
                    <div className="w-2.5 h-2.5 rounded-full bg-stone-300 dark:bg-stone-600" />
                    <div className="w-2.5 h-2.5 rounded-full bg-stone-300 dark:bg-stone-600" />
                  </div>
                </div>

                {/* Preview Customer Switcher */}
                <div className="px-4 py-2 bg-stone-50 dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                  <span className="text-stone-500 dark:text-stone-400 font-medium">{t.previewFor}:</span>
                  <select
                    value={previewClientIndex}
                    onChange={(e) => setPreviewClientIndex(Number(e.target.value))}
                    className="bg-[var(--surface)] border border-stone-200 dark:border-stone-700 rounded px-2 py-1 text-xs font-semibold text-stone-800 dark:text-stone-100 focus:outline-none cursor-pointer"
                  >
                    {clients.map((c, idx) => (
                      <option key={c.id} value={idx}>
                        {c.prefix} {c.name} ({c.lastService})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Channel-Specific Preview Container */}
                {channel === 'WhatsApp' ? (
                  /* WhatsApp Simulation UI */
                  <div className="p-4 space-y-3 bg-[#efeae2]/80 min-h-[320px] flex flex-col justify-between">
                    {/* Simulated WhatsApp Header */}
                    <div className="bg-[#075e54] text-white p-2.5 rounded-lg flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[var(--surface)]/20 flex items-center justify-center font-bold text-xs">
                          💇
                        </div>
                        <div>
                          <div className="font-bold text-xs">Exalt Institut</div>
                          <div className="text-[10px] text-emerald-200 dark:text-emerald-700">En ligne / Online</div>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-700 dark:bg-emerald-200 px-1.5 py-0.5 rounded font-mono-code">WhatsApp</span>
                    </div>

                    {/* WhatsApp Message Bubble */}
                    <div className="bg-[#dcf8c6] p-3.5 rounded-xl rounded-tl-none shadow-xs text-xs text-stone-800 dark:text-stone-100 max-w-[95%] space-y-2 self-start border border-emerald-200 dark:border-emerald-700/50">
                      <div className="font-bold text-[11px] text-[#075e54]">
                        {subjectLine}
                      </div>
                      <div className="whitespace-pre-line leading-relaxed font-sans">
                        {renderedPreviewBody}
                      </div>
                      {ctaText && (
                        <div className="pt-2 border-t border-emerald-300 dark:border-emerald-600/40 text-center">
                          <button
                            type="button"
                            className="w-full bg-[#075e54] hover:bg-[#128c7e] text-white font-semibold text-xs py-1.5 px-3 rounded-md shadow-2xs"
                          >
                            🔗 {ctaText}
                          </button>
                        </div>
                      )}
                      <div className="flex items-center justify-end gap-1 text-[10px] text-stone-500 dark:text-stone-400 pt-1 font-mono-code">
                        <span>10:42</span>
                        <span className="text-sky-600 dark:text-sky-300 font-bold">✓✓</span>
                      </div>
                    </div>

                    <div className="text-center text-[10px] text-stone-400 dark:text-stone-500 font-mono-code">
                      🔒 {language === 'fr' ? 'Chiffrement de bout en bout WhatsApp' : 'End-to-end encrypted WhatsApp'}
                    </div>
                  </div>
                ) : channel === 'SMS' ? (
                  /* SMS Simulation UI */
                  <div className="p-4 space-y-3 bg-stone-100 dark:bg-stone-800 min-h-[320px] flex flex-col justify-between">
                    <div className="text-center text-[11px] text-stone-400 dark:text-stone-500 font-mono-code pt-1">
                      {language === 'fr' ? 'Message SMS • Aujourd\'hui 10:42' : 'SMS Message • Today 10:42'}
                    </div>

                    <div className="bg-sky-600 dark:bg-sky-300 text-white p-3.5 rounded-2xl rounded-tr-none shadow-xs text-xs max-w-[90%] space-y-2 self-end">
                      <div className="whitespace-pre-line leading-relaxed">
                        {renderedPreviewBody}
                      </div>
                    </div>

                    <div className="text-center text-[10px] text-stone-400 dark:text-stone-500 font-mono-code">
                      {language === 'fr' ? 'Envoyé au ' : 'Sent to '} {previewClient?.phone || '+33 6 00 00 00'}
                    </div>
                  </div>
                ) : (
                  /* Email Client Simulated Container */
                  <div className="p-5 space-y-4 bg-[var(--surface)]">
                    {/* Sender Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-xs">
                          S
                        </div>
                        <div>
                          <div className="font-bold text-xs text-stone-900 dark:text-stone-50 leading-tight">
                            Exalt Institut
                          </div>
                          <div className="text-[11px] text-stone-400 dark:text-stone-500">
                            {language === 'fr' ? 'À:' : 'To:'} {previewClient?.email || 'client@example.com'}
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] font-mono-code text-stone-400 dark:text-stone-500">
                        10:42 AM
                      </div>
                    </div>

                    {/* Simulated Subject */}
                    <div className="font-headline font-bold text-sm text-[var(--text-primary)]">
                      {subjectLine}
                    </div>

                    {/* Body with Styled Variables */}
                    <div className="text-xs text-stone-700 dark:text-stone-200 leading-relaxed whitespace-pre-line space-y-3 font-sans">
                      {renderedPreviewBody}
                    </div>

                    {/* CTA Button */}
                    {ctaText && (
                      <div className="pt-2">
                        <button
                          type="button"
                          className="w-full bg-[var(--text-primary)] hover:bg-stone-800 hover:dark:bg-stone-100 text-white font-semibold text-xs py-2.5 px-4 rounded-lg shadow-sm transition-all text-center block cursor-pointer"
                        >
                          {ctaText}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Note */}
                <div className="px-4 py-3 bg-[var(--bg-page)] border-t border-stone-100 dark:border-stone-800 flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                  <span>{t.variablesFooterNote}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
