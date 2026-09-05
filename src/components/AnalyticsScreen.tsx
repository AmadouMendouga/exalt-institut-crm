import React, { useMemo } from 'react';
import {
  Send,
  Eye,
  MousePointerClick,
  CheckCircle2,
  Users,
  Calendar,
  BarChart,
  ArrowUpRight,
  MessageSquare,
  MessageCircle,
  Mail
} from 'lucide-react';
import { motion } from 'motion/react';
import { AutomationCampaign, TimelineItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { SpotlightCard } from './ui/SpotlightCard';
import { useCountUp } from '../hooks/useCountUp';

interface AnalyticsScreenProps {
  campaigns: AutomationCampaign[];
  timeline: TimelineItem[];
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ campaigns, timeline }) => {
  const { language, t } = useLanguage();

  // Toutes ces valeurs sont calculées à partir des données réelles (campagnes +
  // planning), et non plus figées en dur : elles évoluent avec les relances
  // manuelles et automatiques réellement envoyées.
  const metrics = useMemo(() => {
    // Un brouillon n'est pas encore une relance envoyée, seulement une proposition en attente.
    const dispatchedCount = timeline.filter((item) => item.status !== 'Drafts').length;
    const distinctClientsTouched = new Set(
      timeline.filter((item) => item.status !== 'Drafts' && item.clientId).map((item) => item.clientId)
    ).size;
    const totalOpened = campaigns.reduce((sum, c) => sum + (c.stats?.opened || 0), 0);
    const totalCampaignSent = campaigns.reduce((sum, c) => sum + (c.stats?.sent || 0), 0);
    const totalConverted = campaigns.reduce((sum, c) => sum + (c.stats?.converted || 0), 0);

    return {
      dispatchedCount,
      distinctClientsTouched,
      openRateValue: totalCampaignSent > 0 ? (totalOpened / totalCampaignSent) * 100 : 0,
      conversionRateValue: totalCampaignSent > 0 ? (totalConverted / totalCampaignSent) * 100 : 0
    };
  }, [campaigns, timeline]);

  const totalSent = useCountUp(metrics.dispatchedCount);
  const openRate = useCountUp(metrics.openRateValue, { format: (v) => `${v.toFixed(1)}%` });
  const conversionRate = useCountUp(metrics.conversionRateValue, { format: (v) => `${v.toFixed(1)}%` });
  const clientsTouched = useCountUp(metrics.distinctClientsTouched);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            {t.analyticsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            {t.analyticsSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border-color)]/70 rounded-lg px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
          <span>{t.last30Days}</span>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sent */}
        <SpotlightCard className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
            <span className="font-mono-code text-[11px] font-semibold uppercase">{t.totalReminders}</span>
            <Send className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="font-headline text-3xl font-bold text-[var(--text-primary)]">
            <motion.span ref={totalSent.ref}>{totalSent.display}</motion.span>
          </div>
          <div className="flex items-center gap-1 text-stone-400 dark:text-stone-500 text-xs font-medium mt-1">
            <span>{t.allChannelsCaption}</span>
          </div>
        </SpotlightCard>

        {/* Open Rate */}
        <SpotlightCard className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
            <span className="font-mono-code text-[11px] font-semibold uppercase">{t.openRate}</span>
            <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
          </div>
          <div className="font-headline text-3xl font-bold text-[var(--text-primary)]">
            <motion.span ref={openRate.ref}>{openRate.display}</motion.span>
          </div>
          <div className="flex items-center gap-1 text-stone-400 dark:text-stone-500 text-xs font-medium mt-1">
            <span>{t.activeCampaignsCaption}</span>
          </div>
        </SpotlightCard>

        {/* Conversion Rate */}
        <SpotlightCard className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
            <span className="font-mono-code text-[11px] font-semibold uppercase">{t.conversionRate}</span>
            <MousePointerClick className="w-4 h-4 text-amber-600 dark:text-amber-300" />
          </div>
          <div className="font-headline text-3xl font-bold text-[var(--text-primary)]">
            <motion.span ref={conversionRate.ref}>{conversionRate.display}</motion.span>
          </div>
          <div className="flex items-center gap-1 text-stone-400 dark:text-stone-500 text-xs font-medium mt-1">
            <span>{t.activeCampaignsCaption}</span>
          </div>
        </SpotlightCard>

        {/* Clients touchés */}
        <SpotlightCard className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
            <span className="font-mono-code text-[11px] font-semibold uppercase">{t.clientsTouchedLabel}</span>
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
          </div>
          <div className="font-headline text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">
            <motion.span ref={clientsTouched.ref}>{clientsTouched.display}</motion.span>
          </div>
          <div className="flex items-center gap-1 text-stone-400 dark:text-stone-500 text-xs font-medium mt-1">
            <span>{t.distinctClientsCaption}</span>
          </div>
        </SpotlightCard>
      </div>

      {/* Top Performing Campaigns Table */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <h3 className="font-headline font-bold text-base text-[var(--text-primary)]">
            {t.campaignPerformance}
          </h3>
          <span className="text-xs text-stone-400 dark:text-stone-500 font-mono-code">{t.realtime}</span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 dark:border-stone-800 bg-[var(--bg-page)]">
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase">{t.thCampaign}</th>
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase">{t.thChannel}</th>
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase">{t.thSent}</th>
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase">{t.thOpened}</th>
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase">{t.thConverted}</th>
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase text-right">{t.thRate}</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-stone-100 dark:divide-stone-800">
              {campaigns.map((c, index) => {
                const convRate = c.stats.sent > 0 ? Math.round((c.stats.converted / c.stats.sent) * 100) : 0;
                return (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    className="hover:bg-stone-50 hover:dark:bg-stone-900 transition-colors"
                  >
                    <td className="py-3.5 px-6 font-semibold text-stone-800 dark:text-stone-100">
                      {c.name}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono-code font-semibold ${
                        c.channel === 'WhatsApp' 
                          ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-700' 
                          : c.channel === 'Email' 
                          ? 'bg-[var(--surface-highlight)]/30 text-[var(--accent-dark)] border border-teal-200 dark:border-teal-700' 
                          : 'bg-[#dce9ff] text-[#07006c] border border-blue-200 dark:border-blue-700'
                      }`}>
                        {c.channel === 'WhatsApp' ? (
                          <><MessageCircle className="w-3 h-3" /> WhatsApp</>
                        ) : c.channel === 'SMS' ? (
                          <><MessageSquare className="w-3 h-3" /> SMS</>
                        ) : (
                          <><Mail className="w-3 h-3" /> Email</>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-mono-code text-stone-600 dark:text-stone-300">
                      {c.stats.sent.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 font-mono-code text-stone-600 dark:text-stone-300">
                      {c.stats.opened.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 font-mono-code text-emerald-700 dark:text-emerald-200 font-bold">
                      {c.stats.converted.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <span className="font-bold text-[var(--accent)]">{convRate}%</span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
