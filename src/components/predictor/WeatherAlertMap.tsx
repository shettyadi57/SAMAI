import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { HighRiskCorridor } from '../../types';
import {
  WeatherAlertFilter,
  CorridorWeatherRisk,
  WeatherBannerInfo,
  evaluateCorridorsUnderWeather,
  getRiskMarkerColor,
  fetchLiveWeather,
  LiveWeatherReport,
} from '../../engine/predictor';
import {
  CloudSun,
  Sun,
  CloudRain,
  CloudFog,
  Moon,
  Radio,
  RefreshCw,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MapPin,
} from 'lucide-react';

interface WeatherAlertMapProps {
  corridors: HighRiskCorridor[];
  selectedWeather: WeatherAlertFilter;
  onWeatherChange: (filter: WeatherAlertFilter) => void;
  cityCenter: [number, number];
  cityZoom: number;
  cityName: string;
  onSimulateCorridor?: (corridor: HighRiskCorridor) => void;
}

// Controller to smoothly fly to city center on city preset change
const MapViewController: React.FC<{
  center: [number, number];
  zoom: number;
}> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    map.flyTo(center, zoom, { duration: 1.0 });
  }, [center, zoom, map]);
  return null;
};

const createPredictedRiskIcon = (level: 'Low' | 'Medium' | 'High' | 'Critical', rank: number) => {
  const color = getRiskMarkerColor(level);
  return L.divIcon({
    className: 'custom-weather-corridor-pin',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${color};
        color: #FFFFFF;
        font-weight: 800;
        font-family: Inter, sans-serif;
        font-size: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #FFFFFF;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 14px ${color};
        cursor: pointer;
      ">
        ${rank}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

export const WeatherAlertMap: React.FC<WeatherAlertMapProps> = ({
  corridors,
  selectedWeather,
  onWeatherChange,
  cityCenter,
  cityZoom,
  cityName,
  onSimulateCorridor,
}) => {
  const [liveReport, setLiveReport] = useState<LiveWeatherReport | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  // Evaluate corridors under active weather filter
  const { corridorRisks, bannerInfo } = evaluateCorridorsUnderWeather(corridors, selectedWeather);

  // Sync with Open-Meteo live weather
  const handleFetchLiveWeather = async () => {
    setIsLoadingLive(true);
    try {
      const report = await fetchLiveWeather(cityCenter[0], cityCenter[1], cityName);
      setLiveReport(report);
      if (report.isLive) {
        onWeatherChange(report.filter);
      }
    } finally {
      setIsLoadingLive(false);
    }
  };

  // Attempt initial live weather fetch on city change
  useEffect(() => {
    handleFetchLiveWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityName]);

  const weatherOptions: { filter: WeatherAlertFilter; label: string; icon: React.ReactNode }[] = [
    { filter: 'Clear', label: 'Clear Day', icon: <Sun className="w-4 h-4 text-amber-400" /> },
    { filter: 'Rain', label: 'Rain Storm', icon: <CloudRain className="w-4 h-4 text-blue-400" /> },
    { filter: 'Fog', label: 'Dense Fog', icon: <CloudFog className="w-4 h-4 text-slate-300" /> },
    { filter: 'Night', label: 'Night / Dark', icon: <Moon className="w-4 h-4 text-indigo-400" /> },
  ];

  return (
    <div className="bg-navy-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm space-y-4">
      {/* Header with Weather Selector and Live Sync */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CloudSun className="w-4 h-4 text-brand-cyan" />
            Weather Alert Simulation Layer
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamic spatial recoloring of all corridors according to ML-predicted adverse weather risk
          </p>
        </div>

        {/* Live Weather Indicator / Sync Button */}
        <div className="flex items-center gap-2">
          {liveReport && (
            <div className="text-right hidden md:block">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                {liveReport.source === 'open-meteo' ? 'Open-Meteo API' : 'Offline Fallback'}
              </span>
              <span className="text-xs text-slate-300 font-semibold">
                {liveReport.conditionDescription}
              </span>
            </div>
          )}
          <button
            onClick={handleFetchLiveWeather}
            disabled={isLoadingLive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700/60 transition-all disabled:opacity-50"
            title="Fetch live weather telemetry from Open-Meteo"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-cyan ${isLoadingLive ? 'animate-spin' : ''}`} />
            <span>{isLoadingLive ? 'Syncing...' : 'Sync Live Weather'}</span>
          </button>
        </div>
      </div>

      {/* Weather Selector Segmented Control */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {weatherOptions.map((opt) => {
          const isSelected = selectedWeather === opt.filter;
          return (
            <button
              key={opt.filter}
              onClick={() => onWeatherChange(opt.filter)}
              className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                isSelected
                  ? 'bg-slate-800 border-brand-cyan text-white shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Alert Banner */}
      <div
        className="p-4 rounded-xl border flex items-start gap-3 transition-colors"
        style={{
          backgroundColor:
            selectedWeather === 'Rain'
              ? 'rgba(14, 165, 233, 0.12)'
              : selectedWeather === 'Fog'
              ? 'rgba(245, 158, 11, 0.12)'
              : selectedWeather === 'Night'
              ? 'rgba(129, 140, 248, 0.12)'
              : 'rgba(16, 185, 129, 0.12)',
          borderColor: bannerInfo.severityColor,
        }}
      >
        <AlertTriangle
          className="w-5 h-5 shrink-0 mt-0.5"
          style={{ color: bannerInfo.severityColor }}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <h4
              className="text-sm font-extrabold tracking-tight"
              style={{ color: bannerInfo.severityColor }}
            >
              {bannerInfo.bannerTitle}
            </h4>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/60 text-slate-300 font-semibold border border-slate-700/50">
              {bannerInfo.elevatedCorridorsCount} of {bannerInfo.totalCorridorsCount} elevated
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {bannerInfo.bannerMessage}
          </p>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-96 w-full rounded-xl overflow-hidden border border-slate-800 relative z-0 shadow-inner">
        <MapContainer
          center={cityCenter}
          zoom={cityZoom}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          <MapViewController center={cityCenter} zoom={cityZoom} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Buffer circles recolored by predicted risk */}
          {corridorRisks.map((cr) => {
            const color = getRiskMarkerColor(cr.predictedLevel);
            return (
              <Circle
                key={`buff-${cr.corridorId}`}
                center={[cr.latitude, cr.longitude]}
                radius={320}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.24,
                  color,
                  weight: 2,
                  dashArray: '4, 4',
                }}
              />
            );
          })}

          {/* Markers recolored by predicted risk */}
          {corridorRisks.map((cr, idx) => {
            const rawCorridor = corridors.find((c) => c.id === cr.corridorId);
            return (
              <Marker
                key={cr.corridorId}
                position={[cr.latitude, cr.longitude]}
                icon={createPredictedRiskIcon(cr.predictedLevel, idx + 1)}
              >
                <Popup className="custom-popup">
                  <div className="p-1 min-w-[220px] text-slate-900">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-red-600">CORRIDOR #{idx + 1}</span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white"
                        style={{ backgroundColor: getRiskMarkerColor(cr.predictedLevel) }}
                      >
                        {cr.predictedLevel} Risk
                      </span>
                    </div>

                    <div className="font-bold text-sm text-slate-900 leading-tight">
                      {cr.corridorName}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">{cr.district}</div>

                    <div className="mt-2.5 p-2 bg-slate-100 rounded-lg text-xs space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Baseline Score:</span>
                        <span className="font-bold">{cr.baselineScore}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Under {selectedWeather}:</span>
                        <span className="font-bold text-red-600">{cr.predictedScore}/100</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200">
                        <span className="text-slate-600">Weather Risk Delta:</span>
                        <span
                          className={`font-bold ${
                            cr.riskDelta > 0 ? 'text-red-600' : 'text-emerald-600'
                          }`}
                        >
                          {cr.riskDelta > 0 ? '+' : ''}
                          {cr.riskDelta}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-600 flex justify-between font-mono">
                      <span>Slight: {(cr.probabilities.slight * 100).toFixed(0)}%</span>
                      <span>Severe: {(cr.probabilities.severe * 100).toFixed(0)}%</span>
                      <span className="text-red-700 font-bold">
                        Fatal: {(cr.probabilities.fatal * 100).toFixed(0)}%
                      </span>
                    </div>

                    {rawCorridor && onSimulateCorridor && (
                      <button
                        onClick={() => onSimulateCorridor(rawCorridor)}
                        className="w-full mt-2.5 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <span>Simulate in Conditions Panel</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Corridor Impact Quick Table / Cards */}
      <div className="pt-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Monitored Corridors — Predicted Severity Breakdown Under {selectedWeather}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {corridorRisks.map((cr, idx) => (
            <div
              key={cr.corridorId}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-1 mb-1.5">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    #{idx + 1}
                  </span>
                  <div className="text-xs font-bold text-slate-200 line-clamp-1">
                    {cr.corridorName}
                  </div>
                </div>
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase shrink-0"
                  style={{ backgroundColor: getRiskMarkerColor(cr.predictedLevel) }}
                >
                  {cr.predictedLevel}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-1.5 border-t border-slate-800/80">
                <span className="text-slate-400">Predicted Risk:</span>
                <span className="font-bold text-slate-200">{cr.predictedScore}/100</span>
                <span
                  className={`font-bold text-[11px] ${
                    cr.riskDelta > 0 ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  ({cr.riskDelta > 0 ? '+' : ''}
                  {cr.riskDelta}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
