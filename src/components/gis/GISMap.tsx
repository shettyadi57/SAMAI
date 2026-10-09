import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  Polyline,
  ZoomControl,
} from 'react-leaflet';
import L from 'leaflet';
import { HighRiskCorridor, HazardReport, IncidentRecord } from '../../types';
import { RiskBadge, StatusBadge, UrgencyBadge } from '../common/Badge';
import {
  Search,
  RotateCcw,
  Maximize2,
  MapPin,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Compass,
  X,
  Layers,
  Info,
  ChevronRight,
  ExternalLink,
  Shield,
  Eye,
  Crosshair,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GISMapProps {
  corridors: HighRiskCorridor[];
  hazardReports: HazardReport[];
  accidentRecords: IncidentRecord[];
  selectedCorridor: HighRiskCorridor | null;
  onSelectCorridor: (c: HighRiskCorridor | null) => void;
  layers: {
    accidents: boolean;
    citizenHazards: boolean;
    corridors: boolean;
    heatmaps: boolean;
    resolved: boolean;
    trafficLive: boolean;
  };
  cityCenter: [number, number];
  cityZoom: number;
  cityName: string;
}

// Controller to smoothly pan/zoom, invalidate size, and handle Fit Bounds / Reset
const MapEngineController: React.FC<{
  targetCoords: [number, number] | null;
  defaultCenter: [number, number];
  defaultZoom: number;
  triggerReset: number;
  triggerFitAll: number;
  allBounds: L.LatLngBoundsExpression | null;
}> = ({
  targetCoords,
  defaultCenter,
  defaultZoom,
  triggerReset,
  triggerFitAll,
  allBounds,
}) => {
  const map = useMap();

  // Invalidate size on mount and window resize to avoid grey/misaligned tiles
  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  // Target coordinates navigation
  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, 16, { duration: 1.2 });
    }
  }, [targetCoords, map]);

  // Reset view to default center and zoom
  useEffect(() => {
    if (triggerReset > 0) {
      map.flyTo(defaultCenter, defaultZoom, { duration: 1.0 });
    }
  }, [triggerReset, defaultCenter, defaultZoom, map]);

  // Fit all active markers
  useEffect(() => {
    if (triggerFitAll > 0 && allBounds) {
      map.fitBounds(allBounds, { padding: [60, 60], maxZoom: 16 });
    }
  }, [triggerFitAll, allBounds, map]);

  return null;
};

// Sleek Custom SVG DivIcons for Leaflet
const createRiskMarkerIcon = (riskCategory: string, rank: number, isSelected: boolean) => {
  const colorMap: Record<string, string> = {
    critical: '#EF4444',
    high: '#F97316',
    moderate: '#FACC15',
    low: '#10B981',
  };
  const color = colorMap[riskCategory] || '#EF4444';
  const size = isSelected ? 38 : 30;

  return L.divIcon({
    className: 'custom-suraksh-corridor-pin',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${color};
        color: #FFFFFF;
        font-weight: 900;
        font-family: Inter, sans-serif;
        font-size: ${isSelected ? 13 : 11}px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: ${isSelected ? '3px solid #FFFFFF' : '2px solid rgba(255,255,255,0.95)'};
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4), 0 0 ${isSelected ? '22px' : '10px'} ${color};
        cursor: pointer;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      ">
        ${rank}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const createHazardMarkerIcon = (category: string, urgency: string) => {
  const color = urgency === 'critical' ? '#EF4444' : urgency === 'high' ? '#F97316' : '#38BDF8';
  const iconEmoji: Record<string, string> = {
    pothole: '🕳️',
    broken_streetlight: '💡',
    dangerous_junction: '⚠️',
    damaged_sign: '🛑',
    unsafe_construction: '🚧',
    damaged_crossing: '🚶',
    road_obstruction: '📦',
    accident_nearmiss: '💥',
    other: '📍',
  };
  const symbol = iconEmoji[category] || '📍';

  return L.divIcon({
    className: 'custom-suraksh-hazard-pin',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: #111827;
        border: 2px solid ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.5), 0 0 8px ${color}80;
        cursor: pointer;
      ">
        ${symbol}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const createAccidentMarkerIcon = (severity: string) => {
  const bg = severity === 'fatal' ? '#EF4444' : severity === 'severe' ? '#F97316' : '#FACC15';
  return L.divIcon({
    className: 'custom-accident-pin',
    html: `
      <div style="
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: ${bg};
        border: 2px solid #FFFFFF;
        box-shadow: 0 2px 6px rgba(0,0,0,0.6);
        cursor: pointer;
      "></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

export const GISMap: React.FC<GISMapProps> = ({
  corridors,
  hazardReports,
  accidentRecords,
  selectedCorridor,
  onSelectCorridor,
  layers,
  cityCenter,
  cityZoom,
  cityName,
}) => {
  const navigate = useNavigate();

  // Basemap style: 'osm' (Official standard OpenStreetMap) | 'carto' (Light GIS) | 'satellite'
  const [basemapStyle, setBasemapStyle] = useState<'osm' | 'carto' | 'satellite'>('osm');

  // Trigger states for map actions
  const [triggerReset, setTriggerReset] = useState(0);
  const [triggerFitAll, setTriggerFitAll] = useState(0);

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStatus, setSearchStatus] = useState<string | null>(null);
  const [searchTargetCoords, setSearchTargetCoords] = useState<[number, number] | null>(null);

  // Legend visibility toggle
  const [showLegend, setShowLegend] = useState(true);

  // Calculate all active marker bounds for "Fit All Markers"
  const allBounds = useMemo(() => {
    const latlngs: [number, number][] = [];
    if (layers.corridors) {
      corridors.forEach((c) => latlngs.push([c.latitude, c.longitude]));
    }
    if (layers.citizenHazards) {
      hazardReports.forEach((r) => latlngs.push([r.latitude, r.longitude]));
    }
    if (layers.accidents) {
      accidentRecords.forEach((a) => latlngs.push([a.latitude, a.longitude]));
    }
    if (latlngs.length === 0) return null;
    return L.latLngBounds(latlngs);
  }, [corridors, hazardReports, accidentRecords, layers]);

  // Handle Location & Coordinate Search
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setSearchStatus('Searching...');

    // 1. Check if user typed coordinates: e.g. "12.9172, 77.6228"
    const coordMatch = query.match(/^([-+]?[0-9]*\.?[0-9]+)[,\s]+([-+]?[0-9]*\.?[0-9]+)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setSearchTargetCoords([lat, lng]);
        setSearchStatus(`Located coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        return;
      }
    }

    // 2. Check local corridors dataset
    const matchedCorridor = corridors.find(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.district.toLowerCase().includes(query.toLowerCase())
    );
    if (matchedCorridor) {
      onSelectCorridor(matchedCorridor);
      setSearchTargetCoords([matchedCorridor.latitude, matchedCorridor.longitude]);
      setSearchStatus(`Found Corridor: ${matchedCorridor.name}`);
      return;
    }

    // 3. Check local hazard reports
    const matchedReport = hazardReports.find(
      (r) =>
        r.id.toLowerCase().includes(query.toLowerCase()) ||
        r.resolvedAddress.toLowerCase().includes(query.toLowerCase())
    );
    if (matchedReport) {
      setSearchTargetCoords([matchedReport.latitude, matchedReport.longitude]);
      setSearchStatus(`Found Hazard: ${matchedReport.id} (${matchedReport.categoryLabel})`);
      return;
    }

    // 4. Live Geocoding lookup via OpenStreetMap Nominatim
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setSearchTargetCoords([lat, lon]);
        setSearchStatus(`Found: ${data[0].display_name.slice(0, 50)}...`);
      } else {
        setSearchStatus(`No matches found for "${query}". Try searching coordinates (e.g. 12.91, 77.62) or local corridors.`);
      }
    } catch {
      setSearchStatus(`Could not reach geocoding service. Please search by coordinates or known corridors.`);
    }
  };

  const activeTargetCoords = selectedCorridor
    ? [selectedCorridor.latitude, selectedCorridor.longitude] as [number, number]
    : searchTargetCoords;

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-100 dark:bg-slate-900 font-sans">
      {/* ================= TOP FLOATING SEARCH BAR ================= */}
      <div className="absolute top-4 left-4 right-4 md:left-6 md:right-auto md:w-[460px] z-[400]">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="relative shadow-xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-900/95 backdrop-blur-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchStatus(null);
              }}
              placeholder={`Search ${cityName}, coordinates (e.g. 12.91, 77.62) or global places...`}
              className="w-full pl-10 pr-20 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 bg-transparent outline-none"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-brand-emerald hover:bg-brand-emerald-hover text-slate-950 text-[11px] font-bold rounded-lg transition-colors shadow-sm"
            >
              Search
            </button>
          </div>

          {searchStatus && (
            <div className="mt-1.5 px-3 py-1.5 bg-navy-950/95 border border-slate-700 rounded-xl text-[11px] text-brand-cyan shadow-lg flex items-center justify-between">
              <span className="truncate">{searchStatus}</span>
              <button
                type="button"
                onClick={() => setSearchStatus(null)}
                className="text-slate-400 hover:text-white ml-2 text-xs"
              >
                ×
              </button>
            </div>
          )}
        </form>
      </div>

      {/* ================= FLOATING MAP QUICK CONTROLS ================= */}
      <div className="absolute top-4 right-4 z-[400] flex items-center gap-2">
        {/* Reset View Button */}
        <button
          onClick={() => {
            onSelectCorridor(null);
            setSearchTargetCoords(null);
            setTriggerReset((prev) => prev + 1);
          }}
          className="px-3 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-brand-emerald hover:border-brand-emerald rounded-xl text-xs font-semibold shadow-lg flex items-center gap-1.5 transition-all active:scale-95"
          title="Reset View to Default City Center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset View</span>
        </button>

        {/* Fit All Markers Button */}
        <button
          onClick={() => setTriggerFitAll((prev) => prev + 1)}
          className="px-3 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-brand-cyan hover:border-brand-cyan rounded-xl text-xs font-semibold shadow-lg flex items-center gap-1.5 transition-all active:scale-95"
          title="Fit All Monitored Markers on Screen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Fit All</span>
        </button>
      </div>

      {/* ================= MAIN REACT LEAFLET MAP CONTAINER ================= */}
      <MapContainer
        center={cityCenter}
        zoom={cityZoom}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />

        <MapEngineController
          targetCoords={activeTargetCoords}
          defaultCenter={cityCenter}
          defaultZoom={cityZoom}
          triggerReset={triggerReset}
          triggerFitAll={triggerFitAll}
          allBounds={allBounds}
        />

        {/* Official OpenStreetMap Basemap Tiles & Carto / Satellite Switcher */}
        {basemapStyle === 'osm' && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}

        {basemapStyle === 'carto' && (
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            maxZoom={19}
          />
        )}

        {basemapStyle === 'satellite' && (
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={18}
          />
        )}

        {/* ================= HEATMAP & BUFFER ZONES LAYER ================= */}
        {layers.heatmaps &&
          corridors.map((c) => {
            const circleColor =
              c.riskCategory === 'critical'
                ? '#EF4444'
                : c.riskCategory === 'high'
                ? '#F97316'
                : '#FACC15';
            const radius = c.incidentCounts.total * 3.5 + 160;
            return (
              <Circle
                key={`heat-${c.id}`}
                center={[c.latitude, c.longitude]}
                radius={radius}
                pathOptions={{
                  fillColor: circleColor,
                  fillOpacity: 0.22,
                  color: circleColor,
                  weight: 2,
                  dashArray: '5, 5',
                }}
              />
            );
          })}

        {/* ================= HIGH-RISK CORRIDORS LAYER ================= */}
        {layers.corridors &&
          corridors.map((corridor) => (
            <Marker
              key={corridor.id}
              position={[corridor.latitude, corridor.longitude]}
              icon={createRiskMarkerIcon(
                corridor.riskCategory,
                corridor.rank,
                selectedCorridor?.id === corridor.id
              )}
              eventHandlers={{
                click: () => onSelectCorridor(corridor),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[210px] text-slate-900">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-red-600">CORRIDOR #{corridor.rank}</span>
                    <span className="font-bold text-xs capitalize text-slate-700">
                      {corridor.riskCategory} Risk
                    </span>
                  </div>
                  <div className="font-bold text-sm text-slate-900 leading-tight">
                    {corridor.name}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">{corridor.district}</div>

                  <div className="mt-2.5 p-2 bg-slate-100 rounded-lg text-xs flex justify-between font-mono">
                    <span>Risk: {corridor.riskScore}/100</span>
                    <span className="text-red-700 font-bold">{corridor.incidentCounts.fatal} Fatal</span>
                  </div>

                  <button
                    onClick={() => onSelectCorridor(corridor)}
                    className="w-full mt-2.5 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    View Telemetry Card
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* ================= CITIZEN HAZARD REPORTS LAYER ================= */}
        {layers.citizenHazards &&
          hazardReports
            .filter((r) => layers.resolved || r.status !== 'resolved')
            .map((report) => (
              <Marker
                key={report.id}
                position={[report.latitude, report.longitude]}
                icon={createHazardMarkerIcon(report.category, report.urgency)}
              >
                <Popup className="custom-popup">
                  <div className="p-1 min-w-[220px] text-slate-900">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono font-bold text-brand-cyan">{report.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                        {report.status}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-slate-900">{report.categoryLabel}</div>
                    <div className="text-xs text-slate-600 mt-0.5">{report.resolvedAddress}</div>

                    {report.imageUrl && (
                      <div className="my-2 h-24 rounded-lg overflow-hidden bg-slate-200">
                        <img
                          src={report.imageUrl}
                          alt={report.categoryLabel}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="text-[11px] bg-slate-100 p-2 rounded text-slate-700 italic">
                      "{report.description.slice(0, 80)}..."
                    </div>

                    <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
                      <span>Reported: {new Date(report.createdAt).toLocaleDateString()}</span>
                      <span className="font-bold uppercase text-red-600">{report.urgency} Urgency</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

        {/* ================= INDIVIDUAL ACCIDENT RECORDS LAYER ================= */}
        {layers.accidents &&
          accidentRecords.map((acc) => (
            <Marker
              key={acc.id}
              position={[acc.latitude, acc.longitude]}
              icon={createAccidentMarkerIcon(acc.severity)}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[190px] text-slate-900 text-xs">
                  <div className="font-bold text-red-600 uppercase text-[10px]">
                    Accident Record: {acc.id}
                  </div>
                  <div className="font-bold text-sm capitalize mt-0.5">
                    {acc.severity} Collision
                  </div>
                  <div className="text-slate-600 mt-1">
                    Speed Limit: {acc.speedLimitMph} mph • Vehicles: {acc.vehiclesInvolved}
                  </div>
                  <div className="text-slate-600">
                    Vulnerable User: {acc.vruInvolved ? 'Yes (Pedestrian/Cyclist)' : 'No'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Date: {new Date(acc.incidentDate).toLocaleDateString()}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* ================= FLOATING BASEMAP SWITCHER ================= */}
      <div className="absolute bottom-6 right-14 z-[400] flex items-center gap-1 p-1 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl backdrop-blur-xl">
        <button
          onClick={() => setBasemapStyle('osm')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
            basemapStyle === 'osm'
              ? 'bg-brand-emerald text-slate-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-white'
          }`}
        >
          OSM Standard
        </button>
        <button
          onClick={() => setBasemapStyle('carto')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
            basemapStyle === 'carto'
              ? 'bg-brand-emerald text-slate-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-white'
          }`}
        >
          Carto Light
        </button>
        <button
          onClick={() => setBasemapStyle('satellite')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
            basemapStyle === 'satellite'
              ? 'bg-brand-emerald text-slate-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-white'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* ================= FLOATING MAP LEGEND ================= */}
      <div className="absolute bottom-6 left-6 z-[400]">
        {showLegend ? (
          <div className="bg-white/95 dark:bg-navy-900/95 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 shadow-xl backdrop-blur-xl text-xs space-y-2 w-56">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-900 dark:text-white">
                Map Legend
              </span>
              <button
                onClick={() => setShowLegend(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                Hide
              </button>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center text-[9px] text-white font-bold">
                  1
                </span>
                <span>Critical Risk Corridor</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-orange-500 flex items-center justify-center text-[9px] text-white font-bold">
                  4
                </span>
                <span>High Risk Corridor</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-yellow-500 flex items-center justify-center text-[9px] text-white font-bold">
                  7
                </span>
                <span>Moderate Risk Corridor</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-slate-900 border border-cyan-400 flex items-center justify-center text-[10px]">
                  🕳️
                </span>
                <span>Citizen Hazard Report</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 border border-white" />
                <span>Fatal Crash Record</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-2 rounded bg-red-500/20 border border-red-500/60" />
                <span>Incident Heat Buffer</span>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLegend(true)}
            className="px-3 py-1.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold shadow-lg text-slate-700 dark:text-slate-200"
          >
            Show Legend
          </button>
        )}
      </div>

      {/* ================= SELECTED CORRIDOR TELEMETRY CARD (MATCHING REFERENCE IMAGE 2) ================= */}
      {selectedCorridor && (
        <div
          id="corridor-popup-card"
          className="absolute top-20 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-6 w-80 max-w-[92vw] bg-white/95 dark:bg-navy-900/95 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-glow-card overflow-hidden z-[400] backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-200"
        >
          {/* Header Photo Thumbnail */}
          <div className="relative h-28 bg-slate-800 overflow-hidden">
            <img
              src={selectedCorridor.streetImageUrl || 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600'}
              alt={selectedCorridor.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
            <button
              onClick={() => onSelectCorridor(null)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-navy-950/80 hover:bg-slate-800 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white">
              <div>
                <span className="text-[10px] uppercase font-semibold text-brand-cyan tracking-wider">
                  Project Zone
                </span>
                <h4 className="text-sm font-bold text-white truncate max-w-[180px]">
                  {selectedCorridor.name}
                </h4>
              </div>
              <div className="flex items-center gap-1 bg-red-500/20 border border-red-500/40 text-red-300 px-2 py-0.5 rounded text-xs font-bold">
                <Flame className="w-3 h-3 text-red-400" />
                Rank #{selectedCorridor.rank}
              </div>
            </div>
          </div>

          {/* Details Body matching Reference Image 2 metrics */}
          <div className="p-3.5 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center justify-between bg-slate-100 dark:bg-navy-950/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Composite Risk Score</span>
              <span className="font-mono font-bold text-sm text-red-500 dark:text-red-400">
                {selectedCorridor.riskScore} / 100
              </span>
            </div>

            {/* Percentile metrics list */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Braking percentile</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedCorridor.percentiles.braking}%</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Collision percentile</span>
                <span className="font-semibold text-red-500 dark:text-red-400 font-mono">
                  {selectedCorridor.percentiles.collision}%
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Overspeeding Freq</span>
                <span className="font-semibold text-amber-500 dark:text-amber-400 font-mono">
                  {selectedCorridor.percentiles.overspeedingFreq}%
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">VRU Density (Pedestrians)</span>
                <span className="font-semibold text-cyan-600 dark:text-cyan-400 font-mono">
                  {selectedCorridor.percentiles.vruDensity}%
                </span>
              </div>
            </div>

            {/* Crashes & Verified Hazards summary */}
            <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-lg">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Fatal</div>
                <div className="text-xs font-bold text-red-500 dark:text-red-400">{selectedCorridor.incidentCounts.fatal}</div>
              </div>
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-lg">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Severe</div>
                <div className="text-xs font-bold text-orange-500 dark:text-orange-400">{selectedCorridor.incidentCounts.severe}</div>
              </div>
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-lg">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Hazards</div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{selectedCorridor.verifiedHazardsCount}</div>
              </div>
            </div>

            {/* Recommended action */}
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300">
              <span className="font-bold text-emerald-900 dark:text-emerald-200">Recommended Action:</span>{' '}
              {selectedCorridor.recommendedAction}
            </div>

            <button
              onClick={() => navigate('/authority/hotspots')}
              className="w-full py-2 px-3 bg-brand-emerald hover:bg-brand-emerald-hover text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Inspect in Priority Queue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
