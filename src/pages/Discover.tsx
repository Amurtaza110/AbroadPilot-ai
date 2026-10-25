// ============================================================
// Discover Page — AI-Powered University Search
// ============================================================
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Sparkles, GraduationCap, Globe, DollarSign,
  ExternalLink, Bot, Filter, Loader2, BookOpen, Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { streamChat } from '../lib/gemini';

interface UniversityResult {
  name: string;
  country: string;
  program: string;
  tuition: string;
  deadline: string;
  url?: string;
  scholarship?: string;
  requirements?: string;
  why?: string;
}

export const Discover: React.FC = () => {
  const { profile } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const quickSearches = [
    `Best universities for ${profile?.intendedMajors?.[0] || 'Computer Science'} in ${profile?.preferredCountries?.[0] || 'Germany'}`,
    `Fully funded scholarships for ${profile?.targetDegree || 'Masters'} students from ${profile?.nationality || 'international students'}`,
    `Top affordable programs for ${profile?.intendedMajors?.[0] || 'Data Science'} in Europe under $15,000/year`,
    'Public universities in Germany with English-taught Master programs',
    'Best universities in Canada for international students with scholarships',
  ];

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim() || loading) return;

    setLoading(true);
    setHasSearched(true);
    setResults('');

    const enhancedQuery = profile?.isOnboarded
      ? `${q}\n\nContext: Student profile — ${profile.targetDegree} seeker in ${profile.intendedMajors.join(', ')}, CGPA ${profile.cgpa}/${profile.maxCgpa}, Budget: $${profile.maxTuitionBudgetUsd}/year, Nationality: ${profile.nationality}. Show results relevant to this profile.`
      : q;

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

  const renderResults = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h2 key={i} className="text-lg font-black text-white mt-4 mb-2">{line.slice(2)}</h2>;
      if (line.startsWith('## ')) return <h3 key={i} className="text-base font-bold text-brand-300 mt-3 mb-1.5">{line.slice(3)}</h3>;
      if (line.startsWith('### ')) return <h4 key={i} className="text-sm font-bold text-white mt-2 mb-1">{line.slice(4)}</h4>;
      if (line.startsWith('- ') || line.startsWith('• ')) {
        const content = line.slice(2);
        const parts = content.split(/\*\*(.*?)\*\*/g);
        return (
          <li key={i} className="ml-5 text-sm text-slate-300 leading-relaxed">
            {parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="text-white">{p}</strong> : p)}
          </li>
        );
      }
      if (line.trim() === '') return <div key={i} className="h-2" />;
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="text-sm text-slate-300 leading-relaxed">
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{p}</strong> : p)}
        </p>
      );
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-brand"><Sparkles className="w-3 h-3" /> AI + Live Web Search</span>
        </div>
        <h1 className="text-2xl font-black text-white">Discover Programs</h1>
        <p className="text-slate-400 text-sm mt-1">Search universities and scholarships with real-time AI-powered web research</p>
      </div>

      {/* Search Bar */}
      <div className="card p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. 'Top AI masters programs in Germany with scholarships' or 'Fully funded PhDs in UK'"
            className="input-dark pl-12 pr-32 py-4 text-sm text-base"
            disabled={loading}
          />
          <button
            onClick={() => handleSearch()}
            disabled={!query.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary text-xs py-2.5 disabled:opacity-40"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-3.5 h-3.5" /> Search</>}
          </button>
        </div>

        {/* Quick Searches */}
        <div>
          <p className="text-xs text-slate-500 mb-2 font-medium">Quick searches:</p>
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
      </div>

      {/* Results */}
      {(hasSearched || results) && (
        <div className="card p-6">
          {loading && !results && (
            <div className="flex items-center gap-3 text-slate-400 py-4">
              <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
              <span className="text-sm">Searching universities and scholarships with live web data...</span>
            </div>
          )}

          {results && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span className="text-sm font-bold text-white">AI Research Results</span>
                <span className="badge badge-brand text-[10px] ml-auto">Live Web Search</span>
              </div>
              <div className="space-y-0.5">
                {renderResults(results)}
                {loading && <span className="inline-block w-0.5 h-4 bg-brand-400 animate-pulse ml-1" />}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Default State */}
      {!hasSearched && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: <GraduationCap className="w-6 h-6" />,
              title: 'University Programs',
              desc: 'Find English-taught programs matching your profile across 100+ countries',
              color: 'text-blue-400 bg-blue-400/10',
              examples: ['TU Munich CS Masters', 'Oxford MBA', 'MIT PhD Programs']
            },
            {
              icon: <Award className="w-6 h-6" />,
              title: 'Scholarships',
              desc: 'Discover fully funded and partial scholarships you\'re eligible for',
              color: 'text-amber-400 bg-amber-400/10',
              examples: ['DAAD Germany', 'Chevening UK', 'Erasmus Mundus']
            },
            {
              icon: <DollarSign className="w-6 h-6" />,
              title: 'Cost Comparison',
              desc: 'Compare costs across countries, cities, and institutions',
              color: 'text-emerald-400 bg-emerald-400/10',
              examples: ['Germany vs UK costs', 'Living expenses Paris', 'Cheap tuition Europe']
            },
          ].map((card, i) => (
            <div key={i} className="card p-5 space-y-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
              <div>
                <h3 className="font-bold text-white">{card.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{card.desc}</p>
              </div>
              <div className="space-y-1">
                {card.examples.map((ex, j) => (
                  <button key={j}
                    onClick={() => { setQuery(ex); handleSearch(ex); }}
                    className="w-full text-left text-xs text-slate-500 hover:text-brand-400 transition-colors py-0.5">
                    → {ex}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Advisor CTA */}
      <div className="card p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-brand-950/30 border-brand-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <div className="font-bold text-white">Need deeper analysis?</div>
            <div className="text-xs text-slate-400">Chat with AI Advisor for personalized, conversational guidance</div>
          </div>
        </div>
        <Link to="/advisor" className="btn-primary text-sm shrink-0">
          Open AI Advisor <Sparkles className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
