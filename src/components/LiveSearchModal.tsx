import React, { useState } from 'react';
import {
  Search,
  Globe,
  GraduationCap,
  Award,
  ExternalLink,
  Sparkles,
  X,
  Copy,
  Check,
  ArrowRight,
  Filter,
  Flame,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { GroundingSource } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface LiveSearchModalProps {
  initialCategory?: 'universities' | 'scholarships';
  onClose: () => void;
  onNavigateToAdvisor?: (initialQuery?: string) => void;
}

export const LiveSearchModal: React.FC<LiveSearchModalProps> = ({
  initialCategory = 'universities',
  onClose,
  onNavigateToAdvisor
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'universities' | 'scholarships'>(initialCategory);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Selected preset tags
  const [selectedCountry, setSelectedCountry] = useState<string>('All');

  const UNIVERSITY_PRESETS = [
    "English-taught Computer Science Masters in Germany with no tuition fees",
    "Top UK Universities for Software Engineering under £16,000 per year",
    "Italian public universities offering AI with DSU regional scholarship support",
    "European universities accepting 2.8+ CGPA for Master in Data Science",
    "US universities with STEM OPT and high graduate assistantship rates"
  ];

  const SCHOLARSHIP_PRESETS = [
    "Fully funded European Master scholarships 2025/2026 for Pakistani applicants",
    "Italian DSU regional scholarship eligibility, FRC & FBR income requirements",
    "DAAD EPOS and Helmut-Schmidt scholarships for developing countries",
    "Türkiye Bursları government scholarship eligibility, monthly stipend & deadlines",
    "Erasmus Mundus Joint Master Degrees full funding with travel allowance"
  ];

  const COUNTRIES = ['All', 'Germany', 'United Kingdom', 'Italy', 'USA', 'Sweden', 'Turkey', 'Australia'];

  const handleSearch = async (customQuery?: string) => {
    const searchQuery = customQuery || query;
    if (!searchQuery.trim() || loading) return;

    let enrichedQuery = searchQuery;
    if (selectedCountry !== 'All' && !searchQuery.toLowerCase().includes(selectedCountry.toLowerCase())) {
      enrichedQuery = `${searchQuery} in ${selectedCountry}`;
    }

    setLoading(true);
    setResultText(null);
    setSources([]);
    setSearchQueries([]);

    try {
      const res = await fetch('/api/v1/ai/live-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'student-demo-pk-1'
        },
        body: JSON.stringify({
          query: enrichedQuery,
          category: activeTab
        })
      });

      const data = await res.json();
      if (data.success) {
        setResultText(data.text);
        setSources(data.sources || []);
        setSearchQueries(data.searchQueries || []);
      } else {
        showToast(data.message || 'Search inquiry could not be completed', 'error');
      }
    } catch (err) {
      console.error('Live search error:', err);
      showToast('Connection error while contacting Google Search Grounding', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    showToast('Copied findings to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDiscussWithAdvisor = () => {
    if (onNavigateToAdvisor) {
      const prompt = `I used Google Search to discover: "${query}". Here are the findings:\n\n${resultText?.slice(0, 500)}...\n\nCan you evaluate my profile (CGPA: ${user?.cgpa}, Degree: ${user?.degreeTitle}) against these options and build an action plan?`;
      onNavigateToAdvisor(prompt);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/30">
              <Sparkles className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white">Live Search Finder</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30">
                  Google Search Grounding
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-400/20 text-indigo-300 border border-indigo-400/30">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live web intelligence for real universities, upcoming deadlines & verified scholarships
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Switcher Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-3 gap-2">
          <button
            onClick={() => {
              setActiveTab('universities');
              setResultText(null);
              setSources([]);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'universities'
                ? 'bg-white text-teal-700 border-teal-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Find Universities</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('scholarships');
              setResultText(null);
              setSources([]);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'scholarships'
                ? 'bg-white text-indigo-700 border-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Find Scholarships & Grants</span>
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  activeTab === 'universities'
                    ? "e.g. English-taught AI Masters in Germany with no tuition fees & low CGPA requirement..."
                    : "e.g. Fully funded Europe scholarships 2025/2026 for Pakistani engineering graduates..."
                }
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs rounded-2xl border border-slate-200 focus:border-teal-500 focus:outline-none transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'Searching...' : 'Google Search'}</span>
            </button>
          </form>

          {/* Destination Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Target:
            </span>
            {COUNTRIES.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCountry(c)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg shrink-0 transition-colors ${
                  selectedCountry === c
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500" /> High-Demand Queries for Pakistani Students:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(activeTab === 'universities' ? UNIVERSITY_PRESETS : SCHOLARSHIP_PRESETS).map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(preset);
                    handleSearch(preset);
                  }}
                  className="px-2.5 py-1 text-left text-[11px] font-medium bg-slate-50 hover:bg-teal-50 hover:text-teal-900 text-slate-700 rounded-xl border border-slate-200/80 transition-all"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-50/50">
          {loading && (
            <div className="p-8 text-center space-y-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center animate-pulse">
                <Globe className="w-6 h-6 animate-spin" />
              </div>
              <div className="font-bold text-slate-800 text-sm">
                Querying Google Search Grounding & Gemini 3.8 Flash...
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Verifying live official university catalogs, 2025/2026 intake deadlines, tuition fee structures, and scholarship criteria for Pakistani applicants.
              </p>
            </div>
          )}

          {!loading && !resultText && (
            <div className="p-8 text-center space-y-2 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
              <Search className="w-8 h-8 mx-auto text-slate-300" />
              <div className="text-xs font-semibold text-slate-600">
                Enter a query above or click a high-demand preset to start live Google search discovery.
              </div>
              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                The Gemini model will query Google Search in real time and return programs, tuition rates, admission criteria, and official links.
              </p>
            </div>
          )}

          {!loading && resultText && (
            <div className="space-y-4">
              {/* Grounded Sources Banner */}
              {sources.length > 0 && (
                <div className="bg-white rounded-2xl p-4 border border-teal-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      <span>Verified Web Portals & Citations ({sources.length})</span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      Official Sources
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200/80 hover:border-teal-300 text-slate-700 hover:text-teal-900 text-xs transition-colors group"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <Globe className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="truncate font-semibold text-[11px]">{src.title}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Queries Executed */}
              {searchQueries.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-400">Google queries:</span>
                  {searchQueries.map((q, idx) => (
                    <span key={idx} className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600">
                      "{q}"
                    </span>
                  ))}
                </div>
              )}

              {/* Research Text Body */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 text-xs text-slate-800 leading-relaxed">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      {activeTab === 'universities' ? 'Discovered Programs & Admissions Intelligence' : 'Discovered Scholarships & Funding Schemes'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] flex items-center gap-1 transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    {onNavigateToAdvisor && (
                      <button
                        onClick={handleDiscussWithAdvisor}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Discuss with AI Counselor</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Formatted Content */}
                <div className="prose prose-slate max-w-none text-xs leading-relaxed whitespace-pre-wrap font-normal text-slate-800">
                  {resultText}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-slate-600">
              Active Candidate: {user?.fullName || 'Student'} (CGPA {user?.cgpa || '3.3'}, {user?.targetDegree || 'Master'})
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
