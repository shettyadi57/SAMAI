import React from 'react';
import {
  PredictorInput,
  WeatherCondition,
  LightingCondition,
  RoadTypeOption,
  JunctionTypeOption,
} from '../../engine/predictor';
import { HighRiskCorridor } from '../../types';
import {
  Sliders,
  Clock,
  Calendar,
  CloudSun,
  Sun,
  CloudRain,
  CloudFog,
  Moon,
  Compass,
  Gauge,
  Users,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';

interface ConditionsPanelProps {
  input: PredictorInput;
  onChange: (newInput: PredictorInput) => void;
  corridors: HighRiskCorridor[];
  onSelectCorridorPreset?: (corridor: HighRiskCorridor) => void;
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const ConditionsPanel: React.FC<ConditionsPanelProps> = ({
  input,
  onChange,
  corridors,
  onSelectCorridorPreset,
}) => {
  const updateField = <K extends keyof PredictorInput>(field: K, value: PredictorInput[K]) => {
    onChange({
      ...input,
      [field]: value,
    });
  };

  const handleCorridorChange = (corridorId: string) => {
    const c = corridors.find((corr) => corr.id === corridorId);
    if (!c) return;

    // Map corridor attributes to PredictorInput
    const lower = c.roadType.toLowerCase();
    let roadType: RoadTypeOption = 'Local';
    if (lower.includes('expressway') || lower.includes('highway')) roadType = 'Expressway';
    else if (lower.includes('flyover') || lower.includes('ramp')) roadType = 'Flyover Ramp';
    else if (lower.includes('arterial') || lower.includes('concourse')) roadType = 'Arterial';
    else if (lower.includes('collector')) roadType = 'Collector';

    const comb = (c.name + ' ' + c.roadType).toLowerCase();
    let junctionType: JunctionTypeOption = 'Mid-block';
    if (comb.includes('flyover') || comb.includes('ramp')) junctionType = 'Flyover Merge';
    else if (comb.includes('junction') || comb.includes('signal')) junctionType = 'Crossroads';
    else if (comb.includes('roundabout') || comb.includes('circle')) junctionType = 'Roundabout';
    else if (comb.includes('curve') || comb.includes('merge')) junctionType = 'T-Junction';

    onChange({
      ...input,
      roadType,
      speedLimit: c.speedLimitMph || 40,
      junctionType,
      vruPresence: c.percentiles.vruDensity >= 50,
    });

    if (onSelectCorridorPreset) {
      onSelectCorridorPreset(c);
    }
  };

  // Scenario presets
  const applyPreset = (preset: 'monsoon' | 'fog_night' | 'school' | 'clear_freeway') => {
    if (preset === 'monsoon') {
      onChange({
        ...input,
        hour: 19,
        weather: 'Rain',
        lighting: 'Dark',
        roadType: 'Arterial',
        speedLimit: 45,
        junctionType: 'Crossroads',
        vruPresence: true,
      });
    } else if (preset === 'fog_night') {
      onChange({
        ...input,
        hour: 3,
        weather: 'Fog',
        lighting: 'Dark',
        roadType: 'Expressway',
        speedLimit: 65,
        junctionType: 'Flyover Merge',
        vruPresence: false,
      });
    } else if (preset === 'school') {
      onChange({
        ...input,
        hour: 14,
        weather: 'Clear',
        lighting: 'Daylight',
        roadType: 'Local',
        speedLimit: 25,
        junctionType: 'Mid-block',
        vruPresence: true,
      });
    } else if (preset === 'clear_freeway') {
      onChange({
        ...input,
        hour: 11,
        weather: 'Clear',
        lighting: 'Daylight',
        roadType: 'Expressway',
        speedLimit: 55,
        junctionType: 'Mid-block',
        vruPresence: false,
      });
    }
  };

  const resetToSafe = () => {
    onChange({
      hour: 14,
      dayOfWeek: 2,
      weather: 'Clear',
      lighting: 'Daylight',
      roadType: 'Local',
      speedLimit: 25,
      junctionType: 'Mid-block',
      vruPresence: false,
    });
  };

  return (
    <div className="bg-navy-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm space-y-5">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-emerald" />
            Operational Conditions Panel
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure spatio-temporal parameters for real-time model evaluation
          </p>
        </div>
        <button
          onClick={resetToSafe}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white transition-all border border-slate-700/60"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Safe Baseline</span>
        </button>
      </div>

      {/* Corridor Quick Load & Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 block flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Prefill from Monitored Corridor</span>
          </label>
          <select
            onChange={(e) => handleCorridorChange(e.target.value)}
            defaultValue=""
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-cyan"
          >
            <option value="" disabled>
              Select corridor to import parameters...
            </option>
            {corridors.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.rank} {c.name} ({c.speedLimitMph} mph, {c.roadType})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 block flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Hazard Scenario Simulation Presets</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => applyPreset('monsoon')}
              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-[11px] font-semibold rounded-lg border border-slate-700 text-left truncate hover:border-brand-cyan transition-colors"
            >
              🌧️ Monsoon Rush Hour
            </button>
            <button
              onClick={() => applyPreset('fog_night')}
              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-[11px] font-semibold rounded-lg border border-slate-700 text-left truncate hover:border-brand-cyan transition-colors"
            >
              🌫️ Foggy Midnight Ramp
            </button>
            <button
              onClick={() => applyPreset('school')}
              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-[11px] font-semibold rounded-lg border border-slate-700 text-left truncate hover:border-brand-cyan transition-colors"
            >
              🏫 School Zone Daylight
            </button>
            <button
              onClick={() => applyPreset('clear_freeway')}
              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-[11px] font-semibold rounded-lg border border-slate-700 text-left truncate hover:border-brand-cyan transition-colors"
            >
              ☀️ Clear Day Expressway
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Temporal, Weather & Geometry */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Time of Day Slider */}
        <div className="lg:col-span-2 p-3.5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-emerald" />
              Time of Day Slider
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-slate-200 text-xs">
                {String(input.hour).padStart(2, '0')}:00 hrs
              </span>
              <span className="text-[11px] text-slate-400">
                {input.hour >= 6 && input.hour <= 17
                  ? '☀️ Daytime'
                  : input.hour >= 18 && input.hour <= 20
                  ? '🌆 Dusk / Evening Peak'
                  : '🌙 Late Night'}
              </span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="23"
            step="1"
            value={input.hour}
            onChange={(e) => updateField('hour', Number(e.target.value))}
            className="w-full accent-brand-emerald cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>00:00 (Midnight)</span>
            <span>06:00 (Dawn)</span>
            <span>12:00 (Noon)</span>
            <span>18:00 (Dusk)</span>
            <span>23:00 (Night)</span>
          </div>
        </div>

        {/* Day of Week */}
        <div className="p-3.5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            Day of Week
          </label>
          <select
            value={input.dayOfWeek}
            onChange={(e) => updateField('dayOfWeek', Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-cyan"
          >
            {DAYS_OF_WEEK.map((day, idx) => (
              <option key={day} value={idx}>
                {day} {idx === 0 || idx === 6 ? '(Weekend)' : '(Weekday)'}
              </option>
            ))}
          </select>
        </div>

        {/* Weather Selector */}
        <div className="p-3.5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <CloudSun className="w-3.5 h-3.5 text-brand-cyan" />
            Weather Condition
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['Clear', 'Rain', 'Fog'] as WeatherCondition[]).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => updateField('weather', w)}
                className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                  input.weather === w
                    ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {w === 'Clear' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
                {w === 'Rain' && <CloudRain className="w-3.5 h-3.5 text-blue-400" />}
                {w === 'Fog' && <CloudFog className="w-3.5 h-3.5 text-slate-400" />}
                <span>{w}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lighting Selector */}
        <div className="p-3.5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            Lighting Condition
          </label>
          <select
            value={input.lighting}
            onChange={(e) => updateField('lighting', e.target.value as LightingCondition)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-cyan"
          >
            <option value="Daylight">Daylight (Full Sun)</option>
            <option value="Dusk">Dusk / Twilight (Low Sun Angle)</option>
            <option value="Dim Streetlight">Dim Streetlight (Partial Lux)</option>
            <option value="Dark">Dark (Unlit / Pitch Black)</option>
          </select>
        </div>

        {/* Road Type */}
        <div className="p-3.5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            Road Classification
          </label>
          <select
            value={input.roadType}
            onChange={(e) => updateField('roadType', e.target.value as RoadTypeOption)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-cyan"
          >
            <option value="Arterial">Arterial Concourse</option>
            <option value="Expressway">Expressway / Radial Highway</option>
            <option value="Collector">Collector Road</option>
            <option value="Local">Local Residential Street</option>
            <option value="Flyover Ramp">Flyover Incline / Exit Ramp</option>
          </select>
        </div>

        {/* Speed Limit Slider */}
        <div className="p-3.5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-rose-400" />
              Speed Limit
            </span>
            <span className="font-mono font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded text-xs">
              {input.speedLimit} mph ({Math.round(input.speedLimit * 1.6)} km/h)
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="70"
            step="5"
            value={input.speedLimit}
            onChange={(e) => updateField('speedLimit', Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>20 mph (Calmed)</span>
            <span>40 mph</span>
            <span>70 mph (Expressway)</span>
          </div>
        </div>

        {/* Junction Type */}
        <div className="p-3.5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            Junction Topology
          </label>
          <select
            value={input.junctionType}
            onChange={(e) => updateField('junctionType', e.target.value as JunctionTypeOption)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-cyan"
          >
            <option value="Mid-block">None / Mid-block Straight</option>
            <option value="T-Junction">T-Junction / Uncontrolled Merge</option>
            <option value="Crossroads">Signalized 4-Way Crossroads</option>
            <option value="Roundabout">Rotary / Roundabout Circle</option>
            <option value="Flyover Merge">Flyover Merge / Incline Loop</option>
          </select>
        </div>

        {/* Vulnerable Road Users (VRU) Toggle */}
        <div className="p-3.5 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              VRU Presence
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Pedestrians, cyclists, two-wheelers
            </p>
          </div>
          <button
            type="button"
            onClick={() => updateField('vruPresence', !input.vruPresence)}
            className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none p-0.5 ${
              input.vruPresence ? 'bg-amber-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                input.vruPresence ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
