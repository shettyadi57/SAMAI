import { HighRiskCorridor } from '../../types';
import {
  WeatherAlertFilter,
  CorridorWeatherRisk,
  WeatherBannerInfo,
  PredictorInput,
  RoadTypeOption,
  JunctionTypeOption,
} from './types';
import { getPredictorModel } from './model';

function mapCorridorRoadType(roadType: string): RoadTypeOption {
  const lower = roadType.toLowerCase();
  if (lower.includes('expressway') || lower.includes('highway')) return 'Expressway';
  if (lower.includes('flyover') || lower.includes('ramp')) return 'Flyover Ramp';
  if (lower.includes('arterial') || lower.includes('concourse')) return 'Arterial';
  if (lower.includes('collector')) return 'Collector';
  return 'Local';
}

function inferJunctionType(name: string, roadType: string): JunctionTypeOption {
  const combined = (name + ' ' + roadType).toLowerCase();
  if (combined.includes('flyover') || combined.includes('ramp') || combined.includes('incline')) return 'Flyover Merge';
  if (combined.includes('junction') || combined.includes('signal') || combined.includes('crossroads')) return 'Crossroads';
  if (combined.includes('roundabout') || combined.includes('circle')) return 'Roundabout';
  if (combined.includes('curve') || combined.includes('merge')) return 'T-Junction';
  return 'Mid-block';
}

export function evaluateCorridorsUnderWeather(
  corridors: HighRiskCorridor[],
  weatherFilter: WeatherAlertFilter
): {
  corridorRisks: CorridorWeatherRisk[];
  bannerInfo: WeatherBannerInfo;
} {
  const model = getPredictorModel();

  const corridorRisks: CorridorWeatherRisk[] = corridors.map((c) => {
    const roadType = mapCorridorRoadType(c.roadType);
    const junctionType = inferJunctionType(c.name, c.roadType);
    const speedLimit = c.speedLimitMph || 40;
    const vruPresence = c.percentiles.vruDensity >= 50;

    // Baseline conditions: Clear weather, daylight at 14:00
    const baselineInput: PredictorInput = {
      hour: 14,
      dayOfWeek: 3,
      weather: 'Clear',
      lighting: 'Daylight',
      roadType,
      speedLimit,
      junctionType,
      vruPresence,
    };

    const baselineProbs = model.predictProbabilities(baselineInput);
    const baselineScore = model.computeCompositeRisk(baselineProbs);

    // Weather condition input
    const isNight = weatherFilter === 'Night';
    const weather = weatherFilter === 'Rain' ? 'Rain' : weatherFilter === 'Fog' ? 'Fog' : 'Clear';
    const lighting = isNight ? 'Dark' : 'Daylight';
    const hour = isNight ? 23 : 14;

    const testInput: PredictorInput = {
      hour,
      dayOfWeek: 5,
      weather,
      lighting,
      roadType,
      speedLimit,
      junctionType,
      vruPresence,
    };

    const testProbs = model.predictProbabilities(testInput);
    const predictedScore = model.computeCompositeRisk(testProbs);
    const riskDelta = Number((predictedScore - baselineScore).toFixed(1));
    const predictedLevel = model.getRiskLevel(predictedScore);

    return {
      corridorId: c.id,
      corridorName: c.name,
      roadType: c.roadType,
      district: c.district,
      latitude: c.latitude,
      longitude: c.longitude,
      baselineScore,
      predictedScore,
      riskDelta,
      predictedLevel,
      probabilities: testProbs,
    };
  });

  // Calculate elevated corridors (where predictedScore is higher than baselineScore)
  const elevatedCorridors = corridorRisks.filter((r) => r.riskDelta > 0.5);
  const elevatedCount = elevatedCorridors.length;
  const totalCount = corridorRisks.length;

  let bannerTitle = '';
  let bannerMessage = '';
  let severityColor = '#10B981';

  switch (weatherFilter) {
    case 'Rain':
      bannerTitle = `Rain raises predicted risk on ${elevatedCount} corridor${elevatedCount === 1 ? '' : 's'}.`;
      bannerMessage =
        'Precipitation reduces tire traction by up to 35% and increases stopping distance. High-speed expressways and junction merges require active speed moderation.';
      severityColor = '#38BDF8';
      break;

    case 'Fog':
      bannerTitle = `Dense Fog raises predicted risk on ${elevatedCount} corridor${elevatedCount === 1 ? '' : 's'}.`;
      bannerMessage =
        'Critical sight distance hazard: Severe and fatal collision probabilities increase across high-speed radials. Automated radar guidance recommended.';
      severityColor = '#F59E0B';
      break;

    case 'Night':
      bannerTitle = `Night Darkness raises predicted risk on ${elevatedCount} corridor${elevatedCount === 1 ? '' : 's'}.`;
      bannerMessage =
        'Reduced pedestrian contrast and nocturnal speed variance elevate risk on unlit arterial stretches. Streetlight monitoring crews alerted.';
      severityColor = '#818CF8';
      break;

    case 'Clear':
    default:
      bannerTitle = `Clear Weather: Baseline risk conditions active across all ${totalCount} corridors.`;
      bannerMessage =
        'Standard daylight visibility and dry surface friction profile. Routine traffic enforcement and signal timings maintained.';
      severityColor = '#10B981';
      break;
  }

  return {
    corridorRisks,
    bannerInfo: {
      weatherFilter,
      elevatedCorridorsCount: elevatedCount,
      totalCorridorsCount: totalCount,
      bannerTitle,
      bannerMessage,
      severityColor,
    },
  };
}

export function getRiskMarkerColor(level: 'Low' | 'Medium' | 'High' | 'Critical'): string {
  switch (level) {
    case 'Critical':
      return '#EF4444';
    case 'High':
      return '#F97316';
    case 'Medium':
      return '#FACC15';
    case 'Low':
      return '#10B981';
  }
}
