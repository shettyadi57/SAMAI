import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { HighRiskCorridor, ReviewStatus, RiskCategory } from '../types';
import { RiskBadge, ReviewStatusBadge } from '../components/common/Badge';
import { exportCorridorsToCSV } from '../utils/csvExport';
import {
  Flame,
  Sliders,
  Download,
  Filter,
  ArrowUpDown,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Info,
  Edit3,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
} from 'lucide-react';

export const AuthorityHotspotsPage: React.FC = () => {
  const {
    corridors,
    setSelectedCorridor,
    updateCorridorReview,
    scoringWeights,
    setScoringWeights,
  } = useData();
  const navigate = useNavigate();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskCategory, setSelectedRiskCategory] = useState<string>('all');
  const [selectedReviewStatus, setSelectedReviewStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rank' | 'score' | 'fatal' | 'total'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals
  const [showWeightsModal, setShowWeightsModal] = useState(false);
  const [inspectingCorridor, setInspectingCorridor] = useState<HighRiskCorridor | null>(null);
  const [editStatusCorridor, setEditStatusCorridor] = useState<HighRiskCorridor | null>(null);
  const [newStatus, setNewStatus] = useState<ReviewStatus>('needs_review');
  const [statusNotes, setStatusNotes] = useState('');

  // Local weights tuning state
  const [tempWeights, setTempWeights] = useState({ ...scoringWeights });

  // Filtering
  const filteredCorridors = corridors.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.roadType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk =
      selectedRiskCategory === 'all' || c.riskCategory === selectedRiskCategory;

    const matchesStatus =
      selectedReviewStatus === 'all' || c.reviewStatus === selectedReviewStatus;

    return matchesSearch && matchesRisk && matchesStatus;
  });

  // Sorting
  filteredCorridors.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'rank') comparison = a.rank - b.rank;
    else if (sortBy === 'score') comparison = b.riskScore - a.riskScore;
    else if (sortBy === 'fatal') comparison = b.incidentCounts.fatal - a.incidentCounts.fatal;
    else if (sortBy === 'total') comparison = b.incidentCounts.total - a.incidentCounts.total;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleApplyWeights = () => {
    setScoringWeights(tempWeights);
    setShowWeightsModal(false);
  };

  const handleSaveStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editStatusCorridor) {
      updateCorridorReview(editStatusCorridor.id, newStatus, statusNotes);
      setEditStatusCorridor(null);
    }
  };

  return (
    <div className="flex-1 bg-navy-950 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-[1700px] mx-auto space-y-6">
        {/* ================= HEADER SECTION ================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                <Flame className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Road Safety Priority Queue
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-emerald/15 text-brand-emerald border border-emerald-500/30">
                Explainable Multi-Factor AI
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Deterministic priority ranking combining fatal crash telemetry, frequency, recency, and verified citizen hazard evidence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowWeightsModal(true)}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors shadow-sm"
            >
              <Sliders className="w-4 h-4 text-brand-cyan" />
              <span>Configure AI Scoring Weights</span>
            </button>

            <button
              onClick={() => exportCorridorsToCSV(corridors)}
              className="py-2.5 px-4 bg-brand-emerald hover:bg-brand-emerald-hover text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-glow-emerald"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* ================= EXPLAINABLE FORMULA HIGHLIGHT BANNER ================= */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-brand-cyan border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">
                Current Deterministic Scoring Model Formula:
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Score = (Severity × {(scoringWeights.crashSeverityWeight * 100).toFixed(0)}%) + (Frequency × {(scoringWeights.crashFrequencyWeight * 100).toFixed(0)}%) + (Recency × {(scoringWeights.crashRecencyWeight * 100).toFixed(0)}%) + (Citizen Evidence × {(scoringWeights.hazardEvidenceWeight * 100).toFixed(0)}%)
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Monitored Corridors</span>
            <div className="text-sm font-bold text-white font-mono">{corridors.length} Identified Zones</div>
          </div>
        </div>

        {/* ================= FILTERS & CONTROLS ================= */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-surface-card p-3 rounded-2xl border border-slate-800">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by corridor name, district or road type..."
              className="w-full bg-navy-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-brand-emerald"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Risk Category Filter */}
            <select
              value={selectedRiskCategory}
              onChange={(e) => setSelectedRiskCategory(e.target.value)}
              className="bg-navy-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
            >
              <option value="all">All Risk Levels</option>
              <option value="critical">Critical Risk</option>
              <option value="high">High Risk</option>
              <option value="moderate">Moderate Risk</option>
              <option value="low">Low Risk</option>
            </select>

            {/* Review Status Filter */}
            <select
              value={selectedReviewStatus}
              onChange={(e) => setSelectedReviewStatus(e.target.value)}
              className="bg-navy-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="needs_review">Needs Review</option>
              <option value="inspection_scheduled">Inspection Scheduled</option>
              <option value="intervention_active">Intervention Active</option>
              <option value="audited">Safety Audited</option>
            </select>

            {/* Sort field */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-navy-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
            >
              <option value="rank">Sort by Rank</option>
              <option value="score">Sort by Risk Score</option>
              <option value="fatal">Sort by Fatal Crashes</option>
              <option value="total">Sort by Total Crashes</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-navy-950 border border-slate-700/80 rounded-xl text-slate-300 hover:text-white"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= PRIORITY QUEUE TABLE ================= */}
        <div className="bg-surface-card border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="bg-navy-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                  <th className="py-3.5 px-4">Corridor & District</th>
                  <th className="py-3.5 px-4">Risk Score</th>
                  <th className="py-3.5 px-4">Crash Telemetry</th>
                  <th className="py-3.5 px-4">Citizen Reports</th>
                  <th className="py-3.5 px-4">Trend</th>
                  <th className="py-3.5 px-4">Recommended Action</th>
                  <th className="py-3.5 px-4">Review Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredCorridors.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Rank */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-mono font-bold text-xs ${
                          c.rank === 1
                            ? 'bg-red-500 text-white shadow-glow-emerald'
                            : c.rank <= 3
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        #{c.rank}
                      </span>
                    </td>

                    {/* Corridor & District */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-white text-sm group-hover:text-brand-cyan transition-colors">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {c.district} • <span className="italic">{c.roadType}</span>
                      </div>
                    </td>

                    {/* Risk Score & Category */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-white">{c.riskScore}</span>
                        <RiskBadge category={c.riskCategory} />
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs mt-1" title={c.explanation}>
                        {c.explanation}
                      </div>
                    </td>

                    {/* Crash breakdown */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-red-400 font-bold">{c.incidentCounts.fatal} fatal</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-orange-400">{c.incidentCounts.severe} severe</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-slate-400">{c.incidentCounts.slight} slight</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Total {c.incidentCounts.total} incidents logged
                      </div>
                    </td>

                    {/* Citizen hazard evidence */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{c.verifiedHazardsCount} Verified Hazards</span>
                      </div>
                    </td>

                    {/* Recent Trend */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 font-semibold text-xs capitalize">
                        {c.recentTrend === 'increasing' ? (
                          <span className="text-red-400 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" /> Upward
                          </span>
                        ) : c.recentTrend === 'decreasing' ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <TrendingDown className="w-3.5 h-3.5" /> Downward
                          </span>
                        ) : (
                          <span className="text-yellow-400 flex items-center gap-1">
                            <Minus className="w-3.5 h-3.5" /> Stable
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Recommended action */}
                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                        {c.recommendedAction}
                      </p>
                    </td>

                    {/* Review Status */}
                    <td className="py-4 px-4">
                      <ReviewStatusBadge status={c.reviewStatus} />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedCorridor(c);
                            navigate('/authority/dashboard');
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                          title="Locate on GIS Map"
                        >
                          <MapPin className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setInspectingCorridor(c)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                          title="View Score Calculation"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditStatusCorridor(c);
                            setNewStatus(c.reviewStatus);
                            setStatusNotes(c.notes || '');
                          }}
                          className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-brand-emerald rounded-lg transition-colors"
                          title="Update Review Status"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= INTERACTIVE SCORING WEIGHTS MODAL ================= */}
      {showWeightsModal && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-navy-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-glow-card animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-brand-cyan" />
                <h3 className="text-lg font-bold text-white">AI Scoring Weight Calibration</h3>
              </div>
              <button
                onClick={() => setShowWeightsModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-6">
              Adjust the deterministic weighting factors. Weights are dynamically normalized to 100% and will instantaneously re-rank all corridors in real time.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-white">Crash Severity Weight (Fatal/Severe)</span>
                  <span className="font-mono text-brand-cyan">{(tempWeights.crashSeverityWeight * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.7"
                  step="0.05"
                  value={tempWeights.crashSeverityWeight}
                  onChange={(e) =>
                    setTempWeights({ ...tempWeights, crashSeverityWeight: parseFloat(e.target.value) })
                  }
                  className="w-full accent-brand-cyan"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-white">Crash Frequency Weight (Volume)</span>
                  <span className="font-mono text-brand-cyan">{(tempWeights.crashFrequencyWeight * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.5"
                  step="0.05"
                  value={tempWeights.crashFrequencyWeight}
                  onChange={(e) =>
                    setTempWeights({ ...tempWeights, crashFrequencyWeight: parseFloat(e.target.value) })
                  }
                  className="w-full accent-brand-cyan"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-white">Crash Recency & Upward Trajectory</span>
                  <span className="font-mono text-brand-cyan">{(tempWeights.crashRecencyWeight * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.4"
                  step="0.05"
                  value={tempWeights.crashRecencyWeight}
                  onChange={(e) =>
                    setTempWeights({ ...tempWeights, crashRecencyWeight: parseFloat(e.target.value) })
                  }
                  className="w-full accent-brand-cyan"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-white">Verified Citizen Hazard Evidence</span>
                  <span className="font-mono text-brand-cyan">{(tempWeights.hazardEvidenceWeight * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.4"
                  step="0.05"
                  value={tempWeights.hazardEvidenceWeight}
                  onChange={(e) =>
                    setTempWeights({ ...tempWeights, hazardEvidenceWeight: parseFloat(e.target.value) })
                  }
                  className="w-full accent-brand-cyan"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setShowWeightsModal(false)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyWeights}
                className="py-2.5 px-5 bg-brand-emerald hover:bg-brand-emerald-hover text-slate-950 rounded-xl text-xs font-bold shadow-glow-emerald"
              >
                Recalculate Priority Queue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CORRIDOR SCORE EXPLANATION DETAIL MODAL ================= */}
      {inspectingCorridor && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-navy-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-glow-card animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] text-brand-cyan uppercase font-bold">Rank #{inspectingCorridor.rank}</span>
                <h3 className="text-lg font-bold text-white">{inspectingCorridor.name}</h3>
              </div>
              <button
                onClick={() => setInspectingCorridor(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-navy-950 rounded-2xl border border-slate-800 mb-4">
              <div className="text-xs font-bold text-slate-300 mb-1">Transparent AI Reasoning:</div>
              <p className="text-xs text-slate-200 leading-relaxed">{inspectingCorridor.explanation}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-6">
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <span className="text-slate-400">Crash Severity Metric</span>
                <div className="font-bold text-red-400 mt-1">
                  {inspectingCorridor.incidentCounts.fatal} Fatal • {inspectingCorridor.incidentCounts.severe} Severe
                </div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <span className="text-slate-400">Citizen Evidence</span>
                <div className="font-bold text-emerald-400 mt-1">
                  {inspectingCorridor.verifiedHazardsCount} Verified Reports
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedCorridor(inspectingCorridor);
                setInspectingCorridor(null);
                navigate('/authority/dashboard');
              }}
              className="w-full py-2.5 bg-brand-emerald hover:bg-brand-emerald-hover text-slate-950 font-bold rounded-xl text-xs"
            >
              Zoom to Corridor on Map
            </button>
          </div>
        </div>
      )}

      {/* ================= EDIT STATUS MODAL ================= */}
      {editStatusCorridor && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveStatusUpdate}
            className="bg-navy-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-glow-card animate-in fade-in zoom-in-95 duration-200 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Update Corridor Review Status</h3>
              <button
                type="button"
                onClick={() => setEditStatusCorridor(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ReviewStatus)}
                className="w-full bg-navy-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
              >
                <option value="needs_review">Needs Review</option>
                <option value="inspection_scheduled">Inspection Scheduled</option>
                <option value="intervention_active">Intervention Active</option>
                <option value="audited">Safety Audited</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Official Notes</label>
              <textarea
                rows={3}
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Log field inspection dispatch, contractor notes or council authorization..."
                className="w-full bg-navy-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-400 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditStatusCorridor(null)}
                className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-5 bg-brand-emerald hover:bg-brand-emerald-hover text-slate-950 font-bold rounded-xl text-xs"
              >
                Save Status
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
