import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  HazardReport,
  HighRiskCorridor,
  IncidentRecord,
  InterventionRecord,
  NotificationItem,
  ReportStatus,
  ReviewStatus,
  ScoringWeights,
} from '../types';
import { storageService } from '../services/storageService';
import { DEFAULT_WEIGHTS, rankCorridors } from '../utils/priorityScoring';
import {
  CITY_PRESETS,
  CityPreset,
  BENGALURU_CORRIDORS,
  BASEL_CORRIDORS,
  SAMPLE_ACCIDENT_RECORDS,
} from '../data/mockData';

interface MapLayersState {
  accidents: boolean;
  citizenHazards: boolean;
  corridors: boolean;
  heatmaps: boolean;
  resolved: boolean;
  trafficLive: boolean;
}

interface DataContextType {
  activeCity: 'bengaluru' | 'delhi' | 'basel';
  setActiveCity: (city: 'bengaluru' | 'delhi' | 'basel') => void;
  activeCityPreset: CityPreset;
  corridors: HighRiskCorridor[];
  reports: HazardReport[];
  accidents: IncidentRecord[];
  interventions: InterventionRecord[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  scoringWeights: ScoringWeights;
  setScoringWeights: (weights: ScoringWeights) => void;
  selectedCorridor: HighRiskCorridor | null;
  setSelectedCorridor: (c: HighRiskCorridor | null) => void;
  mapLayers: MapLayersState;
  setMapLayers: React.Dispatch<React.SetStateAction<MapLayersState>>;
  addHazardReport: (report: Omit<HazardReport, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => HazardReport;
  updateReportStatus: (id: string, status: ReportStatus, notes?: string, assignedTeam?: string) => void;
  updateCorridorReview: (id: string, status: ReviewStatus, notes?: string) => void;
  addIntervention: (item: Omit<InterventionRecord, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCity, setActiveCityState] = useState<'bengaluru' | 'delhi' | 'basel'>('bengaluru');
  const [corridors, setCorridors] = useState<HighRiskCorridor[]>(() => storageService.getCorridors());
  const [reports, setReports] = useState<HazardReport[]>(() => storageService.getReports());
  const [accidents] = useState<IncidentRecord[]>(SAMPLE_ACCIDENT_RECORDS);
  const [interventions, setInterventions] = useState<InterventionRecord[]>(() => storageService.getInterventions());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => storageService.getNotifications());
  const [scoringWeights, setScoringWeightsState] = useState<ScoringWeights>(DEFAULT_WEIGHTS);
  const [selectedCorridor, setSelectedCorridor] = useState<HighRiskCorridor | null>(corridors[0] || null);

  const [mapLayers, setMapLayers] = useState<MapLayersState>({
    accidents: true,
    citizenHazards: true,
    corridors: true,
    heatmaps: true,
    resolved: false,
    trafficLive: false,
  });

  const setActiveCity = (city: 'bengaluru' | 'delhi' | 'basel') => {
    setActiveCityState(city);
    if (city === 'basel') {
      setCorridors(BASEL_CORRIDORS);
      setSelectedCorridor(BASEL_CORRIDORS[0]);
    } else {
      setCorridors(BENGALURU_CORRIDORS);
      setSelectedCorridor(BENGALURU_CORRIDORS[0]);
    }
  };

  const activeCityPreset = CITY_PRESETS[activeCity];

  // Re-rank corridors when weights change
  const setScoringWeights = (newWeights: ScoringWeights) => {
    setScoringWeightsState(newWeights);
    const ranked = rankCorridors(corridors, newWeights);
    setCorridors(ranked);
    storageService.saveCorridors(ranked);
  };

  const addHazardReport = (
    data: Omit<HazardReport, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): HazardReport => {
    const id = `SUR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const newReport: HazardReport = {
      ...data,
      id,
      status: 'submitted',
      createdAt: now,
      updatedAt: now,
    };

    const updatedList = storageService.addReport(newReport);
    setReports(updatedList);
    setNotifications(storageService.getNotifications());
    return newReport;
  };

  const updateReportStatus = (
    id: string,
    status: ReportStatus,
    notes?: string,
    assignedTeam?: string
  ) => {
    const updated = storageService.updateReportStatus(id, status, notes, assignedTeam);
    setReports(updated);
  };

  const updateCorridorReview = (id: string, status: ReviewStatus, notes?: string) => {
    const updated = storageService.updateCorridorReviewStatus(id, status, notes);
    setCorridors(updated);
    if (selectedCorridor?.id === id) {
      setSelectedCorridor(updated.find((c) => c.id === id) || null);
    }
  };

  const addIntervention = (item: Omit<InterventionRecord, 'id'>) => {
    const newRecord: InterventionRecord = {
      ...item,
      id: `int-${Date.now()}`,
    };
    const updated = storageService.addIntervention(newRecord);
    setInterventions(updated);
  };

  const markNotificationRead = (id: string) => {
    const updated = storageService.markNotificationRead(id);
    setNotifications(updated);
  };

  const markAllNotificationsRead = () => {
    const updated = storageService.markAllNotificationsRead();
    setNotifications(updated);
  };

  const resetAllData = () => {
    storageService.resetAllData();
    setCorridors(storageService.getCorridors());
    setReports(storageService.getReports());
    setInterventions(storageService.getInterventions());
    setNotifications(storageService.getNotifications());
    setSelectedCorridor(storageService.getCorridors()[0] || null);
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <DataContext.Provider
      value={{
        activeCity,
        setActiveCity,
        activeCityPreset,
        corridors,
        reports,
        accidents,
        interventions,
        notifications,
        unreadNotificationCount,
        scoringWeights,
        setScoringWeights,
        selectedCorridor,
        setSelectedCorridor,
        mapLayers,
        setMapLayers,
        addHazardReport,
        updateReportStatus,
        updateCorridorReview,
        addIntervention,
        markNotificationRead,
        markAllNotificationsRead,
        resetAllData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
