import React from 'react';
import { Pencil, Trash2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Service } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ServicesScreenProps {
  services: Service[];
  onOpenAddService: () => void;
  onEditService: (service: Service) => void;
  onDeleteService: (service: Service) => void;
}

const formatFCFA = (value: number) => `${value.toLocaleString('fr-FR')} FCFA`;

export const ServicesScreen: React.FC<ServicesScreenProps> = ({
  services,
  onOpenAddService,
  onEditService,
  onDeleteService
}) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            {t.servicesTitle}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            {t.servicesSubtitle}
          </p>
        </div>

        <button
          onClick={onOpenAddService}
          className="self-start sm:self-auto bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white text-xs sm:text-sm font-semibold py-2 px-3.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.addServiceBtn}</span>
        </button>
      </div>

      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 overflow-hidden shadow-xs">
        {services.length === 0 ? (
          <div className="p-12 text-center text-stone-400 dark:text-stone-500">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
            <p className="font-medium text-stone-600 dark:text-stone-300">{t.noServicesItems}</p>
            <p className="text-xs text-stone-400 dark:text-stone-500">{t.noServicesSub}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-[var(--border-color)]/40 bg-[var(--bg-page)]">
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  {t.thServiceName}
                </th>
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  {t.thServiceCategory}
                </th>
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  {t.thServicePrice}
                </th>
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-right">
                  {t.thActions}
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b border-[var(--border-color)]/30 last:border-0 hover:bg-[var(--surface-alt)]/40 transition-colors">
                  <td className="py-3.5 px-6 font-medium text-sm text-[var(--text-primary)]">
                    <div className="flex items-center gap-3">
                      {service.imageUrl ? (
                        <img src={service.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[var(--surface-alt)] shrink-0" />
                      )}
                      <span>{service.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--surface-alt)] text-[var(--accent-dark)]">
                      {service.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 font-mono-code text-sm text-stone-700 dark:text-stone-200">
                    {formatFCFA(service.price)}
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEditService(service)}
                        className="w-8 h-8 rounded-lg text-stone-500 dark:text-stone-400 hover:text-[var(--accent-dark)] hover:bg-[var(--surface-alt)] flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteService(service)}
                        className="w-8 h-8 rounded-lg text-stone-500 dark:text-stone-400 hover:text-rose-600 hover:dark:text-rose-300 hover:bg-rose-50 hover:dark:bg-rose-900 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};
