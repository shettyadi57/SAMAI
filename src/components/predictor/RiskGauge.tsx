import React from 'react';
import { RiskLevel } from '../../engine/predictor';
import { AlertTriangle, Flame, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';

interface RiskGaugeProps {
  score: number; // 0 - 100
  level: RiskLevel;
  confidenceScore: number; // 0 - 100%
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, level, confidenceScore }) => {
  // Angle for semi-circular needle: 0 score = -90 deg (left), 100 score = +90 deg (right)
  const clampedScore = Math.max(0, Math.min(100, score));
  const angle = -90 + (clampedScore / 100) * 180;

  const levelConfigs: Record<
    RiskLevel,
    { badgeBg: string; text: string; glow: string; label: string; icon: React.ReactNode }
  > = {
    Low: {
      badgeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
      text: 'text-emerald-400',
      glow: 'rgba(16,185,129,0.3)',
      label: 'Low Operational Risk',
      icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" />,
    },
    Medium: {
      badgeBg: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-400',
      text: 'text-yellow-400',
      glow: 'rgba(234,179,8,0.3)',
      label: 'Moderate Corridor Risk',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />,
    },
    High: {
      badgeBg: 'bg-orange-500/15 border-orange-500/40 text-orange-400',
      text: 'text-orange-400',
      glow: 'rgba(249,115,22,0.35)',
      label: 'High Accident Danger',
      icon: <Flame className="w-3.5 h-3.5 text-orange-400" />,
    },
    Critical: {
      badgeBg: 'bg-red-500/20 border-red-500/50 text-red-400',
      text: 'text-red-400',
      glow: 'rgba(239,68,68,0.5)',
      label: 'Critical Hazard Alert',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" />,
    },
  };

  const config = levelConfigs[level];

  return (
    <div className="bg-navy-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Overall Predicted Risk
          </span>
          <h4 className="text-sm font-bold text-white mt-0.5">Composite Risk Index</h4>
        </div>
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.badgeBg}`}
        >
          {config.icon}
          <span>{level}</span>
        </div>
      </div>

      {/* SVG Semi-Circle Radial Gauge */}
      <div className="relative flex flex-col items-center justify-center my-3">
        <svg viewBox="0 0 200 115" className="w-56 h-32 overflow-visible">
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="35%" stopColor="#FACC15" />
              <stop offset="70%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
            <filter id="gaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Background Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1E293B"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Color Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="14"
            strokeLinecap="round"
            filter="url(#gaugeShadow)"
          />

          {/* Center Hub */}
          <circle cx="100" cy="100" r="8" fill="#334155" stroke="#0F172A" strokeWidth="3" />
          <circle cx="100" cy="100" r="3.5" fill="#38BDF8" />

          {/* Needle */}
          <g transform={`rotate(${angle}, 100, 100)`} className="transition-transform duration-700 ease-out">
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="28"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#gaugeShadow)"
            />
            <polygon points="97,35 103,35 100,22" fill="#38BDF8" />
          </g>
        </svg>

        {/* Large Score Number in Center Bottom */}
        <div className="text-center -mt-4">
          <div className="flex items-baseline justify-center gap-1 font-mono">
            <span className={`text-4xl font-extrabold tracking-tight ${config.text}`}>
              {score.toFixed(1)}
            </span>
            <span className="text-slate-400 text-sm font-semibold">/100</span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">{config.label}</p>
        </div>
      </div>

      {/* Model Confidence Indicator Bar */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-slate-400 flex items-center gap-1">
            <span>Model Confidence</span>
            <span title="Based on categorical entropy margin over baseline" className="cursor-help">
              <HelpCircle className="w-3 h-3 text-slate-400 hover:text-slate-200" />
            </span>
          </span>
          <span className="font-mono font-bold text-slate-200">{confidenceScore}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-brand-cyan rounded-full transition-all duration-500"
            style={{ width: `${confidenceScore}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 text-right">
          Entropy-calibrated probabilistic certainty
        </p>
      </div>
    </div>
  );
};
