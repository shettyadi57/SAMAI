import { describe, it, expect } from 'vitest';
import { calculateCorridorRiskScore, rankCorridors, DEFAULT_WEIGHTS } from './priorityScoring';
import { HighRiskCorridor } from '../types';

describe('Road Safety Priority Scoring Algorithm', () => {
  it('correctly calculates deterministic risk score for high-severity corridor', () => {
    const corridorData = {
      incidentCounts: { fatal: 5, severe: 20, slight: 50, total: 75 },
      verifiedHazardsCount: 5,
      recentTrend: 'increasing' as const,
      percentiles: { overspeedingFreq: 45, vruDensity: 65 },
    };

    const result = calculateCorridorRiskScore(corridorData, DEFAULT_WEIGHTS);

    expect(result.score).toBeGreaterThan(70);
    expect(result.category).toBe('critical');
    expect(result.explanation).toContain('fatal');
    expect(result.breakdown.severitySubscore).toBeGreaterThan(0);
  });

  it('correctly classifies low risk corridor with zero fatalities', () => {
    const lowRiskData = {
      incidentCounts: { fatal: 0, severe: 1, slight: 2, total: 3 },
      verifiedHazardsCount: 0,
      recentTrend: 'decreasing' as const,
      percentiles: { overspeedingFreq: 10, vruDensity: 15 },
    };

    const result = calculateCorridorRiskScore(lowRiskData, DEFAULT_WEIGHTS);

    expect(result.score).toBeLessThan(40);
    expect(result.category).toBe('low');
  });

  it('ranks corridors in descending order of risk score', () => {
    const mockCorridors: HighRiskCorridor[] = [
      {
        id: 'c1',
        name: 'Zone A (Low)',
        district: 'Grossbasel',
        roadType: 'Local',
        latitude: 47.5,
        longitude: 7.5,
        rank: 1,
        riskScore: 20,
        riskCategory: 'low',
        incidentCounts: { fatal: 0, severe: 0, slight: 2, total: 2 },
        verifiedHazardsCount: 0,
        recentTrend: 'decreasing',
        percentiles: { braking: 10, collision: 10, overspeedingFreq: 10, overspeedingInt: 5, vruDensity: 10 },
        recommendedAction: 'Routine monitoring',
        reviewStatus: 'audited',
        lastUpdated: '2026-10-01',
        explanation: 'Low baseline',
        speedLimitMph: 30,
      },
      {
        id: 'c2',
        name: 'Zone B (Critical)',
        district: 'Grossbasel',
        roadType: 'Arterial',
        latitude: 47.55,
        longitude: 7.58,
        rank: 2,
        riskScore: 85,
        riskCategory: 'critical',
        incidentCounts: { fatal: 4, severe: 18, slight: 40, total: 62 },
        verifiedHazardsCount: 4,
        recentTrend: 'increasing',
        percentiles: { braking: 50, collision: 85, overspeedingFreq: 50, overspeedingInt: 15, vruDensity: 70 },
        recommendedAction: 'Immediate speed calming',
        reviewStatus: 'needs_review',
        lastUpdated: '2026-10-08',
        explanation: 'High crashes',
        speedLimitMph: 40,
      },
    ];

    const ranked = rankCorridors(mockCorridors, DEFAULT_WEIGHTS);

    expect(ranked[0].id).toBe('c2');
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].id).toBe('c1');
    expect(ranked[1].rank).toBe(2);
  });
});
