// ============================================================
// Applications Tracker — Full CRUD with Firestore
// ============================================================
import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Search, Filter, MoreVertical, Edit2,
  Trash2, ExternalLink, Bot, ChevronDown, X, Save, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Application, ApplicationStatus, DegreeLevel } from '../types';
import { getApplications, createApplication, updateApplication, deleteApplication } from '../lib/firestore';

const STATUS_OPTIONS: ApplicationStatus[] = [
  'Considering', 'Shortlisted', 'Documents Preparing', 'Ready to Submit',
  'Submitted', 'Under Review', 'Interview Scheduled', 'Offer Received',
  'Accepted', 'Waitlisted', 'Rejected', 'Withdrawn'
];

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  'Considering': 'text-slate-400 bg-slate-800 border-slate-700',
  'Shortlisted': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'Documents Preparing': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  'Ready to Submit': 'text-brand-400 bg-brand-400/10 border-brand-400/20',
  'Submitted': 'text-blue-300 bg-blue-300/10 border-blue-300/20',
  'Under Review': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'Interview Scheduled': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  'Offer Received': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  'Accepted': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  'Waitlisted': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  'Rejected': 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  'Withdrawn': 'text-slate-500 bg-slate-800 border-slate-700',
};

const defaultApp: Partial<Application> = {
  universityName: '',
  country: '',
  programTitle: '',
  degreeLevel: 'Master',
  intakeTerm: '',
  deadline: '',
  applicationUrl: '',
  status: 'Considering',
  notes: '',
  documents: [],
  aiAgentEnabled: false,
};

export const Applications: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'All'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [formData, setFormData] = useState<Partial<Application>>(defaultApp);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!profile?.uid) return;
      const apps = await getApplications(profile.uid);
      setApplications(apps);
      setLoading(false);
    };
    load();
  }, [profile?.uid]);

  const filtered = applications.filter(app => {
    const matchesSearch = !searchQuery ||
      app.universityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.programTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSave = async () => {
    if (!profile?.uid) return;
    if (!formData.universityName || !formData.programTitle || !formData.deadline) {
      showToast('Please fill in university, program, and deadline.', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingApp) {
        await updateApplication(editingApp.id, formData);
        setApplications(prev => prev.map(a => a.id === editingApp.id ? { ...a, ...formData } : a));
        showToast('Application updated!', 'success');
      } else {
        const id = await createApplication({
          ...formData,
          userId: profile.uid,
          documents: [],
          aiAgentEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Omit<Application, 'id'>);
        setApplications(prev => [{ id, ...formData, userId: profile.uid } as Application, ...prev]);
        showToast('Application tracked!', 'success');
      }
      setShowAddModal(false);
      setEditingApp(null);
      setFormData(defaultApp);
    } catch (err) {
      showToast('Failed to save application.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (app: Application) => {
    if (!window.confirm(`Delete ${app.universityName} application?`)) return;
    await deleteApplication(app.id);
    setApplications(prev => prev.filter(a => a.id !== app.id));
    showToast('Application removed.', 'info');
  };

  const openEdit = (app: Application) => {
    setFormData(app);
    setEditingApp(app);
    setShowAddModal(true);
  };

  const statusCounts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = applications.filter(a => a.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Applications</h1>
          <p className="text-slate-400 text-sm mt-1">Track and manage all your university applications</p>
        </div>
        <button onClick={() => { setFormData(defaultApp); setEditingApp(null); setShowAddModal(true); }}
          className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Add Application
        </button>
      </div>

      {/* Stats Row */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
        {[
          { label: 'Total', count: applications.length, color: 'text-slate-300' },
          { label: 'Active', count: applications.filter(a => !['Accepted', 'Rejected', 'Withdrawn'].includes(a.status)).length, color: 'text-brand-400' },
          { label: 'Offers', count: applications.filter(a => ['Offer Received', 'Accepted'].includes(a.status)).length, color: 'text-emerald-400' },
          { label: 'Submitted', count: statusCounts['Submitted'] || 0, color: 'text-blue-400' },
        ].map((s, i) => (
          <div key={i} className="card px-4 py-3 flex items-center gap-3 shrink-0">
            <span className={`text-2xl font-black ${s.color}`}>{s.count}</span>
            <span className="text-xs text-slate-500">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search university, program..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-dark pl-9 text-xs"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as ApplicationStatus | 'All')}
          className="input-dark text-xs w-auto"
        >
          <option value="All">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-slate-900 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card py-16 text-center space-y-4">
          <FileText className="w-12 h-12 text-slate-700 mx-auto" />
          <div>
            <p className="text-slate-300 font-semibold">No applications yet</p>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery ? 'Try a different search.' : 'Start tracking your university applications here.'}
            </p>
          </div>
          {!searchQuery && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm mx-auto">
              <Plus className="w-4 h-4" /> Track Your First Application
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => (
            <div key={app.id} className="card p-5 hover:scale-[1.002] transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h3 className="font-bold text-white">{app.universityName}</h3>
                    <span className={`badge text-[10px] border ${STATUS_COLORS[app.status]}`}>
                      {app.status}
                    </span>
                    {app.aiAgentEnabled && (
                      <span className="badge badge-purple text-[9px]">
                        <Zap className="w-2.5 h-2.5" /> Agent Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">{app.programTitle} · {app.degreeLevel}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>📍 {app.country}</span>
                    <span>📅 {app.intakeTerm}</span>
                    <span className="text-amber-400/80">⏰ Deadline: {app.deadline}</span>
                  </div>
                  {app.notes && (
                    <p className="mt-2 text-xs text-slate-500 line-clamp-1">{app.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {app.applicationUrl && (
                    <a href={app.applicationUrl} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-slate-800 transition-all">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button onClick={() => openEdit(app)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(app)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg card p-6 space-y-5 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">
                {editingApp ? 'Edit Application' : 'Track New Application'}
              </h2>
              <button onClick={() => { setShowAddModal(false); setEditingApp(null); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">University Name *</label>
                <input className="input-dark" placeholder="e.g. Technical University of Munich"
                  value={formData.universityName || ''} onChange={e => setFormData(p => ({ ...p, universityName: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Country *</label>
                  <input className="input-dark" placeholder="e.g. Germany"
                    value={formData.country || ''} onChange={e => setFormData(p => ({ ...p, country: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Degree Level</label>
                  <select className="input-dark" value={formData.degreeLevel || 'Master'}
                    onChange={e => setFormData(p => ({ ...p, degreeLevel: e.target.value as DegreeLevel }))}>
                    {['Bachelor', 'Master', 'PhD', 'Diploma'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Program Title *</label>
                <input className="input-dark" placeholder="e.g. M.Sc. Computer Science"
                  value={formData.programTitle || ''} onChange={e => setFormData(p => ({ ...p, programTitle: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Intake Term</label>
                  <input className="input-dark" placeholder="e.g. Winter 2025"
                    value={formData.intakeTerm || ''} onChange={e => setFormData(p => ({ ...p, intakeTerm: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Application Deadline *</label>
                  <input type="date" className="input-dark"
                    value={formData.deadline || ''} onChange={e => setFormData(p => ({ ...p, deadline: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Application Portal URL</label>
                <input className="input-dark" placeholder="https://..."
                  value={formData.applicationUrl || ''} onChange={e => setFormData(p => ({ ...p, applicationUrl: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status</label>
                <select className="input-dark" value={formData.status || 'Considering'}
                  onChange={e => setFormData(p => ({ ...p, status: e.target.value as ApplicationStatus }))}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Notes</label>
                <textarea className="input-dark resize-none" rows={2}
                  placeholder="Scholarship applied, ref number, contacts..."
                  value={formData.notes || ''} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowAddModal(false); setEditingApp(null); }}
                className="btn-ghost flex-1 justify-center text-sm py-2.5">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center text-sm py-2.5">
                {saving ? 'Saving...' : <><Save className="w-4 h-4" /> {editingApp ? 'Update' : 'Add'} Application</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
