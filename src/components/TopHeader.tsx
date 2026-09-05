import React from 'react';
import { Bell, Search, Sparkles, ChevronDown, CheckCircle2, Globe, Sun, Moon, MonitorSmartphone, AlarmClock, Check } from 'lucide-react';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { NavScreen, TimelineItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getReminderLeadHours, setReminderLeadHours, REMINDER_LEAD_HOURS_OPTIONS, ReminderLeadHours } from '../lib/reminderSettings';
import exaltLogo from '../../assets/06_Exalt_marron_transparent.png';

interface TopHeaderProps {
  currentScreen: NavScreen;
  timeline: TimelineItem[];
  onNavigate: (screen: NavScreen) => void;
  onOpenNewAutomation: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentScreen,
  timeline,
  onNavigate,
  onOpenNewAutomation
}) => {
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [leadTimeOpen, setLeadTimeOpen] = React.useState(false);
  const [leadHours, setLeadHours] = React.useState<ReminderLeadHours>(getReminderLeadHours);
  const { language, setLanguage, toggleLanguage, t } = useLanguage();
  const { user } = useAuth();
  const { themePreference, cycleTheme } = useTheme();

  const leadTimeLabel = (hours: ReminderLeadHours) => {
    if (hours === 0) return language === 'fr' ? "Le jour même" : 'On the day';
    if (hours === 72) return language === 'fr' ? '3 jours avant' : '3 days before';
    return language === 'fr' ? `${hours}h avant` : `${hours}h before`;
  };

  const ThemeIcon = themePreference === 'dark' ? Moon : themePreference === 'light' ? Sun : MonitorSmartphone;
  const themeLabel =
    themePreference === 'dark'
      ? (language === 'fr' ? 'Sombre' : 'Dark')
      : themePreference === 'light'
      ? (language === 'fr' ? 'Clair' : 'Light')
      : (language === 'fr' ? 'Automatique' : 'Automatic');

  const { scrollY } = useScroll();
  const headerShadow = useTransform(
    scrollY,
    [0, 60],
    ['0 0px 0px rgba(11,28,48,0)', '0 8px 20px rgba(11,28,48,0.08)']
  );
  const headerBg = useTransform(scrollY, [0, 60], ['rgba(248,249,255,0)', 'rgba(248,249,255,0.92)']);

  return (
    <motion.div
      className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 py-3 backdrop-blur-md flex items-center justify-between gap-4"
      style={{ boxShadow: headerShadow, backgroundColor: headerBg }}
    >
      {/* Mobile brand header if on small screen */}
      <div className="md:hidden flex items-center gap-2">
        <img src={exaltLogo} alt="Exalt Beauty" className="h-9 w-auto" />
      </div>

      <div className="hidden md:block">
        {/* Spacer for alignment */}
      </div>

      {/* Right side controls: Language switcher, Notification bell, User avatar */}
      <div className="flex items-center gap-2.5 sm:gap-3 ml-auto relative">
        {/* Language Switcher Pill in Top Bar */}
        <div className="flex items-center bg-[var(--surface)] border border-[var(--border-color)]/60 p-1 rounded-xl shadow-2xs">
          <button
            type="button"
            onClick={() => setLanguage('fr')}
            title="Français"
            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              language === 'fr'
                ? 'bg-[var(--accent)] text-white shadow-2xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 hover:dark:text-stone-100'
            }`}
          >
            <span>🇫🇷</span>
            <span className="hidden sm:inline">FR</span>
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            title="English"
            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-[var(--accent)] text-white shadow-2xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 hover:dark:text-stone-100'
            }`}
          >
            <span>🇬🇧</span>
            <span className="hidden sm:inline">EN</span>
          </button>
        </div>

        {/* Quick Trigger Button for quick action */}
        <button
          onClick={onOpenNewAutomation}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--surface-highlight)]/40 text-[var(--accent-dark)] hover:bg-[var(--surface-highlight)]/70 border border-[var(--surface-highlight)] transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.quickRelanceAI}</span>
        </button>

        {/* Theme Toggle: system → light → dark → system */}
        <button
          type="button"
          onClick={cycleTheme}
          title={themeLabel}
          aria-label={themeLabel}
          className="touch-manipulation w-9 h-9 rounded-full bg-[var(--surface)] hover:bg-stone-100 hover:dark:bg-stone-800 border border-[var(--border-color)]/60 flex items-center justify-center text-stone-600 dark:text-stone-300 transition-colors cursor-pointer shadow-xs"
        >
          <ThemeIcon className="w-4 h-4 pointer-events-none" />
        </button>

        {/* Reminder Lead Time Setting */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLeadTimeOpen(!leadTimeOpen)}
            title={language === 'fr' ? 'Délai du rappel' : 'Reminder lead time'}
            aria-label={language === 'fr' ? 'Délai du rappel' : 'Reminder lead time'}
            className="touch-manipulation w-9 h-9 rounded-full bg-[var(--surface)] hover:bg-stone-100 hover:dark:bg-stone-800 border border-[var(--border-color)]/60 flex items-center justify-center text-stone-600 dark:text-stone-300 transition-colors cursor-pointer shadow-xs"
          >
            <AlarmClock className="w-4 h-4 pointer-events-none" />
          </button>

          <AnimatePresence>
            {leadTimeOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 bg-[var(--surface)] rounded-xl shadow-xl border border-[var(--border-color)]/60 p-2 z-50"
              >
                <p className="px-2 py-1.5 text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  {language === 'fr' ? 'Alerte de rappel' : 'Reminder alert'}
                </p>
                {REMINDER_LEAD_HOURS_OPTIONS.map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => {
                      setReminderLeadHours(hours);
                      setLeadHours(hours);
                      setLeadTimeOpen(false);
                    }}
                    className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-sm text-stone-700 dark:text-stone-200 hover:bg-[var(--surface-alt)] transition-colors cursor-pointer text-left"
                  >
                    <span>{leadTimeLabel(hours)}</span>
                    {leadHours === hours && <Check className="w-3.5 h-3.5 text-[var(--accent)]" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            id="btn-notifications-bell"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="touch-manipulation w-9 h-9 rounded-full bg-[var(--surface)] hover:bg-stone-100 hover:dark:bg-stone-800 border border-[var(--border-color)]/60 flex items-center justify-center text-stone-600 dark:text-stone-300 transition-colors relative cursor-pointer shadow-xs"
            aria-label={t.notificationsTitle}
          >
            <Bell className="w-4 h-4 pointer-events-none" />
            {timeline.length > 0 && (
              <>
                <span className="pointer-events-none absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 dark:bg-rose-400 ring-2 ring-white animate-ping" />
                <span className="pointer-events-none absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 dark:bg-rose-400 ring-2 ring-white" />
              </>
            )}
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 bg-[var(--surface)] rounded-xl shadow-xl border border-[var(--border-color)]/60 p-3 z-50"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800 mb-2">
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-100 uppercase tracking-wider">
                    {t.notificationsTitle}
                  </span>
                  {timeline.length > 0 && (
                    <span className="text-[10px] bg-[var(--surface-highlight)] text-[var(--accent-dark)] px-1.5 py-0.5 rounded-full font-bold">
                      {Math.min(timeline.length, 3)} {t.newBadge}
                    </span>
                  )}
                </div>
                {timeline.length === 0 ? (
                  <p className="text-xs text-stone-400 dark:text-stone-500 py-4 text-center">
                    {language === 'fr' ? 'Aucune notification pour le moment.' : 'No notifications yet.'}
                  </p>
                ) : (
                  <div className="space-y-2 text-xs">
                    {timeline.slice(0, 3).map((item) => (
                      <div key={item.id} className="p-2 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-stone-700 dark:text-stone-200">
                        <p className="font-semibold text-stone-900 dark:text-stone-50">
                          {item.title}
                        </p>
                        <p className="text-stone-500 dark:text-stone-400 text-[11px]">
                          {item.targetClient} · {item.channel}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-stone-200 dark:border-stone-700">
          <div className="w-9 h-9 rounded-full ring-2 ring-[var(--accent)]/20 overflow-hidden bg-[var(--accent)] text-white flex items-center justify-center font-semibold text-xs cursor-pointer">
            {(user?.name || user?.email || '?').slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-stone-800 dark:text-stone-100 leading-tight">{user?.name || user?.email}</p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">{t.userRole}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
