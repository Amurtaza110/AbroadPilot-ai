// ============================================================
// Dashboard Page — Real Data from Firestore
// ============================================================
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, CheckCircle2, Clock, FileText,
  FolderOpen, Award, Map, Bot, TrendingUp, Plus,
  GraduationCap, Globe, Zap, AlertTriangle, Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getRoadmapTasks, getApplications, getDocuments } from '../lib/firestore';
import { RoadmapTask, Application, StudentDocument } from '../types';

export const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!profile?.uid) return;
      try {
        const [t, a, d] = await Promise.all([
          getRoadmapTasks(profile.uid),
          getApplications(profile.uid),
          getDocuments(profile.uid)
        ]);
        setTasks(t);
        setApplications(a);
        setDocuments(d);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profile?.uid]);

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed');
  const nextTasks = tasks.filter(t => t.status === 'not_started' || t.status === 'in_progress').slice(0, 4);
  const activeApps = applications.filter(a => !['Accepted', 'Rejected', 'Withdrawn'].includes(a.status));
  const verifiedDocs = documents.filter(d => d.status === 'Verified' || d.status === 'Attested').length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 rounded-2xl bg-slate-900 shimmer animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950 border border-slate-800 p-6 sm:p-8">
        <div className="absolute inset-0 gradient-glow-teal" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge badge-brand">
                <Sparkles className="w-3 h-3" /> AI Powered
              </span>
              {profile?.isOnboarded && (
                <span className="badge badge-purple">
                  <Activity className="w-3 h-3" /> {progressPercent}% Roadmap Progress
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {greeting()},{' '}
              <span className="text-gradient">{profile?.fullName?.split(' ')[0] || 'Explorer'}!</span>
            </h1>
            {profile?.isOnboarded ? (
              <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                You're targeting a{' '}
                <span className="text-brand-400 font-semibold">{profile.targetDegree}</span> in{' '}
                <span className="text-white font-semibold">{profile.intendedMajors[0] || 'your field'}</span>{' '}
                across{' '}
                <span className="text-brand-300 font-medium">{profile.preferredCountries.slice(0, 3).join(', ')}</span>.
                {urgentTasks.length > 0 && (
                  <span className="text-amber-400 font-semibold"> {urgentTasks.length} urgent task{urgentTasks.length !== 1 ? 's' : ''} need attention.</span>
                )}
              </p>
            ) : (
              <p className="text-slate-400 text-sm">
                Complete your profile to get a personalized AI roadmap and recommendations.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Link to="/advisor" className="btn-primary text-xs">
              <Bot className="w-3.5 h-3.5" /> Ask AI Advisor
            </Link>
            <Link to="/discover" className="btn-ghost text-xs">
              <Compass className="w-3.5 h-3.5" /> Explore Programs
            </Link>
          </div>
        </div>

        {/* Progress Strip */}
        {totalTasks > 0 && (
          <div className="relative z-10 mt-6 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300 font-semibold">Study Abroad Roadmap Progress</span>
              <span className="text-brand-400 font-bold">{completedTasks}/{totalTasks} milestones</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            to: '/applications',
            icon: <FileText className="w-4 h-4" />,
            label: 'Applications',
            value: applications.length,
            sub: `${activeApps.length} active`,
            color: 'text-blue-400 bg-blue-400/10'
          },
          {
            to: '/roadmap',
            icon: <Map className="w-4 h-4" />,
            label: 'Roadmap Tasks',
            value: totalTasks,
            sub: `${completedTasks} completed`,
            color: 'text-brand-400 bg-brand-400/10'
          },
          {
            to: '/documents',
            icon: <FolderOpen className="w-4 h-4" />,
            label: 'Documents',
            value: documents.length,
            sub: `${verifiedDocs} verified`,
            color: 'text-emerald-400 bg-emerald-400/10'
          },
          {
            to: '/scholarships',
            icon: <Award className="w-4 h-4" />,
            label: 'Scholarships',
            value: profile?.preferredCountries?.length || 0,
            sub: 'Countries targeted',
            color: 'text-amber-400 bg-amber-400/10'
          }
        ].map((stat, i) => (
          <Link key={i} to={stat.to}
            className="card p-5 flex flex-col gap-3 hover:scale-[1.01] transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-black text-white">{stat.value}</div>
            <div className="text-xs text-slate-500">{stat.sub}</div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Next Actions */}
        <div className="lg:col-span-7 card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="badge badge-brand text-[10px]">Action Center</span>
                <h2 className="font-bold text-white text-sm">What to do next</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Your top priority roadmap milestones</p>
            </div>
            <Link to="/roadmap" className="text-xs font-semibold text-brand-400 hover:underline flex items-center gap-1">
              Full Roadmap <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {nextTasks.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <div>
                <p className="text-sm font-semibold text-slate-300">All tasks complete!</p>
                <p className="text-xs text-slate-500 mt-1">Your roadmap is fully up to date.</p>
              </div>
              {totalTasks === 0 && (
                <Link to="/advisor" className="btn-primary text-xs mx-auto">
                  <Bot className="w-3.5 h-3.5" /> Generate AI Roadmap
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {nextTasks.map(task => (
                <div key={task.id}
                  className="p-4 rounded-2xl border border-slate-800 hover:border-brand-500/30 bg-slate-900/50 hover:bg-slate-900 transition-all">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                      task.priority === 'urgent' ? 'bg-rose-400 animate-pulse' :
                      task.priority === 'high' ? 'bg-amber-400' :
                      task.priority === 'medium' ? 'bg-brand-400' : 'bg-slate-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                          Stage {task.stage}
                        </span>
                        {task.priority === 'urgent' && (
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-400/10 px-1.5 py-0.5 rounded border border-rose-400/20">
                            URGENT
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.dueDate}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-white">{task.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                      {task.subtasks?.length > 0 && (
                        <div className="text-[10px] text-brand-400 mt-1.5 font-medium">
                          {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks done
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Tools Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-surface-900 to-accent-950/30 border border-accent-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-accent-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Need application help?</div>
                <div className="text-xs text-slate-400">AI can write your SOP or professor inquiry email</div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link to="/advisor?task=sop" className="px-3 py-1.5 text-xs font-bold bg-brand-500 hover:bg-brand-400 text-surface-950 rounded-lg transition-colors">
                Write SOP
              </Link>
              <Link to="/advisor?task=email" className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700">
                Draft Email
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Applications */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <h2 className="font-bold text-white text-sm">Active Applications</h2>
              </div>
              <Link to="/applications" className="text-xs text-brand-400 font-semibold hover:underline">
                View All
              </Link>
            </div>

            {activeApps.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xs text-slate-500">No active applications yet.</p>
                <Link to="/discover" className="block mt-2 text-xs text-brand-400 font-semibold hover:underline">
                  Explore universities →
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeApps.slice(0, 4).map(app => (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{app.universityName}</div>
                      <div className="text-[11px] text-slate-500 truncate">{app.programTitle}</div>
                      <div className="text-[10px] text-slate-600 mt-0.5">Due: {app.deadline}</div>
                    </div>
                    <span className={`ml-2 shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      app.status === 'Accepted' ? 'status-accepted border-current' :
                      app.status === 'Rejected' ? 'status-rejected border-current' :
                      app.status === 'Submitted' ? 'status-submitted border-current' :
                      'status-pending border-current'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Link to="/applications" className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-700 hover:border-brand-500 text-xs text-slate-500 hover:text-brand-400 transition-all">
              <Plus className="w-3.5 h-3.5" /> Track New Application
            </Link>
          </div>

          {/* Quick AI Actions */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-brand-400" />
              <h2 className="font-bold text-white text-sm">Quick AI Tools</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { to: '/discover', icon: <GraduationCap className="w-4 h-4" />, label: 'Find Universities', color: 'text-blue-400 bg-blue-400/10 hover:bg-blue-400/20' },
                { to: '/scholarships', icon: <Award className="w-4 h-4" />, label: 'Match Scholarships', color: 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20' },
                { to: '/visa', icon: <Globe className="w-4 h-4" />, label: 'Visa Checklist', color: 'text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20' },
                { to: '/cost-planner', icon: <TrendingUp className="w-4 h-4" />, label: 'Plan Costs', color: 'text-purple-400 bg-purple-400/10 hover:bg-purple-400/20' },
              ].map((item, i) => (
                <Link key={i} to={item.to}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all ${item.color}`}>
                  {item.icon}
                  <span className="text-xs font-semibold">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fix missing import
function Compass({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  );
}
