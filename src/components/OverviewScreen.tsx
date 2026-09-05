import React, { useState } from 'react';
import {
  Send,
  RotateCw,
  PieChart,
  Calendar as CalendarIcon,
  Tag,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Filter,
  Users
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Client, NavScreen, TimelineItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { SpotlightCard } from './ui/SpotlightCard';
import { useCountUp } from '../hooks/useCountUp';

interface OverviewScreenProps {
  clients: Client[];
  timeline: TimelineItem[];
  onQuickRelance: (client: Client, mode?: 'SMS' | 'Email') => void;
  onNavigate: (screen: NavScreen) => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  clients,
  timeline,
  onQuickRelance,
  onNavigate
}) => {
  const { language, t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('This Month');
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);

  // Filter clients who need follow-up
  const followUpClients = clients.filter(c => c.status === 'Follow-up Needed');

  const periodOptions = [
    { key: 'this_month', label: t.thisMonth },
    { key: 'last_30_days', label: t.last30Days },
    { key: 'this_quarter', label: t.thisQuarter },
  ];

  const currentPeriodLabel = selectedPeriod === 'This Month' ? t.thisMonth :
    selectedPeriod === 'Last 30 Days' ? t.last30Days :
    selectedPeriod === 'This Quarter' ? t.thisQuarter : selectedPeriod;

  const femaleCount = clients.filter((c) => c.gender === 'F').length;
  const femalePct = clients.length ? Math.round((femaleCount / clients.length) * 100) : 0;
  const malePct = clients.length ? 100 - femalePct : 0;

  const upToDateCount = clients.filter((c) => c.status === 'Up to date').length;
  const conversionPct = clients.length ? Math.round((upToDateCount / clients.length) * 100) : 0;

  const remindersSent = useCountUp(timeline.length);
  const conversionRate = useCountUp(conversionPct, { format: (v) => `${Math.round(v)}%` });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            {t.overviewTitle}
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            {t.overviewSubtitle}
          </p>
        </div>

        {/* Period Selector */}
        <div className="relative self-start sm:self-auto">
          <button
            id="btn-period-filter"
            onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
            className="bg-[var(--surface)] border border-[var(--border-color)]/70 text-[var(--text-primary)] font-medium text-xs sm:text-sm py-2 px-3.5 rounded-lg hover:shadow-sm hover:border-stone-400 hover:dark:border-stone-500 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <CalendarIcon className="w-4 h-4 text-stone-500 dark:text-stone-400" />
            <span>{currentPeriodLabel}</span>
          </button>

          <AnimatePresence>
            {periodDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 mt-1.5 w-44 bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--border-color)]/60 py-1 z-30"
              >
                {periodOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setSelectedPeriod(opt.label);
                      setPeriodDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium cursor-pointer transition-colors ${
                      currentPeriodLabel === opt.label ? 'bg-[var(--surface-alt)] text-[var(--accent-dark)] font-semibold' : 'text-stone-700 dark:text-stone-200 hover:bg-stone-50 hover:dark:bg-stone-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Metrics Bento Grid (3 Cards matching Image 5) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Reminders Sent */}
        <SpotlightCard className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 p-5 flex flex-col justify-between h-44 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <h3 className="font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              {t.remindersSent}
            </h3>
            <div className="w-8 h-8 rounded-full bg-[var(--surface-alt)] flex items-center justify-center text-[var(--text-primary)]">
              <Send className="w-4 h-4 text-stone-700 dark:text-stone-200" />
            </div>
          </div>
          <div>
            <div className="font-headline text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-1">
              <motion.span ref={remindersSent.ref}>{remindersSent.display}</motion.span>
            </div>
          </div>
        </SpotlightCard>

        {/* Metric 2: Conversion Rate */}
        <SpotlightCard className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 p-5 flex flex-col justify-between h-44 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <h3 className="font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              {t.conversionRate}
            </h3>
            <div className="w-8 h-8 rounded-full bg-[var(--surface-alt)] flex items-center justify-center text-[var(--text-primary)]">
              <RotateCw className="w-4 h-4 text-stone-700 dark:text-stone-200" />
            </div>
          </div>
          <div>
            <div className="font-headline text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-1">
              <motion.span ref={conversionRate.ref}>{conversionRate.display}</motion.span>
            </div>
          </div>
        </SpotlightCard>

        {/* Metric 3: Client Breakdown */}
        <SpotlightCard className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 p-5 flex flex-col justify-between h-44 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <h3 className="font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              {t.clientBreakdown}
            </h3>
            <div className="w-8 h-8 rounded-full bg-[var(--surface-alt)] flex items-center justify-center text-[var(--text-primary)]">
              <PieChart className="w-4 h-4 text-stone-700 dark:text-stone-200" />
            </div>
          </div>
          
          <div className="w-full">
            <div className="flex justify-between font-mono-code text-xs mb-2">
              <span className="text-[#07006c] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#07006c]" />
                {t.womenLabel} ({femalePct}%)
              </span>
              <span className="text-[var(--accent-dark)] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--surface-highlight)] border border-[var(--accent-dark)]/20" />
                {t.menLabel} ({malePct}%)
              </span>
            </div>

            {/* Segmented bar chart matching screenshot */}
            <div className="w-full h-3 rounded-full flex overflow-hidden bg-stone-100 dark:bg-stone-800 p-0.5 gap-0.5">
              <div
                className="bg-[#07006c] h-full rounded-l-full transition-all duration-500"
                style={{ width: `${femalePct}%` }}
                title={`Femmes / Women: ${femalePct}%`}
              />
              <div
                className="bg-[var(--surface-highlight)] h-full rounded-r-full transition-all duration-500"
                style={{ width: `${malePct}%` }}
                title={`Hommes / Men: ${malePct}%`}
              />
            </div>
          </div>
        </SpotlightCard>
      </section>

      {/* Next Reminders List Section (matching Image 5 table) */}
      <section className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[var(--border-color)]/40 flex justify-between items-center bg-[var(--surface)]">
          <div>
            <h3 className="font-headline font-bold text-lg text-[var(--text-primary)]">
              {t.nextReminders}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {t.nextRemindersSub}
            </p>
          </div>
          <button
            id="btn-view-all-reminders"
            onClick={() => onNavigate('customers')}
            className="text-[var(--accent)] hover:text-[var(--accent-dark)] hover:underline font-semibold text-xs sm:text-sm cursor-pointer"
          >
            {t.viewAll}
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)]/40 bg-[var(--bg-page)]">
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  {t.thClientName}
                </th>
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  {t.thLastService}
                </th>
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  {t.thSuggestedUpsell}
                </th>
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-right">
                  {t.thAction}
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-stone-100 dark:divide-stone-800">
              {followUpClients.slice(0, 5).map((client, index) => {
                const actionLabel = client.preferredChannel === 'SMS' ? t.sendSms : t.sendEmail;
                return (
                  <motion.tr
                    key={client.id}
                    id={`overview-row-${client.id}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.25 }}
                    className="hover:bg-[var(--bg-page)]/70 transition-colors group cursor-default"
                  >
                    {/* Client Name with Avatar */}
                    <td className="py-3.5 px-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#e5eeff] text-[var(--text-primary)] font-mono-code font-bold text-xs flex items-center justify-center border border-stone-200 dark:border-stone-700 shrink-0">
                        {client.initials}
                      </div>
                      <div>
                        <span className="font-semibold text-stone-800 dark:text-stone-100 group-hover:text-[var(--accent)] transition-colors">
                          {client.name}
                        </span>
                        <span className="block text-[11px] text-stone-400 dark:text-stone-500">
                          {client.phone}
                        </span>
                      </div>
                    </td>

                    {/* Last Service */}
                    <td className="py-3.5 px-6 text-stone-600 dark:text-stone-300 font-medium">
                      {client.lastService}
                    </td>

                    {/* Suggested Upsell Tag */}
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--surface-highlight)]/25 text-[var(--accent-dark)] font-medium text-xs border border-[var(--surface-highlight)]/50">
                        <Tag className="w-3 h-3 text-[var(--accent)]" />
                        <span>{client.suggestedUpsell}</span>
                      </span>
                    </td>

                    {/* Action Button with Hover Arrow */}
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => onQuickRelance(client, client.preferredChannel)}
                        className="inline-flex items-center gap-1 text-[var(--accent)] hover:text-[var(--accent-dark)] font-semibold text-xs sm:text-sm group-hover:translate-x-0.5 transition-all cursor-pointer"
                      >
                        <span>{actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  );
};
