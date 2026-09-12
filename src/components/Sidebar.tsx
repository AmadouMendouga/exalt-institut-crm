import React from 'react';
import {
  LayoutGrid,
  Users,
  Bot,
  Calendar,
  BarChart3,
  HelpCircle,
  LogOut,
  Plus,
  Sparkles,
  Globe,
  Star,
  CalendarClock,
  Target,
  Cake
} from 'lucide-react';
import { motion } from 'motion/react';
import { NavScreen } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import exaltLogo from '../../assets/06_Exalt_marron_transparent.png';

interface SidebarProps {
  currentScreen: NavScreen;
  onNavigate: (screen: NavScreen) => void;
  onOpenNewAutomation: () => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  onOpenNewAutomation,
}) => {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'overview' as NavScreen, label: t.navOverview, icon: LayoutGrid },
    { id: 'customers' as NavScreen, label: t.navCustomers, icon: Users },
    { id: 'prospects' as NavScreen, label: t.navProspects, icon: Target },
    { id: 'services' as NavScreen, label: t.navServices, icon: Sparkles },
    { id: 'automations' as NavScreen, label: t.navAutomations, icon: Bot },
    { id: 'schedule' as NavScreen, label: t.navSchedule, icon: Calendar },
    { id: 'appointments' as NavScreen, label: t.navAppointments, icon: CalendarClock },
    { id: 'birthdaySubmissions' as NavScreen, label: t.navBirthdaySubmissions, icon: Cake },
    { id: 'analytics' as NavScreen, label: t.navAnalytics, icon: BarChart3 },
    { id: 'reviews' as NavScreen, label: t.navReviews, icon: Star },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[260px] lg:w-[280px] bg-[var(--surface-alt)] border-r border-[var(--border-color)]/50 py-6 px-4 z-40 shadow-sm select-none">
        {/* Brand Header */}
        <div className="px-2 mb-7">
          <img src={exaltLogo} alt="Exalt Beauty" className="w-full max-w-[190px] h-auto" />
        </div>

        {/* CTA Button */}
        <div className="mb-6">
          <button
            id="btn-new-automation-sidebar"
            onClick={onOpenNewAutomation}
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent-dark)] active:scale-[0.98] text-white font-medium text-sm py-2.5 px-4 rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
            <span>{t.newAutomation}</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors duration-150 cursor-pointer text-left ${
                  isActive ? 'text-[var(--accent-dark)] font-semibold' : 'text-stone-600 dark:text-stone-300 hover:bg-[var(--surface)]/80 hover:text-stone-900 hover:dark:text-stone-50'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-desktop-active"
                    className="absolute inset-0 bg-[var(--surface-highlight)] rounded-xl shadow-xs"
                    transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                  />
                )}
                <Icon className={`relative w-4 h-4 ${isActive ? 'text-[var(--accent-dark)]' : 'text-stone-500 dark:text-stone-400'}`} />
                <span className="relative flex-1">{item.label}</span>
                {item.id === 'automations' && (
                  <span className="relative w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Language Switcher & System Footer Links */}
        <div className="pt-3 border-t border-[var(--border-color)]/50 space-y-2 mt-auto">
          {/* Language Selector */}
          <div className="bg-[var(--surface)]/70 border border-[var(--border-color)]/50 rounded-xl p-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2 px-2 text-xs font-semibold text-stone-600 dark:text-stone-300">
              <Globe className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="text-[11px] font-mono-code uppercase">Langue / Lang</span>
            </div>
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setLanguage('fr')}
                className={`px-2 py-1 rounded font-semibold text-[11px] transition-all cursor-pointer ${
                  language === 'fr'
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 hover:dark:text-stone-100'
                }`}
              >
                FR 🇫🇷
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded font-semibold text-[11px] transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 hover:dark:text-stone-100'
                }`}
              >
                EN 🇬🇧
              </button>
            </div>
          </div>

          <button
            id="nav-link-help"
            onClick={() => alert(t.helpAlert)}
            className="w-full flex items-center gap-3 px-3.5 py-1.5 text-stone-500 dark:text-stone-400 hover:text-stone-800 hover:dark:text-stone-100 hover:bg-[var(--surface)]/60 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left"
          >
            <HelpCircle className="w-4 h-4 text-stone-400 dark:text-stone-500" />
            <span>{t.navHelp}</span>
          </button>
          <button
            id="nav-link-logout"
            onClick={() => logout()}
            title={user ? `${t.sessionActive} ${user.email}` : undefined}
            className="w-full flex items-center gap-3 px-3.5 py-1.5 text-stone-500 dark:text-stone-400 hover:text-rose-600 hover:dark:text-rose-300 hover:bg-rose-50 hover:dark:bg-rose-900 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4 text-stone-400 dark:text-stone-500" />
            <span>{t.navLogout}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation — inspirée de la barre d'outils Canva : icônes
          plates, défilement horizontal si ça déborde, indicateur discret plutôt
          qu'une pastille de fond, colonnes de largeur égale. */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[var(--surface)]/95 backdrop-blur border-t border-[var(--border-color)]/60 z-50 shadow-lg">
        <div className="flex items-stretch gap-1 overflow-x-auto no-scrollbar px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="relative flex-1 min-w-[74px] flex flex-col items-center justify-center gap-1 py-2.5 px-2.5 text-[10px] font-medium cursor-pointer"
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-[var(--accent)]' : 'text-stone-400 dark:text-stone-500'
                  }`}
                />
                <span
                  className={`transition-colors truncate max-w-full ${
                    isActive ? 'text-[var(--accent-dark)] font-semibold' : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-mobile-active"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[var(--accent)]"
                    transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
