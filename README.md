# SURAKSH: AI-Powered Road Safety & Smart City Intelligence Platform
> **AI-Based High-Risk Road Location Identification and Visualization System**  
> *Detect Risk. Prioritize Action. Build Safer Roads.*

SURAKSH bridges the gap between everyday citizens and municipal traffic safety authorities. Citizens report real-world road hazards with photographic evidence and automatic GPS geolocation, while government officials leverage an explainable AI Priority Queue, live GIS geospatial analytics, and before-and-after safety audits to target high-risk corridors.

---

## 🌟 Key Features

### 1. Citizen Hazard Reporting Portal (Reference Image 1)
- **Photo Upload & Simulated AI Classifier**: Drag-and-drop or snap road damage photos with automatic visual hazard confidence scoring.
- **GPS Pinpointing & Geocoding**: One-tap current location acquisition with OpenStreetMap Nominatim reverse address resolution.
- **Road Safety Taxonomies**: Potholes, damaged signs, dark streetlights, dangerous junctions, unsafe construction zones, damaged pedestrian crossings, road obstructions, and recurring near-miss collision spots.
- **Lifecycle Tracking**: Real-time progress tickets (`Submitted` → `Under Review` → `Verified` → `In Progress` → `Resolved`).

### 2. Authority GIS Analytics Console (Reference Image 2)
- **Full-Screen Interactive Map**: Leaflet + OpenStreetMap engine with color-coded risk markers and accident heatmap buffer zones.
- **Top High-Risk Corridors Panel**: Ranked list with cyan risk bars, incident counts, and single-click map zoom synchronization.
- **Telemetry Charts**: Collision severity breakdown (Slight, Severe, Fatal), speed limit distributions, and road types.
- **Corridor Detail Popups**: Overall Rank, Braking percentile, Collision percentile, Overspeeding frequency, and VRU density.
- **GIS Layers Widget**: Independent toggles for hazard reports, accident heatmaps, corridors, and live filters.

### 3. Authority Gateway (Reference Image 3)
- **Sleek Deep Navy Interface**: Dark cybernetic glassmorphism card with glowing status indicators.
- **Dual-Role Switcher**: Seamless switching between **Public Citizen** and **Government Official** modes.
- **1-Click Hackathon Evaluator Logins**: Pre-authenticated buttons for instant judge testing.

### 4. Road Safety Priority Queue (Main Differentiating Feature)
- **Explainable Multi-Factor Formula**: Deterministic, transparent scoring (0–100) combining crash severity, crash volume, recency trends, and verified citizen reports.
- **Interactive AI Weight Tuner**: Live sliders to calibrate weights and observe real-time priority rank re-ordering.
- **CSV Data Export**: One-click export for official municipal reporting.

### 5. SURAKSH Safety Copilot (AI Assistant)
- **Floating AI Assistant**: Anchored bottom-right on all screens.
- **Grounded Responses**: Answers questions on top corridors, unresolved hazards, and inspection recommendations using the live dataset.

### 6. Safety Analytics & Before-and-After Audit
- **Empirical Before & After Tracking**: Monitors crash and fatality reductions following physical interventions (e.g., speed tables, LED luminaires, signal retiming).
- **Daily Operations Digest & Weekly Reports**: Exportable and printable.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### Installation & Run

1. Clone or navigate to the project directory:
```bash
cd c:/SAMAI
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

---

## 🧪 Running Automated Tests

Run the test suite for the deterministic scoring engine and priority queue algorithm:
```bash
npm test
```

---

## 🛠 Technology Stack

- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + Custom Dark Theme Tokens
- **Mapping & GIS**: Leaflet + React-Leaflet + CARTO Positron / OpenStreetMap
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Persistence**: Reactive Browser LocalStorage with pre-seeded Smart City dataset
- **Testing**: Vitest
