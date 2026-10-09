import {
  HazardReport,
  HighRiskCorridor,
  InterventionRecord,
  NotificationItem,
  User,
  ReportStatus,
  ReviewStatus,
} from '../types';
import {
  INITIAL_CITIZEN_USER,
  INITIAL_AUTHORITY_USER,
  INITIAL_CORRIDORS,
  INITIAL_HAZARD_REPORTS,
  INITIAL_INTERVENTIONS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';

const KEYS = {
  USER: 'suraksh_active_user',
  REPORTS: 'suraksh_hazard_reports_v1',
  CORRIDORS: 'suraksh_corridors_v1',
  INTERVENTIONS: 'suraksh_interventions_v1',
  NOTIFICATIONS: 'suraksh_notifications_v1',
};

export const storageService = {
  // --- USER AUTH ---
  getUser(): User | null {
    try {
      const data = localStorage.getItem(KEYS.USER);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed reading user from storage', e);
    }
    // Default to authority user for rich reviewer testing, or null
    return INITIAL_AUTHORITY_USER;
  },

  setUser(user: User | null): void {
    if (user) {
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.USER);
    }
  },

  // --- HAZARD REPORTS ---
  getReports(): HazardReport[] {
    try {
      const data = localStorage.getItem(KEYS.REPORTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed reading reports', e);
    }
    // Seed default
    localStorage.setItem(KEYS.REPORTS, JSON.stringify(INITIAL_HAZARD_REPORTS));
    return INITIAL_HAZARD_REPORTS;
  },

  addReport(newReport: HazardReport): HazardReport[] {
    const list = this.getReports();
    const updated = [newReport, ...list];
    localStorage.setItem(KEYS.REPORTS, JSON.stringify(updated));

    // Also auto-generate authority alert notification
    this.addNotification({
      id: `notif-${Date.now()}`,
      type: newReport.urgency === 'critical' ? 'critical_hazard' : 'verified_report',
      title: `New ${newReport.urgency.toUpperCase()} Hazard: ${newReport.categoryLabel}`,
      message: `Citizen report ${newReport.id} logged at ${newReport.resolvedAddress}. Immediate review advised.`,
      severity: newReport.urgency === 'critical' ? 'critical' : 'high',
      createdAt: new Date().toISOString(),
      read: false,
      relatedReportId: newReport.id,
    });

    return updated;
  },

  updateReportStatus(
    id: string,
    status: ReportStatus,
    verificationNotes?: string,
    assignedTeam?: string
  ): HazardReport[] {
    const list = this.getReports();
    const currentUser = this.getUser();
    const updated = list.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status,
          updatedAt: new Date().toISOString(),
          assignedTeam: assignedTeam || item.assignedTeam,
          verification: {
            verifiedBy: currentUser ? `${currentUser.name} (${currentUser.badgeId || 'Authority'})` : 'SURAKSH Authority',
            verifiedAt: new Date().toISOString(),
            officialNotes: verificationNotes || item.verification?.officialNotes || 'Status updated via Authority Console.',
            actionTaken: status === 'resolved' ? 'Resolution verified by Municipal Inspection Unit.' : item.verification?.actionTaken,
          },
        };
      }
      return item;
    });

    localStorage.setItem(KEYS.REPORTS, JSON.stringify(updated));
    return updated;
  },

  // --- CORRIDORS / HOTSPOTS ---
  getCorridors(): HighRiskCorridor[] {
    try {
      const data = localStorage.getItem(KEYS.CORRIDORS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed reading corridors', e);
    }
    localStorage.setItem(KEYS.CORRIDORS, JSON.stringify(INITIAL_CORRIDORS));
    return INITIAL_CORRIDORS;
  },

  saveCorridors(corridors: HighRiskCorridor[]): void {
    localStorage.setItem(KEYS.CORRIDORS, JSON.stringify(corridors));
  },

  updateCorridorReviewStatus(id: string, reviewStatus: ReviewStatus, notes?: string): HighRiskCorridor[] {
    const list = this.getCorridors();
    const updated = list.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          reviewStatus,
          notes: notes !== undefined ? notes : c.notes,
          lastUpdated: new Date().toISOString(),
        };
      }
      return c;
    });
    localStorage.setItem(KEYS.CORRIDORS, JSON.stringify(updated));
    return updated;
  },

  // --- INTERVENTIONS ---
  getInterventions(): InterventionRecord[] {
    try {
      const data = localStorage.getItem(KEYS.INTERVENTIONS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed reading interventions', e);
    }
    localStorage.setItem(KEYS.INTERVENTIONS, JSON.stringify(INITIAL_INTERVENTIONS));
    return INITIAL_INTERVENTIONS;
  },

  addIntervention(item: InterventionRecord): InterventionRecord[] {
    const list = this.getInterventions();
    const updated = [item, ...list];
    localStorage.setItem(KEYS.INTERVENTIONS, JSON.stringify(updated));
    return updated;
  },

  // --- NOTIFICATIONS ---
  getNotifications(): NotificationItem[] {
    try {
      const data = localStorage.getItem(KEYS.NOTIFICATIONS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed reading notifications', e);
    }
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS;
  },

  addNotification(notif: NotificationItem): void {
    const list = this.getNotifications();
    const updated = [notif, ...list];
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(updated));
  },

  markNotificationRead(id: string): NotificationItem[] {
    const list = this.getNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(updated));
    return updated;
  },

  markAllNotificationsRead(): NotificationItem[] {
    const list = this.getNotifications();
    const updated = list.map((n) => ({ ...n, read: true }));
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(updated));
    return updated;
  },

  // --- SYSTEM RESET ---
  resetAllData(): void {
    localStorage.removeItem(KEYS.USER);
    localStorage.setItem(KEYS.REPORTS, JSON.stringify(INITIAL_HAZARD_REPORTS));
    localStorage.setItem(KEYS.CORRIDORS, JSON.stringify(INITIAL_CORRIDORS));
    localStorage.setItem(KEYS.INTERVENTIONS, JSON.stringify(INITIAL_INTERVENTIONS));
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  },
};
