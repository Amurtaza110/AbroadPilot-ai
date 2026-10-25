// ============================================================
// Onboarding Wizard — AI-Powered Profile Setup
// Multi-step wizard → AI generates personalized roadmap
// ============================================================
import React, { useState } from 'react';
import {
  Plane, ArrowRight, ArrowLeft, CheckCircle2, Sparkles,
  GraduationCap, Globe, DollarSign, BookOpen, User,
  Loader2, MapPin, Award, Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { OnboardingData, DegreeLevel, IeltsStatus, FundingPreference } from '../types';
import { generatePersonalizedRoadmap } from '../lib/gemini';
import { createRoadmapTasks } from '../lib/firestore';

const STEPS = [
  { id: 1, title: 'Personal Info', icon: <User className="w-4 h-4" /> },
  { id: 2, title: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 3, title: 'Study Goals', icon: <Globe className="w-4 h-4" /> },
  { id: 4, title: 'Language & Tests', icon: <BookOpen className="w-4 h-4" /> },
  { id: 5, title: 'Budget & Funding', icon: <DollarSign className="w-4 h-4" /> },
];

const COUNTRIES = [
  'Germany', 'United Kingdom', 'United States', 'Canada', 'Australia',
  'France', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland',
  'Italy', 'Spain', 'Switzerland', 'Austria', 'New Zealand', 'Japan',
  'South Korea', 'Singapore', 'Malaysia', 'Ireland', 'Belgium',
  'Portugal', 'Poland', 'Czech Republic', 'Hungary', 'Turkey'
];

const MAJORS = [
  'Computer Science', 'Data Science', 'Artificial Intelligence', 'Software Engineering',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering',
  'Business Administration', 'Finance', 'Marketing', 'Economics',
  'Medicine / Health Sciences', 'Pharmacy', 'Biotechnology', 'Nursing',
  'Architecture', 'Environmental Science', 'Psychology', 'Education',
  'International Relations', 'Law', 'Media & Communications', 'Design'
];

const NATIONALITIES = [
  'Pakistani', 'Indian', 'Bangladeshi', 'Sri Lankan', 'Nepali',
  'Nigerian', 'Kenyan', 'Ghanaian', 'Egyptian', 'Moroccan',
  'Brazilian', 'Colombian', 'Mexican', 'Iranian', 'Iraqi',
  'Chinese', 'Indonesian', 'Vietnamese', 'Filipino', 'Malaysian',
  'Other'
];

const initialData: OnboardingData = {
  step: 1,
  fullName: '',
  nationality: '',
  residenceCity: '',
  currentEducationLevel: 'Bachelor',
  degreeTitle: '',
  institutionName: '',
  cgpa: 0,
  maxCgpa: 4.0,
  graduationYear: new Date().getFullYear(),
  targetDegree: 'Master',
  intendedMajors: [],
  preferredCountries: [],
  ieltsStatus: 'Preparing',
  ieltsScore: undefined,
  maxTuitionBudgetUsd: 20000,
  fundingPreference: 'Partial Scholarship + Self',
  workExperienceYears: 0,
  studyGapYears: 0,
  extracurriculars: '',
};

export const Onboarding: React.FC = () => {
  const { completeOnboarding, firebaseUser, profile } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState<OnboardingData>({
    ...initialData,
    fullName: profile?.fullName || firebaseUser?.displayName || '',
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  const update = (key: keyof OnboardingData, value: unknown) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const toggleCountry = (country: string) => {
    const arr = data.preferredCountries;
    if (arr.includes(country)) {
      update('preferredCountries', arr.filter(c => c !== country));
    } else if (arr.length < 5) {
      update('preferredCountries', [...arr, country]);
    }
  };

  const toggleMajor = (major: string) => {
    const arr = data.intendedMajors;
    if (arr.includes(major)) {
      update('intendedMajors', arr.filter(m => m !== major));
    } else if (arr.length < 3) {
      update('intendedMajors', [...arr, major]);
    }
  };

  const next = () => {
    if (currentStep < STEPS.length) setCurrentStep(s => s + 1);
    else handleFinish();
  };

  const back = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1);
  };

  const handleFinish = async () => {
    setGenerating(true);
    try {
      // Save profile
      await completeOnboarding(data);

      // Generate AI roadmap
      const roadmapJson = await generatePersonalizedRoadmap(data);
      if (roadmapJson && firebaseUser) {
        try {
          const tasks = JSON.parse(roadmapJson);
          const roadmapTasks = tasks.map((t: any, idx: number) => ({
            ...t,
            id: `task-${idx}`,
            userId: firebaseUser.uid,
            status: 'not_started',
            subtasks: t.subtasks || [],
            aiGenerated: true,
          }));
          await createRoadmapTasks(roadmapTasks);
        } catch (parseErr) {
          console.warn('Could not parse AI roadmap:', parseErr);
        }
      }

      setDone(true);
      showToast('Profile setup complete! Your AI roadmap is ready.', 'success');
    } catch (err) {
      console.error('Onboarding finish error:', err);
      showToast('Profile saved. You can configure your roadmap later.', 'info');
      setDone(true);
    } finally {
      setGenerating(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return data.fullName.trim() && data.nationality && data.residenceCity.trim();
      case 2: return data.degreeTitle.trim() && data.institutionName.trim() && data.cgpa > 0;
      case 3: return data.intendedMajors.length > 0 && data.preferredCountries.length > 0;
      case 4: return data.ieltsStatus !== undefined;
      case 5: return data.maxTuitionBudgetUsd > 0;
      default: return true;
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6 animate-slide-up">
          <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center mx-auto shadow-2xl shadow-brand-500/30 animate-float">
            <CheckCircle2 className="w-10 h-10 text-surface-950" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">You're all set!</h2>
            <p className="mt-3 text-slate-400 leading-relaxed">
              Your AI-powered study abroad roadmap has been generated based on your profile. 
              Time to start your journey! 🎓
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <div className="badge badge-brand text-xs px-3 py-1.5">
              <Sparkles className="w-3 h-3" /> AI Roadmap Ready
            </div>
            <div className="badge badge-purple text-xs px-3 py-1.5">
              <Globe className="w-3 h-3" /> {data.preferredCountries.length} Countries
            </div>
          </div>
          <p className="text-sm text-slate-500">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  if (generating) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-10 h-10 text-surface-950" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Generating Your AI Roadmap</h2>
            <p className="mt-2 text-slate-400 text-sm">
              Our AI is analyzing your profile and creating a personalized 10-stage study abroad plan...
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-brand-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">This takes about 10 seconds</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
            <Plane className="w-4 h-4 text-surface-950 -rotate-45" />
          </div>
          <span className="font-black text-white">AbroadPilot AI</span>
        </div>
        <div className="text-sm text-slate-400">Step {currentStep} of {STEPS.length}</div>
      </div>

      {/* Progress */}
      <div className="px-6 pt-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className={`flex items-center gap-2 shrink-0 ${currentStep >= step.id ? 'text-brand-400' : 'text-slate-600'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    currentStep > step.id
                      ? 'bg-brand-500 border-brand-500 text-surface-950'
                      : currentStep === step.id
                      ? 'border-brand-500 text-brand-400'
                      : 'border-slate-700 text-slate-600'
                  }`}>
                    {currentStep > step.id ? <CheckCircle2 className="w-4 h-4" /> : step.icon}
                  </div>
                  <span className={`hidden sm:block text-xs font-semibold ${currentStep >= step.id ? 'text-slate-300' : 'text-slate-600'}`}>
                    {step.title}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 transition-all ${currentStep > step.id ? 'bg-brand-500' : 'bg-slate-800'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 pb-12">
        <div className="w-full max-w-2xl animate-slide-up">
          <div className="card p-8 space-y-6">

            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-white">Tell us about yourself</h2>
                  <p className="text-slate-400 text-sm mt-1">Basic details to personalize your experience</p>
                </div>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
                    <input className="input-dark" placeholder="Your full legal name" value={data.fullName}
                      onChange={e => update('fullName', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Nationality</label>
                    <select className="input-dark" value={data.nationality} onChange={e => update('nationality', e.target.value)}>
                      <option value="">Select nationality</option>
                      {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Current City / Country</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input className="input-dark pl-10" placeholder="e.g. Lahore, Pakistan" value={data.residenceCity}
                        onChange={e => update('residenceCity', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Education */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-white">Academic Background</h2>
                  <p className="text-slate-400 text-sm mt-1">Your current education details</p>
                </div>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Current Level</label>
                      <select className="input-dark" value={data.currentEducationLevel}
                        onChange={e => update('currentEducationLevel', e.target.value)}>
                        {['Matriculation / O-Level', 'Intermediate / A-Level', 'Bachelor (Ongoing)', 'Bachelor (Complete)', 'Master (Ongoing)', 'Master (Complete)'].map(l =>
                          <option key={l} value={l}>{l}</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Graduation Year</label>
                      <select className="input-dark" value={data.graduationYear}
                        onChange={e => update('graduationYear', parseInt(e.target.value))}>
                        {Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - 4 + i).map(y =>
                          <option key={y} value={y}>{y}</option>
                        )}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Degree Title</label>
                    <input className="input-dark" placeholder="e.g. Bachelor of Engineering in Computer Science" value={data.degreeTitle}
                      onChange={e => update('degreeTitle', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Institution Name</label>
                    <input className="input-dark" placeholder="e.g. NUST, IBA, University of Dhaka" value={data.institutionName}
                      onChange={e => update('institutionName', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">CGPA</label>
                      <input type="number" step="0.01" min="0" max={data.maxCgpa} className="input-dark"
                        placeholder="e.g. 3.5" value={data.cgpa || ''}
                        onChange={e => update('cgpa', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Out of (Max CGPA)</label>
                      <select className="input-dark" value={data.maxCgpa}
                        onChange={e => update('maxCgpa', parseFloat(e.target.value))}>
                        <option value={4.0}>4.0</option>
                        <option value={5.0}>5.0</option>
                        <option value={10.0}>10.0</option>
                        <option value={100}>100% (Percentage)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Work Experience</label>
                      <select className="input-dark" value={data.workExperienceYears}
                        onChange={e => update('workExperienceYears', parseInt(e.target.value))}>
                        {[0, 1, 2, 3, 4, 5, '6+'].map(y => <option key={y} value={typeof y === 'string' ? 6 : y}>{y} year{y !== 1 ? 's' : ''}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Study Gap</label>
                      <select className="input-dark" value={data.studyGapYears}
                        onChange={e => update('studyGapYears', parseInt(e.target.value))}>
                        {[0, 1, 2, 3, 4, '5+'].map(y => <option key={y} value={typeof y === 'string' ? 5 : y}>{y} year{y !== 1 ? 's' : ''}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Study Goals */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-white">Study Goals</h2>
                  <p className="text-slate-400 text-sm mt-1">What and where do you want to study?</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Target Degree Level</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['Bachelor', 'Master', 'PhD', 'Diploma'] as DegreeLevel[]).map(d => (
                      <button key={d} onClick={() => update('targetDegree', d)}
                        className={`py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all ${
                          data.targetDegree === d
                            ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Fields of Study <span className="text-slate-500 font-normal">(select up to 3)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {MAJORS.map(m => (
                      <button key={m} onClick={() => toggleMajor(m)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          data.intendedMajors.includes(m)
                            ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Preferred Countries <span className="text-slate-500 font-normal">(select up to 5)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COUNTRIES.map(c => (
                      <button key={c} onClick={() => toggleCountry(c)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          data.preferredCountries.includes(c)
                            ? 'bg-accent-500/20 border-accent-500 text-accent-400'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Language & Tests */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-white">Language & Test Scores</h2>
                  <p className="text-slate-400 text-sm mt-1">Your English proficiency and standardized test results</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">IELTS Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Completed', 'Booked', 'Preparing', 'Exempt'] as IeltsStatus[]).map(s => (
                      <button key={s} onClick={() => update('ieltsStatus', s)}
                        className={`py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all ${
                          data.ieltsStatus === s
                            ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {data.ieltsStatus === 'Completed' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">IELTS Score</label>
                      <input type="number" step="0.5" min="0" max="9" className="input-dark"
                        placeholder="e.g. 7.0" value={data.ieltsScore || ''}
                        onChange={e => update('ieltsScore', parseFloat(e.target.value))} />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">GRE Score <span className="text-slate-500">(optional)</span></label>
                    <input type="number" className="input-dark" placeholder="e.g. 320" value={data.extracurriculars || ''}
                      onChange={e => update('extracurriculars', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Extracurriculars / Research <span className="text-slate-500">(optional)</span>
                  </label>
                  <textarea className="input-dark resize-none" rows={3}
                    placeholder="Research papers, publications, projects, leadership roles, volunteering..."
                    value={data.extracurriculars || ''}
                    onChange={e => update('extracurriculars', e.target.value)} />
                </div>
              </div>
            )}

            {/* Step 5: Budget */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-white">Budget & Funding</h2>
                  <p className="text-slate-400 text-sm mt-1">Your financial capacity for tuition (per year)</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-4">
                    Annual Tuition Budget: <span className="text-brand-400">${data.maxTuitionBudgetUsd.toLocaleString()} USD</span>
                  </label>
                  <input type="range" min="0" max="60000" step="1000"
                    value={data.maxTuitionBudgetUsd}
                    onChange={e => update('maxTuitionBudgetUsd', parseInt(e.target.value))}
                    className="w-full accent-brand-500" />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>$0 (Free/Scholarship)</span>
                    <span>$60,000+</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Funding Preference</label>
                  <div className="space-y-2">
                    {(['Full Scholarship Only', 'Partial Scholarship + Self', 'Fully Self-Funded'] as FundingPreference[]).map(f => (
                      <button key={f} onClick={() => update('fundingPreference', f)}
                        className={`w-full text-left py-3 px-4 rounded-xl text-sm font-semibold border transition-all ${
                          data.fundingPreference === f
                            ? 'bg-brand-500/15 border-brand-500 text-brand-300'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}>
                        <div>{f}</div>
                        <div className="text-xs font-normal text-slate-500 mt-0.5">
                          {f === 'Full Scholarship Only' && 'Looking for 100% funded opportunities (DAAD, Chevening, Erasmus+)'}
                          {f === 'Partial Scholarship + Self' && 'Open to merit discounts + personal/family funds'}
                          {f === 'Fully Self-Funded' && 'Can fund tuition and living costs independently'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-sm text-brand-300">
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <Sparkles className="w-4 h-4" />
                    Ready to generate your AI roadmap!
                  </div>
                  <p className="text-brand-400/80 text-xs">
                    Based on your profile, our AI will create a personalized 10-stage study abroad plan with deadlines, tasks, and scholarship recommendations.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button onClick={back} disabled={currentStep === 1}
                className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={next} disabled={!isStepValid()}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                {currentStep === STEPS.length ? (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate My Roadmap
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
