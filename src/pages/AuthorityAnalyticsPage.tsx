import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { GIS_ANALYTICS_DATA } from '../data/mockData';
import { InterventionType } from '../types';
import {
  BarChart3,
  Calendar,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  PlusCircle,
  Clock,
  Info,
  X,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

export const AuthorityAnalyticsPage: React.FC = () => {
  const { corridors, reports, interventions, addIntervention } = useData();

  // Active view: 'weekly' | 'daily' | 'audit'
  const [activeTab, setActiveTab] = useState<'weekly' | 'daily' | 'audit'>('weekly');
  const [showNewInterventionModal, setShowNewInterventionModal] = useState(false);

  // New intervention form state
  const [targetLocation, setTargetLocation] = useState(corridors[0]?.name || 'Elisabethenanlage');
  const [interventionType, setInterventionType] = useState<InterventionType>('pothole_resurfacing');
  const [interventionDate, setInterventionDate] = useState('2026-10-15');
  const [interventionNotes, setInterventionNotes] = useState('');
  const [costEst, setCostEst] = useState('₹6,50,000 / CHF 7,200');

  const weeklyTrendData = GIS_ANALYTICS_DATA.weeklyTrendData;
  const timeOfDayData = GIS_ANALYTICS_DATA.timeOfDayData;

  const handlePrint = () => {
    window.print();
  };

  const handleCreateIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    const typeLabels: Record<InterventionType, string> = {
      lighting_upgrade: 'LED High-Lux Illuminator Upgrade',
      pothole_resurfacing: 'Pavement Resurfacing & Friction Seal',
      signal_installation: 'Adaptive Traffic Signal Installation',
      speed_calming: 'Speed Table & Raised Crosswalk',
      pedestrian_refuge: 'Pedestrian Refuge Island',
      geometric_redesign: 'Intersection Geometric Realignment',
    };

    addIntervention({
      locationId: `loc-${Date.now()}`,
      locationName: targetLocation,
      type: interventionType,
      typeLabel: typeLabels[interventionType],
      interventionDate,
      status: 'planned',
      notes: interventionNotes || 'Field remediation approved by Traffic Safety Directorate.',
      costEstimateInr: costEst,
      prePeriodMonths: 6,
      postPeriodMonths: 0,
      preAccidents: 18,
      postAccidents: 0,
      preFatalities: 1,
      postFatalities: 0,
    });

    setShowNewInterventionModal(false);
    setActiveTab('audit');
  };

  return (
    <div className="flex-1 bg-navy-950 p-4 sm:p-6 lg:p-8 overflow-y-auto print:bg-white print:text-black">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-brand-cyan">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight print:text-black">
                Safety Intelligence & Intervention Audit
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 print:text-slate-600">
              Daily digest, weekly collision trajectories, and empirical before-and-after road safety intervention tracking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors print:hidden"
            >
              <Printer className="w-4 h-4 text-brand-cyan" />
              <span>Print Report</span>
            </button>
            <button
              onClick={() => setShowNewInterventionModal(true)}
              className="py-2.5 px-4 bg-brand-emerald hover:bg-brand-emerald-hover text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-glow-emerald print:hidden"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record New Intervention</span>
            </button>
          </div>
        </div>

        {/* ================= NAVIGATION TABS ================= */}
        <div className="flex gap-2 p-1 bg-surface-card rounded-2xl border border-slate-800 max-w-md print:hidden">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'weekly' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Weekly Safety Summary
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'daily' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Daily Operations Digest
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'audit' ? 'bg-brand-emerald text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Before & After Audit
          </button>
        </div>

        {/* ================= TAB 1: WEEKLY SAFETY REPORT ================= */}
        {activeTab === 'weekly' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-surface-card border border-slate-800">
                <span className="text-xs uppercase font-bold text-slate-400">Total Hazards Logged</span>
                <div className="text-3xl font-black text-white mt-1">{reports.length}</div>
                <span className="text-[11px] text-emerald-400 font-semibold mt-1 inline-block">
                  +18% community engagement
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-surface-card border border-slate-800">
                <span className="text-xs uppercase font-bold text-slate-400">Monitored Blackspots</span>
                <div className="text-3xl font-black text-red-400 mt-1">{corridors.length}</div>
                <span className="text-[11px] text-slate-400 mt-1 inline-block">3 under active review</span>
              </div>
              <div className="p-5 rounded-2xl bg-surface-card border border-slate-800">
                <span className="text-xs uppercase font-bold text-slate-400">Interventions Logged</span>
                <div className="text-3xl font-black text-cyan-400 mt-1">{interventions.length}</div>
                <span className="text-[11px] text-cyan-300 font-semibold mt-1 inline-block">
                  2 completed audits
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-surface-card border border-slate-800">
                <span className="text-xs uppercase font-bold text-slate-400">Crash Reduction Index</span>
                <div className="text-3xl font-black text-emerald-400 mt-1">-56.2%</div>
                <span className="text-[11px] text-emerald-300 font-semibold mt-1 inline-block">
                  Across audited sites
                </span>
              </div>
            </div>

            {/* Weekly Collision Trajectory Chart */}
            <div className="p-6 rounded-3xl bg-surface-card border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Accident Severity Trajectory by Day of Week
                  </h3>
                  <p className="text-xs text-slate-400">
                    Slight, severe, and fatal collision occurrences monitored across city corridors
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-navy-950 border border-slate-800 text-xs font-mono text-brand-cyan">
                  STATS19 Telemetry
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} />
                    <YAxis stroke="#94A3B8" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="slight" fill="#34D399" name="Slight Collisions" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="severe" fill="#F97316" name="Severe Injuries" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="fatal" fill="#EF4444" name="Fatalities" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Time of Day Collision Density */}
            <div className="p-6 rounded-3xl bg-surface-card border border-slate-800 shadow-xl">
              <div className="mb-4">
                <h3 className="text-base font-bold text-white">Collisions by Time Window (Peak Analysis)</h3>
                <p className="text-xs text-slate-400">
                  Identifies evening rush hour (16:00 - 20:00) as the critical intervention window
                </p>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeOfDayData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="hour" stroke="#94A3B8" fontSize={12} />
                    <YAxis stroke="#94A3B8" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#38BDF8"
                      fill="#0284C7"
                      fillOpacity={0.25}
                      name="Recorded Collisions"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: DAILY OPERATIONS DIGEST ================= */}
        {activeTab === 'daily' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-navy-900 to-navy-950 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-brand-emerald text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Today's Road Safety Operations Brief</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">Friday, Oct 9, 2026</span>
              </div>

              <h2 className="text-xl font-bold text-white">
                Daily Command Center Summary
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                During today's shift, <span className="text-white font-bold">6 citizen hazard reports</span> were ingested,
                including 1 critical pavement crater on Grossbasel corridor #1. All reports have been triaged by the AI Copilot.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-2xl bg-navy-950/80 border border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase">Awaiting Field Inspection</span>
                  <div className="text-2xl font-black text-amber-400 mt-1">2 Corridors</div>
                  <p className="text-[11px] text-slate-400 mt-1">Elisabethenanlage & Weiherweg</p>
                </div>
                <div className="p-4 rounded-2xl bg-navy-950/80 border border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase">Emergency Patching</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">1 Dispatched</div>
                  <p className="text-[11px] text-slate-400 mt-1">Cold-mix crew on Grossbasel Süd</p>
                </div>
                <div className="p-4 rounded-2xl bg-navy-950/80 border border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase">Compliance Target</span>
                  <div className="text-2xl font-black text-brand-cyan mt-1">94.2%</div>
                  <p className="text-[11px] text-slate-400 mt-1">Within 24-hr response SLA</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: BEFORE & AFTER SAFETY AUDIT (SECTION 12) ================= */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            {/* Scientific Caveat Warning as requested by prompt Section 12 */}
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-3">
              <Info className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-brand-cyan">Methodological Note & Data Integrity:</span>{' '}
                Comparisons reflect empirical accident and injury records before and after physical interventions.
                In accordance with road safety guidelines, observed reductions should not be interpreted as solely
                causal without regression-to-mean correction and macro traffic volume calibration.
              </div>
            </div>

            {/* Interventions Comparison Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {interventions.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-card border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] text-brand-cyan uppercase font-bold">
                        {item.status.toUpperCase()} INTERVENTION
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5">{item.locationName}</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-brand-emerald border border-emerald-500/30">
                      {item.typeLabel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{item.notes}</p>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Intervention Date: {item.interventionDate}</span>
                    <span>Cost: {item.costEstimateInr}</span>
                  </div>

                  {/* Pre vs Post Comparison Grid */}
                  <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Pre-Period ({item.prePeriodMonths} mo)</span>
                      <div className="text-lg font-bold text-slate-200 mt-1">
                        {item.preAccidents} crashes
                      </div>
                      <div className="text-[10px] text-red-400 font-mono">
                        {item.preFatalities} fatal
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-brand-cyan" />
                      {item.reductionPercentage !== undefined && (
                        <span className="text-xs font-mono font-bold text-emerald-400 mt-1">
                          -{item.reductionPercentage.toFixed(0)}%
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Post-Period ({item.postPeriodMonths} mo)</span>
                      <div className="text-lg font-bold text-brand-emerald mt-1">
                        {item.postAccidents} crashes
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono">
                        {item.postFatalities} fatal
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= RECORD NEW INTERVENTION MODAL ================= */}
      {showNewInterventionModal && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleCreateIntervention}
            className="bg-navy-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-glow-card animate-in fade-in zoom-in-95 duration-200 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Record Safety Intervention</h3>
              <button
                type="button"
                onClick={() => setShowNewInterventionModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Location</label>
              <select
                value={targetLocation}
                onChange={(e) => setTargetLocation(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
              >
                {corridors.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.district})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Intervention Type</label>
              <select
                value={interventionType}
                onChange={(e) => setInterventionType(e.target.value as InterventionType)}
                className="w-full bg-navy-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
              >
                <option value="pothole_resurfacing">Pavement Resurfacing & Friction Seal</option>
                <option value="lighting_upgrade">LED High-Lux Illuminator Upgrade</option>
                <option value="signal_installation">Adaptive Traffic Signal Installation</option>
                <option value="speed_calming">Speed Table & Raised Crosswalk</option>
                <option value="pedestrian_refuge">Pedestrian Refuge Island</option>
                <option value="geometric_redesign">Intersection Geometric Realignment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Execution Date</label>
              <input
                type="date"
                value={interventionDate}
                onChange={(e) => setInterventionDate(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Technical Notes</label>
              <textarea
                rows={2}
                value={interventionNotes}
                onChange={(e) => setInterventionNotes(e.target.value)}
                placeholder="Scope of engineering work, materials used, contractor notes..."
                className="w-full bg-navy-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-400 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewInterventionModal(false)}
                className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-5 bg-brand-emerald hover:bg-brand-emerald-hover text-slate-950 font-bold rounded-xl text-xs"
              >
                Log Intervention
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
