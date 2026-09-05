import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ListFilter,
  Mail,
  MessageSquare,
  MessageCircle,
  Clock,
  Filter,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { Bell } from 'lucide-react';
import { Client, TimelineItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { AnimatedTabs } from './ui/AnimatedTabs';

interface ScheduleScreenProps {
  timeline: TimelineItem[];
  clients: Client[];
  onTriggerItem?: (item: TimelineItem) => void;
  onNewScheduleItem?: () => void;
  onSelectClientReminder?: (client: Client) => void;
}

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({
  timeline,
  clients,
  onTriggerItem,
  onNewScheduleItem,
  onSelectClientReminder
}) => {
  const { language, t } = useLanguage();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedChannel, setSelectedChannel] = useState<string>('All');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past 7 Days' | 'Drafts'>('Upcoming');
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);

  // Mois affiché dans la vue calendrier, relatif au mois courant
  const calendarMonthDate = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + calendarMonthOffset);
    return d;
  }, [calendarMonthOffset]);

  const calendarMonthLabel = useMemo(() => {
    const label = calendarMonthDate.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'long',
      year: 'numeric'
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [calendarMonthDate, language]);

  // Grille du mois construite à partir des vraies dates d'échéance (scheduledAt),
  // semaine démarrant le lundi pour correspondre à l'en-tête LUN..DIM.
  const calendarCells = useMemo(() => {
    const year = calendarMonthDate.getFullYear();
    const month = calendarMonthDate.getMonth();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const itemsByDay = new Map<number, TimelineItem[]>();
    timeline.forEach((item) => {
      const d = new Date(item.scheduledAt);
      if (Number.isNaN(d.getTime()) || d.getFullYear() !== year || d.getMonth() !== month) return;
      const list = itemsByDay.get(d.getDate()) || [];
      list.push(item);
      itemsByDay.set(d.getDate(), list);
    });

    // Rappels manuels obligatoires : marqués séparément des relances déjà
    // envoyées/planifiées, pour rester visuellement distincts sur le calendrier.
    const remindersByDay = new Map<number, Client[]>();
    clients.forEach((client) => {
      if (!client.nextReminderDate) return;
      const d = new Date(client.nextReminderDate);
      if (Number.isNaN(d.getTime()) || d.getFullYear() !== year || d.getMonth() !== month) return;
      const list = remindersByDay.get(d.getDate()) || [];
      list.push(client);
      remindersByDay.set(d.getDate(), list);
    });

    const today = new Date();
    const cells: ({ day: number; isToday: boolean; items: TimelineItem[]; reminders: Client[] } | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({
        day,
        isToday: today.getFullYear() === year && today.getMonth() === month && today.getDate() === day,
        items: itemsByDay.get(day) || [],
        reminders: remindersByDay.get(day) || []
      });
    }
    return cells;
  }, [calendarMonthDate, timeline, clients]);

  // Filtered timeline
  const filteredTimeline = timeline.filter((item) => {
    const matchChannel =
      selectedChannel === 'All' || item.channel === selectedChannel;
    const matchClient =
      selectedClientFilter === 'All' ||
      item.targetClient.toLowerCase().includes(selectedClientFilter.toLowerCase());
    const matchTab = item.status === activeTab;

    return matchChannel && matchClient && matchTab;
  });

  // Group by date
  const groups: { [key: string]: TimelineItem[] } = {};
  filteredTimeline.forEach((item) => {
    if (!groups[item.dateGroup]) {
      groups[item.dateGroup] = [];
    }
    groups[item.dateGroup].push(item);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Header Section matching Image 7 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            {t.scheduleTitle}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            {t.scheduleSubtitle}
          </p>
        </div>

        {/* View Toggle: Calendar View / List View matching Image 7 */}
        <div className="flex items-center bg-[var(--surface)] border border-[var(--border-color)]/70 rounded-lg p-0.5 shadow-2xs self-start sm:self-auto">
          <button
            id="btn-calendar-view"
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-[var(--surface-highlight)]/40 text-[var(--accent-dark)]'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 hover:dark:text-stone-50'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{t.calendarViewBtn}</span>
          </button>

          <button
            id="btn-list-view"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[var(--accent)] text-white shadow-2xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 hover:dark:text-stone-50'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>{t.listViewBtn}</span>
          </button>
        </div>
      </div>

      {/* Filter Row matching Image 7 */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Message Types Filter */}
          <div className="relative">
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full bg-[var(--bg-page)] border border-[var(--border-color)]/70 rounded-lg px-3.5 py-2 text-xs font-medium text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[var(--surface-highlight)] cursor-pointer"
            >
              <option value="All">{t.allMessageTypes} ⌵</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="SMS">{t.smsOnly}</option>
              <option value="Email">{t.emailOnly}</option>
            </select>
          </div>

          {/* All Clients Filter */}
          <div className="relative">
            <select
              value={selectedClientFilter}
              onChange={(e) => setSelectedClientFilter(e.target.value)}
              className="w-full bg-[var(--bg-page)] border border-[var(--border-color)]/70 rounded-lg px-3.5 py-2 text-xs font-medium text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[var(--surface-highlight)] cursor-pointer"
            >
              <option value="All">{t.allClientsOption} ⌵</option>
              <option value="Valérie">Valérie Martin</option>
              <option value="Thomas">Thomas Dubois</option>
              <option value="Camille">Camille Leroy</option>
              <option value="Alexandre">Alexandre Petit</option>
              <option value="Sarah">Sarah Benali</option>
            </select>
          </div>
        </div>

        {/* Tab Pills: Upcoming | Past 7 Days | Drafts matching Image 7 */}
        <div className="pt-1 border-t border-stone-100 dark:border-stone-800">
          <AnimatedTabs
            layoutId="schedule-status-tab"
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as any)}
            tabs={[
              { id: 'Upcoming', label: t.tabUpcoming },
              { id: 'Past 7 Days', label: t.tabPast7Days },
              { id: 'Drafts', label: t.tabDrafts }
            ]}
          />
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'list' ? (
        <div className="space-y-6">
          {Object.keys(groups).length === 0 ? (
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 p-12 text-center text-stone-400 dark:text-stone-500">
              <Clock className="w-8 h-8 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
              <p className="font-medium text-stone-600 dark:text-stone-300">{t.noTimelineItems}</p>
              <p className="text-xs text-stone-400 dark:text-stone-500">{t.noTimelineSub}</p>
            </div>
          ) : (
            Object.entries(groups).map(([dateGroup, items]) => (
              <div key={dateGroup} className="space-y-3">
                {/* Date Group Header, sticky while its items scroll past */}
                <div className="sticky top-16 z-10 -mx-1 px-1 py-1 bg-[var(--bg-page)]/90 backdrop-blur-sm flex items-center gap-2 font-mono-code text-xs font-semibold text-stone-600 dark:text-stone-300 tracking-wider">
                  <span className="w-1 h-3.5 bg-[var(--accent)] rounded-full" />
                  <span>{dateGroup}</span>
                </div>

                {/* Items List, laid out along a vertical timeline beam */}
                <div className="relative pl-2">
                  <div className="absolute left-[21px] top-2 bottom-2 w-px bg-stone-200 dark:bg-stone-700" aria-hidden />
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.06, duration: 0.25 }}
                        className="relative bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow group"
                      >
                        <span className="absolute left-[17px] top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--accent)] ring-2 ring-[var(--bg-page)]" aria-hidden />
                        <div className="flex items-start gap-4 pl-4">
                          {/* Channel Icon Box */}
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                              item.channel === 'WhatsApp'
                                ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-700'
                                : item.channel === 'Email'
                                ? 'bg-[var(--surface-highlight)]/30 text-[var(--accent)]'
                                : 'bg-[#dce9ff] text-[#07006c]'
                            }`}
                          >
                            {item.channel === 'WhatsApp' ? (
                              <MessageCircle className="w-5 h-5" />
                            ) : item.channel === 'Email' ? (
                              <Mail className="w-5 h-5" />
                            ) : (
                              <MessageSquare className="w-5 h-5" />
                            )}
                          </div>

                          {/* Title & Description */}
                          <div>
                            <h4 className="font-headline font-bold text-sm sm:text-base text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                              {item.description}
                            </p>

                            {/* Client tag */}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-alt)] text-[var(--text-primary)] font-mono-code text-[11px] font-medium border border-stone-200 dark:border-stone-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                                {item.targetClient}
                              </span>
                              <span className="text-[11px] text-stone-400 dark:text-stone-500 font-mono-code">
                                • {item.channel}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Time info & Action */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100 dark:border-stone-800">
                          <span className="font-mono-code font-semibold text-xs text-stone-700 dark:text-stone-200">
                            {item.time}
                          </span>
                          <button
                            onClick={() => onTriggerItem && onTriggerItem(item)}
                            className="text-[11px] font-semibold text-[var(--accent)] hover:underline cursor-pointer flex items-center gap-1 mt-1"
                          >
                            <span>{t.detailsBtn}</span>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Calendar View mode — construite à partir des vraies échéances (scheduledAt) */
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCalendarMonthOffset((v) => v - 1)}
                className="w-7 h-7 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 hover:dark:bg-stone-900 flex items-center justify-center text-stone-500 dark:text-stone-400 cursor-pointer"
                aria-label={language === 'fr' ? 'Mois précédent' : 'Previous month'}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="font-headline font-bold text-base text-[var(--text-primary)] min-w-[9rem] text-center">
                {calendarMonthLabel}
              </h3>
              <button
                onClick={() => setCalendarMonthOffset((v) => v + 1)}
                className="w-7 h-7 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 hover:dark:bg-stone-900 flex items-center justify-center text-stone-500 dark:text-stone-400 cursor-pointer"
                aria-label={language === 'fr' ? 'Mois suivant' : 'Next month'}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              {calendarMonthOffset !== 0 && (
                <button
                  onClick={() => setCalendarMonthOffset(0)}
                  className="text-[11px] font-semibold text-[var(--accent)] hover:underline cursor-pointer"
                >
                  {language === 'fr' ? "Aujourd'hui" : 'Today'}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-800 dark:text-emerald-100 font-semibold">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 dark:bg-emerald-400 inline-block" /> WhatsApp
              </span>
              <span className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                <span className="w-2.5 h-2.5 rounded bg-[var(--surface-highlight)] inline-block" /> Email
              </span>
              <span className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                <span className="w-2.5 h-2.5 rounded bg-[#dce9ff] inline-block" /> SMS
              </span>
              <span className="flex items-center gap-1 text-[#93000a] font-semibold">
                <span className="w-2.5 h-2.5 rounded bg-[#ffdad6] inline-block" /> {t.reminderSectionLabel}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono-code text-stone-500 dark:text-stone-400 font-semibold mb-1">
            {language === 'fr' ? (
              <><span>LUN</span><span>MAR</span><span>MER</span><span>JEU</span><span>VEN</span><span>SAM</span><span>DIM</span></>
            ) : (
              <><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span></>
            )}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((cell, i) =>
              cell === null ? (
                <div key={`blank-${i}`} className="min-h-[80px]" />
              ) : (
                <div
                  key={cell.day}
                  className={`min-h-[80px] p-1.5 rounded-lg border text-left transition-all ${
                    cell.isToday
                      ? 'bg-[var(--surface-alt)] border-[var(--accent)] shadow-2xs'
                      : 'bg-[var(--surface)] border-stone-200 dark:border-stone-700 hover:border-stone-300 hover:dark:border-stone-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${cell.isToday ? 'text-[var(--accent)]' : 'text-stone-700 dark:text-stone-200'}`}>
                      {cell.day}
                    </span>
                    {cell.isToday && (
                      <span className="text-[9px] bg-[var(--accent)] text-white px-1 rounded font-mono-code font-bold">
                        {language === 'fr' ? 'Auj.' : 'Today'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {cell.items.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onTriggerItem && onTriggerItem(item)}
                        className={`text-[10px] truncate px-1 py-0.5 rounded font-semibold cursor-pointer ${
                          item.channel === 'WhatsApp'
                            ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100'
                            : item.channel === 'Email'
                            ? 'bg-[var(--surface-highlight)]/40 text-[var(--accent-dark)]'
                            : 'bg-[#dce9ff] text-[#07006c]'
                        }`}
                        title={`${item.title} — ${item.targetClient}`}
                      >
                        {item.title}
                      </div>
                    ))}
                    {cell.items.length > 2 && (
                      <div className="text-[10px] text-stone-400 dark:text-stone-500 font-mono-code px-1">
                        +{cell.items.length - 2}
                      </div>
                    )}
                    {cell.reminders.map((client) => (
                      <div
                        key={client.id}
                        onClick={() => onSelectClientReminder && onSelectClientReminder(client)}
                        className="flex items-center gap-1 text-[10px] truncate px-1 py-0.5 rounded font-semibold cursor-pointer bg-[#ffdad6] text-[#93000a]"
                        title={`${t.reminderSectionLabel} — ${client.prefix} ${client.name}${client.nextReminderNote ? ` (${client.nextReminderNote})` : ''}`}
                      >
                        <Bell className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{client.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};
