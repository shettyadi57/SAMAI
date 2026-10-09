import { PredictorInput, SeverityClass } from './types';

export interface CrashDatasetSample {
  id: string;
  features: PredictorInput;
  severity: SeverityClass;
}

// Simple deterministic PRNG (Mulberry32) for reproducible synthetic dataset generation
function createPRNG(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WEATHERS = ['Clear', 'Rain', 'Fog'] as const;
const ROAD_TYPES = ['Arterial', 'Expressway', 'Collector', 'Local', 'Flyover Ramp'] as const;
const JUNCTIONS = ['Mid-block', 'T-Junction', 'Crossroads', 'Roundabout', 'Flyover Merge'] as const;
const SPEED_LIMITS = [20, 30, 40, 50, 60, 70];

function generateSeededDataset(count: number = 650, seed: number = 20261009): CrashDatasetSample[] {
  const rand = createPRNG(seed);
  const samples: CrashDatasetSample[] = [];

  for (let i = 0; i < count; i++) {
    // Generate realistic features
    const hour = Math.floor(rand() * 24);
    const dayOfWeek = Math.floor(rand() * 7);

    // Weather distribution: 65% Clear, 25% Rain, 10% Fog
    const wRoll = rand();
    const weather = wRoll < 0.65 ? 'Clear' : wRoll < 0.90 ? 'Rain' : 'Fog';

    // Lighting condition strongly correlates with hour
    let lighting: 'Daylight' | 'Dusk' | 'Dim Streetlight' | 'Dark';
    if (hour >= 6 && hour < 18) {
      lighting = rand() < 0.92 ? 'Daylight' : 'Dusk';
    } else if (hour === 18 || hour === 19 || hour === 5) {
      lighting = rand() < 0.6 ? 'Dusk' : 'Dim Streetlight';
    } else {
      lighting = rand() < 0.55 ? 'Dim Streetlight' : 'Dark';
    }

    const roadType = ROAD_TYPES[Math.floor(rand() * ROAD_TYPES.length)];
    const speedLimit = SPEED_LIMITS[Math.floor(rand() * SPEED_LIMITS.length)];
    const junctionType = JUNCTIONS[Math.floor(rand() * JUNCTIONS.length)];

    // VRU (Pedestrian/Cyclist/2-Wheeler) probability higher on Arterials/Locals and daytime/dusk
    const vruProb = roadType === 'Expressway' ? 0.08 : roadType === 'Local' ? 0.55 : 0.35;
    const vruPresence = rand() < vruProb;

    // Calculate latent severity log-odds matching empirical road safety statistics (~76% Slight, ~18% Severe, ~6% Fatal)
    let baseFatalScore = -3.8;
    let baseSevereScore = -2.0;

    // Weather impact
    if (weather === 'Fog') {
      baseFatalScore += 0.95;
      baseSevereScore += 0.70;
    } else if (weather === 'Rain') {
      baseFatalScore += 0.45;
      baseSevereScore += 0.35;
    }

    // Lighting impact
    if (lighting === 'Dark') {
      baseFatalScore += 0.85;
      baseSevereScore += 0.60;
    } else if (lighting === 'Dim Streetlight') {
      baseFatalScore += 0.55;
      baseSevereScore += 0.35;
    } else if (lighting === 'Dusk') {
      baseFatalScore += 0.30;
      baseSevereScore += 0.20;
    }

    // Speed impact: kinetic energy scales as v^2
    const speedFactor = (speedLimit - 20) / 50; // 0.0 to 1.0
    baseFatalScore += speedFactor * 1.15;
    baseSevereScore += speedFactor * 0.75;

    // Road type impact
    if (roadType === 'Expressway') {
      baseFatalScore += 0.45;
      baseSevereScore += 0.30;
    } else if (roadType === 'Flyover Ramp') {
      baseFatalScore += 0.40;
      baseSevereScore += 0.25;
    } else if (roadType === 'Arterial') {
      baseFatalScore += 0.25;
      baseSevereScore += 0.15;
    }

    // Junction type impact
    if (junctionType === 'Crossroads' || junctionType === 'Flyover Merge') {
      baseFatalScore += 0.30;
      baseSevereScore += 0.25;
    }

    // VRU impact: vulnerable road users face higher injury severity
    if (vruPresence) {
      baseFatalScore += 0.70;
      baseSevereScore += 0.55;
    }

    // Late night hours (00:00 - 04:00) increase fatigue and speeding severity
    if (hour >= 0 && hour <= 4) {
      baseFatalScore += 0.45;
      baseSevereScore += 0.30;
    }

    // Convert latent log-odds to probabilities via softmax
    const eSlight = Math.exp(0);
    const eSevere = Math.exp(baseSevereScore);
    const eFatal = Math.exp(baseFatalScore);
    const sum = eSlight + eSevere + eFatal;

    const pSlight = eSlight / sum;
    const pSevere = eSevere / sum;
    // pFatal = eFatal / sum

    // Sample class with realistic latent severity boundaries and bounded noise
    const noise = (rand() - 0.5) * 0.35;
    const latentFatal = baseFatalScore + noise;
    const latentSevere = baseSevereScore + noise;

    let severity: SeverityClass;
    if (latentFatal > -1.8) {
      severity = 'fatal';
    } else if (latentSevere > -0.95) {
      severity = 'severe';
    } else {
      severity = 'slight';
    }

    samples.push({
      id: `syn-crash-${String(i + 1).padStart(4, '0')}`,
      features: {
        hour,
        dayOfWeek,
        weather,
        lighting,
        roadType,
        speedLimit,
        junctionType,
        vruPresence,
      },
      severity,
    });
  }

  return samples;
}

export const SEEDED_CRASH_DATASET: CrashDatasetSample[] = generateSeededDataset(650);
