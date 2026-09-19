import React, { useMemo, useState } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  SlidersHorizontal,
  AlertCircle,
  AlertTriangle,
  Send,
  UserCheck,
  XCircle,
  Trash2,
  Waves,
  MessageCircle,
  MessageSquare,
  CheckCircle2,
  Download,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Prospect, ProspectStatus } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { downloadCsv } from '../lib/exportCsv';
import { downloadProfessionalExcel } from '../lib/exportExcel';

interface ProspectsScreenProps {
  prospects: Prospect[];
  onOpenAddProspect: () => void;
  onRelance: (prospect: Prospect) => void;
  onConvert: (prospect: Prospect) => void;
  onMarkNotInterested: (prospect: Prospect) => void;
  onDelete: (prospect: Prospect) => void;
  onBulkRelance?: (prospects: Prospect[]) => void;
}

const STATUS_STYLES: Record<ProspectStatus, string> = {
  new: 'bg-[#ffdad6] text-[#93000a] border border-[#ba1a1a]/20',
  contacted: 'bg-[#dce9ff] text-[var(--text-primary)] border border-blue-200 dark:border-blue-700',
  converted: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700',
  not_interested: 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700'
};

const ALL_STATUSES: ProspectStatus[] = ['new', 'contacted', 'converted', 'not_interested'];
const NO_WAVE = '__no_wave__';

function parseProspectedDate(value: string): Date | null {
  const raw = value.trim();
  const fr = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (fr) {
    const [, d, m, y] = fr;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  const safeIso = raw.replace(/(\.\d{3})\d+/, '$1');
  const parsed = new Date(safeIso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function daysSinceProspected(value: string): number | '' {
  const parsed = parseProspectedDate(value);
  if (!parsed) return '';
  const start = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.max(0, Math.floor((today - start) / 86400000));
}

// Pagination compacte : numéros pleins jusqu'à 7 pages, sinon 1, 2 … voisins de la
// page courante … dernière, pour ne jamais déborder même avec des centaines d'entrées.
function getPageList(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const keep = new Set<number>([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = Array.from(keep).filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | 'ellipsis')[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push('ellipsis');
    result.push(p);
    prev = p;
  }
  return result;
}

export const ProspectsScreen: React.FC<ProspectsScreenProps> = ({
  prospects,
  onOpenAddProspect,
  onRelance,
  onConvert,
  onMarkNotInterested,
  onDelete,
  onBulkRelance
}) => {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<Set<ProspectStatus>>(new Set());
  const [selectedWaves, setSelectedWaves] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const itemsPerPage = 15;

  const statusLabel = (status: ProspectStatus): string => {
    switch (status) {
      case 'new': return t.prospectStatusNew;
      case 'contacted': return t.prospectStatusContacted;
      case 'converted': return t.prospectStatusConverted;
      case 'not_interested': return t.prospectStatusNotInterested;
      default: return status;
    }
  };

  const availableWaves = useMemo(() => {
    const set = new Set<string>();
    let hasNoWave = false;
    prospects.forEach((p) => (p.wave ? set.add(p.wave) : (hasNoWave = true)));
    const sorted = Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    return hasNoWave ? [...sorted, NO_WAVE] : sorted;
  }, [prospects]);

  const activeFilterCount = selectedStatuses.size + selectedWaves.size;

  const toggleStatus = (status: ProspectStatus) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
    setCurrentPage(1);
  };

  const toggleWave = (wave: string) => {
    setSelectedWaves((prev) => {
      const next = new Set(prev);
      if (next.has(wave)) next.delete(wave);
      else next.add(wave);
      return next;
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedStatuses(new Set());
    setSelectedWaves(new Set());
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    return prospects.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        (p.source || '').toLowerCase().includes(q) ||
        (p.wave || '').toLowerCase().includes(q);
      const matchStatus = selectedStatuses.size === 0 || selectedStatuses.has(p.status);
      const matchWave = selectedWaves.size === 0 || selectedWaves.has(p.wave || NO_WAVE);
      return matchSearch && matchStatus && matchWave;
    });
  }, [prospects, searchQuery, selectedStatuses, selectedWaves]);

  const resultLabel = (result: Prospect['lastRelanceStatus']) => {
    if (!result) return '';
    if (language === 'en') return result;
    return result === 'sent' ? 'Envoyé' : 'Échec';
  };

  const handleExportCsv = () => {
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(
      `prospects-exalt-${date}.csv`,
      [
        { label: 'Nom', value: (p: Prospect) => p.name },
        { label: 'Civilité', value: (p: Prospect) => p.civility || '' },
        { label: 'Téléphone', value: (p: Prospect) => p.phone },
        { label: 'Date de prospection', value: (p: Prospect) => p.prospectedDate },
        { label: 'Source', value: (p: Prospect) => p.source || '' },
        { label: 'Vague', value: (p: Prospect) => p.wave || '' },
        { label: 'Statut', value: (p: Prospect) => statusLabel(p.status) },
        { label: 'Dernière relance', value: (p: Prospect) => p.lastRelanceAt || '' },
        { label: 'Canal de relance', value: (p: Prospect) => p.lastRelanceChannel || '' },
        { label: 'Résultat relance', value: (p: Prospect) => resultLabel(p.lastRelanceStatus) },
        { label: 'Jours depuis prospection', value: (p: Prospect) => daysSinceProspected(p.prospectedDate) },
        { label: 'Converti ?', value: (p: Prospect) => p.status === 'converted' ? 'Oui' : 'Non' },
        { label: 'Notes', value: (p: Prospect) => p.notes || '' },
        { label: 'Date de création', value: (p: Prospect) => p.createdAt },
        { label: 'Dernière modification', value: (p: Prospect) => p.updatedAt },
        { label: 'ID Prospect', value: (p: Prospect) => p.id },
        { label: 'ID Client converti', value: (p: Prospect) => p.convertedClientId || '' },
      ],
      filtered
    );
  };

  const handleExportExcel = () => {
    const date = new Date().toISOString().slice(0, 10);
    const total = filtered.length;
    const newCount = filtered.filter((p) => p.status === 'new').length;
    const contactedCount = filtered.filter((p) => p.status === 'contacted').length;
    const convertedCount = filtered.filter((p) => p.status === 'converted').length;
    const notInterestedCount = filtered.filter((p) => p.status === 'not_interested').length;
    const sentCount = filtered.filter((p) => p.lastRelanceStatus === 'sent').length;
    const failedCount = filtered.filter((p) => p.lastRelanceStatus === 'failed').length;

    const sourceCounts = Array.from(
      filtered.reduce((map, p) => {
        const label = p.source || 'Non renseignée';
        map.set(label, (map.get(label) || 0) + 1);
        return map;
      }, new Map<string, number>())
    ).sort((a, b) => b[1] - a[1]);

    const waveCounts = Array.from(
      filtered.reduce((map, p) => {
        const label = p.wave || 'Sans vague';
        map.set(label, (map.get(label) || 0) + 1);
        return map;
      }, new Map<string, number>())
    ).sort((a, b) => b[1] - a[1]);

    downloadProfessionalExcel({
      filename: `prospects-exalt-${date}.xlsx`,
      dataSheetName: 'Prospects',
      tableName: 'ProspectsExalt',
      rows: filtered,
      columns: [
        { header: 'Nom', width: 24, value: (p: Prospect) => p.name },
        { header: 'Civilité', width: 11, value: (p: Prospect) => p.civility || '' },
        { header: 'Téléphone', width: 19, value: (p: Prospect) => p.phone },
        { header: 'Date de prospection', width: 19, kind: 'date', value: (p: Prospect) => p.prospectedDate },
        { header: 'Source', width: 28, value: (p: Prospect) => p.source || '' },
        { header: 'Vague', width: 18, value: (p: Prospect) => p.wave || '' },
        {
          header: 'Statut',
          width: 20,
          value: (p: Prospect) => statusLabel(p.status),
          style: (p: Prospect) => p.status,
        },
        { header: 'Dernière relance', width: 21, kind: 'datetime', value: (p: Prospect) => p.lastRelanceAt || '' },
        { header: 'Canal de relance', width: 18, value: (p: Prospect) => p.lastRelanceChannel || '' },
        {
          header: 'Résultat relance',
          width: 18,
          value: (p: Prospect) => resultLabel(p.lastRelanceStatus),
          style: (p: Prospect) =>
            p.lastRelanceStatus === 'sent' ? 'sent' :
            p.lastRelanceStatus === 'failed' ? 'failed' :
            undefined,
        },
        { header: 'Jours depuis prospection', width: 22, kind: 'number', value: (p: Prospect) => daysSinceProspected(p.prospectedDate) },
        {
          header: 'Converti ?',
          width: 13,
          value: (p: Prospect) => p.status === 'converted' ? 'Oui' : 'Non',
          style: (p: Prospect) => p.status === 'converted' ? 'converted' : undefined,
        },
        { header: 'Notes', width: 38, wrap: true, value: (p: Prospect) => p.notes || '' },
        { header: 'Date de création', width: 21, kind: 'datetime', value: (p: Prospect) => p.createdAt },
        { header: 'Dernière modification', width: 21, kind: 'datetime', value: (p: Prospect) => p.updatedAt },
        { header: 'ID Prospect', width: 38, value: (p: Prospect) => p.id },
        { header: 'ID Client converti', width: 38, value: (p: Prospect) => p.convertedClientId || '' },
      ],
      summaryTitle: language === 'fr' ? 'Résumé analytique — Prospects' : 'Analytical summary — Prospects',
      summaryMetrics: [
        { label: 'Total prospects', value: total },
        { label: 'Nouveaux', value: newCount },
        { label: 'Contactés', value: contactedCount },
        { label: 'Convertis', value: convertedCount },
        { label: 'Non intéressés', value: notInterestedCount },
        { label: 'Taux de conversion', value: total ? convertedCount / total : 0, kind: 'percent' },
        { label: 'Relances envoyées', value: sentCount },
        { label: 'Échecs de relance', value: failedCount },
        { label: 'Sources distinctes', value: sourceCounts.length },
        { label: 'Vagues distinctes', value: waveCounts.length },
      ],
      distributions: [
        {
          title: 'Répartition par statut',
          rows: [
            { label: statusLabel('new'), count: newCount, percent: total ? newCount / total : 0, style: 'new' },
            { label: statusLabel('contacted'), count: contactedCount, percent: total ? contactedCount / total : 0, style: 'contacted' },
            { label: statusLabel('converted'), count: convertedCount, percent: total ? convertedCount / total : 0, style: 'converted' },
            { label: statusLabel('not_interested'), count: notInterestedCount, percent: total ? notInterestedCount / total : 0, style: 'not_interested' },
          ],
        },
        {
          title: 'Répartition par vague',
          rows: waveCounts.map(([label, count]) => ({
            label,
            count,
            percent: total ? count / total : 0,
          })),
        },
        {
          title: 'Répartition par source',
          rows: sourceCounts.map(([label, count]) => ({
            label,
            count,
            percent: total ? count / total : 0,
          })),
        },
      ],
      exportInfo: [
        { label: 'Export effectué le', value: new Date().toLocaleString(language === 'fr' ? 'fr-FR' : 'en-GB') },
        { label: 'Nombre de lignes exportées', value: total },
        { label: 'Recherche', value: searchQuery || 'Aucune' },
        {
          label: 'Statuts',
          value: selectedStatuses.size === 0
            ? 'Tous'
            : Array.from(selectedStatuses).map((status) => statusLabel(status)).join(', '),
        },
        {
          label: 'Vagues',
          value: selectedWaves.size === 0
            ? 'Toutes'
            : Array.from(selectedWaves).map((wave) => wave === NO_WAVE ? 'Sans vague' : wave).join(', '),
        },
        { label: 'Périmètre', value: 'Toutes les lignes correspondant aux filtres actifs, pagination ignorée' },
      ],
    });
  };

  const totalEntries = filtered.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const displayed = filtered.slice(startIndex, startIndex + itemsPerPage);
  const startEntryNumber = totalEntries === 0 ? 0 : startIndex + 1;
  const endEntryNumber = Math.min(startIndex + itemsPerPage, totalEntries);
  const pageList = getPageList(safePage, totalPages);

  // Sélection multiple pour l'envoi groupé.
  const allDisplayedSelected = displayed.length > 0 && displayed.every((p) => selectedIds.has(p.id));
  const selectedProspects = useMemo(
    () => prospects.filter((p) => selectedIds.has(p.id)),
    [prospects, selectedIds]
  );

  const toggleProspectSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllDisplayed = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allDisplayedSelected) {
        displayed.forEach((p) => next.delete(p.id));
      } else {
        displayed.forEach((p) => next.add(p.id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

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
            {t.prospectsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            {t.prospectsSubtitle}
          </p>
        </div>

        <div className="self-start sm:self-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportMenuOpen((open) => !open)}
              className="bg-[var(--surface)] border border-[var(--border-color)]/70 hover:border-[var(--accent)] text-stone-700 dark:text-stone-200 text-xs sm:text-sm font-semibold py-2 px-3.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              title={language === 'fr' ? 'Télécharger les prospects filtrés' : 'Download filtered prospects'}
            >
              <Download className="w-4 h-4" />
              <span>{language === 'fr' ? 'Télécharger' : 'Download'}</span>
              <span className="text-[10px] text-stone-400 dark:text-stone-500">({filtered.length})</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            <AnimatePresence>
              {exportMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 mt-1.5 w-72 bg-[var(--surface)] rounded-xl shadow-xl border border-[var(--border-color)]/60 p-1.5 z-40"
                >
                  <button
                    type="button"
                    onClick={() => {
                      handleExportExcel();
                      setExportMenuOpen(false);
                    }}
                    className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-[var(--surface-alt)] cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-300 shrink-0" />
                    <span>
                      <span className="block text-xs font-semibold text-[var(--text-primary)]">Excel professionnel (.xlsx)</span>
                      <span className="block text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        Couleurs, filtres, dates, résumé et informations d’export
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleExportCsv();
                      setExportMenuOpen(false);
                    }}
                    className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-[var(--surface-alt)] cursor-pointer"
                  >
                    <FileText className="w-4 h-4 mt-0.5 text-stone-500 shrink-0" />
                    <span>
                      <span className="block text-xs font-semibold text-[var(--text-primary)]">CSV brut (.csv)</span>
                      <span className="block text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        Format léger pour Python, Power BI ou import de données
                      </span>
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={onOpenAddProspect}
            className="bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white text-xs sm:text-sm font-semibold py-2 px-3.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.addProspectBtn}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[var(--surface)] border border-[var(--border-color)]/70 rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[var(--surface-highlight)] focus:border-[var(--accent)] transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 hover:dark:text-stone-300"
            >
              {t.clearSearch}
            </button>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`w-full lg:w-auto bg-[var(--surface)] border border-[var(--border-color)]/70 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-medium hover:border-stone-400 hover:dark:border-stone-500 flex items-center justify-center gap-2 shadow-2xs cursor-pointer ${
              activeFilterCount > 0 ? 'border-[var(--accent)] bg-[var(--surface-alt)] text-[var(--accent-dark)]' : 'text-stone-700 dark:text-stone-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
            <span>{t.filterByProspectStatus}</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 mt-1.5 w-64 bg-[var(--surface)] rounded-xl shadow-xl border border-[var(--border-color)]/60 p-3 z-30 max-h-96 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wider">
                    {t.thProspectStatus}
                  </span>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-[11px] text-[var(--accent)] hover:underline font-medium cursor-pointer"
                    >
                      {t.clearSearch}
                    </button>
                  )}
                </div>
                <div className="space-y-1 mb-3">
                  {ALL_STATUSES.map((st) => (
                    <label
                      key={st}
                      className="flex items-center gap-2 px-1.5 py-1 rounded text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-50 hover:dark:bg-stone-900 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStatuses.has(st)}
                        onChange={() => toggleStatus(st)}
                        className="w-3.5 h-3.5 rounded border-stone-300 dark:border-stone-600 text-[var(--accent)] focus:ring-[var(--surface-highlight)] cursor-pointer"
                      />
                      <span>{statusLabel(st)}</span>
                    </label>
                  ))}
                </div>

                {availableWaves.length > 0 && (
                  <>
                    <div className="text-[11px] font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wider mb-2 border-t border-[var(--border-color)]/40 pt-2">
                      {t.prospectWaveLabel}
                    </div>
                    <div className="space-y-1">
                      {availableWaves.map((wave) => (
                        <label
                          key={wave}
                          className="flex items-center gap-2 px-1.5 py-1 rounded text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-50 hover:dark:bg-stone-900 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedWaves.has(wave)}
                            onChange={() => toggleWave(wave)}
                            className="w-3.5 h-3.5 rounded border-stone-300 dark:border-stone-600 text-[var(--accent)] focus:ring-[var(--surface-highlight)] cursor-pointer"
                          />
                          <span>{wave === NO_WAVE ? t.prospectNoWave : wave}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bulk Selection Bar — envoi groupé WhatsApp à plusieurs prospects sélectionnés */}
      <AnimatePresence>
        {onBulkRelance && selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-between gap-3 bg-[var(--surface-alt)] border border-[var(--accent)]/40 rounded-xl px-4 py-2.5"
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--accent-dark)]">
              <CheckCircle2 className="w-4 h-4" />
              <span>{selectedIds.size} {t.bulkSelectedCount}</span>
              <button
                type="button"
                onClick={clearSelection}
                className="text-stone-400 dark:text-stone-500 hover:text-stone-600 hover:dark:text-stone-300 cursor-pointer"
                aria-label={t.bulkClearSelection}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => onBulkRelance(selectedProspects)}
              className="inline-flex items-center gap-1.5 bg-emerald-600 dark:bg-emerald-300 hover:bg-emerald-700 hover:dark:bg-emerald-200 text-white text-xs sm:text-sm font-semibold py-2 px-3.5 rounded-lg shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t.bulkSendProspectsBtn}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)]/60 overflow-hidden shadow-xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)]/40 bg-[var(--bg-page)]">
                {onBulkRelance && (
                  <th className="py-3 pl-6 pr-2 w-8">
                    <input
                      type="checkbox"
                      checked={allDisplayedSelected}
                      onChange={toggleSelectAllDisplayed}
                      aria-label={t.bulkSelectAll}
                      className="w-4 h-4 rounded border-stone-300 dark:border-stone-600 text-[var(--accent)] focus:ring-[var(--surface-highlight)] cursor-pointer"
                    />
                  </th>
                )}
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">{t.thProspectName}</th>
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">{t.thProspectPhone}</th>
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">{t.thProspectDate}</th>
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">{t.prospectWaveLabel}</th>
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">{t.thProspectStatus}</th>
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-right">{t.thActions}</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-stone-100 dark:divide-stone-800 font-sans">
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={onBulkRelance ? 7 : 6} className="py-12 text-center text-stone-400 dark:text-stone-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
                    <p className="font-medium text-stone-600 dark:text-stone-300">{t.prospectsEmpty}</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500">{t.prospectsEmptySub}</p>
                  </td>
                </tr>
              ) : (
                displayed.map((prospect, index) => {
                  const isConverted = prospect.status === 'converted';
                  const isNotInterested = prospect.status === 'not_interested';
                  return (
                    <motion.tr
                      key={prospect.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02, duration: 0.2 }}
                      className="hover:bg-[var(--surface-alt)]/40 transition-colors"
                    >
                      {onBulkRelance && (
                        <td className="py-3.5 pl-6 pr-2 w-8">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(prospect.id)}
                            onChange={() => toggleProspectSelection(prospect.id)}
                            aria-label={prospect.name}
                            className="w-4 h-4 rounded border-stone-300 dark:border-stone-600 text-[var(--accent)] focus:ring-[var(--surface-highlight)] cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="py-3.5 px-6">
                        <span className="font-semibold text-stone-900 dark:text-stone-50">
                          {prospect.civility || 'M./Mme'} {prospect.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-mono-code text-xs text-stone-600 dark:text-stone-300 whitespace-nowrap">
                        {prospect.phone || '—'}
                      </td>
                      <td className="py-3.5 px-6 font-mono-code text-xs text-stone-600 dark:text-stone-300 whitespace-nowrap">
                        {prospect.prospectedDate}
                      </td>
                      <td className="py-3.5 px-6 text-stone-500 dark:text-stone-400 text-xs">
                        {prospect.wave ? (
                          <span className="inline-flex items-center gap-1">
                            <Waves className="w-3 h-3 shrink-0" />
                            {prospect.wave}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-mono-code font-medium ${STATUS_STYLES[prospect.status]}`}>
                            {statusLabel(prospect.status)}
                          </span>
                          {prospect.lastRelanceChannel === 'WhatsApp' && (
                            <span title="WhatsApp" className="shrink-0">
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
                            </span>
                          )}
                          {prospect.lastRelanceChannel === 'SMS' && (
                            <span title="SMS" className="shrink-0">
                              <MessageSquare className="w-3.5 h-3.5 text-sky-600 dark:text-sky-300" />
                            </span>
                          )}
                          {prospect.lastRelanceStatus === 'failed' && (
                            <span title={t.prospectSendFailedTooltip} className="shrink-0">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-300" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isConverted && !isNotInterested && (
                            <>
                              <button
                                onClick={() => onRelance(prospect)}
                                title={t.prospectRelanceBtn}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-600 dark:border-emerald-300 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-600 hover:dark:bg-emerald-300 hover:text-white font-semibold text-xs transition-all cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                <span className="hidden sm:inline">{t.prospectRelanceBtn}</span>
                              </button>
                              <button
                                onClick={() => onConvert(prospect)}
                                title={t.prospectConvertBtn}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white font-semibold text-xs transition-all cursor-pointer"
                              >
                                <UserCheck className="w-3 h-3" />
                                <span className="hidden sm:inline">{t.prospectConvertBtn}</span>
                              </button>
                              <button
                                onClick={() => onMarkNotInterested(prospect)}
                                title={t.prospectMarkNotInterestedBtn}
                                className="p-1.5 rounded-lg text-stone-400 dark:text-stone-500 hover:text-rose-600 hover:dark:text-rose-300 hover:bg-rose-50 hover:dark:bg-rose-900 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => onDelete(prospect)}
                            title={t.reviewsDeleteBtn}
                            className="p-1.5 rounded-lg text-stone-400 dark:text-stone-500 hover:text-rose-600 hover:dark:text-rose-300 hover:bg-rose-50 hover:dark:bg-rose-900 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3.5 bg-[var(--surface)] border-t border-[var(--border-color)]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 dark:text-stone-400">
          <div>
            {t.showingEntries} {startEntryNumber} {t.to} {endEntryNumber} {t.of} {totalEntries} {t.entries}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1 rounded border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-100 hover:dark:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {pageList.map((entry, i) =>
              entry === 'ellipsis' ? (
                <span key={`ellipsis-${i}`} className="w-7 h-7 flex items-center justify-center text-stone-400 dark:text-stone-500">
                  …
                </span>
              ) : (
                <button
                  key={entry}
                  onClick={() => setCurrentPage(entry)}
                  className={`w-7 h-7 shrink-0 rounded text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                    safePage === entry ? 'bg-[var(--accent)] text-white shadow-xs' : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 hover:dark:bg-stone-800'
                  }`}
                >
                  {entry}
                </button>
              )
            )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages || totalPages === 0}
              className="p-1 rounded border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-100 hover:dark:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
