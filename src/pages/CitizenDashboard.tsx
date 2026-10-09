import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { HazardReport } from '../types';
import { StatusBadge, UrgencyBadge } from '../components/common/Badge';
import {
  PlusCircle,
  Shield,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Camera,
  X,
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { reports } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedReport, setSelectedReport] = useState<HazardReport | null>(null);

  // Status breakdown counts
  const statusCounts = {
    submitted: reports.filter((r) => r.status === 'submitted').length,
    under_review: reports.filter((r) => r.status === 'under_review').length,
    verified: reports.filter((r) => r.status === 'verified').length,
    in_progress: reports.filter((r) => r.status === 'in_progress').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
  };

  return (
    <div className="flex-1 bg-navy-950 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ================= HERO WELCOME BANNER ================= */}
        <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950/80 via-navy-900 to-navy-900 border border-emerald-500/30 p-6 sm:p-8 overflow-hidden shadow-glow-authority">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-brand-emerald mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart City Community Network</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Help make your roads safer.
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Detect road hazards, snap photographic evidence, and submit in seconds. Our AI-assisted
              platform feeds directly to municipal road safety authorities to prioritize repair actions.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                id="btn-report-hazard-hero"
                onClick={() => navigate('/citizen/report')}
                className="py-3 px-6 bg-brand-emerald hover:bg-brand-emerald-hover text-slate-950 font-black rounded-2xl text-sm transition-all shadow-glow-emerald flex items-center gap-2.5 hover:scale-105 active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report a Road Hazard</span>
              </button>

              <button
                onClick={() => navigate('/authority/dashboard')}
                className="py-3 px-5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white font-semibold rounded-2xl text-xs transition-colors flex items-center gap-2"
              >
                <span>View Live City Blackspot Map</span>
                <ExternalLink className="w-3.5 h-3.5 text-brand-cyan" />
              </button>
            </div>
          </div>
        </div>

        {/* ================= REPORT LIFECYCLE PIPELINE CARDS ================= */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Community Hazard Lifecycle Tracking
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Submitted', count: statusCounts.submitted, color: 'text-blue-400', border: 'border-blue-500/30' },
              { label: 'Under Review', count: statusCounts.under_review, color: 'text-purple-400', border: 'border-purple-500/30' },
              { label: 'Verified', count: statusCounts.verified, color: 'text-amber-400', border: 'border-amber-500/30' },
              { label: 'In Progress', count: statusCounts.in_progress, color: 'text-cyan-400', border: 'border-cyan-500/30' },
              { label: 'Resolved', count: statusCounts.resolved, color: 'text-emerald-400', border: 'border-emerald-500/30' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`p-4 rounded-2xl bg-surface-card border ${stat.border} shadow-sm text-center`}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {stat.label}
                </span>
                <div className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= RECENT HAZARD REPORTS LIST ================= */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Community Road Hazard Reports</h2>
              <p className="text-xs text-slate-400">
                Track status updates, municipal verification notes, and field squad repairs.
              </p>
            </div>
            <button
              onClick={() => navigate('/citizen/report')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-brand-emerald flex items-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="bg-surface-card border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-glow-card transition-all cursor-pointer group flex flex-col"
              >
                {/* Thumbnail Header */}
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                  <img
                    src={report.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600'}
                    alt={report.categoryLabel}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-navy-950/80 text-brand-cyan border border-cyan-500/40">
                      {report.id}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <StatusBadge status={report.status} />
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="font-bold truncate">{report.categoryLabel}</span>
                    <UrgencyBadge urgency={report.urgency} />
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start gap-1.5 text-xs text-slate-300 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{report.resolvedAddress}</span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {report.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="text-brand-cyan group-hover:underline flex items-center gap-0.5 font-semibold">
                      View Progress <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= REPORT PROGRESS DETAILS MODAL ================= */}
      {selectedReport && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-navy-900 border border-slate-700 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-glow-card animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-navy-950/50">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40">
                  {selectedReport.id}
                </span>
                <h3 className="text-sm font-bold text-white">{selectedReport.categoryLabel}</h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Image Preview */}
              {selectedReport.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-700 h-56 bg-slate-950">
                  <img
                    src={selectedReport.imageUrl}
                    alt={selectedReport.categoryLabel}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Status & Urgency Header */}
              <div className="flex items-center justify-between p-3.5 bg-slate-800/50 rounded-2xl border border-slate-700/60">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Current State</span>
                  <div className="mt-0.5">
                    <StatusBadge status={selectedReport.status} />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Urgency</span>
                  <div className="mt-0.5">
                    <UrgencyBadge urgency={selectedReport.urgency} />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Location</span>
                <p className="text-xs text-white mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {selectedReport.resolvedAddress}
                </p>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Coordinates: {selectedReport.latitude}, {selectedReport.longitude}
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Description</span>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed bg-navy-950 p-3 rounded-xl border border-slate-800">
                  {selectedReport.description}
                </p>
              </div>

              {/* Verification & Action Audit Trail */}
              {selectedReport.verification && (
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Official Municipal Action Log</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    <span className="text-slate-400 font-medium">Verified by:</span>{' '}
                    {selectedReport.verification.verifiedBy}
                  </p>
                  <p className="text-xs text-slate-300">
                    <span className="text-slate-400 font-medium">Official Notes:</span>{' '}
                    {selectedReport.verification.officialNotes}
                  </p>
                  {selectedReport.verification.actionTaken && (
                    <p className="text-xs text-emerald-300 font-semibold">
                      <span className="text-slate-400 font-medium">Action Scheduled:</span>{' '}
                      {selectedReport.verification.actionTaken}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-navy-950/80 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="py-2 px-5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
