export type WeatherCondition = 'Clear' | 'Rain' | 'Fog';
export type LightingCondition = 'Daylight' | 'Dusk' | 'Dim Streetlight' | 'Dark';
export type RoadTypeOption =
  | 'Arterial'
  | 'Expressway'
  | 'Collector'
  | 'Local'
  | 'Flyover Ramp';
export type JunctionTypeOption =
  | 'Mid-block'
  | 'T-Junction'
  | 'Crossroads'
  | 'Roundabout'
  | 'Flyover Merge';

export type SeverityClass = 'slight' | 'severe' | 'fatal';

export interface PredictorInput {
  hour: number; // 0 - 23
  dayOfWeek: number; // 0 (Sun) - 6 (Sat)
  weather: WeatherCondition;
  lighting: LightingCondition;
  roadType: RoadTypeOption;
  speedLimit: number; // 20 - 70 mph
  junctionType: JunctionTypeOption;
  vruPresence: boolean; // Vulnerable road users (pedestrians, cyclists, two-wheelers)
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface SeverityProbabilities {
  slight: number; // 0.0 - 1.0
  severe: number; // 0.0 - 1.0
  fatal: number;  // 0.0 - 1.0
}

export interface FactorContribution {
  featureKey: keyof PredictorInput;
  label: string;
  currentValue: string;
  deltaRiskPercentage: number; // Positive = pushes risk up, negative = protective
  direction: 'up' | 'down' | 'neutral';
}

export interface PredictionResult {
  probabilities: SeverityProbabilities;
  compositeRiskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  confidenceScore: number; // 0 - 100%
  contributions: FactorContribution[];
  explanationSentence: string;
}

export interface ConfusionMatrix {
  matrix: {
    slight: { slight: number; severe: number; fatal: number };
    severe: { slight: number; severe: number; fatal: number };
    fatal: { slight: number; severe: number; fatal: number };
  };
  totalSamples: number;
}

export interface ClassMetrics {
  precision: number;
  recall: number;
  f1Score: number;
  support: number;
}

export interface ModelEvaluation {
  accuracy: number;
  perClassMetrics: {
    slight: ClassMetrics;
    severe: ClassMetrics;
    fatal: ClassMetrics;
  };
  confusionMatrix: ConfusionMatrix;
  sampleCount: number;
  datasetNote: string;
}

export type WeatherAlertFilter = 'Clear' | 'Rain' | 'Fog' | 'Night';

export interface CorridorWeatherRisk {
  corridorId: string;
  corridorName: string;
  roadType: string;
  district: string;
  latitude: number;
  longitude: number;
  baselineScore: number;
  predictedScore: number;
  riskDelta: number;
  predictedLevel: RiskLevel;
  probabilities: SeverityProbabilities;
}

export interface WeatherBannerInfo {
  weatherFilter: WeatherAlertFilter;
  elevatedCorridorsCount: number;
  totalCorridorsCount: number;
  bannerTitle: string;
  bannerMessage: string;
  severityColor: string;
}
