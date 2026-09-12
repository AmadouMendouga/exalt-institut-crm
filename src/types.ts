export type NavScreen = 'overview' | 'customers' | 'services' | 'automations' | 'schedule' | 'analytics' | 'reviews' | 'appointments' | 'prospects';

export type Gender = 'F' | 'M';

export type ClientStatus = 'Follow-up Needed' | 'Up to date' | 'Pending Response';

export type ChannelType = 'Email' | 'SMS' | 'WhatsApp';

export type RelanceType =
  | 'post_service'
  | 'upsell'
  | 'discount'
  | 'periodic_reminder'
  | 'reengagement'
  | 'birthday'
  | 'checkin';

export interface MessageTemplate {
  id: string;
  relanceType: RelanceType;
  title: {
    fr: string;
    en: string;
  };
  category: {
    fr: string;
    en: string;
  };
  channel: ChannelType;
  subject?: {
    fr: string;
    en: string;
  };
  content: {
    fr: string[];
    en: string[];
  };
  ctaText?: {
    fr: string;
    en: string;
  };
  isCustom?: boolean;
}

export interface Client {
  id: string;
  name: string;
  prefix: 'Mme.' | 'M.';
  gender: Gender;
  initials: string;
  email: string;
  phone: string;
  lastService: string;
  lastServiceDate: string; // e.g. "12 Oct 2023"
  rawDate: string; // ISO date for sorting
  status: ClientStatus;
  suggestedUpsell: string;
  preferredChannel: ChannelType;
  totalVisits: number;
  totalSpent: number; // in FCFA
  avatarBg?: string;
  notes?: string;
  birthDate?: string; // ISO "YYYY-MM-DD"
  marketingOptIn: boolean;
  nextReminderDate?: string; // ISO "YYYY-MM-DD" — rappel manuel obligatoire (ex. "recoiffer dans 3 semaines")
  nextReminderNote?: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  price: number; // in FCFA
  imageUrl: string | null;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  clientId: string | null;
  clientName: string | null;
  createdAt: string;
}

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Declined' | 'Completed' | 'Cancelled';

export interface AppointmentServiceItem {
  id: string;
  name: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientId: string | null;
  note: string | null;
  services: AppointmentServiceItem[];
  startsAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  createdAt: string;
}

export type ProspectStatus = 'new' | 'contacted' | 'converted' | 'not_interested';
export type ProspectCivility = 'M.' | 'Mme';

export interface Prospect {
  id: string;
  name: string;
  phone: string;
  prospectedDate: string; // ISO "YYYY-MM-DD"
  source: string | null;
  wave: string | null;
  civility: ProspectCivility | null;
  notes: string | null;
  status: ProspectStatus;
  lastRelanceAt: string | null;
  convertedClientId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityRule {
  weekday: number;
  isClosed: boolean;
  openMinutes: number;
  closeMinutes: number;
}

export interface AutomationCampaign {
  id: string;
  name: string;
  category: string;
  actionEvent: string;
  delayTime: number;
  delayUnit: 'Days' | 'Weeks' | 'Hours';
  channel: ChannelType;
  subjectLine: string;
  messageBody: string;
  ctaText: string;
  ctaUrl: string;
  status: 'active' | 'paused' | 'draft';
  targetAudience: string;
  lastTriggered?: string;
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
}

export interface TimelineItem {
  id: string;
  dateGroup: string; // e.g. "TODAY, OCT 26" or "TOMORROW, OCT 27"
  time: string; // e.g. "10:00 AM"
  title: string;
  description: string;
  targetClient: string;
  channel: ChannelType;
  status: 'Upcoming' | 'Past 7 Days' | 'Drafts';
  scheduledAt: string; // ISO datetime — vraie date/heure d'échéance, utilisée par le calendrier
  campaignId?: string;
  clientId?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

