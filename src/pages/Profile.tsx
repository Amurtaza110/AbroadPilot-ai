import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Globe,
  DollarSign,
  Languages,
  CheckCircle2,
  Save,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCurrencyPkr } from '../types';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || 'Hamza Tariq');
  const [email, setEmail] = useState(user?.email || 'hamza.tariq@example.com');
  const [phone, setPhone] = useState(user?.phone || '+92 300 1234567');
  const [nationality, setNationality] = useState(user?.nationality || 'Pakistani');
  const [residenceCity, setResidenceCity] = useState(user?.residenceCity || 'Lahore, Punjab');

  // Academic
  const [degreeTitle, setDegreeTitle] = useState(user?.degreeTitle || 'BS Computer Science');
  const [institutionName, setInstitutionName] = useState(user?.institutionName || 'FAST-NUCES Lahore');
  const [cgpa, setCgpa] = useState<number>(user?.cgpa || 3.35);
  const [maxCgpa, setMaxCgpa] = useState<number>(user?.maxCgpa || 4.0);
  const [graduationYear, setGraduationYear] = useState<number>(user?.graduationYear || 2025);

  // Target preferences
  const [targetDegree, setTargetDegree] = useState<'Bachelor' | 'Master' | 'PhD' | 'Diploma'>(user?.targetDegree || 'Master');
  const [intendedMajor, setIntendedMajor] = useState(user?.intendedMajor || 'Computer Science & AI');
  const [preferredCountries, setPreferredCountries] = useState<string[]>(user?.preferredCountries || ['Germany', 'United Kingdom', 'Italy']);

  // Budget
  const [maxTuitionBudgetPkr, setMaxTuitionBudgetPkr] = useState<number>(user?.maxTuitionBudgetPkr || 2500000);
  const [fundingPreference, setFundingPreference] = useState(user?.fundingPreference || 'Partial Scholarship + Self');

  // Testing
  const [ieltsStatus, setIeltsStatus] = useState(user?.ieltsStatus || 'Completed');
  const [ieltsScore, setIeltsScore] = useState<number | undefined>(user?.ieltsScore || 7.0);

  // Work & Gap
  const [workExperienceYears, setWorkExperienceYears] = useState<number>(user?.workExperienceYears || 1);
  const [studyGapYears, setStudyGapYears] = useState<number>(user?.studyGapYears || 0);

  const [saving, setSaving] = useState(false);

  const handleCountryToggle = (country: string) => {
    if (preferredCountries.includes(country)) {
      if (preferredCountries.length > 1) {
        setPreferredCountries(preferredCountries.filter(c => c !== country));
      }
    } else {
      setPreferredCountries([...preferredCountries, country]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const success = await updateProfile({
      fullName,
      email,
      phone,
      nationality,
      residenceCity,
      degreeTitle,
      institutionName,
      cgpa,
      maxCgpa,
      graduationYear,
      targetDegree,
      intendedMajor,
      preferredCountries,
      maxTuitionBudgetPkr,
      fundingPreference: fundingPreference as any,
      ieltsStatus: ieltsStatus as any,
      ieltsScore,
      workExperienceYears,
      studyGapYears,
      isOnboarded: true
    });
    setSaving(false);
    if (success) {
      showToast("Profile & study preferences updated successfully", "success");
    } else {
      showToast("Failed to update profile", "error");
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded uppercase">
            Candidate Dossier
          </span>
          <span className="text-xs text-slate-500 font-medium">Underpinning AI Matching Logic</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
          Student Profile & Study Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Your accurate CGPA scale, Pakistani university, and PKR budget drive all algorithmic matching and visa roadmaps.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal & Contact Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">Personal & Geographic Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number (WhatsApp)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current City & Province in Pakistan</label>
              <input
                type="text"
                value={residenceCity}
                onChange={(e) => setResidenceCity(e.target.value)}
                placeholder="e.g. Lahore, Punjab or Islamabad, ICT"
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nationality</label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-teal-500 bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Academic Profile */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Academic Qualifications & Grading</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Completed Degree Title *</label>
              <input
                type="text"
                required
                value={degreeTitle}
                onChange={(e) => setDegreeTitle(e.target.value)}
                placeholder="e.g. BS Computer Science (4 Years)"
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pakistani University / Board *</label>
              <input
                type="text"
                required
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="e.g. NUST, FAST, LUMS, Punjab University"
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cumulative CGPA *</label>
              <input
                type="number"
                step="0.01"
                min="1.0"
                max={maxCgpa}
                value={cgpa}
                onChange={(e) => setCgpa(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Grading Scale (Max CGPA)</label>
              <select
                value={maxCgpa}
                onChange={(e) => setMaxCgpa(parseFloat(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-teal-500 bg-white"
              >
                <option value={4.0}>4.0 Scale (Standard Pakistani Universities)</option>
                <option value={5.0}>5.0 Scale</option>
                <option value={10.0}>10.0 Scale</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Graduation Year</label>
              <input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(parseInt(e.target.value, 10) || 2025)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Study Abroad Targets & Budget */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Globe className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Target Degree, Countries & PKR Budget</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Degree Level *</label>
              <select
                value={targetDegree}
                onChange={(e) => setTargetDegree(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-teal-500 bg-white"
              >
                <option value="Bachelor">Bachelor (Undergraduate)</option>
                <option value="Master">Master (Postgraduate / MS / MPhil)</option>
                <option value="PhD">PhD / Doctoral Fellowship</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Intended Major / Specialization *</label>
              <input
                type="text"
                required
                value={intendedMajor}
                onChange={(e) => setIntendedMajor(e.target.value)}
                placeholder="e.g. Artificial Intelligence, Data Science, Mechanical Eng"
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-2">Preferred Destinations</label>
            <div className="flex flex-wrap gap-2">
              {['Germany', 'United Kingdom', 'Italy', 'United States', 'Turkey', 'Australia', 'Canada', 'Sweden'].map((c) => {
                const isSelected = preferredCountries.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCountryToggle(c)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? `✓ ${c}` : `+ ${c}`}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Max Annual Tuition Budget: {formatCurrencyPkr(maxTuitionBudgetPkr)}
              </label>
              <input
                type="range"
                min={0}
                max={8000000}
                step={250000}
                value={maxTuitionBudgetPkr}
                onChange={(e) => setMaxTuitionBudgetPkr(parseInt(e.target.value, 10))}
                className="w-full accent-teal-600 mt-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Funding Strategy</label>
              <select
                value={fundingPreference}
                onChange={(e) => setFundingPreference(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-teal-500 bg-white"
              >
                <option value="Partial Scholarship + Self">Partial Scholarship + Family Contribution</option>
                <option value="Full Scholarship Only">Full Scholarship Only (DAAD/Chevening/DSU)</option>
                <option value="Fully Self-Funded">Fully Self-Funded</option>
              </select>
            </div>
          </div>
        </div>

        {/* English Testing & Work Experience */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Languages className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm">English Testing & Career Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">IELTS / PTE Status</label>
              <select
                value={ieltsStatus}
                onChange={(e) => setIeltsStatus(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-teal-500 bg-white"
              >
                <option value="Completed">Test Completed (Have TRF)</option>
                <option value="Booked">Test Date Booked</option>
                <option value="Preparing">Currently Preparing</option>
                <option value="Exempt">English Proficiency Certificate (Medium of Instruction)</option>
              </select>
            </div>
            {ieltsStatus === 'Completed' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Overall IELTS Band Score</label>
                <input
                  type="number"
                  step="0.5"
                  min="4.0"
                  max="9.0"
                  value={ieltsScore || 7.0}
                  onChange={(e) => setIeltsScore(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Post-Graduation Work Experience (Years)</label>
              <input
                type="number"
                min="0"
                max="20"
                value={workExperienceYears}
                onChange={(e) => setWorkExperienceYears(parseInt(e.target.value, 10) || 0)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Study Gap (Years if any)</label>
              <input
                type="number"
                min="0"
                max="10"
                value={studyGapYears}
                onChange={(e) => setStudyGapYears(parseInt(e.target.value, 10) || 0)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-500/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 text-xs"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating Database...' : 'Save Profile & Update Matching Engine'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
