import { HighRiskCorridor, IncidentRecord, RiskCategory, ScoringWeights } from '../types';

export const DEFAULT_WEIGHTS: ScoringWeights = {
  crashSeverityWeight: 0.40,
  crashFrequencyWeight: 0.25,
  crashRecencyWeight: 0.20,
  hazardEvidenceWeight: 0.15,
};

/**
 * Deterministic, explainable Road Safety Priority Scoring formula
 * Normalized to 0 - 100 scale.
 */
export function calculateCorridorRiskScore(
  corridor: {
    incidentCounts: { fatal: number; severe: number; slight: number; total: number };
    verifiedHazardsCount: number;
    recentTrend: 'increasing' | 'stable' | 'decreasing';
    percentiles: { overspeedingFreq: number; vruDensity: number };
  },
  weights: ScoringWeights = DEFAULT_WEIGHTS
): {
  score: number;
  category: RiskCategory;
  explanation: string;
  breakdown: {
    severitySubscore: number;
    frequencySubscore: number;
    recencySubscore: number;
    hazardSubscore: number;
  };
} {
  const { incidentCounts, verifiedHazardsCount, recentTrend } = corridor;

  // 1. Crash Severity Subscore (0 - 100)
  // Fatal = 5.0, Severe = 3.0, Slight = 1.0 (Equivalent to standard IRC / UK DfT STATS19 weighting)
  const weightedSeverityRaw =
    (incidentCounts.fatal * 5.0) +
    (incidentCounts.severe * 3.0) +
    (incidentCounts.slight * 1.0);
  
  // Normalization cap (e.g. 50 weighted points = 100)
  const severitySubscore = Math.min(100, (weightedSeverityRaw / 40) * 100);

  // 2. Crash Frequency Subscore (0 - 100)
  // Frequency based on total incidents (20+ incidents in observation period is maxed)
  const frequencySubscore = Math.min(100, (incidentCounts.total / 18) * 100);

  // 3. Recency & Trend Subscore (0 - 100)
  let recencySubscore = 50;
  if (recentTrend === 'increasing') {
    recencySubscore = 90;
  } else if (recentTrend === 'stable') {
    recencySubscore = 60;
  } else if (recentTrend === 'decreasing') {
    recencySubscore = 30;
  }

  // 4. Verified Citizen Hazard Evidence Subscore (0 - 100)
  // 1 verified hazard = 20 pts, 5+ = 100 pts
  const hazardSubscore = Math.min(100, (verifiedHazardsCount / 5) * 100);

  // Ensure weights sum to 1.0
  const totalWeight =
    weights.crashSeverityWeight +
    weights.crashFrequencyWeight +
    weights.crashRecencyWeight +
    weights.hazardEvidenceWeight;

  const wSev = weights.crashSeverityWeight / totalWeight;
  const wFreq = weights.crashFrequencyWeight / totalWeight;
  const wRec = weights.crashRecencyWeight / totalWeight;
  const wHaz = weights.hazardEvidenceWeight / totalWeight;

  // Final composite score
  const compositeScore =
    (severitySubscore * wSev) +
    (frequencySubscore * wFreq) +
    (recencySubscore * wRec) +
    (hazardSubscore * wHaz);

  const finalScore = Math.round(compositeScore * 10) / 10;

  // Risk categorization
  let category: RiskCategory = 'low';
  if (finalScore >= 75) {
    category = 'critical';
  } else if (finalScore >= 55) {
    category = 'high';
  } else if (finalScore >= 35) {
    category = 'moderate';
  } else {
    category = 'low';
  }

  // Transparent explanation generator
  const reasons: string[] = [];
  if (incidentCounts.fatal > 0) {
    reasons.push(`${incidentCounts.fatal} fatal crash${incidentCounts.fatal > 1 ? 'es' : ''}`);
  }
  if (incidentCounts.severe >= 2) {
    reasons.push(`${incidentCounts.severe} severe injury collisions`);
  }
  if (recentTrend === 'increasing') {
    reasons.push('an upward incident trajectory');
  }
  if (verifiedHazardsCount >= 2) {
    reasons.push(`${verifiedHazardsCount} verified citizen hazard reports`);
  }

  let explanation = '';
  if (reasons.length > 0) {
    explanation = `Ranked with score ${finalScore}/100 driven by ${reasons.join(', ')}.`;
  } else {
    explanation = `Score ${finalScore}/100 calculated from regular baseline road safety indices.`;
  }

  return {
    score: finalScore,
    category,
    explanation,
    breakdown: {
      severitySubscore: Math.round(severitySubscore * 10) / 10,
      frequencySubscore: Math.round(frequencySubscore * 10) / 10,
      recencySubscore: Math.round(recencySubscore * 10) / 10,
      hazardSubscore: Math.round(hazardSubscore * 10) / 10,
    },
  };
}

/**
 * Re-ranks all corridors based on current scoring weights
 */
export function rankCorridors(
  corridors: HighRiskCorridor[],
  weights: ScoringWeights = DEFAULT_WEIGHTS
): HighRiskCorridor[] {
  const recalculated = corridors.map((corridor) => {
    const result = calculateCorridorRiskScore(corridor, weights);
    return {
      ...corridor,
      riskScore: result.score,
      riskCategory: result.category,
      explanation: result.explanation,
    };
  });

  // Sort descending by score
  recalculated.sort((a, b) => b.riskScore - a.riskScore);

  // Update rank indices
  return recalculated.map((c, idx) => ({
    ...c,
    rank: idx + 1,
  }));
}
