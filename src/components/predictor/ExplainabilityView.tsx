import React from 'react';
import { FactorContribution } from '../../engine/predictor';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import { Sparkles, MessageSquareQuote, TrendingUp, TrendingDown } from 'lucide-react';

interface ExplainabilityViewProps {
  contributions: FactorContribution[];
  explanationSentence: string;
}

export const ExplainabilityView: React.FC<ExplainabilityViewProps> = ({
  contributions,
  explanationSentence,
}) => {
  // Prepare data for horizontal diverging bar chart
  const chartData = contributions.map((c) => ({
    name: c.label,
    delta: c.deltaRiskPercentage,
    value: c.currentValue,
    direction: c.direction,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositive = data.delta > 0;
      return (
        <div className="bg-navy-950 border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs backdrop-blur-md">
          <div className="font-bold text-slate-200 mb-1">{data.name}</div>
          <div className="text-slate-400 mb-1.5">
            Active Setting:{' '}
            <span className="font-semibold text-slate-300 font-mono">{data.value}</span>
          </div>
          <div
            className={`font-mono font-bold flex items-center gap-1.5 ${
              isPositive ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>
              {isPositive ? '+' : ''}
              {data.delta}% Risk Contribution
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {isPositive ? 'Pushes crash severity upward' : 'Protective baseline dampening'}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-navy-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-cyan" />
            Explainable AI — Factor Contribution Analysis
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamic feature ablation (ΔRisk) measuring push factors vs protective dampening
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-red-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
            <span>Elevates Risk (+)</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
            <span>Protective (-)</span>
          </div>
        </div>
      </div>

      {/* Dynamic Plain-English Summary Sentence Card */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
        <MessageSquareQuote className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-cyan block mb-1">
            AI Automated Reasoning Summary
          </span>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {explanationSentence}
          </p>
        </div>
      </div>

      {/* Diverging Bar Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 110, bottom: 10 }}
          >
            <XAxis
              type="number"
              domain={['dataMin - 2', 'dataMax + 2']}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#CBD5E1', fontSize: 11, fontWeight: 500 }}
              width={105}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="#64748B" strokeWidth={1.5} strokeDasharray="3 3" />
            <Bar dataKey="delta" radius={[4, 4, 4, 4]}>
              {chartData.map((entry, index) => {
                const isPositive = entry.delta > 0;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isPositive ? '#F43F5E' : '#10B981'}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[11px] text-slate-400 text-center font-mono">
        Values represent counterfactual sensitivity ΔRisk = R(x) - R(x_baseline) relative to neutral operating baseline
      </div>
    </div>
  );
};
