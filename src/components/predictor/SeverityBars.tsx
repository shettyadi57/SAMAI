import React from 'react';
import { SeverityProbabilities } from '../../engine/predictor';
import { ShieldCheck, AlertCircle, Skull, CheckCircle2 } from 'lucide-react';

interface SeverityBarsProps {
  probabilities: SeverityProbabilities;
}

export const SeverityBars: React.FC<SeverityBarsProps> = ({ probabilities }) => {
  const slightPct = Math.round(probabilities.slight * 1000) / 10;
  const severePct = Math.round(probabilities.severe * 1000) / 10;
  const fatalPct = Math.round(probabilities.fatal * 1000) / 10;

  // Exact display sum to verify 100%
  const sumDisplay = (slightPct + severePct + fatalPct).toFixed(1);

  return (
    <div className="bg-navy-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-emerald" />
            Crash Severity Probabilities
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Multinomial Softmax Output distribution (P(Class))
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] font-mono font-semibold text-slate-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Sum: {sumDisplay}%</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Slight */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              P(Slight Injury / Damage)
            </span>
            <span className="font-mono font-bold text-slate-200 text-sm">
              {slightPct.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(16,185,129,0.4)]"
              style={{ width: `${Math.max(2, slightPct)}%` }}
            />
          </div>
        </div>

        {/* Severe */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-semibold text-amber-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
              P(Severe Hospitalization)
            </span>
            <span className="font-mono font-bold text-slate-200 text-sm">
              {severePct.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(245,158,11,0.4)]"
              style={{ width: `${Math.max(2, severePct)}%` }}
            />
          </div>
        </div>

        {/* Fatal */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-semibold text-rose-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>
              P(Fatal Injury)
            </span>
            <span className="font-mono font-bold text-slate-200 text-sm">
              {fatalPct.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-red-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(244,63,94,0.5)]"
              style={{ width: `${Math.max(2, fatalPct)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
