import React from 'react';
import { ModelEvaluation } from '../../engine/predictor';
import {
  BrainCircuit,
  Info,
  CheckCircle2,
  Table,
  ShieldAlert,
  HelpCircle,
  FileText,
} from 'lucide-react';

interface ModelEvaluationCardProps {
  evaluation: ModelEvaluation;
}

export const ModelEvaluationCard: React.FC<ModelEvaluationCardProps> = ({ evaluation }) => {
  const { accuracy, perClassMetrics, confusionMatrix, sampleCount, datasetNote } = evaluation;
  const matrix = confusionMatrix.matrix;

  // Max cell value for matrix shading
  const maxCell = Math.max(
    matrix.slight.slight,
    matrix.slight.severe,
    matrix.slight.fatal,
    matrix.severe.slight,
    matrix.severe.severe,
    matrix.severe.fatal,
    matrix.fatal.slight,
    matrix.fatal.severe,
    matrix.fatal.fatal
  );

  const getCellBg = (count: number, isDiagonal: boolean) => {
    if (count === 0) return 'bg-slate-900/60 text-slate-400';
    const intensity = Math.min(1, count / (maxCell || 1));
    if (isDiagonal) {
      return intensity > 0.6
        ? 'bg-emerald-600/40 text-emerald-200 border-emerald-500/50'
        : 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30';
    }
    return intensity > 0.4
      ? 'bg-amber-600/30 text-amber-200 border-amber-500/40'
      : 'bg-slate-800/80 text-slate-300 border-slate-700/50';
  };

  return (
    <div className="bg-navy-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-purple-400" />
            Empirical Model Evaluation & Audit Metrics
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent validation metrics computed across all {sampleCount} dataset samples
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Overall Accuracy: {(accuracy * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Per-Class Metrics Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Table className="w-3.5 h-3.5 text-brand-cyan" />
            Per-Class Precision, Recall & F1-Score
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                  <th className="py-2.5 px-3 font-semibold">Severity Class</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Precision</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Recall</th>
                  <th className="py-2.5 px-3 font-semibold text-right">F1-Score</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
                <tr>
                  <td className="py-2.5 px-3 font-sans font-semibold text-emerald-400">Slight</td>
                  <td className="py-2.5 px-3 text-right">
                    {(perClassMetrics.slight.precision * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {(perClassMetrics.slight.recall * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {(perClassMetrics.slight.f1Score * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400">
                    {perClassMetrics.slight.support}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-semibold text-amber-400">Severe</td>
                  <td className="py-2.5 px-3 text-right">
                    {(perClassMetrics.severe.precision * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {(perClassMetrics.severe.recall * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {(perClassMetrics.severe.f1Score * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400">
                    {perClassMetrics.severe.support}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-semibold text-rose-400">Fatal</td>
                  <td className="py-2.5 px-3 text-right">
                    {(perClassMetrics.fatal.precision * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {(perClassMetrics.fatal.recall * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {(perClassMetrics.fatal.f1Score * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400">
                    {perClassMetrics.fatal.support}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3x3 Confusion Matrix Grid */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
            3×3 Multiclass Confusion Matrix
          </h4>
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 overflow-x-auto">
            <div className="min-w-[280px]">
              {/* Header Columns */}
              <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                <div className="text-left font-sans text-slate-400">Actual ↓ / Pred →</div>
                <div className="text-emerald-400">Pred Slight</div>
                <div className="text-amber-400">Pred Severe</div>
                <div className="text-rose-400">Pred Fatal</div>
              </div>

              {/* Row 1: True Slight */}
              <div className="grid grid-cols-4 gap-1.5 items-center mb-1.5">
                <span className="text-xs font-semibold text-emerald-400">True Slight</span>
                <div
                  className={`py-2 text-center rounded-lg font-mono font-bold text-xs border ${getCellBg(
                    matrix.slight.slight,
                    true
                  )}`}
                >
                  {matrix.slight.slight}
                </div>
                <div
                  className={`py-2 text-center rounded-lg font-mono text-xs border ${getCellBg(
                    matrix.slight.severe,
                    false
                  )}`}
                >
                  {matrix.slight.severe}
                </div>
                <div
                  className={`py-2 text-center rounded-lg font-mono text-xs border ${getCellBg(
                    matrix.slight.fatal,
                    false
                  )}`}
                >
                  {matrix.slight.fatal}
                </div>
              </div>

              {/* Row 2: True Severe */}
              <div className="grid grid-cols-4 gap-1.5 items-center mb-1.5">
                <span className="text-xs font-semibold text-amber-400">True Severe</span>
                <div
                  className={`py-2 text-center rounded-lg font-mono text-xs border ${getCellBg(
                    matrix.severe.slight,
                    false
                  )}`}
                >
                  {matrix.severe.slight}
                </div>
                <div
                  className={`py-2 text-center rounded-lg font-mono font-bold text-xs border ${getCellBg(
                    matrix.severe.severe,
                    true
                  )}`}
                >
                  {matrix.severe.severe}
                </div>
                <div
                  className={`py-2 text-center rounded-lg font-mono text-xs border ${getCellBg(
                    matrix.severe.fatal,
                    false
                  )}`}
                >
                  {matrix.severe.fatal}
                </div>
              </div>

              {/* Row 3: True Fatal */}
              <div className="grid grid-cols-4 gap-1.5 items-center">
                <span className="text-xs font-semibold text-rose-400">True Fatal</span>
                <div
                  className={`py-2 text-center rounded-lg font-mono text-xs border ${getCellBg(
                    matrix.fatal.slight,
                    false
                  )}`}
                >
                  {matrix.fatal.slight}
                </div>
                <div
                  className={`py-2 text-center rounded-lg font-mono text-xs border ${getCellBg(
                    matrix.fatal.severe,
                    false
                  )}`}
                >
                  {matrix.fatal.severe}
                </div>
                <div
                  className={`py-2 text-center rounded-lg font-mono font-bold text-xs border ${getCellBg(
                    matrix.fatal.fatal,
                    true
                  )}`}
                >
                  {matrix.fatal.fatal}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Synthetic Dataset Disclosure Note */}
      <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 flex items-start gap-3">
        <Info className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white font-semibold">Dataset & Model Disclosure: </strong>
          {datasetNote}
        </div>
      </div>
    </div>
  );
};
