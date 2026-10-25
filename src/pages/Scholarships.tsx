// ============================================================
// Scholarships Page — AI-Powered Scholarship Discovery
// ============================================================
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award, Sparkles, Search, Loader2, Globe, DollarSign,
  Calendar, ExternalLink, Bot, GraduationCap, Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { streamChat } from '../lib/gemini';

const FEATURED_SCHOLARSHIPS = [
  {
    name: 'DAAD Scholarship (Germany)',
    coverage: 'Fully Funded',
    value: '~$25,000/year',
    deadline: 'Oct–Nov annually',
    countries: ['Germany'],
    url: 'https://www.daad.de/en/',
    flag: '🇩🇪',
    tags: ['STEM', 'Social Sciences', 'Arts'],
  },
  {
    name: 'Chevening Scholarships (UK)',
    coverage: 'Fully Funded',
    value: '~£18,000–£30,000',
    deadline: 'November annually',
    countries: ['United Kingdom'],
    url: 'https://www.chevening.org/',
    flag: '🇬🇧',
    tags: ['Master\'s', 'Leadership', '1 year'],
  },
  {
    name: 'Erasmus Mundus',
    coverage: 'Fully Funded',
    value: '€10,000–€21,000/year',
    deadline: 'Jan–Mar annually',
    countries: ['European Union'],
    url: 'https://erasmus-plus.ec.europa.eu/',
    flag: '🇪🇺',
    tags: ['Joint Degree', 'International', 'Master/PhD'],
  },
  {
    name: 'Commonwealth Scholarships',
    coverage: 'Fully Funded',
    value: 'Full tuition + stipend',
    deadline: 'December annually',
    countries: ['United Kingdom'],
    url: 'https://cscuk.fcdo.gov.uk/',
    flag: '🇬🇧',
    tags: ['Commonwealth', 'Master\'s', 'PhD'],
  },
  {
    name: 'Gates Cambridge Scholarship',
    coverage: 'Fully Funded',
    value: '£45,000+',
    deadline: 'October annually',
    countries: ['United Kingdom'],
    url: 'https://www.gatescambridge.org/',
    flag: '🇬🇧',
    tags: ['Cambridge', 'High Achievement', 'All Degrees'],
  },
  {
    name: 'Vanier Canada Graduate Scholarship',
    coverage: 'Fully Funded',
    value: 'CAD $50,000/year',
    deadline: 'November annually',
    countries: ['Canada'],
    url: 'https://vanier.gc.ca/',
    flag: '🇨🇦',
    tags: ['PhD', 'Research', 'Leadership'],
  },
];

export const Scholarships: React.FC = () => {
  const { profile } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim() || loading) return;

    setLoading(true);
    setHasSearched(true);
    setResults('');

    const profileContext = profile?.isOnboarded
      ? `Student profile: ${profile.nationality} student, ${profile.targetDegree} in ${profile.intendedMajors.join(', ')}, CGPA ${profile.cgpa}/${profile.maxCgpa}, IELTS ${profile.ieltsScore || profile.ieltsStatus}, Countries: ${profile.preferredCountries.join(', ')}, Funding: ${profile.fundingPreference}`
      : '';

    const enhancedQuery = `${q}${profileContext ? `\n\nStudent context: ${profileContext}. Show eligibility notes.` : ''}`;

    await streamChat(
      enhancedQuery,
      { useWebSearch: true, profile },
      (chunk) => {
        if (!chunk.done) setResults(prev => prev + chunk.text);
        else setLoading(false);
      }
    );
    setLoading(false);
  };

  const quickSearches = [
    profile?.isOnboarded
      ? `Find fully funded scholarships for ${profile.nationality} ${profile.targetDegree} students in ${profile.preferredCountries[0] || 'Europe'}`
      : 'Find fully funded scholarships for international students in Europe',
    'DAAD Germany scholarship 2025 requirements and application steps',
    'Erasmus Mundus scholarships list with deadlines 2025-2026',
    'Scholarships for developing country students with low CGPA',
    'No-IELTS scholarships for master\'s students',
  ];

  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h3 key={i} className="text-base font-bold text-brand-300 mt-4 mb-1">{line.slice(3)}</h3>;
      if (line.startsWith('### ')) return <h4 key={i} className="text-sm font-bold text-white mt-3 mb-1">{line.slice(4)}</h4>;
      if (line.startsWith('- ') || line.startsWith('• ')) {
        const parts = line.slice(2).split(/\*\*(.*?)\*\*/g);
        return <li key={i} className="ml-5 text-sm text-slate-300 leading-relaxed py-0.5">
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="text-white">{p}</strong> : p)}
        </li>;
      }
      if (line.trim() === '') return <div key={i} className="h-2" />;
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return <p key={i} className="text-sm text-slate-300 leading-relaxed">
        {parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="text-white">{p}</strong> : p)}
      </p>;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-brand"><Sparkles className="w-3 h-3" /> AI + Live Search</span>
          <span className="badge badge-gold"><Award className="w-3 h-3" /> Scholarships</span>
        </div>
        <h1 className="text-2xl font-black text-white">Scholarships</h1>
        <p className="text-slate-400 text-sm mt-1">Find scholarships you're eligible for with personalized AI search</p>
      </div>

      {/* AI Search */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="w-4 h-4 text-brand-400" />
          <span className="text-sm font-bold text-white">AI Scholarship Search</span>
          <span className="badge badge-brand text-[10px] ml-auto">Real-time Web Search</span>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. 'Fully funded PhD scholarships for African students in Germany'"
            className="input-dark pl-12 pr-28 py-4 text-sm"
            disabled={loading}
          />
          <button
            onClick={() => handleSearch()}
            disabled={!query.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary text-xs py-2.5 disabled:opacity-40"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-3.5 h-3.5" /> Find</>}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickSearches.map((q, i) => (
            <button key={i}
              onClick={() => { setQuery(q); handleSearch(q); }}
              disabled={loading}
              className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-brand-500/40 text-slate-300 hover:text-white rounded-full transition-all disabled:opacity-40">
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* AI Results */}
      {(hasSearched || results) && (
        <div className="card p-6">
          {loading && !results && (
            <div className="flex items-center gap-3 text-slate-400 py-4">
              <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
              <span className="text-sm">Searching live scholarship databases...</span>
            </div>
          )}
          {results && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span className="text-sm font-bold text-white">AI Scholarship Results</span>
              </div>
              {renderText(results)}
              {loading && <span className="inline-block w-0.5 h-4 bg-brand-400 animate-pulse" />}
            </div>
          )}
        </div>
      )}

      {/* Featured Scholarships */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">🌟 Notable Scholarships</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURED_SCHOLARSHIPS.map((s, i) => (
            <div key={i} className="card p-5 space-y-3 hover:scale-[1.01] transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{s.flag}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{s.name}</h3>
                    <span className={`badge text-[9px] mt-1 ${s.coverage === 'Fully Funded' ? 'badge-brand' : 'badge-gold'}`}>
                      {s.coverage}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{s.value}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>{s.deadline}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {s.tags.map((t, j) => (
                  <span key={j} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <a href={s.url} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-brand-400 bg-brand-400/10 border border-brand-400/20 rounded-xl hover:bg-brand-400/20 transition-colors">
                  <ExternalLink className="w-3 h-3" /> Official Site
                </a>
                <button
                  onClick={() => { setQuery(`${s.name} requirements, eligibility, and application process 2025`); handleSearch(`${s.name} requirements, eligibility, and application process 2025`); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors">
                  <Bot className="w-3 h-3" /> AI Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
