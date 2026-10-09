import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import {
  getPredictorModel,
  PredictorInput,
  WeatherAlertFilter,
} from '../engine/predictor';
import { ConditionsPanel } from '../components/predictor/ConditionsPanel';
import { SeverityBars } from '../components/predictor/SeverityBars';
import { RiskGauge } from '../components/predictor/RiskGauge';
import { ExplainabilityView } from '../components/predictor/ExplainabilityView';
import { WeatherAlertMap } from '../components/predictor/WeatherAlertMap';
import { ModelEvaluationCard } from '../components/predictor/ModelEvaluationCard';
import {
  BrainCircuit,
  MapPin,
  Shield,
  Activity,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { HighRiskCorridor } from '../types';

export const RiskPredictorPage: React.FC = () => {
  const { corridors, activeCity, setActiveCity, activeCityPreset } = useData();

  // Model singleton instance (cached in memory)
  const model = useMemo(() => getPredictorModel(), []);
  const evaluation = useMemo(() => model.getEvaluation(), [model]);

  // Interactive conditions input state
  const [conditionsInput, setConditionsInput] = useState<PredictorInput>({
    hour: 19,
    dayOfWeek: 5,
    weather: 'Rain',
    lighting: 'Dark',
    roadType: 'Arterial',
    speedLimit: 45,
    junctionType: 'Crossroads',
    vruPresence: true,
  });

  // Weather alert filter for spatial corridor layer
  const [weatherAlertFilter, setWeatherAlertFilter] = useState<WeatherAlertFilter>('Rain');

  // Real-time in-browser prediction
  const predictionResult = useMemo(() => {
    return model.predict(conditionsInput);
  }, [model, conditionsInput]);

  // Quick simulate handler from map popup or presets
  const handleSimulateCorridor = (corridor: HighRiskCorridor) => {
    const lower = corridor.roadType.toLowerCase();
    let roadType: PredictorInput['roadType'] = 'Local';
    if (lower.includes('expressway') || lower.includes('highway')) roadType = 'Expressway';
    else if (lower.includes('flyover') || lower.includes('ramp')) roadType = 'Flyover Ramp';
    else if (lower.includes('arterial') || lower.includes('concourse')) roadType = 'Arterial';
    else if (lower.includes('collector')) roadType = 'Collector';

    const comb = (corridor.name + ' ' + corridor.roadType).toLowerCase();
    let junctionType: PredictorInput['junctionType'] = 'Mid-block';
    if (comb.includes('flyover') || comb.includes('ramp')) junctionType = 'Flyover Merge';
    else if (comb.includes('junction') || comb.includes('signal')) junctionType = 'Crossroads';
    else if (comb.includes('roundabout') || comb.includes('circle')) junctionType = 'Roundabout';
    else if (comb.includes('curve') || comb.includes('merge')) junctionType = 'T-Junction';

    setConditionsInput((prev) => ({
      ...prev,
      roadType,
      speedLimit: corridor.speedLimitMph || 40,
      junctionType,
      vruPresence: corridor.percentiles.vruDensity >= 50,
    }));

    // Smooth scroll down to conditions simulator
    const el = document.getElementById('simulator-panel');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-navy-950 text-slate-100 p-4 lg:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-cyan/15 border border-brand-cyan/40 text-brand-cyan flex items-center gap-1">
              <BrainCircuit className="w-3 h-3" />
              Machine Learning Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 border border-purple-500/40 text-purple-300">
              In-Browser Softmax Model
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>AI Crash Risk & Severity Predictor</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time in-browser multinomial logistic regression forecasting crash severity distributions,
            feature sensitivities, and weather hazard corridor impacts.
          </p>
        </div>

        {/* City Selector Tabs */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          <MapPin className="w-4 h-4 text-brand-emerald ml-2" />
          {(['bengaluru', 'delhi', 'basel'] as const).map((city) => (
            <button
              key={city}
              onClick={() => setActiveCity(city)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                activeCity === city
                  ? 'bg-brand-emerald text-navy-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {city === 'bengaluru' ? 'Bengaluru Metro' : city === 'delhi' ? 'Delhi NCR' : 'Basel Pilot'}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: Weather Alert Layer & Map */}
      <div>
        <WeatherAlertMap
          corridors={corridors}
          selectedWeather={weatherAlertFilter}
          onWeatherChange={setWeatherAlertFilter}
          cityCenter={activeCityPreset.center}
          cityZoom={activeCityPreset.zoom}
          cityName={activeCityPreset.name}
          onSimulateCorridor={handleSimulateCorridor}
        />
      </div>

      {/* SECTION 2: Scenario Simulator & Real-time Predictions */}
      <div id="simulator-panel" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-emerald" />
              Interactive Scenario Risk Simulator
            </h2>
            <p className="text-xs text-slate-400">
              Adjust temporal, environmental, and road topology parameters to observe immediate probabilistic shifts
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* Left Column: Conditions Input Panel (7 Cols) */}
          <div className="xl:col-span-7">
            <ConditionsPanel
              input={conditionsInput}
              onChange={setConditionsInput}
              corridors={corridors}
            />
          </div>

          {/* Right Column: Model Output Cards (5 Cols) */}
          <div className="xl:col-span-5 flex flex-col gap-4">
            {/* Risk Gauge */}
            <RiskGauge
              score={predictionResult.compositeRiskScore}
              level={predictionResult.riskLevel}
              confidenceScore={predictionResult.confidenceScore}
            />

            {/* Severity Probabilities */}
            <SeverityBars probabilities={predictionResult.probabilities} />
          </div>
        </div>

        {/* Explainability View (Full Width) */}
        <div>
          <ExplainabilityView
            contributions={predictionResult.contributions}
            explanationSentence={predictionResult.explanationSentence}
          />
        </div>
      </div>

      {/* SECTION 3: Honest Model Evaluation & Transparency Audit */}
      <div>
        <ModelEvaluationCard evaluation={evaluation} />
      </div>
    </div>
  );
};
