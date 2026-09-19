import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Send,
  ChevronLeft,
  ChevronRight,
  Plus,
  UserPlus,
  SlidersHorizontal,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageCircle,
  Cake,
  Download,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Client, Gender, ClientStatus } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { downloadCsv } from '../lib/exportCsv';
import { downloadProfessionalExcel } from '../lib/exportExcel';

interface CustomersScreenProps {
  clients: Client[];
  onQuickRelance: (client: Client) => void;
  onOpenAddClient: () => void;
  onSelectClientDetail?: (client: Client) => void;
  onBulkRelance?: (clients: Client[]) => void;
}

export const CustomersScreen: React.FC<CustomersScreenProps> = ({
  clients,
  onQuickRelance,
  onOpenAddClient,
  onSelectClientDetail,
  onBulkRelance
}) => {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const itemsPerPage = 6;

  // Filtered clients list
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      // Search match
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.lastService.toLowerCase().includes(q);

      // Gender filter
      const matchGender =
        selectedGender === 'All' ||
        (selectedGender === 'F' && c.gender === 'F') ||
        (selectedGender === 'M' && c.gender === 'M');

      // Status filter
      const matchStatus =
        statusFilter === 'All' || c.status === statusFilter;

      return matchSearch && matchGender && matchStatus;
    });
  }, [clients, searchQuery, selectedGender, statusFilter]);

  const clientStatusLabel = (status: ClientStatus): string => {
    if (language === 'en') return status;
    switch (status) {
      case 'Follow-up Needed': return 'Relance nécessaire';
      case 'Up to date': return 'À jour';
      case 'Pending Response': return 'Réponse en attente';
      default: return status;
    }
  };

  const handleExportCsv = () => {
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(
      `clients-exalt-${date}.csv`,
      [
        { label: 'Nom', value: (c: Client) => c.name },
        { label: 'Civilité', value: (c: Client) => c.prefix },
        { label: 'Genre', value: (c: Client) => c.gender },
        { label: 'Téléphone', value: (c: Client) => c.phone },
        { label: 'Email', value: (c: Client) => c.email },
        { label: 'Dernière prestation', value: (c: Client) => c.lastService },
        { label: 'Date dernière prestation', value: (c: Client) => c.rawDate },
        { label: 'Statut', value: (c: Client) => clientStatusLabel(c.status) },
        { label: 'Nombre de visites', value: (c: Client) => c.totalVisits },
        { label: 'Total dépensé (FCFA)', value: (c: Client) => c.totalSpent },
        { label: 'Canal préféré', value: (c: Client) => c.preferredChannel },
        { label: 'Consentement marketing', value: (c: Client) => c.marketingOptIn ? 'Oui' : 'Non' },
        { label: 'Date de naissance', value: (c: Client) => c.birthDate || '' },
        { label: 'Prochain rappel', value: (c: Client) => c.nextReminderDate || '' },
        { label: 'Note du rappel', value: (c: Client) => c.nextReminderNote || '' },
        { label: 'Upsell suggéré', value: (c: Client) => c.suggestedUpsell },
        { label: 'Notes', value: (c: Client) => c.notes || '' },
        { label: 'ID Client', value: (c: Client) => c.id },
      ],
      filteredClients
    );
  };

  const handleExportExcel = () => {
    const date = new Date().toISOString().slice(0, 10);
    const total = filteredClients.length;
    const femaleCount = filteredClients.filter((c) => c.gender === 'F').length;
    const maleCount = filteredClients.filter((c) => c.gender === 'M').length;
    const followUpCount = filteredClients.filter((c) => c.status === 'Follow-up Needed').length;
    const upToDateCount = filteredClients.filter((c) => c.status === 'Up to date').length;
    const pendingCount = filteredClients.filter((c) => c.status === 'Pending Response').length;
    const totalSpent = filteredClients.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const totalVisits = filteredClients.reduce((sum, c) => sum + (c.totalVisits || 0), 0);
    const optInCount = filteredClients.filter((c) => c.marketingOptIn).length;

    const channelCounts = Array.from(
      filteredClients.reduce((map, c) => {
        map.set(c.preferredChannel || 'Non renseigné', (map.get(c.preferredChannel || 'Non renseigné') || 0) + 1);
        return map;
      }, new Map<string, number>())
    ).sort((a, b) => b[1] - a[1]);

    downloadProfessionalExcel({
      filename: `clients-exalt-${date}.xlsx`,
      dataSheetName: 'Clients',
      tableName: 'ClientsExalt',
      rows: filteredClients,
      columns: [
        { header: 'Nom', width: 24, value: (c: Client) => c.name },
        { header: 'Civilité', width: 11, value: (c: Client) => c.prefix },
        { header: 'Genre', width: 10, value: (c: Client) => c.gender },
        { header: 'Téléphone', width: 19, value: (c: Client) => c.phone },
        { header: 'Email', width: 30, value: (c: Client) => c.email },
        { header: 'Dernière prestation', width: 30, value: (c: Client) => c.lastService },
        { header: 'Date dernière prestation', width: 21, kind: 'date', value: (c: Client) => c.rawDate },
        {
          header: 'Statut',
          width: 21,
          value: (c: Client) => clientStatusLabel(c.status),
          style: (c: Client) =>
            c.status === 'Follow-up Needed' ? 'warning' :
            c.status === 'Up to date' ? 'converted' :
            'contacted',
        },
        { header: 'Nombre de visites', width: 17, kind: 'number', value: (c: Client) => c.totalVisits },
        { header: 'Total dépensé', width: 18, kind: 'currency', value: (c: Client) => c.totalSpent },
        { header: 'Canal préféré', width: 16, value: (c: Client) => c.preferredChannel },
        {
          header: 'Consentement marketing',
          width: 23,
          value: (c: Client) => c.marketingOptIn ? 'Oui' : 'Non',
          style: (c: Client) => c.marketingOptIn ? 'sent' : 'warning',
        },
        { header: 'Date de naissance', width: 18, kind: 'date', value: (c: Client) => c.birthDate || '' },
        { header: 'Prochain rappel', width: 18, kind: 'date', value: (c: Client) => c.nextReminderDate || '' },
        { header: 'Note du rappel', width: 34, wrap: true, value: (c: Client) => c.nextReminderNote || '' },
        { header: 'Upsell suggéré', width: 28, wrap: true, value: (c: Client) => c.suggestedUpsell },
        { header: 'Notes', width: 38, wrap: true, value: (c: Client) => c.notes || '' },
        { header: 'ID Client', width: 38, value: (c: Client) => c.id },
      ],
      summaryTitle: language === 'fr' ? 'Résumé analytique — Clients' : 'Analytical summary — Clients',
      summaryMetrics: [
        { label: 'Total clients', value: total },
        { label: 'Femmes', value: femaleCount },
        { label: 'Hommes', value: maleCount },
        { label: 'Relance nécessaire', value: followUpCount },
        { label: 'À jour', value: upToDateCount },
        { label: 'Réponse en attente', value: pendingCount },
        { label: 'Visites cumulées', value: totalVisits },
        { label: 'Dépenses cumulées', value: totalSpent, kind: 'currency' },
        { label: 'Dépense moyenne / client', value: total ? Math.round(totalSpent / total) : 0, kind: 'currency' },
        { label: 'Consentement marketing', value: total ? optInCount / total : 0, kind: 'percent' },
      ],
      distributions: [
        {
          title: 'Répartition par statut',
          rows: [
            { label: 'Relance nécessaire', count: followUpCount, percent: total ? followUpCount / total : 0, style: 'warning' },
            { label: 'À jour', count: upToDateCount, percent: total ? upToDateCount / total : 0, style: 'converted' },
            { label: 'Réponse en attente', count: pendingCount, percent: total ? pendingCount / total : 0, style: 'contacted' },
          ],
        },
        {
          title: 'Répartition par genre',
          rows: [
            { label: 'Femmes', count: femaleCount, percent: total ? femaleCount / total : 0 },
            { label: 'Hommes', count: maleCount, percent: total ? maleCount / total : 0 },
          ],
        },
        {
          title: 'Répartition par canal préféré',
          rows: channelCounts.map(([label, count]) => ({
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
          label: 'Genre',
          value: selectedGender === 'All' ? 'Tous' : selectedGender === 'F' ? 'Femmes' : 'Hommes',
        },
        { label: 'Statut', value: statusFilter === 'All' ? 'Tous' : clientStatusLabel(statusFilter as ClientStatus) },
        { label: 'Périmètre', value: 'Toutes les lignes correspondant aux filtres actifs, pagination ignorée' },
      ],
    });
  };

  // Pagination calculation
  const totalEntries = filteredClients.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

  const startEntryNumber = totalEntries === 0 ? 0 : startIndex + 1;
  const endEntryNumber = Math.min(startIndex + itemsPerPage, totalEntries);

  // Sélection multiple pour l'envoi groupé (ex. messages "Prise de nouvelles"
  // destinés à plusieurs clients à la fois, cf. relances de type checkin).
  const allDisplayedSelected = displayedClients.length > 0 && displayedClients.every((c) => selectedIds.has(c.id));
  const selectedClients = useMemo(
    () => clients.filter((c) => selectedIds.has(c.id)),
    [clients, selectedIds]
  );

  const toggleClientSelection = (id: string) => {
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
        displayedClients.forEach((c) => next.delete(c.id));
      } else {
        displayedClients.forEach((c) => next.add(c.id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  // Clients sans date de naissance connue : ceux à qui envoyer la demande
  // (page publique /anniversaire) a du sens.
  const clientsMissingBirthdate = useMemo(() => clients.filter((c) => !c.birthDate), [clients]);
  const selectClientsMissingBirthdate = () => {
    setSelectedIds(new Set(clientsMissingBirthdate.map((c) => c.id)));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            {t.customersTitle}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            {t.customersSubtitle}
          </p>
        </div>

        <div className="self-start sm:self-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportMenuOpen((open) => !open)}
              className="bg-[var(--surface)] border border-[var(--border-color)]/70 hover:border-[var(--accent)] text-stone-700 dark:text-stone-200 text-xs sm:text-sm font-semibold py-2 px-3.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              title={language === 'fr' ? 'Télécharger les clients filtrés' : 'Download filtered clients'}
            >
              <Download className="w-4 h-4" />
              <span>{language === 'fr' ? 'Télécharger' : 'Download'}</span>
              <span className="text-[10px] text-stone-400 dark:text-stone-500">({filteredClients.length})</span>
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
            onClick={onOpenAddClient}
            className="bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white text-xs sm:text-sm font-semibold py-2 px-3.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.addClient}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar (Search + Gender Filter + More Filters) matching Image 1 */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search input with leading icon */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-clients"
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

        {/* Gender Filter Dropdown */}
        <div className="relative">
          <button
            id="btn-gender-filter"
            onClick={() => setGenderDropdownOpen(!genderDropdownOpen)}
            className="w-full lg:w-44 bg-[var(--surface)] border border-[var(--border-color)]/70 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-200 hover:border-stone-400 hover:dark:border-stone-500 flex items-center justify-between gap-2 shadow-2xs cursor-pointer"
          >
            <span>
              {selectedGender === 'All'
                ? t.allGenders
                : selectedGender === 'F'
                ? t.genderFemale
                : t.genderMale}
            </span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500">▼</span>
          </button>

          <AnimatePresence>
            {genderDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 mt-1.5 w-44 bg-[var(--surface)] rounded-lg shadow-lg border border-[var(--border-color)]/60 py-1 z-30"
              >
                <button
                  onClick={() => {
                    setSelectedGender('All');
                    setGenderDropdownOpen(false);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium ${
                    selectedGender === 'All' ? 'bg-[var(--surface-alt)] text-[var(--accent-dark)] font-semibold' : 'text-stone-700 dark:text-stone-200 hover:bg-stone-50 hover:dark:bg-stone-900'
                  }`}
                >
                  {t.allGenders}
                </button>
                <button
                  onClick={() => {
                    setSelectedGender('F');
                    setGenderDropdownOpen(false);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium ${
                    selectedGender === 'F' ? 'bg-[var(--surface-alt)] text-[var(--accent-dark)] font-semibold' : 'text-stone-700 dark:text-stone-200 hover:bg-stone-50 hover:dark:bg-stone-900'
                  }`}
                >
                  {t.genderFemale}
                </button>
                <button
                  onClick={() => {
                    setSelectedGender('M');
                    setGenderDropdownOpen(false);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium ${
                    selectedGender === 'M' ? 'bg-[var(--surface-alt)] text-[var(--accent-dark)] font-semibold' : 'text-stone-700 dark:text-stone-200 hover:bg-stone-50 hover:dark:bg-stone-900'
                  }`}
                >
                  {t.genderMale}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* More Filters Toggle */}
        <div className="relative">
          <button
            id="btn-more-filters"
            onClick={() => setMoreFiltersOpen(!moreFiltersOpen)}
            className={`w-full lg:w-auto bg-[var(--surface)] border border-[var(--border-color)]/70 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-medium hover:border-stone-400 hover:dark:border-stone-500 flex items-center justify-center gap-2 shadow-2xs cursor-pointer ${
              statusFilter !== 'All' ? 'border-[var(--accent)] bg-[var(--surface-alt)] text-[var(--accent-dark)]' : 'text-stone-700 dark:text-stone-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
            <span>{t.moreFilters}</span>
            {statusFilter !== 'All' && (
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            )}
          </button>

          <AnimatePresence>
            {moreFiltersOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 mt-1.5 w-60 bg-[var(--surface)] rounded-xl shadow-xl border border-[var(--border-color)]/60 p-3 z-30"
              >
                <div className="text-xs font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wider mb-2">
                  {t.filterByStatus}
                </div>
                <div className="space-y-1">
                  {['All', 'Follow-up Needed', 'Up to date'].map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setStatusFilter(st);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-medium flex items-center justify-between ${
                        statusFilter === st ? 'bg-[var(--surface-highlight)]/30 text-[var(--accent-dark)] font-bold' : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 hover:dark:bg-stone-900'
                      }`}
                    >
                      <span>{st === 'All' ? t.allStatuses : (st === 'Follow-up Needed' ? t.statusFollowUp : t.statusUpToDate)}</span>
                      {statusFilter === st && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)]" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Raccourci : cibler d'un clic les clients dont la date de naissance n'est pas
          encore connue, pour leur envoyer la demande via /anniversaire. */}
      {onBulkRelance && clientsMissingBirthdate.length > 0 && selectedIds.size === 0 && (
        <button
          type="button"
          onClick={selectClientsMissingBirthdate}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--accent-dark)] hover:underline cursor-pointer"
        >
          <Cake className="w-3.5 h-3.5" />
          <span>{t.selectMissingBirthdate} ({clientsMissingBirthdate.length})</span>
        </button>
      )}

      {/* Bulk Selection Bar — envoi groupé WhatsApp à plusieurs clients sélectionnés */}
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
              onClick={() => onBulkRelance(selectedClients)}
              className="inline-flex items-center gap-1.5 bg-emerald-600 dark:bg-emerald-300 hover:bg-emerald-700 hover:dark:bg-emerald-200 text-white text-xs sm:text-sm font-semibold py-2 px-3.5 rounded-lg shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t.bulkSendBtn}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customers Data Table matching Image 1 */}
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
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  {t.thClientName}
                </th>
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  {t.thGender}
                </th>
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  {t.thLastService}
                </th>
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  {t.thDate}
                </th>
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  {t.thStatus}
                </th>
                <th className="py-3 px-6 font-mono-code text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-right">
                  {t.thActions}
                </th>
              </tr>
            </thead>

            <tbody className="text-sm divide-y divide-stone-100 dark:divide-stone-800 font-sans">
              {displayedClients.length === 0 ? (
                <tr>
                  <td colSpan={onBulkRelance ? 7 : 6} className="py-12 text-center text-stone-400 dark:text-stone-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
                    <p className="font-medium text-stone-600 dark:text-stone-300">{t.noClientsFound}</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500">{t.noClientsSub}</p>
                  </td>
                </tr>
              ) : (
                displayedClients.map((client, index) => {
                  const isFollowUp = client.status === 'Follow-up Needed';

                  return (
                    <motion.tr
                      key={client.id}
                      id={`client-row-${client.id}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.2 }}
                      className="hover:bg-[var(--surface-alt)]/40 transition-colors group cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent)]"
                      tabIndex={0}
                      role="button"
                      onClick={() => onSelectClientDetail && onSelectClientDetail(client)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectClientDetail && onSelectClientDetail(client);
                        }
                      }}
                    >
                      {onBulkRelance && (
                        <td className="py-3.5 pl-6 pr-2 w-8" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(client.id)}
                            onChange={() => toggleClientSelection(client.id)}
                            aria-label={`${client.prefix} ${client.name}`}
                            className="w-4 h-4 rounded border-stone-300 dark:border-stone-600 text-[var(--accent)] focus:ring-[var(--surface-highlight)] cursor-pointer"
                          />
                        </td>
                      )}
                      {/* Client Name with Avatar */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono-code font-bold text-xs shrink-0 ${client.avatarBg || 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-100'}`}>
                            {client.initials}
                          </div>
                          <div>
                            <span className="font-semibold text-stone-900 dark:text-stone-50 group-hover:text-[var(--accent)] transition-colors">
                              {client.prefix} {client.name}
                            </span>
                            <span className="block text-[11px] text-stone-400 dark:text-stone-500">
                              {client.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Gender */}
                      <td className="py-3.5 px-6 font-mono-code text-xs text-stone-600 dark:text-stone-300 font-medium">
                        {client.gender}
                      </td>

                      {/* Last Service */}
                      <td className="py-3.5 px-6 text-stone-700 dark:text-stone-200 font-medium">
                        {client.lastService}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-6 font-mono-code text-xs text-stone-600 dark:text-stone-300 whitespace-nowrap">
                        {client.lastServiceDate}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-6">
                        {isFollowUp ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-mono-code font-medium bg-[#ffdad6] text-[#93000a] border border-[#ba1a1a]/20">
                            {t.statusFollowUp}
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-mono-code font-medium bg-[#dce9ff] text-[var(--text-primary)] border border-blue-200 dark:border-blue-700">
                            {t.statusUpToDate}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        {isFollowUp ? (
                          <button
                            id={`btn-relance-${client.id}`}
                            onClick={() => onQuickRelance(client)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold text-xs transition-all shadow-2xs cursor-pointer ${
                              client.preferredChannel === 'WhatsApp'
                                ? 'border-emerald-600 dark:border-emerald-300 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-600 hover:dark:bg-emerald-300 hover:text-white ring-2 ring-emerald-200 dark:ring-emerald-700'
                                : 'border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white'
                            }`}
                          >
                            <Send className="w-3 h-3" />
                            <span>{t.quickRelanceBtn}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onQuickRelance(client)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-100 hover:dark:bg-stone-800 font-medium text-xs transition-all cursor-pointer opacity-70 hover:opacity-100"
                          >
                            <span>{t.relanceBtn}</span>
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination matching Image 1 */}
        <div className="px-6 py-3.5 bg-[var(--surface)] border-t border-[var(--border-color)]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 dark:text-stone-400">
          <div>
            {t.showingEntries} {startEntryNumber} {t.to} {endEntryNumber} {t.of} {totalEntries} {t.entries}
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-100 hover:dark:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 hover:dark:bg-stone-800'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
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
