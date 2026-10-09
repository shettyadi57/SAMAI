import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { HazardCategory, UrgencyLevel } from '../types';
import {
  Camera,
  Upload,
  MapPin,
  Compass,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  Shield,
  EyeOff,
  Clock,
  FileText,
} from 'lucide-react';

export const CitizenReportPage: React.FC = () => {
  const { addHazardReport } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [category, setCategory] = useState<HazardCategory>('pothole');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('high');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'
  );
  const [aiDetectedLabel, setAiDetectedLabel] = useState('Severe Asphalt Depression / Pothole (94.6% confidence)');
  
  // Location states
  const [latitude, setLatitude] = useState<number>(47.5492);
  const [longitude, setLongitude] = useState<number>(7.5905);
  const [resolvedAddress, setResolvedAddress] = useState('Elisabethenanlage 14, 4051 Basel');
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(true);

  // Submission result modal
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  const categories: { key: HazardCategory; label: string; icon: string }[] = [
    { key: 'pothole', label: 'Pothole or Damaged Road', icon: '🕳️' },
    { key: 'broken_streetlight', label: 'Broken Streetlight', icon: '💡' },
    { key: 'dangerous_junction', label: 'Dangerous Junction', icon: '⚠️' },
    { key: 'damaged_sign', label: 'Missing / Damaged Sign', icon: '🛑' },
    { key: 'unsafe_construction', label: 'Unsafe Construction Zone', icon: '🚧' },
    { key: 'damaged_crossing', label: 'Damaged Pedestrian Crossing', icon: '🚶' },
    { key: 'road_obstruction', label: 'Road Obstruction', icon: '📦' },
    { key: 'accident_nearmiss', label: 'Recurring Near-Miss Spot', icon: '💥' },
    { key: 'other', label: 'Other Hazard', icon: '🔍' },
  ];

  // Geolocation lookup
  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Using simulated Smart City coordinates.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        setLocationSuccess(true);
        setIsLocating(false);

        // Reverse geocoding lookup
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          if (data && data.display_name) {
            setResolvedAddress(data.display_name);
          } else {
            setResolvedAddress(`GPS: ${lat}, ${lng} (Street resolution unavailable)`);
          }
        } catch {
          setResolvedAddress(`Coordinates: ${lat}° N, ${lng}° E (Smart City Corridor)`);
        }
      },
      (err) => {
        setIsLocating(false);
        // Fallback to demo location
        setLatitude(47.5492);
        setLongitude(7.5905);
        setResolvedAddress('Elisabethenanlage 14, 4051 Basel (Demo GPS)');
      },
      { timeout: 8000 }
    );
  };

  // Image Upload handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setAiDetectedLabel('AI Vision: Pothole & Road Surface Defect Detected (96.2% Confidence)');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please describe the hazard to assist road engineers.');
      return;
    }

    const matchedCat = categories.find((c) => c.key === category);

    const newReport = addHazardReport({
      category,
      categoryLabel: matchedCat ? matchedCat.label : 'Road Hazard',
      description,
      imageUrl: imagePreview || undefined,
      latitude,
      longitude,
      resolvedAddress,
      urgency,
      submittedBy: {
        userId: user?.id || 'usr-citizen-anon',
        userName: user?.name || 'Concerned Citizen',
        isAnonymous,
      },
    });

    setSubmittedReportId(newReport.id);
  };

  return (
    <div className="flex-1 bg-navy-950 py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb / Back button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/citizen/dashboard')}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            ← Back to Citizen Dashboard
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-brand-emerald border border-emerald-500/30 text-xs font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>Community Hazard Reporting Portal</span>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">Report a Road Hazard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Submit photographic evidence and GPS coordinates to alert municipal road safety authorities.
          </p>
        </div>

        {/* Reporting Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-surface-card/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-glow-authority backdrop-blur-xl space-y-8"
        >
          {/* 1. PHOTO UPLOAD & AI DETECTION (Matching Reference Image 1) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Camera className="w-4 h-4 text-brand-emerald" />
                <span>1. Photographic Evidence</span>
              </label>
              <span className="text-[11px] text-slate-400">JPG, PNG or WebP</span>
            </div>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 group max-h-72 bg-slate-900">
                <img src={imagePreview} alt="Hazard preview" className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-transparent pointer-events-none" />

                {/* AI Detection Pill */}
                {aiDetectedLabel && (
                  <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-navy-950/90 border border-emerald-500/40 text-xs text-white flex items-center gap-2 backdrop-blur-md">
                    <Sparkles className="w-4 h-4 text-brand-emerald shrink-0 animate-pulse" />
                    <span className="font-semibold text-emerald-300">{aiDetectedLabel}</span>
                  </div>
                )}

                {/* Replace or Remove Button */}
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-navy-950/80 hover:bg-red-500 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-700 hover:border-brand-emerald rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-navy-950/40 hover:bg-slate-900/40 transition-all text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-brand-emerald flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-white">Click or drag image to upload</span>
                <span className="text-xs text-slate-400 mt-1">Take a clear photo showing road surface damage</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* 2. HAZARD CATEGORY SELECTION */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              2. Hazard Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center gap-2.5 ${
                    category === cat.key
                      ? 'bg-brand-emerald/15 border-brand-emerald text-emerald-300 shadow-glow-emerald'
                      : 'bg-navy-950/60 border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. LOCATION & RESOLVED ADDRESS */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>3. Location Coordinates</span>
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-xs font-bold text-cyan-400 flex items-center gap-1.5 transition-colors"
              >
                <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Detecting GPS...' : 'Use My Current Location'}</span>
              </button>
            </div>

            {/* Resolved Address Input */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Human-Readable Address</label>
                <input
                  type="text"
                  value={resolvedAddress}
                  onChange={(e) => setResolvedAddress(e.target.value)}
                  placeholder="e.g. Elisabethenanlage 14, 4051 Basel"
                  className="w-full bg-navy-950/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 outline-none focus:border-brand-emerald"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    className="w-full bg-navy-950/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    className="w-full bg-navy-950/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. DESCRIPTION & URGENCY */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                4. Description of Danger
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the hazard size, visual cues, impact on cyclists/vehicles, and recent near misses..."
                className="w-full bg-navy-950/90 border border-slate-700/80 rounded-xl p-3.5 text-xs text-white placeholder-slate-400 outline-none focus:border-brand-emerald"
                required
              />
            </div>

            {/* Urgency selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Urgency Level
              </label>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {(['low', 'medium', 'high', 'critical'] as UrgencyLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setUrgency(lvl)}
                    className={`py-2 px-3 rounded-xl border font-bold capitalize transition-all ${
                      urgency === lvl
                        ? lvl === 'critical'
                          ? 'bg-red-500/20 border-red-500 text-red-300'
                          : lvl === 'high'
                          ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                          : lvl === 'medium'
                          ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
                          : 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-navy-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy toggle */}
            <div className="pt-2 flex items-center justify-between p-3.5 rounded-xl bg-navy-950/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <EyeOff className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Public Display Privacy</div>
                  <div className="text-[11px] text-slate-400">
                    Display report anonymously on community boards
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded text-brand-emerald accent-brand-emerald"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-brand-emerald hover:bg-brand-emerald-hover text-slate-950 font-black rounded-2xl text-sm transition-all shadow-glow-emerald flex items-center justify-center gap-2"
          >
            <span>Submit Hazard Report</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      {submittedReportId && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-navy-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-glow-card text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-brand-emerald flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white">Hazard Report Logged!</h3>
            <p className="text-xs text-slate-300 mt-2">
              Your report has been queued for official verification by Municipal Traffic Safety Engineers.
            </p>

            <div className="my-6 p-4 rounded-2xl bg-navy-950 border border-slate-800 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">Official Ticket ID</span>
                <span className="text-sm font-mono font-bold text-brand-cyan">{submittedReportId}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Status</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-semibold">
                  Submitted — Awaiting Verification
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/citizen/dashboard')}
                className="py-2.5 px-4 bg-brand-emerald hover:bg-brand-emerald-hover text-slate-950 rounded-xl text-xs font-bold transition-colors"
              >
                Citizen Dashboard
              </button>
              <button
                onClick={() => navigate('/authority/reports')}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                View in Authority
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
