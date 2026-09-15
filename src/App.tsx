import React, { useState, useEffect } from 'react';
import {
  NavScreen,
  Client,
  Service,
  AutomationCampaign,
  TimelineItem,
  ToastMessage,
  ChannelType,
  Review,
  Appointment,
  AppointmentStatus,
  AvailabilityRule,
  Prospect,
  ProspectStatus,
  ProspectCivility,
  BirthdaySubmission,
  BirthdaySubmissionStatus
} from './types';
import { apiGet, apiPost, apiPatch, apiPut, apiDelete, apiUpload } from './api/client';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { OverviewScreen } from './components/OverviewScreen';
import { CustomersScreen } from './components/CustomersScreen';
import { ServicesScreen } from './components/ServicesScreen';
import { ReviewsScreen } from './components/ReviewsScreen';
import { AppointmentsScreen } from './components/AppointmentsScreen';
import { ProspectsScreen } from './components/ProspectsScreen';
import { BulkProspectRelanceModal } from './components/BulkProspectRelanceModal';
import { AddProspectModal } from './components/AddProspectModal';
import { ProspectRelanceModal, ProspectRelanceChannel } from './components/ProspectRelanceModal';
import { CampaignMediaItem } from './components/CampaignMediaPanel';
import { BirthdaySubmissionsScreen } from './components/BirthdaySubmissionsScreen';
import { AutomationsScreen } from './components/AutomationsScreen';
import { ScheduleScreen } from './components/ScheduleScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { QuickRelanceModal } from './components/QuickRelanceModal';
import { BulkRelanceModal } from './components/BulkRelanceModal';
import { NewAutomationModal } from './components/NewAutomationModal';
import { AddClientModal } from './components/AddClientModal';
import { AddServiceModal } from './components/AddServiceModal';
import { ClientDetailDrawer } from './components/ClientDetailDrawer';
import { ReminderPopup } from './components/ReminderPopup';
import { Toast } from './components/Toast';
import { LoginScreen } from './components/LoginScreen';
import { useLanguage } from './context/LanguageContext';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { language, t } = useLanguage();
  const { user, isLoading: isAuthLoading } = useAuth();

  // Navigation screen
  const [currentScreen, setCurrentScreen] = useState<NavScreen>('overview');

  // Application data state
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [birthdaySubmissions, setBirthdaySubmissions] = useState<BirthdaySubmission[]>([]);
  const [availability, setAvailability] = useState<AvailabilityRule[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [campaignMedia, setCampaignMedia] = useState<Partial<Record<'photo' | 'video', CampaignMediaItem>>>({});
  const [campaigns, setCampaigns] = useState<AutomationCampaign[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modal states
  const [quickRelanceClient, setQuickRelanceClient] = useState<Client | null>(null);
  const [quickRelanceChannel, setQuickRelanceChannel] = useState<ChannelType>('WhatsApp');
  const [quickRelanceDraftId, setQuickRelanceDraftId] = useState<string | undefined>(undefined);
  const [quickRelanceInitialMessage, setQuickRelanceInitialMessage] = useState<string | undefined>(undefined);
  const [isQuickRelanceOpen, setIsQuickRelanceOpen] = useState(false);

  const [bulkRelanceClients, setBulkRelanceClients] = useState<Client[]>([]);
  const [isBulkRelanceOpen, setIsBulkRelanceOpen] = useState(false);

  const [bulkRelanceProspects, setBulkRelanceProspects] = useState<Prospect[]>([]);
  const [isBulkProspectRelanceOpen, setIsBulkProspectRelanceOpen] = useState(false);

  const [isNewAutomationOpen, setIsNewAutomationOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [detailClient, setDetailClient] = useState<Client | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const [isAddProspectOpen, setIsAddProspectOpen] = useState(false);
  const [relanceProspect, setRelanceProspect] = useState<Prospect | null>(null);
  const [isProspectRelanceOpen, setIsProspectRelanceOpen] = useState(false);
  // Suivi de la conversion en cours : quand un client est créé pendant que ceci
  // est renseigné, on relie ce client au prospect d'origine juste après.
  const [convertingProspectId, setConvertingProspectId] = useState<string | null>(null);
  const [clientPrefill, setClientPrefill] = useState<{ name?: string; phone?: string } | undefined>(undefined);

  // Toast trigger helper — un toast avec `action` (ex. Annuler) reste affiché plus
  // longtemps pour laisser le temps de cliquer dessus.
  const addToast = (
    type: 'success' | 'info' | 'warning',
    title: string,
    description?: string,
    action?: { label: string; onClick: () => void }
  ) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, title, description, action }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, action ? 8000 : 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const reportError = (err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    addToast('warning', language === 'fr' ? 'Une erreur est survenue' : 'Something went wrong', message);
  };

  // Load application data from the API once authenticated
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setIsDataLoading(true);
    Promise.all([
      apiGet<Client[]>('/api/clients'),
      apiGet<Service[]>('/api/services'),
      apiGet<AutomationCampaign[]>('/api/campaigns'),
      apiGet<TimelineItem[]>('/api/timeline'),
      apiGet<Review[]>('/api/reviews'),
      apiGet<Appointment[]>('/api/appointments'),
      apiGet<AvailabilityRule[]>('/api/availability'),
      apiGet<Prospect[]>('/api/prospects'),
      apiGet<CampaignMediaItem[]>('/api/campaign-media'),
      apiGet<BirthdaySubmission[]>('/api/birthday-submissions'),
    ])
      .then(([clientsData, servicesData, campaignsData, timelineData, reviewsData, appointmentsData, availabilityData, prospectsData, campaignMediaData, birthdaySubmissionsData]) => {
        if (cancelled) return;
        setClients(clientsData);
        setServices(servicesData);
        setCampaigns(campaignsData);
        setTimeline(timelineData);
        setReviews(reviewsData);
        setAppointments(appointmentsData);
        setAvailability(availabilityData);
        setProspects(prospectsData);
        setCampaignMedia(
          Object.fromEntries(campaignMediaData.map((m) => [m.kind, m])) as Partial<Record<'photo' | 'video', CampaignMediaItem>>
        );
        setBirthdaySubmissions(birthdaySubmissionsData);
      })
      .catch(reportError)
      .finally(() => {
        if (!cancelled) setIsDataLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Quick Relance Trigger — draftItemId/rawTemplate sont fournis quand on finalise
  // un brouillon généré par une automatisation plutôt que d'envoyer une relance libre.
  const handleOpenQuickRelance = (
    client: Client,
    mode?: ChannelType,
    draftItemId?: string,
    rawTemplate?: string
  ) => {
    setQuickRelanceClient(client);
    setQuickRelanceChannel(mode || client.preferredChannel || 'WhatsApp');
    setQuickRelanceDraftId(draftItemId);
    setQuickRelanceInitialMessage(rawTemplate);
    setIsQuickRelanceOpen(true);
  };

  // Ouverture de l'envoi groupé WhatsApp depuis la sélection multiple de l'écran Clients
  const handleOpenBulkRelance = (selected: Client[]) => {
    setBulkRelanceClients(selected);
    setIsBulkRelanceOpen(true);
  };

  // Quick Relance Send Execution
  const handleSendRelance = async (client: Client, channel: ChannelType, message: string, draftItemId?: string) => {
    try {
      const { client: updatedClient, timelineItem } = await apiPost<{ client: Client; timelineItem: TimelineItem }>(
        '/api/relances/send',
        { clientId: client.id, channel, message, language, timelineItemId: draftItemId }
      );

      setClients((prev) => prev.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
      setTimeline((prev) =>
        draftItemId
          ? prev.map((t) => (t.id === timelineItem.id ? timelineItem : t))
          : [timelineItem, ...prev]
      );
      if (draftItemId && timelineItem.campaignId) {
        // La finalisation d'un brouillon met à jour les stats de sa campagne côté API.
        apiGet<AutomationCampaign[]>('/api/campaigns').then(setCampaigns).catch(() => {});
      }

      const destination = channel === 'Email' ? client.email : client.phone;
      addToast(
        'success',
        language === 'fr' ? `Relance ${channel} transmise avec succès` : `${channel} follow-up sent successfully`,
        language === 'fr'
          ? `Message transmis à ${client.prefix} ${client.name} via ${channel} (${destination}).`
          : `Message dispatched to ${client.prefix} ${client.name} via ${channel} (${destination}).`
      );
    } catch (err) {
      reportError(err);
    }
  };

  // Modifier le consentement marketing d'un client (conditionne son éligibilité aux automatisations)
  const handleToggleOptIn = async (client: Client) => {
    try {
      const updated = await apiPatch<Client>(`/api/clients/${client.id}/marketing-opt-in`, {
        marketingOptIn: !client.marketingOptIn
      });
      setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      if (detailClient && detailClient.id === updated.id) {
        setDetailClient(updated);
      }
      addToast(
        'info',
        language === 'fr' ? 'Consentement marketing mis à jour' : 'Marketing consent updated',
        language === 'fr'
          ? `${client.name} : relances automatiques ${updated.marketingOptIn ? 'autorisées' : 'désactivées'}.`
          : `${client.name}: automated follow-ups ${updated.marketingOptIn ? 'enabled' : 'disabled'}.`
      );
    } catch (err) {
      reportError(err);
    }
  };

  // Add or Update Client
  const handleSaveClient = async (client: Client) => {
    try {
      if (editingClient) {
        const { id, ...payload } = client;
        const updated = await apiPut<Client>(`/api/clients/${editingClient.id}`, payload);
        setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        if (detailClient && detailClient.id === updated.id) {
          setDetailClient(updated);
        }
        addToast(
          'success',
          language === 'fr' ? 'Client mis à jour' : 'Client updated',
          language === 'fr'
            ? `${updated.prefix} ${updated.name} a été mis à jour.`
            : `${updated.prefix} ${updated.name} has been updated.`
        );
      } else {
        const { id, ...payload } = client;
        const created = await apiPost<Client>('/api/clients', payload);
        setClients((prev) => [created, ...prev]);
        addToast(
          'success',
          language === 'fr' ? 'Nouveau client enregistré' : 'New client created',
          language === 'fr'
            ? `${created.prefix} ${created.name} a été ajouté à la base de données.`
            : `${created.prefix} ${created.name} has been added to the customer database.`
        );

        if (convertingProspectId) {
          try {
            const updatedProspect = await apiPatch<Prospect>(`/api/prospects/${convertingProspectId}/converted`, {
              clientId: created.id
            });
            setProspects((prev) => prev.map((p) => (p.id === updatedProspect.id ? updatedProspect : p)));
            addToast('success', t.prospectConverted, `${created.prefix} ${created.name}`);
          } catch (err) {
            reportError(err);
          } finally {
            setConvertingProspectId(null);
            setClientPrefill(undefined);
          }
        }
      }
    } catch (err) {
      reportError(err);
      throw err;
    }
  };

  // Prospects
  const handleAddProspect = async (data: { name: string; phone: string; prospectedDate: string; source: string | null; wave: string | null; civility: ProspectCivility | null; notes: string | null }) => {
    try {
      const created = await apiPost<Prospect>('/api/prospects', data);
      setProspects((prev) => [created, ...prev]);
      addToast('success', t.prospectCreated, created.name);
    } catch (err) {
      reportError(err);
      throw err;
    }
  };

  const handleOpenProspectRelance = (prospect: Prospect) => {
    setRelanceProspect(prospect);
    setIsProspectRelanceOpen(true);
  };

  const handleUploadCampaignMedia = async (kind: 'photo' | 'video', file: File) => {
    try {
      const updated = await apiUpload<CampaignMediaItem>(`/api/campaign-media/${kind}`, file);
      setCampaignMedia((prev) => ({ ...prev, [kind]: updated }));
    } catch (err) {
      reportError(err);
    }
  };

  const handleDeleteCampaignMedia = async (kind: 'photo' | 'video') => {
    try {
      await apiDelete(`/api/campaign-media/${kind}`);
      setCampaignMedia((prev) => {
        const next = { ...prev };
        delete next[kind];
        return next;
      });
    } catch (err) {
      reportError(err);
    }
  };

  const handleOpenBulkProspectRelance = (selected: Prospect[]) => {
    setBulkRelanceProspects(selected);
    setIsBulkProspectRelanceOpen(true);
  };

  const handleSendProspectRelance = async (prospect: Prospect, message: string, channel: ProspectRelanceChannel) => {
    try {
      const updated =
        channel === 'SMS'
          ? await apiPost<Prospect>(`/api/prospects/${prospect.id}/send-sms`, { message })
          : await apiPatch<Prospect>(`/api/prospects/${prospect.id}/status`, { status: 'contacted', channel });
      setProspects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      const failed = updated.lastRelanceStatus === 'failed';
      addToast(
        failed ? 'warning' : 'success',
        failed
          ? (language === 'fr' ? `Échec de l'envoi ${channel}` : `${channel} send failed`)
          : (language === 'fr' ? `Relance ${channel} envoyée` : `${channel} follow-up sent`),
        `${prospect.name} • ${prospect.phone}`
      );
    } catch (err) {
      reportError(err);
    }
  };

  const handleBulkSendProspectSms = async (items: { id: string; message: string }[]) => {
    try {
      const result = await apiPost<{ results: { prospect: Prospect; ok: boolean; reason: string | null }[] }>(
        '/api/prospects/bulk/send-sms',
        { items }
      );
      setProspects((prev) => {
        const byId = new Map(result.results.map((r) => [r.prospect.id, r.prospect]));
        return prev.map((p) => byId.get(p.id) ?? p);
      });
      const sentCount = result.results.filter((r) => r.ok).length;
      const failedCount = result.results.length - sentCount;
      addToast(
        failedCount > 0 && sentCount === 0 ? 'warning' : 'success',
        language === 'fr' ? 'Envoi SMS groupé terminé' : 'Bulk SMS send complete',
        language === 'fr'
          ? `${sentCount} envoyés${failedCount ? `, ${failedCount} échoués` : ''}.`
          : `${sentCount} sent${failedCount ? `, ${failedCount} failed` : ''}.`
      );
      return { sentCount, failedCount };
    } catch (err) {
      reportError(err);
      return { sentCount: 0, failedCount: items.length };
    }
  };

  const handleConvertProspect = (prospect: Prospect) => {
    setEditingClient(null);
    setClientPrefill({ name: prospect.name, phone: prospect.phone });
    setConvertingProspectId(prospect.id);
    setIsAddClientOpen(true);
  };

  const handleUpdateProspectStatus = async (prospect: Prospect, status: ProspectStatus) => {
    try {
      const updated = await apiPatch<Prospect>(`/api/prospects/${prospect.id}/status`, { status });
      setProspects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      addToast('info', t.prospectStatusUpdated, prospect.name);
    } catch (err) {
      reportError(err);
    }
  };

  // Suppression réellement effectuée tout de suite (pas de perte de données si l'onglet
  // se ferme), mais on garde les infos du prospect pour pouvoir le recréer à l'identique
  // si "Annuler" est cliqué depuis le toast.
  const handleDeleteProspect = async (prospect: Prospect) => {
    try {
      await apiDelete(`/api/prospects/${prospect.id}`);
      setProspects((prev) => prev.filter((p) => p.id !== prospect.id));
      addToast('info', t.prospectDeleted, prospect.name, {
        label: t.undoBtn,
        onClick: async () => {
          try {
            const restored = await apiPost<Prospect>('/api/prospects', {
              name: prospect.name,
              phone: prospect.phone,
              prospectedDate: prospect.prospectedDate,
              source: prospect.source,
              wave: prospect.wave,
              civility: prospect.civility,
              notes: prospect.notes
            });
            setProspects((prev) => [restored, ...prev]);
          } catch (err) {
            reportError(err);
          }
        }
      });
    } catch (err) {
      reportError(err);
    }
  };

  // Add or Update Service (catalog)
  const handleSaveService = async (payload: { name: string; category: string; price: number; imageUrl: string | null }) => {
    try {
      if (editingService) {
        const updated = await apiPut<Service>(`/api/services/${editingService.id}`, payload);
        setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        addToast('success', t.serviceUpdated, updated.name);
        return updated;
      } else {
        const created = await apiPost<Service>('/api/services', payload);
        setServices((prev) => [...prev, created]);
        addToast('success', t.serviceCreated, created.name);
        return created;
      }
    } catch (err) {
      reportError(err);
      throw err;
    }
  };

  const handleUploadServiceImage = async (serviceId: string, file: File) => {
    const updated = await apiUpload<Service>(`/api/services/${serviceId}/image`, file);
    setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    return updated;
  };

  // Delete Service
  const handleDeleteService = async (service: Service) => {
    if (!window.confirm(t.deleteServiceConfirm)) return;
    try {
      await apiDelete(`/api/services/${service.id}`);
      setServices((prev) => prev.filter((s) => s.id !== service.id));
      addToast('info', t.serviceDeleted, service.name);
    } catch (err) {
      reportError(err);
    }
  };

  const handleDeleteReview = async (review: Review) => {
    if (!window.confirm(t.reviewsDeleteConfirm)) return;
    try {
      await apiDelete(`/api/reviews/${review.id}`);
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      addToast('info', t.reviewDeleted);
    } catch (err) {
      reportError(err);
    }
  };

  const handleUpdateAppointmentStatus = async (appointment: Appointment, status: AppointmentStatus) => {
    try {
      const updated = await apiPatch<Appointment>(`/api/appointments/${appointment.id}/status`, { status });
      setAppointments((prev) => prev.map((a) => (a.id === appointment.id ? updated : a)));
      addToast('success', t.appointmentStatusUpdated, appointment.clientName);
    } catch (err) {
      reportError(err);
    }
  };

  const handleDeleteAppointment = async (appointment: Appointment) => {
    if (!window.confirm(t.reviewsDeleteConfirm)) return;
    try {
      await apiDelete(`/api/appointments/${appointment.id}`);
      setAppointments((prev) => prev.filter((a) => a.id !== appointment.id));
      addToast('info', t.appointmentDeleted);
    } catch (err) {
      reportError(err);
    }
  };

  const handleUpdateBirthdaySubmissionStatus = async (submission: BirthdaySubmission, status: BirthdaySubmissionStatus) => {
    try {
      const result = await apiPatch<{ submission: BirthdaySubmission; client: Client | null }>(
        `/api/birthday-submissions/${submission.id}/status`,
        { status }
      );
      setBirthdaySubmissions((prev) => prev.map((s) => (s.id === submission.id ? result.submission : s)));
      if (result.client) {
        setClients((prev) => {
          const exists = prev.some((c) => c.id === result.client!.id);
          return exists ? prev.map((c) => (c.id === result.client!.id ? result.client! : c)) : [...prev, result.client!];
        });
      }
      addToast('success', t.birthdaySubmissionStatusUpdated, submission.name);
    } catch (err) {
      reportError(err);
    }
  };

  const handleDeleteBirthdaySubmission = async (submission: BirthdaySubmission) => {
    if (!window.confirm(t.reviewsDeleteConfirm)) return;
    try {
      await apiDelete(`/api/birthday-submissions/${submission.id}`);
      setBirthdaySubmissions((prev) => prev.filter((s) => s.id !== submission.id));
      addToast('info', t.birthdaySubmissionDeleted);
    } catch (err) {
      reportError(err);
    }
  };

  const handleSaveAvailability = async (rules: AvailabilityRule[]) => {
    try {
      const updated = await apiPut<AvailabilityRule[]>('/api/availability', rules);
      setAvailability(updated);
      addToast('success', t.availabilitySaved);
    } catch (err) {
      reportError(err);
    }
  };

  // Toggle Client Status from Drawer
  const handleToggleClientStatus = async (client: Client) => {
    const newStatus = client.status === 'Follow-up Needed' ? 'Up to date' : 'Follow-up Needed';
    try {
      const updated = await apiPatch<Client>(`/api/clients/${client.id}/status`, { status: newStatus });
      setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      if (detailClient && detailClient.id === updated.id) {
        setDetailClient(updated);
      }
      const statusLabel = newStatus === 'Follow-up Needed' ? t.statusFollowUp : t.statusUpToDate;
      addToast(
        'info',
        language === 'fr' ? 'Statut mis à jour' : 'Status updated',
        language === 'fr' ? `${client.name} est maintenant "${statusLabel}".` : `${client.name} is now "${statusLabel}".`
      );
    } catch (err) {
      reportError(err);
    }
  };

  // Efface le rappel obligatoire d'un client une fois traité (le popup de
  // relance cesse alors de le signaler).
  const handleClearReminder = async (client: Client) => {
    try {
      const updated = await apiPatch<Client>(`/api/clients/${client.id}/reminder`, {
        nextReminderDate: null,
        nextReminderNote: null
      });
      setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err) {
      reportError(err);
    }
  };

  // Save Campaign from Editor
  const handleSaveCampaign = async (updatedCampaign: AutomationCampaign) => {
    try {
      const saved = await apiPut<AutomationCampaign>(`/api/campaigns/${updatedCampaign.id}`, updatedCampaign);
      setCampaigns((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
      addToast(
        'success',
        language === 'fr' ? 'Campagne enregistrée & activée' : 'Campaign saved & live',
        language === 'fr'
          ? `Le workflow "${saved.name}" (${saved.channel}) est actif avec un délai de ${saved.delayTime} ${saved.delayUnit.toLowerCase()}.`
          : `Workflow "${saved.name}" (${saved.channel}) is active with a delay of ${saved.delayTime} ${saved.delayUnit.toLowerCase()}.`
      );
    } catch (err) {
      reportError(err);
    }
  };

  // Create Campaign
  const handleCreateCampaign = async (newCampaign: AutomationCampaign) => {
    try {
      const { id, ...payload } = newCampaign;
      const created = await apiPost<AutomationCampaign>('/api/campaigns', payload);
      setCampaigns((prev) => [created, ...prev]);
      addToast(
        'success',
        language === 'fr' ? 'Automatisation créée' : 'Automation created',
        language === 'fr'
          ? `Le workflow "${created.name}" a été ajouté et déployé sur ${created.channel}.`
          : `Workflow "${created.name}" has been deployed on ${created.channel}.`
      );
    } catch (err) {
      reportError(err);
    }
  };

  // Déclenche réellement la campagne maintenant : segmentation + création des
  // relances (brouillons pour WhatsApp, envoi simulé journalisé pour Email/SMS).
  const handleTriggerCampaignTest = async (campaign: AutomationCampaign) => {
    try {
      const result = await apiPost<{ matched: number; created: TimelineItem[]; campaign: AutomationCampaign }>(
        `/api/campaigns/${campaign.id}/trigger`
      );

      setCampaigns((prev) => prev.map((c) => (c.id === result.campaign.id ? result.campaign : c)));
      if (result.created.length > 0) {
        setTimeline((prev) => [...result.created, ...prev]);
        const clientsData = await apiGet<Client[]>('/api/clients');
        setClients(clientsData);
      }

      if (result.matched === 0) {
        addToast(
          'info',
          language === 'fr' ? `Aucun client dû pour "${campaign.name}"` : `No client due for "${campaign.name}"`,
          language === 'fr'
            ? 'Aucun client ne correspond actuellement aux critères de déclenchement de cette campagne.'
            : 'No client currently matches this campaign\'s trigger criteria.'
        );
        return;
      }

      const drafts = result.created.filter((it) => it.status === 'Drafts').length;
      const sent = result.created.length - drafts;
      addToast(
        'success',
        language === 'fr' ? `"${campaign.name}" déclenchée` : `"${campaign.name}" triggered`,
        language === 'fr'
          ? `${result.matched} client(s) ciblé(s) — ${sent} relance(s) envoyée(s), ${drafts} brouillon(s) WhatsApp en attente dans le Planning.`
          : `${result.matched} client(s) matched — ${sent} follow-up(s) sent, ${drafts} WhatsApp draft(s) waiting in Schedule.`
      );
    } catch (err) {
      reportError(err);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[var(--bg-page)] text-[var(--text-primary)] font-sans antialiased">
      {/* Fixed Desktop Sidebar & Mobile Bottom Navigation */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        onOpenNewAutomation={() => setIsNewAutomationOpen(true)}
      />

      {/* Main Content Canvas */}
      <main className="flex-1 w-full md:ml-[260px] lg:ml-[280px] min-h-screen p-4 sm:p-6 lg:p-10 pb-28 md:pb-10 overflow-x-hidden max-w-7xl">
        {/* Top Header with User Profile and Notifications */}
        <TopHeader
          currentScreen={currentScreen}
          timeline={timeline}
          onNavigate={setCurrentScreen}
          onOpenNewAutomation={() => setIsNewAutomationOpen(true)}
        />

        {/* Dynamic Screen View */}
        <div className="mt-4">
          {currentScreen === 'overview' && (
            <OverviewScreen
              clients={clients}
              timeline={timeline}
              onQuickRelance={handleOpenQuickRelance}
              onNavigate={setCurrentScreen}
            />
          )}

          {currentScreen === 'customers' && (
            <CustomersScreen
              clients={clients}
              onQuickRelance={handleOpenQuickRelance}
              onOpenAddClient={() => {
                setEditingClient(null);
                setClientPrefill(undefined);
                setIsAddClientOpen(true);
              }}
              onSelectClientDetail={(c) => {
                setDetailClient(c);
                setIsDetailDrawerOpen(true);
              }}
              onBulkRelance={handleOpenBulkRelance}
            />
          )}

          {currentScreen === 'prospects' && (
            <ProspectsScreen
              prospects={prospects}
              onOpenAddProspect={() => setIsAddProspectOpen(true)}
              onRelance={handleOpenProspectRelance}
              onConvert={handleConvertProspect}
              onMarkNotInterested={(p) => handleUpdateProspectStatus(p, 'not_interested')}
              onDelete={handleDeleteProspect}
              onBulkRelance={handleOpenBulkProspectRelance}
            />
          )}

          {currentScreen === 'services' && (
            <ServicesScreen
              services={services}
              onOpenAddService={() => {
                setEditingService(null);
                setIsAddServiceOpen(true);
              }}
              onEditService={(service) => {
                setEditingService(service);
                setIsAddServiceOpen(true);
              }}
              onDeleteService={handleDeleteService}
            />
          )}

          {currentScreen === 'automations' && (
            <AutomationsScreen
              campaigns={campaigns}
              clients={clients}
              onSaveCampaign={handleSaveCampaign}
              onNewCampaign={() => setIsNewAutomationOpen(true)}
              onTriggerNow={handleTriggerCampaignTest}
            />
          )}

          {currentScreen === 'schedule' && (
            <ScheduleScreen
              timeline={timeline}
              clients={clients}
              onSelectClientReminder={(c) => {
                setDetailClient(c);
                setIsDetailDrawerOpen(true);
              }}
              onTriggerItem={(it) => {
                // Un brouillon (relance WhatsApp auto-générée) s'ouvre dans la
                // modale de relance pour validation/envoi manuel ; les autres
                // entrées restent un simple rappel des détails.
                if (it.status === 'Drafts' && it.clientId) {
                  const targetClient = clients.find((c) => c.id === it.clientId);
                  const campaign = it.campaignId ? campaigns.find((c) => c.id === it.campaignId) : undefined;
                  if (targetClient) {
                    handleOpenQuickRelance(targetClient, it.channel, it.id, campaign?.messageBody);
                    return;
                  }
                }
                addToast('info', it.title, `${it.description} — ${it.targetClient} (${it.channel})`);
              }}
              onNewScheduleItem={() => setIsNewAutomationOpen(true)}
            />
          )}

          {currentScreen === 'analytics' && (
            <AnalyticsScreen campaigns={campaigns} timeline={timeline} />
          )}

          {currentScreen === 'reviews' && (
            <ReviewsScreen reviews={reviews} onDeleteReview={handleDeleteReview} />
          )}

          {currentScreen === 'appointments' && (
            <AppointmentsScreen
              appointments={appointments}
              availability={availability}
              onUpdateStatus={handleUpdateAppointmentStatus}
              onDelete={handleDeleteAppointment}
              onSaveAvailability={handleSaveAvailability}
            />
          )}

          {currentScreen === 'birthdaySubmissions' && (
            <BirthdaySubmissionsScreen
              submissions={birthdaySubmissions}
              onUpdateStatus={handleUpdateBirthdaySubmissionStatus}
              onDelete={handleDeleteBirthdaySubmission}
            />
          )}
        </div>
      </main>

      {/* Interactive Modals & Drawers */}
      <QuickRelanceModal
        isOpen={isQuickRelanceOpen}
        client={quickRelanceClient}
        initialChannel={quickRelanceChannel}
        draftItemId={quickRelanceDraftId}
        initialMessage={quickRelanceInitialMessage}
        onClose={() => setIsQuickRelanceOpen(false)}
        onSend={handleSendRelance}
      />

      <BulkRelanceModal
        isOpen={isBulkRelanceOpen}
        clients={bulkRelanceClients}
        onClose={() => setIsBulkRelanceOpen(false)}
        onSend={(client, channel, message) => handleSendRelance(client, channel, message)}
      />

      <NewAutomationModal
        isOpen={isNewAutomationOpen}
        onClose={() => setIsNewAutomationOpen(false)}
        onCreate={handleCreateCampaign}
      />

      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => {
          setIsAddClientOpen(false);
          setEditingClient(null);
          setConvertingProspectId(null);
          setClientPrefill(undefined);
        }}
        onSave={handleSaveClient}
        editingClient={editingClient}
        services={services}
        prefill={clientPrefill}
      />

      <AddProspectModal
        isOpen={isAddProspectOpen}
        onClose={() => setIsAddProspectOpen(false)}
        onSave={handleAddProspect}
        defaultWave={[...prospects].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]?.wave || undefined}
      />

      <ProspectRelanceModal
        isOpen={isProspectRelanceOpen}
        prospect={relanceProspect}
        onClose={() => setIsProspectRelanceOpen(false)}
        onSend={handleSendProspectRelance}
        campaignMedia={campaignMedia}
        onUploadCampaignMedia={handleUploadCampaignMedia}
        onDeleteCampaignMedia={handleDeleteCampaignMedia}
      />

      <BulkProspectRelanceModal
        isOpen={isBulkProspectRelanceOpen}
        prospects={bulkRelanceProspects}
        onClose={() => setIsBulkProspectRelanceOpen(false)}
        onSend={handleSendProspectRelance}
        onBulkSendSms={handleBulkSendProspectSms}
        campaignMedia={campaignMedia}
        onUploadCampaignMedia={handleUploadCampaignMedia}
        onDeleteCampaignMedia={handleDeleteCampaignMedia}
      />

      <AddServiceModal
        isOpen={isAddServiceOpen}
        onClose={() => {
          setIsAddServiceOpen(false);
          setEditingService(null);
        }}
        onSave={handleSaveService}
        onUploadImage={handleUploadServiceImage}
        editingService={editingService}
      />

      <ClientDetailDrawer
        isOpen={isDetailDrawerOpen}
        client={detailClient}
        onClose={() => setIsDetailDrawerOpen(false)}
        onQuickRelance={handleOpenQuickRelance}
        onToggleStatus={handleToggleClientStatus}
        onToggleOptIn={handleToggleOptIn}
        onEdit={(c) => {
          setEditingClient(c);
          setIsAddClientOpen(true);
        }}
      />

      <ReminderPopup
        clients={clients}
        onQuickRelance={(c) => handleOpenQuickRelance(c)}
        onMarkDone={handleClearReminder}
      />

      {/* Global Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
