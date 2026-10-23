import React, { useState, useEffect } from 'react';
import {
  Award,
  Bookmark,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Globe,
  DollarSign
} from 'lucide-react';
import { Scholarship, formatCurrencyPkr, convertToPkr } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Scholarships: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDestination, setSelectedDestination] = useState<string>('All');
  const [selectedCoverage, setSelectedCoverage] = useState<string>('All');
  const [pakistanPriorityOnly, setPakistanPriorityOnly] = useState<boolean>(false);

  const fetchScholarships = async () => {
    try {
      const res = await fetch('/api/v1/scholarships');
      const data = await res.json();
      if (data.success) {
        setScholarships(data.scholarships || []);
        setSavedIds(data.savedScholarshipIds || []);
      }
    } catch (err) {
      console.error('Failed to load scholarships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const handleToggleSave = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/scholarships/${id}/toggle-save`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSavedIds(data.savedScholarshipIds);
        const isNowSaved = data.savedScholarshipIds.includes(id);
        showToast(isNowSaved ? "Scholarship added to your Tracker" : "Removed from Tracker", "info");
      }
    } catch (err) {
      console.error('Toggle save scholarship error:', err);
    }
  };

  // Eligibility evaluation against current student profile
  const checkEligibility = (sch: Scholarship) => {
    if (!user) return { eligible: true, note: 'Profile not set' };
    if (user.cgpa < sch.minCgpa) {
      return { eligible: false, note: `Requires CGPA ${sch.minCgpa}+ (You have ${user.cgpa})` };
    }
    if (sch.ieltsRequired && sch.minIeltsScore && (user.ieltsScore || 0) < sch.minIeltsScore) {
      return { eligible: false, note: `Requires IELTS ${sch.minIeltsScore}+` };
    }
    return { eligible: true, note: 'Candidate Appears Eligible' };
  };

  const filteredScholarships = scholarships.filter(s => {
    if (selectedDestination !== 'All' && !s.destinationCountries.includes(selectedDestination)) return false;
    if (selectedCoverage !== 'All' && s.coverageType !== selectedCoverage) return false;
    if (pakistanPriorityOnly && !s.isPakistanSpecificOrPriority) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-50 text-amber-900 font-bold px-2 py-0.5 rounded uppercase">
              Funding Opportunities
            </span>
            <span className="text-xs text-slate-500 font-medium">Government & Bilateral Grants</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Scholarship Discovery & Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified funding schemes available for Pakistani scholars pursuing Bachelor, Master, and PhD degrees abroad.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto shadow-sm">
          {savedIds.length} Scholarships Tracked
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Destination</label>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
            >
              <option value="All">All Countries</option>
              <option value="United Kingdom">United Kingdom (Chevening)</option>
              <option value="Germany">Germany (DAAD EPOS)</option>
              <option value="United States">United States (Fulbright USEFP)</option>
              <option value="Turkey">Turkey (Türkiye Bursları)</option>
              <option value="Italy">Italy (DSU Regional)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Coverage</label>
            <select
              value={selectedCoverage}
              onChange={(e) => setSelectedCoverage(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
            >
              <option value="All">All Coverage</option>
              <option value="Fully Funded">Fully Funded (Tuition + Stipend + Flights)</option>
              <option value="Living Stipend">Living Stipend / Housing</option>
              <option value="Tuition Waiver">Tuition Waiver Only</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setPakistanPriorityOnly(!pakistanPriorityOnly)}
          className={`py-2 px-3 rounded-xl font-bold text-xs transition-colors border ${
            pakistanPriorityOnly
              ? 'bg-teal-600 border-teal-600 text-white'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          {pakistanPriorityOnly ? '✓ Showing Pakistan Specific' : 'Filter Pakistan Priority Programs'}
        </button>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredScholarships.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-base">No scholarships match your filters</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredScholarships.map((sch) => {
            const isSaved = savedIds.includes(sch.id);
            const eligibility = checkEligibility(sch);

            return (
              <div
                key={sch.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-extrabold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                          {sch.coverageType}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {sch.destinationCountries.join(', ')}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mt-1.5">{sch.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{sch.provider}</p>
                    </div>

                    <button
                      onClick={() => handleToggleSave(sch.id)}
                      className={`p-2 rounded-xl transition-colors ${
                        isSaved ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-400 hover:text-slate-800'
                      }`}
                      title={isSaved ? "Saved" : "Save scholarship"}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {sch.description}
                  </p>

                  {/* Academic Criteria & Eligibility Badge */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Academic Requirement</span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          eligibility.eligible
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {eligibility.note}
                      </span>
                    </div>
                    <div className="text-slate-700 leading-normal text-[11px]">
                      {sch.academicCriteria}
                    </div>
                  </div>

                  {/* Required Documents Checklist */}
                  {sch.requiredDocuments && sch.requiredDocuments.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Core Dossier Required:
                      </span>
                      <ul className="text-[11px] text-slate-600 space-y-1">
                        {sch.requiredDocuments.slice(0, 3).map((doc, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-teal-600 font-bold">•</span>
                            <span className="line-clamp-1">{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Footer Link & Verification */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified: {sch.lastVerified}</span>
                  </div>

                  <a
                    href={sch.applicationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-teal-600 hover:text-teal-800 font-bold hover:underline"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
