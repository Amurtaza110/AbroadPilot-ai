import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  ExternalLink,
  Calendar,
  Clock,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Edit2,
  LayoutGrid,
  ListFilter
} from 'lucide-react';
import { Application, formatCurrencyPkr } from '../types';
import { ApplicationModal } from '../components/ApplicationModal';
import { useToast } from '../context/ToastContext';

export const Applications: React.FC = () => {
  const { showToast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/v1/applications');
      const data = await res.json();
      if (data.success && data.applications) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleSaveApp = async (appData: Partial<Application>) => {
    try {
      const res = await fetch('/api/v1/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appData)
      });
      const data = await res.json();
      if (data.success) {
        setApplications(prev => {
          const idx = prev.findIndex(a => a.id === data.application.id);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = data.application;
            return copy;
          }
          return [data.application, ...prev];
        });
        showToast(`Saved application for ${data.application.universityName}`, 'success');
      }
    } catch (err) {
      console.error('Failed to save application:', err);
    }
  };

  const handleDeleteApp = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Remove this application record from your tracker?")) return;
    try {
      const res = await fetch(`/api/v1/applications/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setApplications(prev => prev.filter(a => a.id !== id));
        showToast("Application record removed", "info");
      }
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };

  // Group into Kanban Lanes
  const LANES = [
    {
      id: 'planning',
      title: 'Planning & Shortlisted',
      statuses: ['Considering', 'Shortlisted']
    },
    {
      id: 'preparing',
      title: 'Preparing & Review',
      statuses: ['Preparing', 'Ready to submit']
    },
    {
      id: 'submitted',
      title: 'Submitted to Portal',
      statuses: ['Submitted', 'Under review', 'Additional information requested']
    },
    {
      id: 'decisions',
      title: 'Interviews & Offers',
      statuses: ['Interview stage', 'Offer received', 'Waitlisted', 'Rejected']
    },
    {
      id: 'enrolled',
      title: 'Final Acceptance',
      statuses: ['Accepted', 'Enrollment confirmed', 'Withdrawn']
    }
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded uppercase">
              Application Tracker
            </span>
            <span className="text-xs text-slate-500 font-medium">{applications.length} Universities Logged</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Application Management Workspace
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track references, portal submission receipts, deadlines, and offer letters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                viewMode === 'board' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add University</span>
          </button>
        </div>
      </div>

      {/* Main View */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No university applications currently recorded</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You can add an application from the Discover page or click "Add University" above to track portals manually.
          </p>
        </div>
      ) : viewMode === 'board' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
          {LANES.map((lane) => {
            const laneApps = applications.filter(a => lane.statuses.includes(a.status));
            return (
              <div
                key={lane.id}
                className="bg-slate-100/80 p-3 rounded-2xl border border-slate-200/80 space-y-3 min-w-[240px]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
                  <span className="font-bold text-slate-800">{lane.title}</span>
                  <span className="text-[10px] font-extrabold bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                    {laneApps.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {laneApps.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => setEditingApp(app)}
                      className="p-3 bg-white rounded-xl border border-slate-200 hover:border-teal-400 shadow-2xs hover:shadow-sm transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                            {app.country}
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs mt-1 line-clamp-1">{app.universityName}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{app.programTitle}</p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteApp(app.id, e)}
                          className="p-1 text-slate-300 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {app.deadline}
                        </span>
                        <span className="font-semibold text-slate-700">{app.status}</span>
                      </div>

                      {app.applicationRefNo && (
                        <div className="text-[10px] font-mono text-slate-500 bg-slate-50 p-1 rounded border border-slate-100 truncate">
                          Ref: {app.applicationRefNo}
                        </div>
                      )}

                      {app.portalUrl && app.portalUrl !== 'https://' && (
                        <a
                          href={app.portalUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] text-teal-600 hover:underline flex items-center gap-1 font-semibold pt-0.5"
                        >
                          Open University Portal <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}

                  {laneApps.length === 0 && (
                    <div className="text-center py-6 text-[11px] text-slate-400 italic">
                      No applications
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Table View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="p-3.5">University & Country</th>
                <th className="p-3.5">Program & Level</th>
                <th className="p-3.5">Intake / Deadline</th>
                <th className="p-3.5">Reference #</th>
                <th className="p-3.5">Application Fee</th>
                <th className="p-3.5">Status Phase</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{app.universityName}</div>
                    <div className="text-[11px] text-teal-700">{app.country}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-medium text-slate-900">{app.programTitle}</div>
                    <div className="text-[11px] text-slate-400">{app.degreeLevel}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-800">{app.intakeTerm}</div>
                    <div className="text-[11px] text-slate-400">Due: {app.deadline}</div>
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-600">
                    {app.applicationRefNo || '—'}
                  </td>
                  <td className="p-3.5 font-semibold text-slate-800">
                    {app.feePkr ? formatCurrencyPkr(app.feePkr) : '0 PKR'}
                  </td>
                  <td className="p-3.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                      {app.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => setEditingApp(app)}
                      className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-lg"
                      title="Edit application"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteApp(app.id, e)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg"
                      title="Delete application"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / Create Modal */}
      {(editingApp || showAddModal) && (
        <ApplicationModal
          initialData={editingApp || undefined}
          onClose={() => {
            setEditingApp(null);
            setShowAddModal(false);
          }}
          onSave={handleSaveApp}
        />
      )}
    </div>
  );
};
