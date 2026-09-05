// Délai d'anticipation du popup de rappel (en heures) avant la date de rappel
// réelle — réglable par l'utilisateur, persisté côté navigateur comme le thème
// et la mise en veille du popup.
export const REMINDER_LEAD_HOURS_STORAGE_KEY = 'crm-reminder-lead-hours';
export const REMINDER_LEAD_HOURS_OPTIONS = [0, 24, 48, 72] as const;
export type ReminderLeadHours = (typeof REMINDER_LEAD_HOURS_OPTIONS)[number];

const DEFAULT_LEAD_HOURS: ReminderLeadHours = 24;

export function getReminderLeadHours(): ReminderLeadHours {
  try {
    const raw = localStorage.getItem(REMINDER_LEAD_HOURS_STORAGE_KEY);
    if (raw === null) return DEFAULT_LEAD_HOURS;
    const stored = Number(raw);
    return (REMINDER_LEAD_HOURS_OPTIONS as readonly number[]).includes(stored)
      ? (stored as ReminderLeadHours)
      : DEFAULT_LEAD_HOURS;
  } catch {
    return DEFAULT_LEAD_HOURS;
  }
}

export function setReminderLeadHours(hours: ReminderLeadHours): void {
  try {
    localStorage.setItem(REMINDER_LEAD_HOURS_STORAGE_KEY, String(hours));
  } catch {
    // stockage indisponible (navigation privée…) : le réglage ne sera pas retenu
  }
}

export function addDaysISO(iso: string, days: number): string {
  // Calcul entièrement en UTC pour éviter tout décalage d'un jour lié au
  // fuseau local (ex. UTC+1 au Cameroun) qu'un aller-retour par l'heure
  // locale introduirait.
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
}
