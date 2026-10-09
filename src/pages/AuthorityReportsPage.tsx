import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { HazardReport, ReportStatus, UrgencyLevel } from '../types';
import { StatusBadge, UrgencyBadge } from '../components/common/Badge';
import { exportReportsToCSV } from '../utils/csvExport';
import {
  FileCheck2,
  Filter,
  Search,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Camera,
  X,
  AlertTriangle,
  ArrowRight,
  Shield,
  UserCheck,
} from 'lucide-react';

export const AuthorityReportsPage: React.FC = () => {
  const { reports, updateReportStatus } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  
  // Triage modal state
  const [reviewingReport, setReviewingReport] = useState<HazardReport | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [assignedSquad, setAssignedSquad] = useState('Civil Works Quick Response Team 1');

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.resolvedAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || r.urgency === urgencyFilter;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const handleUpdateStatus = (status: ReportStatus) => {
    if (!reviewingReport) return;
    updateReportStatus(
      reviewingReport.id,
      status,
      actionNotes || `Official status updated to ${status}.`,
      assignedSquad
    );
    setReviewingReport(null);
    setActionNotes('');
  };

  return (
    <div className="flex-1 bg-navy-950 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-[1700px] mx-auto space-y-6">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-xl bg-brand-emerald/10 border border-emerald-500/30 text-brand-emerald">
                <FileCheck2 className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Hazard Reports Management & Triage
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Review photographic evidence, verify road hazards, dispatch municipal maintenance squads, and track resolution audits.
            </p>
          </div>

          <button
            onClick={() => exportReportsToCSV(reports)}
            className="py-2.5 px-4 bg-brand-emerald hover:bg-brand-emerald-hover text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-glow-emerald shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export Reports CSV</span>
          </button>
        </div>

        {/* ================= FILTERS ROW ================= */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-surface-card p-3 rounded-2xl border border-slate-800">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket ID, hazard type, or street address..."
              className="w-full bg-navy-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-brand-emerald"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-navy-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted (Awaiting Triage)</option>
              <option value="under_review">Under Review</option>
              <option value="verified">Verified</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Declined</option>
            </select>

            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="bg-navy-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
            >
              <option value="all">All Urgency Levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* ================= REPORTS TABLE ================= */}
        <div className="bg-surface-card border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="bg-navy-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  <th className="py-3.5 px-4 w-32">Ticket ID</th>
                  <th className="py-3.5 px-4">Hazard Category</th>
                  <th className="py-3.5 px-4">Location & Coordinates</th>
                  <th className="py-3.5 px-4">Urgency</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submitted By</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-4 px-4 font-mono font-bold text-brand-cyan">
                      {r.id}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-white text-xs">{r.categoryLabel}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs mt-0.5">
                        {r.description}
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{r.resolvedAddress}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <UrgencyBadge urgency={r.urgency} />
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={r.status} />
                    </td>

                    <td className="py-4 px-4 text-slate-400">
                      {r.submittedBy.isAnonymous ? (
                        <span className="italic text-slate-400">Anonymous Citizen</span>
                      ) : (
                        <span>{r.submittedBy.userName}</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(r.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => {
                          setReviewingReport(r);
                          setActionNotes(r.verification?.officialNotes || '');
                          setAssignedSquad(r.assignedTeam || 'Civil Works Quick Response Team 1');
                        }}
                        className="py-1.5 px-3 bg-slate-800 hover:bg-brand-emerald hover:text-slate-950 text-slate-200 rounded-xl font-bold text-xs transition-all shadow-sm"
                      >
                        Inspect & Triage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= OFFICIAL TRIAGE & VERIFICATION MODAL ================= */}
      {reviewingReport && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-navy-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-glow-card animate-in fade-in zoom-in-95 duration-200 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono text-brand-cyan uppercase font-bold">
                  Official Verification Desk • {reviewingReport.id}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">{reviewingReport.categoryLabel}</h3>
              </div>
              <button
                onClick={() => setReviewingReport(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo Evidence & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-48 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950">
                {reviewingReport.imageUrl ? (
                  <img
                    src={reviewingReport.imageUrl}
                    alt={reviewingReport.categoryLabel}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                    No photo uploaded
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] uppercase font-bold">Address</span>
                  <p className="text-white font-semibold mt-0.5">{reviewingReport.resolvedAddress}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] uppercase font-bold">Coordinates</span>
                  <p className="text-brand-cyan font-mono">{reviewingReport.latitude}, {reviewingReport.longitude}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] uppercase font-bold">Reported Urgency</span>
                  <div className="mt-1">
                    <UrgencyBadge urgency={reviewingReport.urgency} />
                  </div>
                </div>
              </div>
            </div>

            {/* Citizen Statement */}
            <div className="p-3.5 bg-slate-800/40 rounded-2xl border border-slate-700/60">
              <span className="text-[11px] text-slate-400 font-bold uppercase">Citizen Statement</span>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">"{reviewingReport.description}"</p>
            </div>

            {/* Verification Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Assign Maintenance Squad / Unit
                </label>
                <select
                  value={assignedSquad}
                  onChange={(e) => setAssignedSquad(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                >
                  <option value="Civil Works Quick Response Team 1">Civil Works Quick Response Team 1 (Asphalt Patching)</option>
                  <option value="Municipal Electrical Grid Squad">Municipal Electrical Grid Squad (Lighting & Signals)</option>
                  <option value="Traffic Engineering & Signage Wing">Traffic Engineering & Signage Wing (Markings & Signs)</option>
                  <option value="Pavement & Road Safety Rapid Action Squad">Pavement & Road Safety Rapid Action Squad (Crash Prevention)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Official Verification Notes
                </label>
                <textarea
                  rows={2}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Record ground validation details or work order tracking reference..."
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-400 outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => handleUpdateStatus('rejected')}
                className="py-2.5 px-4 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-colors"
              >
                Decline / Duplicate
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus('verified')}
                  className="py-2.5 px-4 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-colors"
                >
                  Mark Verified (Feeds Priority Queue)
                </button>
                <button
                  onClick={() => handleUpdateStatus('in_progress')}
                  className="py-2.5 px-4 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition-colors"
                >
                  Dispatch Squad (In Progress)
                </button>
                <button
                  onClick={() => handleUpdateStatus('resolved')}
                  className="py-2.5 px-5 bg-brand-emerald hover:bg-brand-emerald-hover text-slate-950 font-black rounded-xl text-xs transition-colors shadow-glow-emerald"
                >
                  Certify Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
