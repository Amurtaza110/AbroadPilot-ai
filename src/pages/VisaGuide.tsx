// ============================================================
// Visa Guide — AI-Generated Country-Specific Checklists
// ============================================================
import React, { useState } from 'react';
import {
  ShieldCheck, Globe, Loader2, Sparkles, ChevronRight,
  CheckSquare, Square, ExternalLink, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { generateVisaChecklist } from '../lib/gemini';

const POPULAR_COUNTRIES = [
  { code: 'DE', name: 'Germany', flag: '🇩🇪', note: 'APS Certificate required' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', note: 'CAS + 28-day funds' },
  { code: 'US', name: 'United States', flag: '🇺🇸', note: 'F-1 Visa + SEVIS' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', note: 'Study Permit' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', note: 'Subclass 500 Visa' },
  { code: 'FR', name: 'France', flag: '🇫🇷', note: 'Campus France required' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', note: 'MVV + Residence Permit' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', note: 'Universitaly + Visto D' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', note: 'Migrationsverket' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', note: 'Student Visa' },
];

export const VisaGuide: React.FC = () => {
  const { profile } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState<{ code: string; name: string } | null>(null);
  const [customCountry, setCustomCountry] = useState('');
  const [checklist, setChecklist] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkItems, setCheckItems] = useState<Record<string, boolean>>({});

  const generateChecklist = async (country: string) => {
    setLoading(true);
    setChecklist('');

    await generateVisaChecklist(
      country,
      profile?.nationality || 'International',
      profile?.targetDegree || 'Master',
      (chunk) => {
        if (!chunk.done) setChecklist(prev => prev + chunk.text);
        else setLoading(false);
      }
    );
    setLoading(false);
  };

  const handleCountrySelect = (country: { code: string; name: string }) => {
    setSelectedCountry(country);
    generateChecklist(country.name);
  };

  const handleCustomSearch = () => {
    if (!customCountry.trim()) return;
    const c = { code: customCountry.toUpperCase().slice(0, 2), name: customCountry };
    setSelectedCountry(c);
    generateChecklist(customCountry);
  };

  const renderChecklist = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h2 key={i} className="text-lg font-black text-white mt-4 mb-2 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-brand-400" />{line.slice(2)}</h2>;
      if (line.startsWith('## ')) return <h3 key={i} className="text-sm font-bold text-brand-300 mt-4 mb-2 uppercase tracking-wide">{line.slice(3)}</h3>;
      if (line.startsWith('### ')) return <h4 key={i} className="text-sm font-semibold text-white mt-3 mb-1">{line.slice(4)}</h4>;
      if (line.match(/^\d+\./)) {
        const content = line.replace(/^\d+\.\s*/, '');
        const id = `item-${i}`;
        const parts = content.split(/\*\*(.*?)\*\*/g);
        return (
          <button key={i}
            onClick={() => setCheckItems(prev => ({ ...prev, [id]: !prev[id] }))}
            className={`flex items-start gap-3 w-full text-left p-3 rounded-xl transition-all ${
              checkItems[id] ? 'bg-brand-500/10 border border-brand-500/20' : 'hover:bg-slate-800'
            }`}>
            {checkItems[id]
              ? <CheckSquare className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              : <Square className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />}
            <span className={`text-sm ${checkItems[id] ? 'line-through text-slate-500' : 'text-slate-300'}`}>
              {parts.map((p, j) => j % 2 === 1 ? <strong key={j} className={checkItems[id] ? '' : 'text-white'}>{p}</strong> : p)}
            </span>
          </button>
        );
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        const content = line.slice(2);
        const parts = content.split(/\*\*(.*?)\*\*/g);
        return (
          <li key={i} className="ml-5 text-sm text-slate-400 leading-relaxed py-0.5">
            {parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="text-slate-200">{p}</strong> : p)}
          </li>
        );
      }
      if (line.includes('⚠️') || line.includes('Warning') || line.includes('Important')) {
        return (
          <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 my-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-200">{line.replace('⚠️', '').replace('Warning:', '').replace('Important:', '').trim()}</p>
          </div>
        );
      }
      if (line.trim() === '') return <div key={i} className="h-1" />;
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="text-sm text-slate-400 leading-relaxed">
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="text-slate-200">{p}</strong> : p)}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-brand"><Sparkles className="w-3 h-3" /> AI Generated · Live Web Search</span>
        </div>
        <h1 className="text-2xl font-black text-white">Visa Guide</h1>
        <p className="text-slate-400 text-sm mt-1">AI-generated, country-specific student visa checklists with real-time requirements</p>
      </div>

      {/* Country Selection */}
      <div className="card p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-300">Select Destination Country</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {POPULAR_COUNTRIES.map(c => (
            <button key={c.code}
              onClick={() => handleCountrySelect(c)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedCountry?.code === c.code
                  ? 'bg-brand-500/15 border-brand-500 text-brand-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}>
              <div className="text-2xl mb-1">{c.flag}</div>
              <div className="text-xs font-bold">{c.name}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{c.note}</div>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-xs text-slate-500">or search any country</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={customCountry}
            onChange={e => setCustomCountry(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCustomSearch()}
            placeholder="e.g. Japan, Switzerland, South Korea..."
            className="input-dark flex-1"
          />
          <button onClick={handleCustomSearch} disabled={!customCountry.trim() || loading}
            className="btn-primary text-sm disabled:opacity-40">
            <Globe className="w-4 h-4" /> Generate Checklist
          </button>
        </div>
      </div>

      {/* Results */}
      {(loading || checklist) && (
        <div className="card p-6">
          {loading && !checklist && (
            <div className="flex items-center gap-3 text-slate-400 py-4">
              <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
              <span className="text-sm">Generating visa checklist with live requirements...</span>
            </div>
          )}

          {checklist && (
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-400" />
                  <span className="font-bold text-white">{selectedCountry?.name} Student Visa Guide</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-brand text-[10px]">
                    <Sparkles className="w-3 h-3" /> AI + Web Search
                  </span>
                  {Object.values(checkItems).filter(Boolean).length > 0 && (
                    <span className="badge badge-brand text-[10px]">
                      {Object.values(checkItems).filter(Boolean).length} items checked
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-0.5">
                {renderChecklist(checklist)}
                {loading && <span className="inline-block w-0.5 h-4 bg-brand-400 animate-pulse ml-1" />}
              </div>
              <p className="mt-4 text-xs text-slate-600 border-t border-slate-800 pt-4">
                ⚠️ This checklist is AI-generated based on publicly available information. Always verify requirements with the official embassy or consulate website. Requirements change frequently.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
