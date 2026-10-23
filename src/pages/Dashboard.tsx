import React, { useState, useEffect } from 'react';
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  GraduationCap,
  Award,
  FileText,
  FolderLock,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RoadmapTask, University, Application, StudentDocument, formatCurrencyPkr, convertToPkr } from '../types';

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenSopAssistant: () => void;
  onOpenEmailDraft: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateTab,
  onOpenSopAssistant,
  onOpenEmailDraft
}) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [savedUnis, setSavedUnis] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [tasksRes, appsRes, docsRes, unisRes] = await Promise.all([
          fetch('/api/v1/roadmap'),
          fetch('/api/v1/applications'),
          fetch('/api/v1/documents'),
          fetch('/api/v1/universities')
        ]);
        const tasksData = await tasksRes.json();
        const appsData = await appsRes.json();
        const docsData = await docsRes.json();
        const unisData = await unisRes.json();

        if (tasksData.tasks) setTasks(tasksData.tasks);
        if (appsData.applications) setApplications(appsData.applications);
        if (docsData.documents) setDocuments(docsData.documents);
        if (unisData.savedUniversityIds) setSavedUnis(unisData.savedUniversityIds);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Calculations
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const nextActions = tasks
    .filter(t => t.status === 'not_started' || t.status === 'in_progress')
    .slice(0, 3);

  const attestedDocsCount = documents.filter(d => d.status === 'attested' || d.status === 'verified').length;

  const handleQuickCompleteTask = async (task: RoadmapTask) => {
    try {
      const res = await fetch(`/api/v1/roadmap/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      const data = await res.json();
      if (data.success) {
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'completed' } : t));
      }
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-teal-500 text-slate-950 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                AbroadPilot Journey Hub
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {user?.residenceCity || 'Pakistan'} Edition
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.fullName || 'Candidate'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Targeting <span className="text-teal-400 font-semibold">{user?.targetDegree || 'Master'}</span> in{' '}
              <span className="text-white font-semibold">{user?.intendedMajor || 'Computer Science'}</span> across{' '}
              <span className="text-teal-300 font-medium">{user?.preferredCountries?.join(', ') || 'Germany, UK, Italy'}</span>.
            </p>
          </div>

          {/* Quick Actions in Banner */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateTab('roadmap')}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <span>Continue Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('discover')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-teal-400" />
              <span>Explore Universities</span>
            </button>
          </div>
        </div>

        {/* Roadmap Progress Strip */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">Interactive 10-Stage Study Abroad Roadmap</span>
              <span className="text-[11px] text-teal-400 font-medium">
                ({completedTasks.length} of {tasks.length} Milestones Cleared)
              </span>
            </div>
            <span className="font-extrabold text-teal-300 text-sm">{progressPercent}% Completed</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saved Universities */}
        <div
          onClick={() => onNavigateTab('discover')}
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Shortlisted Universities</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{savedUnis.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Discover & Compare programs</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Active Applications */}
        <div
          onClick={() => onNavigateTab('applications')}
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tracked Applications</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{applications.length}</div>
          <div className="text-[11px] text-teal-700 font-medium mt-1 flex items-center gap-1">
            <span>{applications.filter(a => a.status === 'Submitted' || a.status === 'Accepted').length} Active Submissions</span>
          </div>
        </div>

        {/* Attested Vault Documents */}
        <div
          onClick={() => onNavigateTab('documents')}
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Document Vault</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderLock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{documents.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>{attestedDocsCount} Attested & Verified</span>
          </div>
        </div>

        {/* Annual Budget Ceiling */}
        <div
          onClick={() => onNavigateTab('calculator')}
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tuition Budget (PKR)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 truncate">
            {formatCurrencyPkr(user?.maxTuitionBudgetPkr || 2500000)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>{user?.fundingPreference || 'Partial + Self'}</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: What should I do next? & Active Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Next Recommended Actions (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-teal-50 text-teal-800 font-extrabold px-2 py-0.5 rounded uppercase">
                  Action Center
                </span>
                <span className="font-bold text-slate-900 text-sm">What should I do next?</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Top 3 prioritized milestones based on your profile and target intake dates.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('roadmap')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 hover:underline"
            >
              Full Roadmap <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {nextActions.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                All scheduled roadmap milestones are currently completed!
              </div>
            ) : (
              nextActions.map((task, idx) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                        Stage {task.stageNumber}
                      </span>
                      {task.priority === 'urgent' && (
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">
                          Urgent
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Due {task.dueDate}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs">{task.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                      {task.description}
                    </p>

                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="text-[10px] text-teal-700 font-medium pt-1">
                        {task.subtasks.filter(s => s.completed).length} of {task.subtasks.length} checklist items verified
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleQuickCompleteTask(task)}
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:border-teal-400 text-slate-400 hover:text-teal-600 transition-colors shadow-sm shrink-0"
                    title="Mark task completed"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Quick AI Tools Bar */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
              <div>
                <div className="font-bold text-xs text-white">Need Application Support?</div>
                <div className="text-[11px] text-slate-300">Generate an SOP draft or professor inquiry email.</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onOpenSopAssistant}
                className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
              >
                SOP Assistant
              </button>
              <button
                onClick={onOpenEmailDraft}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition-colors"
              >
                Inquiry Email
              </button>
            </div>
          </div>
        </div>

        {/* Right: Active Applications & Quick Visa Prep Checklist (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Applications Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <span className="font-bold text-slate-900 text-sm">Active Applications</span>
              </div>
              <button
                onClick={() => onNavigateTab('applications')}
                className="text-xs font-semibold text-teal-600 hover:underline"
              >
                View Workspace
              </button>
            </div>

            <div className="space-y-2.5">
              {applications.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No active university applications tracked yet.
                  <button
                    onClick={() => onNavigateTab('discover')}
                    className="block mx-auto mt-2 text-teal-600 font-semibold hover:underline"
                  >
                    Explore verified programs
                  </button>
                </div>
              ) : (
                applications.slice(0, 3).map((app) => (
                  <div
                    key={app.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{app.universityName}</div>
                      <div className="text-[11px] text-slate-500">{app.programTitle}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Deadline: {app.deadline} • {app.country}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200 shrink-0">
                      {app.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pakistan Student Visa Readiness Widget */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span className="font-bold text-sm">Pakistan Visa Essentials</span>
              </div>
              <button
                onClick={() => onNavigateTab('visa')}
                className="text-xs font-semibold text-teal-400 hover:underline"
              >
                Full Checklists
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Applying from Pakistan requires early preparation of authentic documents:
            </p>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-teal-400 font-bold">•</span>
                <span><strong>Germany:</strong> APS certificate from APS Islamabad mandatory.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400 font-bold">•</span>
                <span><strong>UK:</strong> 28-day continuous bank maintenance & IOM TB test.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400 font-bold">•</span>
                <span><strong>Italy:</strong> Universitaly pre-enrolment & DSU financial grant.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
