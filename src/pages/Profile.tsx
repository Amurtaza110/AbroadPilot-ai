// ============================================================
// Profile Settings Page
// ============================================================
import React, { useState } from 'react';
import {
  User, Save, Loader2, Mail, Globe, GraduationCap,
  DollarSign, BookOpen, Shield, CheckCircle2, Camera
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { UserProfile, DegreeLevel, IeltsStatus, FundingPreference } from '../types';

export const Profile: React.FC = () => {
  const { profile, updateProfile, logout } = useAuth();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>(profile || {});
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'goals' | 'financial'>('personal');

  const update = (key: keyof UserProfile, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await updateProfile(formData);
    setSaving(false);
    if (success) showToast('Profile saved!', 'success');
    else showToast('Failed to save profile.', 'error');
  };

  const TABS = [
    { id: 'personal', label: 'Personal Info', icon: <User className="w-4 h-4" /> },
    { id: 'academic', label: 'Academic', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'goals', label: 'Study Goals', icon: <Globe className="w-4 h-4" /> },
    { id: 'financial', label: 'Financial', icon: <DollarSign className="w-4 h-4" /> },
  ] as const;

  const COUNTRIES = [
    'Germany', 'United Kingdom', 'United States', 'Canada', 'Australia',
    'France', 'Netherlands', 'Sweden', 'Italy', 'Switzerland', 'Japan',
    'South Korea', 'Singapore', 'Ireland', 'New Zealand', 'Other'
  ];

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Profile Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Your profile helps AI personalize recommendations for you</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="card p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center text-surface-950 text-2xl font-black">
              {profile?.fullName?.[0]?.toUpperCase() || '?'}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-black text-white">{profile?.fullName || 'Your Name'}</h2>
            <p className="text-sm text-slate-400">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              {profile?.isOnboarded ? (
                <span className="badge badge-brand text-[10px]"><CheckCircle2 className="w-3 h-3" /> Profile Complete</span>
              ) : (
                <span className="badge bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px]">Profile Incomplete</span>
              )}
              <span className="badge badge-purple text-[10px]">
                {profile?.role || 'student'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
        {TABS.map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-brand-500 text-surface-950 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}>
            {tab.icon}
            <span className="hidden sm:block">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card p-6 space-y-5">
        {/* Personal Info */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3">Personal Information</h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input className="input-dark" value={formData.fullName || ''} onChange={e => update('fullName', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nationality</label>
                  <input className="input-dark" value={formData.nationality || ''} onChange={e => update('nationality', e.target.value)} placeholder="e.g. Pakistani" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current City</label>
                  <input className="input-dark" value={formData.residenceCity || ''} onChange={e => update('residenceCity', e.target.value)} placeholder="e.g. Lahore, Pakistan" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Academic */}
        {activeTab === 'academic' && (
          <div className="space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3">Academic Background</h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Degree Title</label>
                <input className="input-dark" value={formData.degreeTitle || ''} onChange={e => update('degreeTitle', e.target.value)} placeholder="e.g. Bachelor of Engineering" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Institution Name</label>
                <input className="input-dark" value={formData.institutionName || ''} onChange={e => update('institutionName', e.target.value)} placeholder="University name" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">CGPA</label>
                  <input type="number" step="0.01" className="input-dark" value={formData.cgpa || ''} onChange={e => update('cgpa', parseFloat(e.target.value))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Out of</label>
                  <input type="number" className="input-dark" value={formData.maxCgpa || 4} onChange={e => update('maxCgpa', parseFloat(e.target.value))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Grad Year</label>
                  <input type="number" className="input-dark" value={formData.graduationYear || ''} onChange={e => update('graduationYear', parseInt(e.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">IELTS Status</label>
                  <select className="input-dark" value={formData.ieltsStatus || 'Preparing'} onChange={e => update('ieltsStatus', e.target.value as IeltsStatus)}>
                    {(['Completed', 'Booked', 'Preparing', 'Exempt'] as IeltsStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">IELTS Score</label>
                  <input type="number" step="0.5" min="0" max="9" className="input-dark" value={formData.ieltsScore || ''} onChange={e => update('ieltsScore', parseFloat(e.target.value))} placeholder="e.g. 7.0" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Extracurriculars / Research</label>
                <textarea className="input-dark resize-none" rows={2} value={formData.extracurriculars || ''} onChange={e => update('extracurriculars', e.target.value)} placeholder="Publications, research projects, leadership, awards..." />
              </div>
            </div>
          </div>
        )}

        {/* Study Goals */}
        {activeTab === 'goals' && (
          <div className="space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3">Study Goals</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Target Degree</label>
              <div className="grid grid-cols-4 gap-2">
                {(['Bachelor', 'Master', 'PhD', 'Diploma'] as DegreeLevel[]).map(d => (
                  <button key={d} onClick={() => update('targetDegree', d)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      formData.targetDegree === d
                        ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}>{d}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Intended Majors (comma-separated)</label>
              <input className="input-dark" value={formData.intendedMajors?.join(', ') || ''}
                onChange={e => update('intendedMajors', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="Computer Science, Data Science" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Preferred Countries (comma-separated)</label>
              <input className="input-dark" value={formData.preferredCountries?.join(', ') || ''}
                onChange={e => update('preferredCountries', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="Germany, UK, Canada" />
            </div>
          </div>
        )}

        {/* Financial */}
        {activeTab === 'financial' && (
          <div className="space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3">Financial Details</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-3">
                Annual Tuition Budget: <span className="text-brand-400">${(formData.maxTuitionBudgetUsd || 0).toLocaleString()} USD</span>
              </label>
              <input type="range" min="0" max="60000" step="1000"
                value={formData.maxTuitionBudgetUsd || 0}
                onChange={e => update('maxTuitionBudgetUsd', parseInt(e.target.value))}
                className="w-full accent-brand-500" />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>$0 (Scholarship only)</span>
                <span>$60,000+</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Funding Preference</label>
              <div className="space-y-2">
                {(['Full Scholarship Only', 'Partial Scholarship + Self', 'Fully Self-Funded'] as FundingPreference[]).map(f => (
                  <button key={f} onClick={() => update('fundingPreference', f)}
                    className={`w-full text-left py-3 px-4 rounded-xl text-sm font-semibold border transition-all ${
                      formData.fundingPreference === f
                        ? 'bg-brand-500/15 border-brand-500 text-brand-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}>{f}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary w-full justify-center py-3 text-sm">
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save All Changes</>}
      </button>
    </div>
  );
};
