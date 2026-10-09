export type UserRole = 'citizen' | 'authority';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  badgeId?: string;
  department?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export type HazardCategory =
  | 'pothole'
  | 'damaged_sign'
  | 'broken_streetlight'
  | 'dangerous_junction'
  | 'unsafe_construction'
  | 'damaged_crossing'
  | 'road_obstruction'
  | 'accident_nearmiss'
  | 'other';

export type ReportStatus =
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface VerificationDetails {
  verifiedBy: string;
  verifiedAt: string;
  officialNotes: string;
  actionTaken?: string;
}

export interface HazardReport {
  id: string; // e.g. "SUR-2026-1042"
  category: HazardCategory;
  categoryLabel: string;
  description: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  resolvedAddress: string;
  urgency: UrgencyLevel;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  submittedBy: {
    userId: string;
    userName: string;
    isAnonymous: boolean;
  };
  verification?: VerificationDetails;
  priorityScoreContribution?: number;
  assignedTeam?: string;
}

export type CrashSeverity = 'fatal' | 'severe' | 'slight';

export interface IncidentRecord {
  id: string;
  latitude: number;
  longitude: number;
  incidentDate: string;
  severity: CrashSeverity;
  roadType: string;
  speedLimitMph: number;
  vruInvolved: boolean; // Vulnerable Road User (pedestrian, cyclist)
  vehiclesInvolved: number;
  district: string;
  corridorId?: string;
  weatherCondition?: string;
  lightingCondition?: string;
}

export type RiskCategory = 'critical' | 'high' | 'moderate' | 'low';
export type ReviewStatus = 'needs_review' | 'inspection_scheduled' | 'intervention_active' | 'audited';

export interface CorridorPercentiles {
  braking: number;
  collision: number;
  overspeedingFreq: number;
  overspeedingInt: number;
  vruDensity: number;
}

export interface HighRiskCorridor {
  id: string;
  name: string;
  district: string;
  roadType: string;
  latitude: number;
  longitude: number;
  rank: number;
  riskScore: number; // 0 - 100
  riskCategory: RiskCategory;
  incidentCounts: {
    fatal: number;
    severe: number;
    slight: number;
    total: number;
  };
  verifiedHazardsCount: number;
  recentTrend: 'increasing' | 'stable' | 'decreasing';
  percentiles: CorridorPercentiles;
  recommendedAction: string;
  reviewStatus: ReviewStatus;
  notes?: string;
  lastUpdated: string;
  explanation: string;
  streetImageUrl?: string;
  speedLimitMph: number;
}

export type InterventionType =
  | 'lighting_upgrade'
  | 'pothole_resurfacing'
  | 'signal_installation'
  | 'speed_calming'
  | 'pedestrian_refuge'
  | 'geometric_redesign';

export interface InterventionRecord {
  id: string;
  locationId: string;
  locationName: string;
  type: InterventionType;
  typeLabel: string;
  interventionDate: string;
  status: 'planned' | 'in_progress' | 'completed';
  notes: string;
  costEstimateInr?: string;
  prePeriodMonths: number;
  postPeriodMonths: number;
  preAccidents: number;
  postAccidents: number;
  preFatalities: number;
  postFatalities: number;
  reductionPercentage?: number;
}

export type NotificationType =
  | 'critical_hazard'
  | 'cluster_alert'
  | 'verified_report'
  | 'critical_unreviewed'
  | 'inspection_overdue'
  | 'intervention_complete'
  | 'weekly_summary';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'info';
  createdAt: string;
  read: boolean;
  relatedReportId?: string;
  relatedLocationId?: string;
}

export interface ScoringWeights {
  crashSeverityWeight: number; // e.g. 0.40
  crashFrequencyWeight: number; // e.g. 0.25
  crashRecencyWeight: number; // e.g. 0.20
  hazardEvidenceWeight: number; // e.g. 0.15
}
