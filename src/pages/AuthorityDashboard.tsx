import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { GISMap } from '../components/gis/GISMap';
import { GIS_ANALYTICS_DATA, CITY_PRESETS } from '../data/mockData';
import { HighRiskCorridor } from '../types';
import {
  RotateCcw,
  MoreHorizontal,
  ChevronDown,
  Info,
  Car,
  Bike,
  Truck,
  Layers as LayersIcon,
  Search,
  Filter,
  Clock,
  Table as TableIcon,
  Sliders,
  Plus,
  Minus,
  Settings,
  Eye,
  CheckSquare,
  Square,
  Shield,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export const AuthorityDashboard: React.FC = () => {
  const {
    activeCity,
    setActiveCity,
    activeCityPreset,
    corridors,
    reports,
    accidents,
    selectedCorridor,
    setSelectedCorridor,
    mapLayers,
    setMapLayers,
  } = useData();
  const navigate = useNavigate();

  // Active analytics tab: 'Safety' | 'Traffic Calming' | 'School Zones'
  const [activeTab, setActiveTab] = useState<'Safety' | 'Traffic Calming' | 'School Zones'>('Safety');

  // Selected vehicle filter
  const [activeVehicle, setActiveVehicle] = useState<'lcv' | 'cyclists' | 'cars'>('cars');

  // Floating Layers drawer open/close
  const [isLayersOpen, setIsLayersOpen] = useState(true);
  const [layersSearch, setLayersSearch] = useState('');
  const [safetyDeviceThreshold, setSafetyDeviceThreshold] = useState(15);
  const [activeOnlyLayers, setActiveOnlyLayers] = useState(false);

  const handleCorridorClick = (c: HighRiskCorridor) => {
    setSelectedCorridor(c);
  };

  const accidentPieData = GIS_ANALYTICS_DATA.accidentTypeData;
  const speedLimitData = GIS_ANALYTICS_DATA.speedLimitData;

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      {/* ================= LEFT ANALYTICS PANEL (MATCHING REFERENCE IMAGE 2) ================= */}
      <div className="w-full lg:w-[460px] xl:w-[490px] h-full bg-white dark:bg-surface-card border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-y-auto text-slate-800 dark:text-slate-100 shadow-xl z-20">
        {/* Top Header: Activity & Refresh */}
        <div className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Activity</h2>
              <button
                onClick={() => window.location.reload()}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                title="Refresh GIS Feeds"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* City Selector Dropdown (India default + presets) */}
            <div className="mt-2 relative inline-flex items-center">
              <select
                value={activeCity}
                onChange={(e) => setActiveCity(e.target.value as any)}
                className="appearance-none pl-7 pr-8 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer hover:border-brand-emerald transition-colors"
              >
                <option value="bengaluru">🇮🇳 Bengaluru Metro (India)</option>
                <option value="delhi">🇮🇳 Delhi NCR (India)</option>
                <option value="basel">🇨🇭 Basel City Pilot (Reference UI)</option>
              </select>
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute left-2.5 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">GIS SENSORS</span>
            <div className="text-sm font-bold text-brand-emerald">28 Active Feeds</div>
          </div>
        </div>

        {/* Category Tabs: Safety, Traffic Calming, School Zones */}
        <div className="px-5 pt-3 border-b border-slate-100 dark:border-slate-800/80 flex gap-6 text-sm font-bold">
          {(['Safety', 'Traffic Calming', 'School Zones'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 transition-all border-b-2 ${
                activeTab === tab
                  ? 'border-brand-cyan text-brand-cyan dark:text-brand-cyan'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Vehicle Mode Chips matching Reference Image 2 */}
        <div className="p-4 grid grid-cols-3 gap-2">
          {/* LCV Chip */}
          <button
            onClick={() => setActiveVehicle('lcv')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              activeVehicle === 'lcv'
                ? 'bg-slate-100 dark:bg-slate-800 border-brand-cyan shadow-sm'
                : 'bg-white dark:bg-navy-950/40 border-slate-200 dark:border-slate-800/80 hover:border-slate-400'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 dark:text-white uppercase truncate">
              <Truck className="w-3.5 h-3.5 text-red-400" />
              <span>Light Comm</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">15 apr 2021 - today</div>
          </button>

          {/* Cyclists Chip */}
          <button
            onClick={() => setActiveVehicle('cyclists')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              activeVehicle === 'cyclists'
                ? 'bg-slate-100 dark:bg-slate-800 border-brand-cyan shadow-sm'
                : 'bg-white dark:bg-navy-950/40 border-slate-200 dark:border-slate-800/80 hover:border-slate-400'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 dark:text-white uppercase truncate">
              <Bike className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Cyclists</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">05 oct 2022 - today</div>
          </button>

          {/* Cars Chip */}
          <button
            onClick={() => setActiveVehicle('cars')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              activeVehicle === 'cars'
                ? 'bg-slate-100 dark:bg-slate-800 border-brand-cyan shadow-sm'
                : 'bg-white dark:bg-navy-950/40 border-slate-200 dark:border-slate-800/80 hover:border-slate-400'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 dark:text-white uppercase truncate">
              <Car className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cars</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">15 apr 2019 - today</div>
          </button>
        </div>

        {/* Top High Risk Corridors Ranking matching Reference Image 2 */}
        <div className="p-4 mx-4 mb-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Top high risk corridors
              </h3>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <button
              onClick={() => navigate('/authority/hotspots')}
              className="text-xs text-brand-cyan hover:underline flex items-center gap-1 font-semibold"
            >
              <span>show all ({corridors.length})</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {/* Corridors list with cyan bars */}
          <div className="space-y-3">
            {corridors.slice(0, 5).map((corridor, idx) => {
              const barPercentages = [94, 78, 62, 48, 36];
              const scoreValue = [9.4, 8.8, 8.2, 7.1, 6.5];
              const pctLabels = ['7.38%', '6.12%', '4.85%', '3.91%', '2.74%'];

              const isCurrent = selectedCorridor?.id === corridor.id;

              return (
                <div
                  key={corridor.id}
                  onClick={() => handleCorridorClick(corridor)}
                  className={`p-2 rounded-xl cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-slate-200/80 dark:bg-slate-800 border border-brand-cyan/50 shadow-sm'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-900 dark:text-slate-200 truncate max-w-[240px]">
                      {corridor.name}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {scoreValue[idx]} • {pctLabels[idx]}
                    </span>
                  </div>
                  {/* Cyan progress bar matching reference image */}
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${barPercentages[idx]}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts Section: Accident Type & Speed Limit matching Reference Image 2 */}
        <div className="p-4 grid grid-cols-2 gap-3">
          {/* Accident Type Donut */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-900 dark:text-white">Accident Type</span>
              <Info className="w-3 h-3 text-slate-400" />
            </div>

            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={accidentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={46}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {accidentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#374151',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1 text-[10px] mt-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                  Slight
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-200">822</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-[#2DD4BF]" />
                  Severe
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-200">170</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  Fatal
                </span>
                <span className="font-bold text-red-500 dark:text-red-400">21</span>
              </div>
            </div>
          </div>

          {/* Speed Limit Donut */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-900 dark:text-white">Speed Limit</span>
              <Info className="w-3 h-3 text-slate-400" />
            </div>

            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={speedLimitData}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={46}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {speedLimitData.map((entry, index) => (
                      <Cell key={`cell-speed-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#374151',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-0.5 text-[10px] mt-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">30 mph</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">384</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">40 mph</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">78</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">50 mph</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">123</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">60 mph</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">171</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">70 mph</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">115</span>
              </div>
            </div>
          </div>
        </div>

        {/* Road Type & Intersections row matching Reference Image 2 */}
        <div className="px-4 pb-6 grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-700 dark:text-slate-300">Road Type</span>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Arterials (48%)</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-700 dark:text-slate-300">Intersections</span>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Signalized (64%)</div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT / CENTER GIS MAP AREA ================= */}
      <div className="flex-1 relative h-full">
        {/* The Live Interactive GIS Leaflet Map with Official OSM Tiles */}
        <GISMap
          corridors={corridors}
          hazardReports={reports}
          accidentRecords={accidents}
          selectedCorridor={selectedCorridor}
          onSelectCorridor={setSelectedCorridor}
          layers={mapLayers}
          cityCenter={activeCityPreset.center}
          cityZoom={activeCityPreset.zoom}
          cityName={activeCityPreset.name}
        />

        {/* Floating Right "Layers" Drawer matching Reference Image 2 */}
        <div
          id="map-layers-panel"
          className={`absolute top-4 right-4 z-[400] w-72 bg-white/95 dark:bg-navy-900/95 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-glow-card backdrop-blur-xl transition-all ${
            isLayersOpen ? 'block' : 'hidden'
          }`}
        >
          {/* Header */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayersIcon className="w-4 h-4 text-brand-cyan" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Layers
              </h4>
            </div>
            <button
              onClick={() => setIsLayersOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Hide
            </button>
          </div>

          {/* Search layers input */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={layersSearch}
                onChange={(e) => setLayersSearch(e.target.value)}
                placeholder="search for layers"
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-[11px] text-slate-900 dark:text-white placeholder-slate-400 outline-none"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-2 px-1">
              <button
                onClick={() =>
                  setMapLayers({
                    accidents: true,
                    citizenHazards: true,
                    corridors: true,
                    heatmaps: true,
                    resolved: true,
                    trafficLive: true,
                  })
                }
                className="hover:underline font-semibold"
              >
                Open all
              </button>
              <button
                onClick={() =>
                  setMapLayers({
                    accidents: false,
                    citizenHazards: false,
                    corridors: false,
                    heatmaps: false,
                    resolved: false,
                    trafficLive: false,
                  })
                }
                className="hover:underline font-semibold"
              >
                Close all
              </button>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeOnlyLayers}
                  onChange={(e) => setActiveOnlyLayers(e.target.checked)}
                  className="rounded text-brand-emerald text-xs w-3 h-3"
                />
                <span>Active only</span>
              </label>
            </div>
          </div>

          {/* Layers List matching Reference Image 2 */}
          <div className="p-3 space-y-3 text-xs max-h-72 overflow-y-auto">
            {/* SURAKSH Insights / Vianova Insights */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-brand-emerald" />
                  SURAKSH AI Insights
                  <span className="px-1 text-[9px] bg-amber-500/20 text-amber-500 dark:text-amber-300 rounded font-mono">BETA</span>
                </span>
              </div>
              <div className="pl-5 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center justify-between py-1">
                  <span>Risk Buffer Radius</span>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={safetyDeviceThreshold}
                    onChange={(e) => setSafetyDeviceThreshold(Number(e.target.value))}
                    className="w-24 accent-brand-emerald"
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 px-1 font-mono">
                  <span>0</span>
                  <span>10</span>
                  <span>15</span>
                  <span>20</span>
                  <span>25+ devs</span>
                </div>
              </div>
            </div>

            {/* Individual Layer Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="flex items-center justify-between cursor-pointer hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  High-Risk Corridors
                </span>
                <input
                  type="checkbox"
                  checked={mapLayers.corridors}
                  onChange={(e) => setMapLayers((p) => ({ ...p, corridors: e.target.checked }))}
                  className="rounded text-brand-emerald w-3.5 h-3.5"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  Citizen Hazard Reports
                </span>
                <input
                  type="checkbox"
                  checked={mapLayers.citizenHazards}
                  onChange={(e) => setMapLayers((p) => ({ ...p, citizenHazards: e.target.checked }))}
                  className="rounded text-brand-emerald w-3.5 h-3.5"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  Accident Records Layer
                </span>
                <input
                  type="checkbox"
                  checked={mapLayers.accidents}
                  onChange={(e) => setMapLayers((p) => ({ ...p, accidents: e.target.checked }))}
                  className="rounded text-brand-emerald w-3.5 h-3.5"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  Heatmaps & Incident Buffers
                </span>
                <input
                  type="checkbox"
                  checked={mapLayers.heatmaps}
                  onChange={(e) => setMapLayers((p) => ({ ...p, heatmaps: e.target.checked }))}
                  className="rounded text-brand-emerald w-3.5 h-3.5"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  Resolved Hazards
                </span>
                <input
                  type="checkbox"
                  checked={mapLayers.resolved}
                  onChange={(e) => setMapLayers((p) => ({ ...p, resolved: e.target.checked }))}
                  className="rounded text-brand-emerald w-3.5 h-3.5"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Toggle button if Layers Drawer was hidden */}
        {!isLayersOpen && (
          <button
            onClick={() => setIsLayersOpen(true)}
            className="absolute top-4 right-4 z-[400] px-3 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2"
          >
            <LayersIcon className="w-4 h-4 text-brand-cyan" />
            <span>Show Layers</span>
          </button>
        )}

        {/* Floating Bottom-Center Percentile Distribution Widgets matching Reference Image 2 */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] hidden sm:flex flex-row gap-3 pointer-events-auto">
          {/* Collision Percentile Card */}
          <div className="bg-white/95 dark:bg-navy-900/95 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 shadow-glow-card backdrop-blur-xl w-60">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              <span>Collision Percentile</span>
              <Info className="w-3 h-3 text-slate-400" />
            </div>
            {/* Visual Bar graph distribution */}
            <div className="flex items-end justify-between h-8 gap-1 px-1">
              {[20, 35, 45, 60, 85, 95, 75, 55, 30].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-teal-400/80 hover:bg-teal-300 rounded-t transition-all"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 mt-1 px-0.5 font-mono">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* VRU Percentile Card */}
          <div className="bg-white/95 dark:bg-navy-900/95 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 shadow-glow-card backdrop-blur-xl w-60">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              <span>VRU (Pedestrian) Percentile</span>
              <Info className="w-3 h-3 text-slate-400" />
            </div>
            {/* Visual Bar graph distribution */}
            <div className="flex items-end justify-between h-8 gap-1 px-1">
              {[15, 25, 40, 50, 70, 80, 65, 45, 20].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-cyan-400/80 hover:bg-cyan-300 rounded-t transition-all"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 mt-1 px-0.5 font-mono">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Floating Bottom Left Action Buttons matching Reference Image 2 */}
        <div className="absolute bottom-6 left-6 z-[400] hidden md:flex items-center gap-2">
          <button
            onClick={() => navigate('/authority/hotspots')}
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
            title="Open Priority Queue Table"
          >
            <TableIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/authority/analytics')}
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
            title="Safety Analytics"
          >
            <Clock className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/authority/hotspots')}
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
            title="Adjust AI Weights"
          >
            <Sliders className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
