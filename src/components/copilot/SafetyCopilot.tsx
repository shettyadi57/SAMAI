import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Bot,
  X,
  Send,
  Sparkles,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  Compass,
  FileText,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    route?: string;
  };
}

export const SafetyCopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { corridors, reports } = useData();
  const { role } = useAuth();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text:
        role === 'authority'
          ? "Hello Officer. I am the SURAKSH Safety Copilot. I analyze live GIS telemetry, citizen hazard reports, and accident records to help prioritize interventions. How can I assist you today?"
          : "Hello! I am your SURAKSH Safety Assistant. I can help guide you through reporting road hazards, checking status updates, and understanding road risk rankings in your neighborhood.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const quickPrompts =
    role === 'authority'
      ? [
          'Show top 5 priority locations',
          "Summarize today's unresolved reports",
          'Forecast crash risk under rain/fog',
          'Why is the #1 corridor high risk?',
          'Explain weekly accident trend',
          'What should an officer inspect first?',
        ]
      : [
          'How do I report a pothole?',
          'What does "Verified" status mean?',
          'Are my reports kept confidential?',
          'Show dangerous roads nearby',
        ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const generateGroundedResponse = (prompt: string): string => {
    const q = prompt.toLowerCase();
    const unresolvedReports = reports.filter((r) => r.status === 'submitted' || r.status === 'under_review');
    const topCorridor = corridors[0];

    if (q.includes('top') && (q.includes('5') || q.includes('priority') || q.includes('blackspot') || q.includes('location'))) {
      const top5 = corridors.slice(0, 5);
      return `Here are the top high-risk corridors currently ranked by the SURAKSH Priority Queue based on fatal crashes, severe injuries, and verified citizen reports:\n\n` +
        top5
          .map(
            (c, i) =>
              `${i + 1}. **${c.name}** (${c.district}) — Risk Score: **${c.riskScore}/100** [${c.riskCategory.toUpperCase()}]\n   • Fatal crashes: ${c.incidentCounts.fatal} | Severe: ${c.incidentCounts.severe} | Verified reports: ${c.verifiedHazardsCount}`
          )
          .join('\n\n') +
        `\n\n*Source: Grounded in active dataset containing ${corridors.length} monitored corridors.*`;
    }

    if (q.includes('unresolved') || q.includes("today's report") || q.includes('pending')) {
      return `There are currently **${unresolvedReports.length} unresolved citizen hazard reports** requiring authority attention:\n\n` +
        unresolvedReports
          .map(
            (r) =>
              `• **[${r.id}] ${r.categoryLabel}** at *${r.resolvedAddress}*\n  Urgency: **${r.urgency.toUpperCase()}** | Status: *${r.status}*`
          )
          .join('\n\n') +
        `\n\nReview them in the **Hazard Reports Management** console to verify or schedule inspection teams.`;
    }

    if (q.includes('#1') || q.includes('why is') || (topCorridor && q.includes(topCorridor.name.toLowerCase()))) {
      if (!topCorridor) return "No corridor data currently loaded.";
      return `**Risk Analysis for ${topCorridor.name}:**\n\n` +
        `• **Rank:** #${topCorridor.rank} in the municipality with a composite score of **${topCorridor.riskScore}/100** (${topCorridor.riskCategory.toUpperCase()}).\n` +
        `• **Crash Evidence:** ${topCorridor.incidentCounts.fatal} fatal and ${topCorridor.incidentCounts.severe} severe injury collisions recorded.\n` +
        `• **Citizen Reports:** ${topCorridor.verifiedHazardsCount} independently verified hazard reports (e.g., deep asphalt depressions and failed street lighting).\n` +
        `• **Telemetry:** High VRU (vulnerable road user) density percentile (**${topCorridor.percentiles.vruDensity}%**) and excessive braking events.\n\n` +
        `**Recommended Action:** *${topCorridor.recommendedAction}*`;
    }

    if (q.includes('predict') || q.includes('forecast') || q.includes('weather') || q.includes('rain') || q.includes('fog')) {
      return `**AI Crash Risk Predictor Intelligence:**\n\n` +
        `• **Adverse Weather Impact:** Dense fog increases fatal collision likelihood across high-speed radials. Heavy rain degrades tire braking traction by up to 35%.\n` +
        `• **In-Browser ML Simulation:** Our Softmax Logistic Regression engine forecasts P(Slight/Severe/Fatal) and runs feature ablation explaining exact factor contributions.\n` +
        `• **Live Corridors Map:** Open the **"AI Risk Predictor"** console from the sidebar (/authority/predictor) to simulate custom speeds, lighting, and weather conditions with live Open-Meteo telemetry sync.`;
    }

    if (q.includes('trend') || q.includes('weekly')) {
      return `**Weekly Accident Trend Analysis:**\n\n` +
        `• Historical pattern shows peak collision incidence occurring on **Friday evenings (16:00 - 20:00)**.\n` +
        `• Overall distribution: **81.1% slight collisions, 16.8% severe injuries, and 2.1% fatal collisions**.\n` +
        `• Note: Observed trend reductions following physical interventions reflect empirical records and are monitored under the Safety Audit module.`;
    }

    if (q.includes('inspect first') || q.includes('officer')) {
      return `**Recommended Inspection Priority:**\n\n` +
        `1. **${topCorridor ? topCorridor.name : 'Primary Corridor'}** — Scheduled review is overdue. Verify recent citizen report **SUR-2026-1042** (pothole near transit stop).\n` +
        `2. **Spalenring School Crossing** — Check pedestrian refuge beacon visibility before school resumption.\n` +
        `3. Assign field maintenance crews to cold-patch critical pavement depressions on gross arterial sections.`;
    }

    if (q.includes('report a pothole') || q.includes('how to submit') || q.includes('how do i')) {
      return `To submit a road hazard:\n\n` +
        `1. Click the green **"Report a Hazard"** button in your dashboard or navigation bar.\n` +
        `2. Snap or upload a clear photo of the road damage (our system automatically analyzes the image).\n` +
        `3. Tap **"Use My Current Location"** to automatically pinpoint GPS coordinates.\n` +
        `4. Select the hazard type (Pothole, Broken Streetlight, Dangerous Junction, etc.).\n` +
        `5. Hit Submit. You will receive an official tracking ID (e.g. SUR-2026-XXXX) to track government repair progress.`;
    }

    if (q.includes('status') || q.includes('verified')) {
      return `**Report Lifecycle Explained:**\n\n` +
        `• **Submitted:** Received by SURAKSH platform and queued for review.\n` +
        `• **Under Review:** Municipal engineers are reviewing photographic evidence and GIS coordinates.\n` +
        `• **Verified:** Officials confirmed the hazard is genuine; it is assigned a risk weight.\n` +
        `• **In Progress:** Maintenance squad or contractor has been deployed to the site.\n` +
        `• **Resolved:** Repairs completed and certified by safety inspection.`;
    }

    if (q.includes('confidential') || q.includes('anonymous') || q.includes('privacy')) {
      return `**Privacy Guarantee:**\n\n` +
        `Yes! Your identity is strictly protected. If you check "Post anonymously", your personal contact details will **never** be shown publicly. Only verified evidence (photograph, GPS, and timestamp) is shared with authorized road safety inspectors.`;
    }

    // Fallback response
    return `I am grounded in live SURAKSH road safety data. You can ask me:\n` +
      `• "Show top 5 priority locations"\n` +
      `• "Summarize today's unresolved reports"\n` +
      `• "Why is ${topCorridor ? topCorridor.name : 'this location'} high risk?"\n` +
      `• "How do I report a pothole?"`;
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responseText = generateGroundedResponse(query);
      const botMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          id="btn-safety-copilot-trigger"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-full shadow-glow-emerald hover:scale-105 active:scale-95 transition-all group border border-emerald-300/40"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-300 rounded-full animate-ping" />
          </div>
          <span className="text-sm font-semibold tracking-wide">SURAKSH Copilot</span>
          <span className="text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded-full font-mono text-slate-900">AI</span>
        </button>
      )}

      {/* Floating Copilot Modal */}
      {isOpen && (
        <div
          id="copilot-panel"
          className="fixed bottom-6 right-6 w-[410px] max-w-[94vw] h-[580px] max-h-[85vh] bg-navy-900/95 border border-slate-700/80 rounded-3xl shadow-glow-card z-50 flex flex-col overflow-hidden backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-navy-800 to-navy-900 border-b border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center shadow-glow-emerald">
                <Bot className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white tracking-wide">SURAKSH Copilot</h3>
                  <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                    DEMO AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Grounded on Smart City GIS Feeds
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="p-2.5 bg-navy-950/60 border-b border-slate-800/80 overflow-x-auto flex gap-2 no-scrollbar">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="whitespace-nowrap text-[11px] bg-slate-800/90 hover:bg-emerald-950/80 hover:text-emerald-300 hover:border-emerald-500/40 border border-slate-700/70 text-slate-300 px-3 py-1.5 rounded-full transition-all shrink-0 flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                {p}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-navy-900/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-xs shadow-md font-medium'
                      : 'bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-tl-xs whitespace-pre-line'
                  }`}
                >
                  {msg.text}
                  <div
                    className={`text-[9px] mt-1.5 ${
                      msg.sender === 'user' ? 'text-emerald-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-xs text-slate-400 italic pl-8">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-150" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-300" />
                <span>Copilot analyzing GIS dataset...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-navy-950/90 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  role === 'authority'
                    ? 'Ask about corridors, inspections, risk scores...'
                    : 'Ask how to report or check hazard status...'
                }
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-8 h-8 rounded-xl bg-brand-emerald hover:bg-brand-emerald-hover disabled:opacity-40 disabled:hover:bg-brand-emerald text-slate-950 flex items-center justify-center transition-colors shrink-0 font-bold"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              Decision Support Assistant • Always verify ground conditions
            </p>
          </div>
        </div>
      )}
    </>
  );
};
