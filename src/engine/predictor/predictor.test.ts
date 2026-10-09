import { describe, it, expect } from 'vitest';
import {
  getPredictorModel,
  PredictorInput,
  evaluateCorridorsUnderWeather,
  mapWmoCodeToFilter,
  fetchLiveWeather,
} from './index';
import { BENGALURU_CORRIDORS } from '../../data/mockData';

describe('In-Browser ML Risk Predictor Engine', () => {
  const model = getPredictorModel();

  const baseInput: PredictorInput = {
    hour: 14,
    dayOfWeek: 2,
    weather: 'Clear',
    lighting: 'Daylight',
    roadType: 'Arterial',
    speedLimit: 40,
    junctionType: 'T-Junction',
    vruPresence: false,
  };

  it('trains once and caches in-memory singleton', () => {
    const model1 = getPredictorModel();
    const model2 = getPredictorModel();
    expect(model1).toBe(model2);
  });

  it('guarantees probabilities sum strictly to 1.0 across diverse test scenarios', () => {
    const testCases: PredictorInput[] = [
      baseInput,
      { ...baseInput, weather: 'Rain', lighting: 'Dark', speedLimit: 60, vruPresence: true },
      { ...baseInput, weather: 'Fog', lighting: 'Dim Streetlight', hour: 2, speedLimit: 70 },
      { ...baseInput, roadType: 'Local', speedLimit: 20, junctionType: 'Mid-block' },
      { ...baseInput, roadType: 'Expressway', speedLimit: 70, junctionType: 'Flyover Merge', vruPresence: true },
      { ...baseInput, hour: 0, lighting: 'Dark', weather: 'Fog', vruPresence: true },
    ];

    for (const tc of testCases) {
      const probs = model.predictProbabilities(tc);
      const sum = probs.slight + probs.severe + probs.fatal;

      expect(probs.slight).toBeGreaterThanOrEqual(0);
      expect(probs.severe).toBeGreaterThanOrEqual(0);
      expect(probs.fatal).toBeGreaterThanOrEqual(0);
      expect(probs.slight).toBeLessThanOrEqual(1);
      expect(probs.severe).toBeLessThanOrEqual(1);
      expect(probs.fatal).toBeLessThanOrEqual(1);

      // Probabilities must sum to 1 within floating-point tolerance
      expect(Math.abs(sum - 1.0)).toBeLessThan(1e-6);
    }
  });

  it('produces completely deterministic predictions for identical inputs', () => {
    const input: PredictorInput = {
      hour: 21,
      dayOfWeek: 5,
      weather: 'Rain',
      lighting: 'Dark',
      roadType: 'Flyover Ramp',
      speedLimit: 50,
      junctionType: 'Crossroads',
      vruPresence: true,
    };

    const res1 = model.predict(input);
    const res2 = model.predict(input);

    expect(res1.probabilities.slight).toBe(res2.probabilities.slight);
    expect(res1.probabilities.severe).toBe(res2.probabilities.severe);
    expect(res1.probabilities.fatal).toBe(res2.probabilities.fatal);
    expect(res1.compositeRiskScore).toBe(res2.compositeRiskScore);
    expect(res1.confidenceScore).toBe(res2.confidenceScore);
    expect(res1.riskLevel).toBe(res2.riskLevel);
  });

  it('preserves strict monotonicity: Fog + Night >= Clear + Day for the same location', () => {
    const clearDay: PredictorInput = {
      ...baseInput,
      weather: 'Clear',
      lighting: 'Daylight',
      hour: 12,
    };

    const fogNight: PredictorInput = {
      ...baseInput,
      weather: 'Fog',
      lighting: 'Dark',
      hour: 23,
    };

    const clearDayResult = model.predict(clearDay);
    const fogNightResult = model.predict(fogNight);

    // Composite risk score must be monotonic
    expect(fogNightResult.compositeRiskScore).toBeGreaterThanOrEqual(clearDayResult.compositeRiskScore);

    // Fatal probability must increase under Fog + Night
    expect(fogNightResult.probabilities.fatal).toBeGreaterThan(clearDayResult.probabilities.fatal);

    // Total high-severity probability (Severe + Fatal) must strictly increase
    const clearHighSeverity = clearDayResult.probabilities.severe + clearDayResult.probabilities.fatal;
    const fogHighSeverity = fogNightResult.probabilities.severe + fogNightResult.probabilities.fatal;
    expect(fogHighSeverity).toBeGreaterThan(clearHighSeverity);

    // Slight probability must decrease
    expect(fogNightResult.probabilities.slight).toBeLessThan(clearDayResult.probabilities.slight);
  });

  it('preserves monotonicity: Rain >= Clear (all else equal)', () => {
    const clearInput = { ...baseInput, weather: 'Clear' as const };
    const rainInput = { ...baseInput, weather: 'Rain' as const };

    const clearScore = model.computeCompositeRisk(model.predictProbabilities(clearInput));
    const rainScore = model.computeCompositeRisk(model.predictProbabilities(rainInput));

    expect(rainScore).toBeGreaterThan(clearScore);
  });

  it('preserves monotonicity: High Speed >= Low Speed (all else equal)', () => {
    const lowSpeed = { ...baseInput, speedLimit: 25 };
    const highSpeed = { ...baseInput, speedLimit: 65 };

    const lowScore = model.computeCompositeRisk(model.predictProbabilities(lowSpeed));
    const highScore = model.computeCompositeRisk(model.predictProbabilities(highSpeed));

    expect(highScore).toBeGreaterThan(lowScore);
  });

  it('preserves monotonicity: VRU presence >= No VRU (all else equal)', () => {
    const noVru = { ...baseInput, vruPresence: false };
    const withVru = { ...baseInput, vruPresence: true };

    const noVruScore = model.computeCompositeRisk(model.predictProbabilities(noVru));
    const withVruScore = model.computeCompositeRisk(model.predictProbabilities(withVru));

    expect(withVruScore).toBeGreaterThan(noVruScore);
  });

  it('generates explainability factor contributions and dynamic sentence via ablation', () => {
    const riskyInput: PredictorInput = {
      hour: 23,
      dayOfWeek: 5,
      weather: 'Fog',
      lighting: 'Dark',
      roadType: 'Expressway',
      speedLimit: 65,
      junctionType: 'Crossroads',
      vruPresence: true,
    };

    const result = model.predict(riskyInput);

    expect(result.contributions.length).toBeGreaterThan(3);
    expect(result.explanationSentence.length).toBeGreaterThan(20);

    // Top factors should have positive risk delta
    const topPositive = result.contributions.find((c) => c.direction === 'up');
    expect(topPositive).toBeDefined();
    expect(topPositive!.deltaRiskPercentage).toBeGreaterThan(0);
  });

  it('provides honest model evaluation with accuracy, precision, recall, and confusion matrix', () => {
    const evalData = model.getEvaluation();

    expect(evalData.accuracy).toBeGreaterThan(0.65);
    expect(evalData.sampleCount).toBe(650);

    // Per-class metrics
    expect(evalData.perClassMetrics.slight.precision).toBeGreaterThan(0);
    expect(evalData.perClassMetrics.slight.recall).toBeGreaterThan(0);
    expect(evalData.perClassMetrics.severe.precision).toBeGreaterThan(0);
    expect(evalData.perClassMetrics.fatal.precision).toBeGreaterThan(0);

    // Confusion matrix checks
    const matrix = evalData.confusionMatrix.matrix;
    const slightTotal = matrix.slight.slight + matrix.slight.severe + matrix.slight.fatal;
    const severeTotal = matrix.severe.slight + matrix.severe.severe + matrix.severe.fatal;
    const fatalTotal = matrix.fatal.slight + matrix.fatal.severe + matrix.fatal.fatal;

    expect(slightTotal + severeTotal + fatalTotal).toBe(650);
    expect(evalData.datasetNote).toContain('synthetic');
  });

  it('evaluates weather alert layer on corridors and formats dynamic banner message', () => {
    const { corridorRisks, bannerInfo } = evaluateCorridorsUnderWeather(BENGALURU_CORRIDORS, 'Rain');

    expect(corridorRisks.length).toBe(BENGALURU_CORRIDORS.length);
    expect(bannerInfo.elevatedCorridorsCount).toBeGreaterThan(0);
    expect(bannerInfo.bannerTitle).toContain('Rain raises predicted risk');
    expect(bannerInfo.bannerTitle).toContain(String(bannerInfo.elevatedCorridorsCount));

    // Fog should raise risk across all corridors
    const fogResult = evaluateCorridorsUnderWeather(BENGALURU_CORRIDORS, 'Fog');
    expect(fogResult.bannerInfo.bannerTitle).toContain('Dense Fog');
    expect(fogResult.bannerInfo.elevatedCorridorsCount).toBe(BENGALURU_CORRIDORS.length);
  });

  it('correctly maps WMO weather codes and handles graceful offline fallback', async () => {
    expect(mapWmoCodeToFilter(0, 1)).toBe('Clear');
    expect(mapWmoCodeToFilter(0, 0)).toBe('Night');
    expect(mapWmoCodeToFilter(61, 1)).toBe('Rain');
    expect(mapWmoCodeToFilter(45, 1)).toBe('Fog');

    // Offline fallback test with invalid host / offline response
    const fallback = await fetchLiveWeather(999, 999, 'TestCity');
    expect(fallback).toBeDefined();
    expect(fallback.filter).toBeDefined();
  });
});
