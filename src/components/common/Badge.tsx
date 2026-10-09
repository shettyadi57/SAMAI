import React from 'react';
import { RiskCategory, ReportStatus, UrgencyLevel, ReviewStatus } from '../../types';

export const RiskBadge: React.FC<{ category: RiskCategory; score?: number; className?: string }> = ({
  category,
  score,
  className = '',
}) => {
  const styles: Record<RiskCategory, string> = {
    critical: 'bg-red-500/15 text-red-400 border-red-500/30',
    high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    moderate: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[category]} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          category === 'critical'
            ? 'bg-red-500 animate-pulse'
            : category === 'high'
            ? 'bg-orange-500'
            : category === 'moderate'
            ? 'bg-yellow-500'
            : 'bg-emerald-500'
        }`}
      />
      {category.toUpperCase()}
      {score !== undefined && <span className="opacity-80 font-mono">({score})</span>}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ReportStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const config: Record<ReportStatus, { label: string; style: string }> = {
    submitted: { label: 'Submitted', style: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    under_review: { label: 'Under Review', style: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    verified: { label: 'Verified', style: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    in_progress: { label: 'In Progress', style: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
    resolved: { label: 'Resolved', style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    rejected: { label: 'Declined', style: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  };

  const item = config[status] || { label: status, style: 'bg-slate-700 text-slate-300' };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.style} ${className}`}
    >
      {item.label}
    </span>
  );
};

export const UrgencyBadge: React.FC<{ urgency: UrgencyLevel }> = ({ urgency }) => {
  const styles: Record<UrgencyLevel, string> = {
    critical: 'bg-red-500/20 text-red-300 border-red-500/40',
    high: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    low: 'bg-slate-500/20 text-slate-300 border-slate-600',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${styles[urgency]}`}>
      {urgency}
    </span>
  );
};

export const ReviewStatusBadge: React.FC<{ status: ReviewStatus }> = ({ status }) => {
  const config: Record<ReviewStatus, { label: string; style: string }> = {
    needs_review: { label: 'Needs Review', style: 'bg-red-500/15 text-red-400 border-red-500/30' },
    inspection_scheduled: { label: 'Inspection Scheduled', style: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    intervention_active: { label: 'Intervention Active', style: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
    audited: { label: 'Safety Audited', style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  };

  const item = config[status] || { label: status, style: 'bg-slate-700 text-slate-300 border-slate-600' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${item.style}`}>
      {item.label}
    </span>
  );
};
