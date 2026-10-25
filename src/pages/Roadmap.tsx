// ============================================================
// Roadmap Page — AI-Generated Tasks with Firestore CRUD
// ============================================================
import React, { useState, useEffect } from 'react';
import {
  Map, CheckCircle2, Circle, Clock, AlertTriangle,
  ChevronDown, ChevronRight, Plus, Sparkles, Bot,
  Loader2, RefreshCw, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { RoadmapTask, TaskStatus, TaskPriority } from '../types';
import { getRoadmapTasks, updateRoadmapTask, createRoadmapTasks } from '../lib/firestore';
import { generatePersonalizedRoadmap } from '../lib/gemini';

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  urgent: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
  high: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  medium: 'text-brand-400 bg-brand-400/10 border-brand-400/30',
  low: 'text-slate-400 bg-slate-800 border-slate-700',
};

const STATUS_ICON: Record<TaskStatus, React.ReactNode> = {
  completed: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
  in_progress: <Circle className="w-5 h-5 text-brand-400 fill-brand-400/30" />,
  not_started: <Circle className="w-5 h-5 text-slate-600" />,
  blocked: <AlertTriangle className="w-5 h-5 text-rose-400" />,
  skipped: <Circle className="w-5 h-5 text-slate-700" />,
};

export const Roadmap: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');

  useEffect(() => {
    const load = async () => {
      if (!profile?.uid) return;
      const t = await getRoadmapTasks(profile.uid);
      setTasks(t);
      setLoading(false);
    };
    load();
  }, [profile?.uid]);

  const handleStatusChange = async (task: RoadmapTask, newStatus: TaskStatus) => {
    await updateRoadmapTask(task.id, {
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
    });
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    if (newStatus === 'completed') showToast(`✅ "${task.title}" completed!`, 'success');
  };

  const toggleSubtask = async (task: RoadmapTask, subtaskId: string) => {
    const updated = task.subtasks.map(s =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    await updateRoadmapTask(task.id, { subtasks: updated });
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, subtasks: updated } : t));
  };

  const handleRegenerateRoadmap = async () => {
    if (!profile?.uid || !profile.isOnboarded) return;
    setGenerating(true);
    try {
      const roadmapJson = await generatePersonalizedRoadmap({
        step: 5,
        fullName: profile.fullName,
        nationality: profile.nationality,
        residenceCity: profile.residenceCity,
        currentEducationLevel: profile.currentEducationLevel,
        degreeTitle: profile.degreeTitle,
        institutionName: profile.institutionName,
        cgpa: profile.cgpa,
        maxCgpa: profile.maxCgpa,
        graduationYear: profile.graduationYear,
        targetDegree: profile.targetDegree,
        intendedMajors: profile.intendedMajors,
        preferredCountries: profile.preferredCountries,
        ieltsStatus: profile.ieltsStatus,
        ieltsScore: profile.ieltsScore,
        maxTuitionBudgetUsd: profile.maxTuitionBudgetUsd,
        fundingPreference: profile.fundingPreference,
        workExperienceYears: profile.workExperienceYears,
        studyGapYears: profile.studyGapYears,
        extracurriculars: profile.extracurriculars,
      });

      if (roadmapJson) {
        const parsed = JSON.parse(roadmapJson);
        const newTasks = parsed.map((t: any, i: number) => ({
          ...t,
          id: `task-regen-${Date.now()}-${i}`,
          userId: profile.uid,
          status: 'not_started' as TaskStatus,
          aiGenerated: true,
        }));
        await createRoadmapTasks(newTasks);
        const reloaded = await getRoadmapTasks(profile.uid);
        setTasks(reloaded);
        showToast('Roadmap regenerated with fresh AI plan!', 'success');
      }
    } catch (err) {
      showToast('Could not regenerate roadmap. Try again.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Group by stage
  const stageMap = tasks.reduce<Record<number, RoadmapTask[]>>((acc, t) => {
    if (!acc[t.stage]) acc[t.stage] = [];
    acc[t.stage].push(t);
    return acc;
  }, {});

  const filteredTasks = tasks.filter(t => filterStatus === 'all' || t.status === filterStatus);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-slate-900 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white">My Roadmap</h1>
          <p className="text-slate-400 text-sm mt-1">AI-generated personalized study abroad plan</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRegenerateRoadmap}
            disabled={generating || !profile?.isOnboarded}
            className="btn-ghost text-sm disabled:opacity-40"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Regenerate
          </button>
        </div>
      </div>

      {/* Progress */}
      {tasks.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-brand-400" />
              <span className="font-bold text-white text-sm">Overall Progress</span>
            </div>
            <span className="font-black text-brand-400">{progress}%</span>
          </div>
          <div className="progress-bar mb-3">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>{completedCount} completed</span>
            <span>{tasks.filter(t => t.status === 'in_progress').length} in progress</span>
            <span>{tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length} urgent</span>
          </div>
        </div>
      )}

      {/* Filter */}
      {tasks.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {(['all', 'not_started', 'in_progress', 'completed', 'blocked'] as const).map(s => (
            <button key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filterStatus === s
                  ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}>
              {s === 'all' ? 'All' : s.replace('_', ' ')} ({s === 'all' ? tasks.length : tasks.filter(t => t.status === s).length})
            </button>
          ))}
        </div>
      )}

      {/* No tasks state */}
      {tasks.length === 0 && (
        <div className="card py-16 text-center space-y-4">
          <Map className="w-12 h-12 text-slate-700 mx-auto" />
          <div>
            <p className="text-slate-300 font-semibold">No roadmap yet</p>
            <p className="text-sm text-slate-500 mt-1">Complete your profile and let AI generate your personalized plan.</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link to="/advisor" className="btn-primary text-sm">
              <Bot className="w-4 h-4" /> Generate with AI
            </Link>
            <Link to="/profile" className="btn-ghost text-sm">Complete Profile</Link>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map(task => {
          const isExpanded = expandedTasks.has(task.id);
          const completedSubs = task.subtasks?.filter(s => s.completed).length || 0;
          const totalSubs = task.subtasks?.length || 0;

          return (
            <div key={task.id} className={`card transition-all ${
              task.status === 'completed' ? 'opacity-60' : ''
            }`}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Status Icon (clickable) */}
                  <button
                    onClick={() => handleStatusChange(task,
                      task.status === 'completed' ? 'not_started' :
                      task.status === 'in_progress' ? 'completed' : 'in_progress'
                    )}
                    className="shrink-0 mt-0.5 hover:scale-110 transition-transform"
                  >
                    {STATUS_ICON[task.status]}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-bold">
                        Stage {task.stage}
                      </span>
                      <span className={`badge text-[9px] border ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </span>
                      {task.aiGenerated && (
                        <span className="badge badge-brand text-[9px]">
                          <Sparkles className="w-2.5 h-2.5" /> AI
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 ml-auto">
                        <Clock className="w-3 h-3" /> {task.dueDate}
                      </span>
                    </div>

                    <h3 className={`font-bold text-sm ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>
                      {task.title}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {task.description}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      {totalSubs > 0 && (
                        <span className="text-[10px] text-brand-400 font-medium">
                          {completedSubs}/{totalSubs} subtasks
                        </span>
                      )}
                      {task.officialLink && (
                        <a href={task.officialLink} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] text-brand-400 hover:underline flex items-center gap-0.5">
                          Official link <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {totalSubs > 0 && (
                        <button
                          onClick={() => setExpandedTasks(prev => {
                            const next = new Set(prev);
                            next.has(task.id) ? next.delete(task.id) : next.add(task.id);
                            return next;
                          })}
                          className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-0.5 ml-auto"
                        >
                          Subtasks {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subtasks */}
                {isExpanded && totalSubs > 0 && (
                  <div className="mt-3 ml-8 space-y-2 border-t border-slate-800 pt-3">
                    {task.subtasks.map(sub => (
                      <button key={sub.id}
                        onClick={() => toggleSubtask(task, sub.id)}
                        className="flex items-center gap-2 w-full text-left group">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 transition-colors ${sub.completed ? 'text-emerald-400' : 'text-slate-700 group-hover:text-slate-500'}`} />
                        <span className={`text-xs transition-colors ${sub.completed ? 'line-through text-slate-600' : 'text-slate-400 group-hover:text-slate-300'}`}>
                          {sub.title}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
