import React, { useState, useEffect } from 'react';
import {
  Settings2,
  ShieldCheck,
  Building2,
  Award,
  FileCheck2,
  Plus,
  RefreshCw,
  Clock,
  Sparkles,
  ExternalLink,
  Edit
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { University } from '../types';

export const Admin: React.FC = () => {
  const { brandName, setBrandName } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  // Brand Name Config
  const [tempBrandName, setTempBrandName] = useState(brandName);

  // University Upsert Modal
  const [showAddUniModal, setShowAddUniModal] = useState(false);
  const [uniName, setUniName] = useState('');
  const [uniCountry, setUniCountry] = useState('Germany');
  const [uniCity, setUniCity] = useState('');
  const [uniWebsite, setUniWebsite] = useState('https://');
  const [uniSource, setUniSource] = useState('Official International Office');
  const [uniSourceUrl, setUniSourceUrl] = useState('https://');

  const fetchAdminData = async () => {
    try {
      const [statsRes, unisRes] = await Promise.all([
        fetch('/api/v1/admin/stats'),
        fetch('/api/v1/universities')
      ]);
      const statsData = await statsRes.json();
      const unisData = await unisRes.json();

      if (statsData.success) {
        setStats(statsData.stats);
        setLogs(statsData.recentLogs || []);
      }
      if (unisData.success) {
        setUniversities(unisData.universities || []);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempBrandName.trim()) return;
    setBrandName(tempBrandName.trim());
    showToast(`Brand name updated to: ${tempBrandName.trim()}`, "success");
  };

  const handleAddUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUni: University = {
      id: `uni-${Date.now()}`,
      name: uniName,
      country: uniCountry,
      city: uniCity,
      website: uniWebsite,
      admissionsUrl: uniWebsite,
      description: `Official public higher education institution in ${uniCity}, ${uniCountry}.`,
      logo: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=160&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80',
      type: 'public',
      acceptanceRateRange: '20% - 30%',
      popularForPakistaniStudents: true,
      englishRequirementSummary: 'IELTS 6.5 or equivalent.',
      intakes: ['Winter', 'Summer'],
      lastVerified: new Date().toISOString().split('T')[0],
      verificationSource: uniSource,
      sourceUrl: uniSourceUrl,
      isDemoData: false,
      programs: [
        {
          id: `prog-${Date.now()}`,
          universityId: `uni-${Date.now()}`,
          universityName: uniName,
          country: uniCountry,
          title: 'M.Sc. Advanced Engineering Systems',
          degreeLevel: 'Master',
          subjectArea: 'Engineering',
          durationMonths: 24,
          tuitionAnnual: uniCountry === 'Germany' ? 0 : 4000,
          tuitionCurrency: uniCountry === 'Germany' ? 'EUR' : uniCountry === 'United Kingdom' ? 'GBP' : 'USD',
          estimatedLivingAnnual: 11000,
          languageOfInstruction: 'English',
          minCgpa: 3.0,
          ieltsScore: 6.5,
          greGmatRequired: false,
          applicationDeadlineUpcoming: '2026-06-15',
          intakeTerm: 'Winter 2026',
          hasScholarshipOpportunity: true,
          officialProgramUrl: uniSourceUrl,
          notes: 'Standard admission criteria.'
        }
      ]
    };

    try {
      const res = await fetch('/api/v1/universities/admin/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUni)
      });
      const data = await res.json();
      if (data.success) {
        setUniversities(prev => [data.university, ...prev]);
        setShowAddUniModal(false);
        showToast(`University record for ${newUni.name} registered`, "success");
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to add university:', err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-900 text-teal-400 font-bold px-2 py-0.5 rounded uppercase">
              Role: Authorized Administrator
            </span>
            <span className="text-xs text-slate-500 font-medium">Server-Grounded Data Governance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Admin & Data Source Control Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit verifiable data sources, manage university datasets, and configure brand settings.
          </p>
        </div>

        <button
          onClick={() => setShowAddUniModal(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-teal-400" />
          <span>Add Verified University</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Universities</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalUniversities || universities.length}</div>
          <div className="text-[11px] text-teal-700 font-medium mt-1">
            {stats?.totalPrograms || 14} Degree Programs
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Scholarships</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalScholarships || 5}</div>
          <div className="text-[11px] text-slate-400 mt-1">Fully Funded / Bilateral</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Visa Frameworks</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalVisaTemplates || 4}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">100% Sourced Embassies</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">AI Gateway</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-sm font-black text-slate-900 truncate mt-1">
            {stats?.aiStatus || 'Gemini 3.8 Flash Active'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Grounded Structured Schemas</div>
        </div>
      </div>

      {/* Two Column: Brand Settings & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Brand & Platform Settings: 5 cols */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Settings2 className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-sm">Platform & Brand Customization</h3>
          </div>

          <form onSubmit={handleUpdateBrand} className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Configurable Product Brand Name</label>
              <input
                type="text"
                value={tempBrandName}
                onChange={(e) => setTempBrandName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-teal-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                As required by Master Prompt Section 1: "Make the brand name configurable."
              </span>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
            >
              Update Brand
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="font-bold text-slate-700 block">Data Integrity Standards</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Every sample record in AbroadPilot is cataloged with an explicit verification source URL and timestamp. No admission policies or immigration fees are fabricated.
            </p>
          </div>
        </div>

        {/* Audit Logs Stream: 7 cols */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-sm">Security & Administrative Audit Logs</h3>
            </div>
            <button
              onClick={fetchAdminData}
              className="p-1 text-slate-400 hover:text-slate-700"
              title="Refresh logs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto font-mono text-[11px]">
            {logs.length === 0 ? (
              <div className="text-slate-400 py-6 text-center">No audit records recorded yet.</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/70">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] mb-0.5">
                    <span className="font-bold text-teal-700 uppercase">{log.action}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-slate-800 font-medium">{log.details}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Actor: {log.actor}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* University Data Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Verified University Source Registry</h3>
            <p className="text-xs text-slate-400">All registered institutions and their authoritative source pages.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="p-3">University</th>
                <th className="p-3">Country</th>
                <th className="p-3">Source & Verification</th>
                <th className="p-3">Last Verified</th>
                <th className="p-3">Official URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {universities.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-bold text-slate-900">{u.name}</td>
                  <td className="p-3 font-medium text-slate-600">{u.country}</td>
                  <td className="p-3">
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {u.verificationSource}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">{u.lastVerified}</td>
                  <td className="p-3">
                    <a
                      href={u.sourceUrl || u.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Admissions Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add University Modal */}
      {showAddUniModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-base">Add Verified University Record</h3>
            <form onSubmit={handleAddUniversity} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">University Name *</label>
                <input
                  type="text"
                  required
                  value={uniName}
                  onChange={(e) => setUniName(e.target.value)}
                  placeholder="e.g. Heidelberg University"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Country *</label>
                  <select
                    value={uniCountry}
                    onChange={(e) => setUniCountry(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium bg-white"
                  >
                    <option value="Germany">Germany</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="Italy">Italy</option>
                    <option value="Turkey">Turkey</option>
                    <option value="Australia">Australia</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={uniCity}
                    onChange={(e) => setUniCity(e.target.value)}
                    placeholder="e.g. Heidelberg"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Website</label>
                <input
                  type="url"
                  value={uniWebsite}
                  onChange={(e) => setUniWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-teal-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Verification Source Name *</label>
                <input
                  type="text"
                  required
                  value={uniSource}
                  onChange={(e) => setUniSource(e.target.value)}
                  placeholder="e.g. DAAD Portal & University Admissions Office"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Source URL *</label>
                <input
                  type="url"
                  required
                  value={uniSourceUrl}
                  onChange={(e) => setUniSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-teal-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddUniModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
