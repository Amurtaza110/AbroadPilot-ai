import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  GraduationCap,
  Scale,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  SlidersHorizontal,
  DollarSign,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { University, Program, convertToPkr, formatCurrencyPkr } from '../types';
import { UniversityCard } from '../components/UniversityCard';
import { CompareModal } from '../components/CompareModal';
import { AiMatchModal } from '../components/AiMatchModal';
import { ApplicationModal } from '../components/ApplicationModal';
import { LiveSearchModal } from '../components/LiveSearchModal';
import { useToast } from '../context/ToastContext';

interface DiscoverProps {
  searchQuery: string;
}

export const Discover: React.FC<DiscoverProps> = ({ searchQuery }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [universities, setUniversities] = useState<University[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedDegree, setSelectedDegree] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [tuitionFreeOnly, setTuitionFreeOnly] = useState<boolean>(false);
  const [maxBudgetPkr, setMaxBudgetPkr] = useState<number>(4000000);
  const [sortBy, setSortBy] = useState<'match' | 'tuitionAsc' | 'ranking' | 'name'>('match');

  // Comparison State
  const [comparedUnis, setComparedUnis] = useState<University[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // AI Match Modal State
  const [activeMatchModal, setActiveMatchModal] = useState<{ uni: University; prog: Program } | null>(null);

  // Application Modal State
  const [activeAppModal, setActiveAppModal] = useState<{ uni: University; prog: Program } | null>(null);

  // Live Google Search Modal State
  const [showLiveSearchModal, setShowLiveSearchModal] = useState(false);

  const fetchUniversities = async () => {
    try {
      const res = await fetch('/api/v1/universities');
      const data = await res.json();
      if (data.success) {
        setUniversities(data.universities || []);
        setSavedIds(data.savedUniversityIds || []);
      }
    } catch (err) {
      console.error('Failed to load universities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const handleToggleSave = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/universities/${id}/toggle-save`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setSavedIds(data.savedUniversityIds);
        const isNowSaved = data.savedUniversityIds.includes(id);
        showToast(isNowSaved ? "Added to your Saved Universities" : "Removed from Saved Universities", "info");
      }
    } catch (err) {
      console.error('Toggle save error:', err);
    }
  };

  const handleToggleCompare = (uni: University) => {
    const exists = comparedUnis.some(u => u.id === uni.id);
    if (exists) {
      setComparedUnis(prev => prev.filter(u => u.id !== uni.id));
      showToast(`Removed ${uni.name} from comparison`, "info");
    } else {
      if (comparedUnis.length >= 3) {
        showToast("You can compare up to 3 universities simultaneously", "warning");
        return;
      }
      setComparedUnis(prev => [...prev, uni]);
      showToast(`Added ${uni.name} to comparison`, "success");
    }
  };

  const handleCreateApplication = async (appData: any) => {
    try {
      const res = await fetch('/api/v1/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appData)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Tracked application for ${appData.universityName}`, "success");
      }
    } catch (err) {
      console.error('Failed to create application:', err);
    }
  };

  // Filter & sort logic
  const filteredUniversities = useMemo(() => {
    return universities.filter(u => {
      // Search term
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesUni = u.name.toLowerCase().includes(q) || u.country.toLowerCase().includes(q) || u.city.toLowerCase().includes(q);
        const matchesProg = u.programs.some(p => p.title.toLowerCase().includes(q) || p.subjectArea.toLowerCase().includes(q));
        if (!matchesUni && !matchesProg) return false;
      }

      // Country
      if (selectedCountry !== 'All' && u.country !== selectedCountry) {
        return false;
      }

      // Degree Level
      if (selectedDegree !== 'All') {
        const hasDegree = u.programs.some(p => p.degreeLevel === selectedDegree);
        if (!hasDegree) return false;
      }

      // Subject
      if (selectedSubject !== 'All') {
        const hasSubj = u.programs.some(p => p.subjectArea.toLowerCase().includes(selectedSubject.toLowerCase()));
        if (!hasSubj) return false;
      }

      // Tuition Free
      if (tuitionFreeOnly) {
        const hasZeroTuition = u.programs.some(p => p.tuitionAnnual === 0);
        if (!hasZeroTuition) return false;
      }

      // Max Budget PKR
      if (maxBudgetPkr) {
        const hasAffordable = u.programs.some(p => {
          const pkr = convertToPkr(p.tuitionAnnual, p.tuitionCurrency);
          return pkr <= maxBudgetPkr;
        });
        if (!hasAffordable) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'tuitionAsc') {
        const minA = Math.min(...a.programs.map(p => convertToPkr(p.tuitionAnnual, p.tuitionCurrency)));
        const minB = Math.min(...b.programs.map(p => convertToPkr(p.tuitionAnnual, p.tuitionCurrency)));
        return minA - minB;
      }
      if (sortBy === 'ranking') {
        return (a.rankingQs || 999) - (b.rankingQs || 999);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      // default: match score (by popular for pk or ranking)
      return (b.popularForPakistaniStudents ? 1 : 0) - (a.popularForPakistaniStudents ? 1 : 0);
    });
  }, [universities, searchQuery, selectedCountry, selectedDegree, selectedSubject, tuitionFreeOnly, maxBudgetPkr, sortBy]);

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded uppercase">
              Curated Directory
            </span>
            <span className="text-xs text-slate-500 font-medium">100% Verified Admissions Sources</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Discover Universities & Degree Programs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate admission criteria, language prerequisites, and exact PKR costs for Pakistani applicants.
          </p>
        </div>

        {comparedUnis.length > 0 && (
          <button
            onClick={() => setShowCompareModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-transform hover:scale-[1.02]"
          >
            <Scale className="w-4 h-4 text-teal-400" />
            <span>Compare ({comparedUnis.length}) Universities</span>
          </button>
        )}
      </div>

      {/* Google Search Grounding Discovery Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg border border-teal-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white">Cannot find your target university or program?</span>
              <span className="text-[10px] bg-teal-400/20 text-teal-300 font-bold px-2 py-0.5 rounded-full border border-teal-400/30">
                Google Search Grounded
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Query Gemini 3.8 Flash with live Google Search to discover any university, admission benchmarks & deadlines worldwide.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowLiveSearchModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md shrink-0 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Search className="w-3.5 h-3.5 text-slate-950" />
          <span>Search Universities with Google AI</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {/* Country */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Destinations</option>
              <option value="Germany">Germany (APS / Low Fee)</option>
              <option value="United Kingdom">United Kingdom (CAS / 28-day)</option>
              <option value="United States">United States (F-1 / STEM OPT)</option>
              <option value="Italy">Italy (DSU Grant / Affordable)</option>
              <option value="Turkey">Turkey (Low Cost / English)</option>
              <option value="Australia">Australia (Subclass 500)</option>
            </select>
          </div>

          {/* Degree */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Degree Level</label>
            <select
              value={selectedDegree}
              onChange={(e) => setSelectedDegree(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Degrees</option>
              <option value="Bachelor">Bachelor (BS / BA)</option>
              <option value="Master">Master (MS / MSc)</option>
              <option value="PhD">PhD / Doctorate</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Subject Field</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Subjects</option>
              <option value="Computer">Computer Science & IT</option>
              <option value="Data">Data Science & AI</option>
              <option value="Engineering">Engineering & Tech</option>
              <option value="Business">Business & Finance</option>
            </select>
          </div>

          {/* Max Budget (PKR) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Max Tuition: {formatCurrencyPkr(maxBudgetPkr)}
            </label>
            <input
              type="range"
              min={0}
              max={10000000}
              step={200000}
              value={maxBudgetPkr}
              onChange={(e) => setMaxBudgetPkr(parseInt(e.target.value, 10))}
              className="w-full accent-teal-600 mt-1"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sort Results</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
            >
              <option value="match">Highest Pakistani Fit</option>
              <option value="tuitionAsc">Tuition (Lowest First)</option>
              <option value="ranking">Global QS Ranking</option>
              <option value="name">University Name (A-Z)</option>
            </select>
          </div>

          {/* Tuition Free Toggle Button */}
          <div className="flex flex-col justify-end">
            <button
              onClick={() => setTuitionFreeOnly(!tuitionFreeOnly)}
              className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border ${
                tuitionFreeOnly
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Check className={`w-3.5 h-3.5 ${tuitionFreeOnly ? 'block' : 'hidden'}`} />
              <span>Tuition-Free (0 PKR)</span>
            </button>
          </div>
        </div>
      </div>

      {/* University Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Loading Verified Programs & Prerequisites...</p>
        </div>
      ) : filteredUniversities.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No universities matched your filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting your budget slider, selecting 'All Destinations', or clearing your search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUniversities.map((uni) => (
            <UniversityCard
              key={uni.id}
              university={uni}
              profile={user}
              isSaved={savedIds.includes(uni.id)}
              isCompared={comparedUnis.some(u => u.id === uni.id)}
              onToggleSave={handleToggleSave}
              onToggleCompare={handleToggleCompare}
              onOpenAiMatch={(u, p) => setActiveMatchModal({ uni: u, prog: p })}
              onAddToApplications={(u, p) => setActiveAppModal({ uni: u, prog: p })}
            />
          ))}
        </div>
      )}

      {/* Floating Compare Bar */}
      {comparedUnis.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold">
              {comparedUnis.length} / 3 Universities Selected
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {comparedUnis.map((u) => (
              <span
                key={u.id}
                className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700 flex items-center gap-1"
              >
                <span className="truncate max-w-[100px]">{u.name}</span>
                <button
                  onClick={() => setComparedUnis(prev => prev.filter(x => x.id !== u.id))}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <button
            onClick={() => setShowCompareModal(true)}
            className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow"
          >
            Compare Side-by-Side
          </button>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && (
        <CompareModal
          selectedUniversities={comparedUnis}
          onClose={() => setShowCompareModal(false)}
          onRemove={(id) => setComparedUnis(prev => prev.filter(u => u.id !== id))}
          onApply={(u) => {
            const p = u.programs?.[0];
            if (p) setActiveAppModal({ uni: u, prog: p });
          }}
        />
      )}

      {/* AI Match Modal */}
      {activeMatchModal && (
        <AiMatchModal
          university={activeMatchModal.uni}
          program={activeMatchModal.prog}
          profile={user}
          onClose={() => setActiveMatchModal(null)}
          onAddToApplications={(u, p) => setActiveAppModal({ uni: u, prog: p })}
        />
      )}

      {/* Application Creation Modal */}
      {activeAppModal && (
        <ApplicationModal
          initialData={{
            universityId: activeAppModal.uni.id,
            universityName: activeAppModal.uni.name,
            country: activeAppModal.uni.country,
            programTitle: activeAppModal.prog.title,
            degreeLevel: activeAppModal.prog.degreeLevel,
            intakeTerm: activeAppModal.prog.intakeTerm,
            deadline: activeAppModal.prog.applicationDeadlineUpcoming,
            portalUrl: activeAppModal.prog.officialProgramUrl || activeAppModal.uni.admissionsUrl,
            status: 'Preparing'
          }}
          onClose={() => setActiveAppModal(null)}
          onSave={handleCreateApplication}
        />
      )}

      {/* Live Google Search Modal */}
      {showLiveSearchModal && (
        <LiveSearchModal
          initialCategory="universities"
          onClose={() => setShowLiveSearchModal(false)}
        />
      )}
    </div>
  );
};
