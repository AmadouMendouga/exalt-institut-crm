import React, { useState } from 'react';
import { Lock, Mail, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { StatefulButton } from './ui/StatefulButton';
import exaltLogo from '../../assets/06_Exalt_marron_transparent.png';

export const LoginScreen: React.FC = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'idle') return;
    setError(null);
    setStatus('loading');
    try {
      await login(email, password);
      setStatus('success');
    } catch {
      setError(t.loginError);
      setStatus('idle');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--bg-page)] p-4 overflow-hidden">
      {/* Subtle brand-tinted dot grid backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: 'radial-gradient(circle, #d9c9be 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 60% 50% at 50% 40%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 40%, black 40%, transparent 100%)',
        }}
      />
      <div
        aria-hidden
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[560px] h-[360px] rounded-full bg-[var(--surface-highlight)]/30 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 24, stiffness: 260 }}
        className="relative w-full max-w-sm bg-[var(--surface)] rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 p-8"
      >
        <div className="flex flex-col items-center gap-3 mb-6">
          <img src={exaltLogo} alt="Exalt Beauty" className="w-full max-w-[220px] h-auto" />
          <div className="text-center">
            <h1 className="font-headline font-bold text-xl text-[var(--text-primary)]">{t.loginTitle}</h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{t.loginSubtitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
              {t.emailLabel}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg pl-9 pr-3 py-2.5 text-sm text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-[var(--surface-highlight)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
              {t.passwordLabel}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--bg-page)] border border-stone-300 dark:border-stone-600 rounded-lg pl-9 pr-3 py-2.5 text-sm text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-[var(--surface-highlight)] focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-[#93000a] bg-[#ffdad6] border border-[#ffdad6] rounded-lg px-3 py-2"
            >
              {error}
            </motion.p>
          )}

          <StatefulButton
            type="submit"
            status={status}
            loadingText={t.loggingIn}
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white py-2.5 rounded-xl text-sm font-semibold shadow-xs cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{t.loginButton}</span>
          </StatefulButton>
        </form>
      </motion.div>
    </div>
  );
};
