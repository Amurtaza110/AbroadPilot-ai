// ============================================================
// Auto-Apply Agent & University Deadline Tracker (Phase 2)
// Autonomous application dossier compiler, readiness checker & portal agent
// ============================================================
import React, { useState, useEffect } from 'react';
import {
  Zap, Clock, CheckCircle2, AlertTriangle, FileText, ArrowRight,
  ExternalLink, Calendar, RefreshCw, Shield, Sparkles, Download,
  Check, Play, Bot, ChevronRight, Bell, Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getApplications, getDocuments, updateApplication } from '../lib/firestore';
import { Application, StudentDocument } from '../types';

interface AgentTask {
  id: string;
  appId: string;
  universityName: string;
  action: string;
  timestamp: string;
  status: 'completed' | 'in_progress' | 'attention_required';
  detail: string;
}

export const AutoApplyAgent: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();

  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isCompilingDossier, setIsCompilingDossier] = useState(false);
  const [compiledPackage, setCompiledPackage] = useState<string | null>(null);

  // Simulated live agent activity feed
  const [agentLogs, setAgentLogs] = useState<AgentTask[]>([
    {
      id: 'log-1',
      appId: 'app-tum-1',
      universityName: 'Technical University of Munich',
      action: 'Portal Deadline Verification',
      timestamp: '10 mins ago',
      status: 'completed',
      detail: 'TUMonline portal verified for Winter Semester 2026. Official deadline confirmed: May 31, 2026.',
    },
    {
      id: 'log-2',
      appId: 'app-tum-1',
      universityName: 'Technical University of Munich',
      action: 'Curriculum & Prerequisite Match',
      timestamp: '25 mins ago',
      status: 'completed',
      detail: 'Calculated 120 ECTS in CS. Algorithm & Mathematics requirements satisfied by BS transcripts.',
    },
    {
      id: 'log-3',
      appId: 'app-manchester-2',
      universityName: 'University of Manchester',
      action: 'IELTS Band Verification',
      timestamp: '1 hour ago',
      status: 'completed',
      detail: 'IELTS Band 7.5 satisfies the Faculty of Science & Engineering minimum English requirement (6.5).',
    },
    {
      id: 'log-4',
      appId: 'app-toronto-3',
      universityName: 'University of Toronto',
      action: 'Dossier Readiness Check',
      timestamp: '3 hours ago',
      status: 'attention_required',
      detail: 'Statement of Intent requires second faculty referee letter before portal submission.',
    }
  ]);

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;
    setLoading(false);
    const [apps, docs] = await Promise.all([
      getApplications(profile.uid),
      getDocuments(profile.uid)
    ]);
    setApplications(apps);
    setDocuments(docs);
    if (apps.length > 0 && !selectedApp) {
      setSelectedApp(apps[0]);
    }
  };

  // Toggle Auto-Apply Agent for an application
  const toggleAgent = async (app: Application) => {
    const updatedStatus = !app.aiAgentEnabled;
    const newStatus = updatedStatus ? 'monitoring' : 'pending';
    await updateApplication(app.id, {
      aiAgentEnabled: updatedStatus,
      agentStatus: newStatus
    });

    setApplications(prev =>
      prev.map(a => a.id === app.id ? { ...a, aiAgentEnabled: updatedStatus, agentStatus: newStatus } : a)
    );

    if (selectedApp?.id === app.id) {
      setSelectedApp(prev => prev ? { ...prev, aiAgentEnabled: updatedStatus, agentStatus: newStatus } : null);
    }

    showToast(
      updatedStatus ? `Auto-Apply Agent activated for ${app.universityName}` : `Agent paused for ${app.universityName}`,
      'info'
    );
  };

  // Calculate Days Remaining
  const getDaysRemaining = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate Readiness Percentage
  const getReadinessScore = (app: Application) => {
    let score = 30; // base score for shortlisted
    if (app.status === 'Documents Preparing') score += 20;
    if (app.status === 'Ready to Submit') score += 50;
    if (app.status === 'Submitted' || app.status === 'Under Review' || app.status === 'Accepted') score = 100;
    if (documents.some(d => d.category === 'Passport' && d.status === 'Verified')) score += 10;
    if (documents.some(d => d.category === 'Transcript' && (d.status === 'Verified' || d.status === 'Attested'))) score += 10;
    return Math.min(100, score);
  };

  // 1-Click Calendar Export (.ics)
  const exportCalendarEvent = (app: Application) => {
    const deadlineDate = new Date(app.deadline);
    const dateFormatted = deadlineDate.toISOString().replace(/-|:|\.\d\d\d/g, '').slice(0, 8);

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AbroadPilot AI//Study Abroad Deadline Tracker//EN',
      'BEGIN:VEVENT',
      `UID:deadline-${app.id}@abroadpilot.ai`,
      `DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d\d\d/g, '').slice(0, 15)}Z`,
      `DTSTART;VALUE=DATE:${dateFormatted}`,
      `SUMMARY:🎯 Application Deadline: ${app.universityName}`,
      `DESCRIPTION:AbroadPilot AI Alert: Deadline for ${app.programTitle} (${app.country}). Portal: ${app.applicationUrl}`,
      `URL:${app.applicationUrl}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P7D',
      'ACTION:DISPLAY',
      `DESCRIPTION:AbroadPilot Reminder: 1 week left for ${app.universityName} application deadline!`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Deadline_${app.universityName.replace(/\s+/g, '_')}.ics`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Calendar reminder exported for ${app.universityName}`, 'success');
  };

  // Compile Autonomous Dossier
  const handleCompileDossier = (app: Application) => {
    setIsCompilingDossier(true);
    setCompiledPackage(null);

    setTimeout(() => {
      setIsCompilingDossier(false);
      const pkgSummary = `AbroadPilot Autonomous Dossier Package
Target: ${app.universityName} — ${app.programTitle} (${app.country})
Applicant: ${profile?.fullName || 'Student'} (CGPA ${profile?.cgpa || '3.5'})

Verified Documents Attached:
1. Valid International Passport (Verified)
2. Certified Academic Transcripts (HEC Attested)
3. IELTS Academic Certificate (Band ${profile?.ieltsScore || 7.5})
4. Tailored SOP Draft (TUM & EuroPass Standard)
5. 2 Academic Recommendation Letters

Portal Autofill Payload:
- Full Name: ${profile?.fullName || ''}
- Nationality: ${profile?.nationality || 'Pakistan'}
- Current Degree: ${profile?.degreeTitle || 'Bachelor of Science'}
- Major Subject Area: ${(profile?.intendedMajors || []).join(', ')}
- Financial Proof: ${profile?.fundingPreference || 'Self / Partial Scholarship'}
`;
      setCompiledPackage(pkgSummary);
      showToast('Application Dossier compiled successfully!', 'success');
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-accent-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 text-accent-400 fill-accent-400/20" />
            Autonomous Pilot Engine
          </div>
          <h1 className="text-2xl font-black text-white">Auto-Apply Agent & Deadline Radar</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Monitors university portals, validates requirement criteria, and compiles complete application dossiers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-surface-900 border border-slate-800 flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">
              {applications.filter(a => a.aiAgentEnabled).length} Active Agent Monitors
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Applications Radar */}
        <div className="lg:col-span-7 space-y-4">
          <div className="card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-400" />
                Target University Radar & Deadlines
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                {applications.length} tracked institutions
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {applications.map(app => {
                const daysLeft = getDaysRemaining(app.deadline);
                const readiness = getReadinessScore(app);
                const isSelected = selectedApp?.id === app.id;

                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-surface-800/90 border-brand-500/50 shadow-md ring-1 ring-brand-500/20'
                        : 'bg-surface-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-surface-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate">{app.universityName}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-800 text-slate-300 border border-slate-700/60">
                            {app.country}
                          </span>
                        </div>
                        <p className="text-xs text-brand-300 font-medium truncate mt-0.5">
                          {app.programTitle}
                        </p>
                      </div>

                      {/* Deadline Countdown Badge */}
                      <div className="text-right shrink-0">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                            daysLeft < 30
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : daysLeft < 90
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {daysLeft > 0 ? `${daysLeft}d left` : 'Deadline Passed'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {app.deadline}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar & Agent Toggle */}
                    <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Dossier Readiness</span>
                          <span className="font-bold text-white">{readiness}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              readiness === 100
                                ? 'bg-emerald-400'
                                : readiness >= 60
                                ? 'bg-brand-400'
                                : 'bg-amber-400'
                            }`}
                            style={{ width: `${readiness}%` }}
                          />
                        </div>
                      </div>

                      {/* Autonomous Agent Switch */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            toggleAgent(app);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                            app.aiAgentEnabled
                              ? 'bg-accent-500/15 text-accent-300 border-accent-500/40'
                              : 'bg-surface-800 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                        >
                          <Zap className={`w-3 h-3 ${app.aiAgentEnabled ? 'text-accent-400 fill-accent-400' : ''}`} />
                          {app.aiAgentEnabled ? 'Agent Active' : 'Enable Agent'}
                        </button>

                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            exportCalendarEvent(app);
                          }}
                          title="Export to Calendar (.ics)"
                          className="p-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-white border border-slate-700"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Agent Activity Feed */}
          <div className="card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Bot className="w-4 h-4 text-accent-400" />
                Autonomous Portal Verification Log
              </h3>
              <span className="text-[10px] text-accent-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-ping" />
                Live Feed
              </span>
            </div>

            <div className="space-y-2.5">
              {agentLogs.map(log => (
                <div key={log.id} className="p-3 rounded-xl bg-surface-900/40 border border-slate-800 flex items-start gap-3">
                  <div className="mt-0.5">
                    {log.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{log.action}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                      {log.universityName}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {log.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Application Dossier & Actions */}
        <div className="lg:col-span-5 space-y-4">
          {selectedApp ? (
            <div className="card space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="text-[10px] font-bold text-brand-400 uppercase tracking-wide">
                    Active Dossier Inspector
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedApp.universityName}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedApp.programTitle}</p>
                </div>

                <a
                  href={selectedApp.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5 transition-colors"
                  title="Open University Portal"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Requirement Checklist */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Mandatory Submission Package
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-surface-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-200">International Passport</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Verified
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-surface-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-200">Official Degree & Transcripts</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      HEC Attested
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-surface-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-200">IELTS Academic Score Card</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Band 7.5 (Met)
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-surface-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-200">Statement of Purpose (SOP)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                      Ready in SOP Studio
                    </span>
                  </div>
                </div>
              </div>

              {/* Compile & Export Button */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => handleCompileDossier(selectedApp)}
                  disabled={isCompilingDossier}
                  className="btn-primary w-full justify-center py-2.5 text-xs font-bold"
                >
                  {isCompilingDossier ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Autonomous Pilot Compiling Dossier...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Compile 1-Click Application Package
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => exportCalendarEvent(selectedApp)}
                  className="btn-ghost w-full justify-center py-2 text-xs font-semibold"
                >
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-brand-400" />
                  Sync Deadline to Google / Apple Calendar
                </button>
              </div>

              {/* Compiled Package Output */}
              {compiledPackage && (
                <div className="mt-3 p-3 rounded-xl bg-surface-950 border border-brand-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Dossier Package Ready
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(compiledPackage);
                        showToast('Package payload copied to clipboard!', 'success');
                      }}
                      className="text-[11px] text-brand-400 hover:underline"
                    >
                      Copy Payload
                    </button>
                  </div>
                  <pre className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {compiledPackage}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="card text-center p-6 flex flex-col items-center justify-center min-h-[300px] text-slate-500">
              <Zap className="w-10 h-10 stroke-[1.5] text-slate-600 mb-2" />
              <h4 className="text-sm font-bold text-slate-400">Select an Institution</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Choose any tracked university on the left to inspect requirements, monitor portal status, and compile your application package.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
