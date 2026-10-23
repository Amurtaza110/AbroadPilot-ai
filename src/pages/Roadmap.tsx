import React, { useState, useEffect } from 'react';
import {
  MapPin,
  CheckCircle2,
  Clock,
  Plus,
  RotateCcw,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Check,
  Calendar
} from 'lucide-react';
import { RoadmapTask } from '../types';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { useToast } from '../context/ToastContext';

export const Roadmap: React.FC = () => {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTask, setActiveTask] = useState<RoadmapTask | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const STAGES = [
    { num: 1, title: "Student Assessment" },
    { num: 2, title: "Destination & Budget" },
    { num: 3, title: "University Shortlist" },
    { num: 4, title: "Funding & Scholarships" },
    { num: 5, title: "Document Vault (HEC/APS)" },
    { num: 6, title: "Admission Applications" },
    { num: 7, title: "Offer Evaluations" },
    { num: 8, title: "Visa / Residence Permit" },
    { num: 9, title: "Pre-Departure & Flights" },
    { num: 10, title: "Arrival & Orientation" }
  ];

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/v1/roadmap');
      const data = await res.json();
      if (data.success && data.tasks) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('Failed to load roadmap tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleTask = async (task: RoadmapTask, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = task.status === 'completed' ? 'in_progress' : 'completed';
    try {
      const res = await fetch(`/api/v1/roadmap/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setTasks(prev => prev.map(t => t.id === task.id ? data.task : t));
        showToast(
          newStatus === 'completed' ? `Milestone cleared: ${task.title}` : `Re-opened task: ${task.title}`,
          'success'
        );
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleSaveTask = async (updatedTask: RoadmapTask) => {
    try {
      const res = await fetch(`/api/v1/roadmap/tasks/${updatedTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
      const data = await res.json();
      if (data.success) {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? data.task : t));
        showToast("Task updated successfully", "success");
      }
    } catch (err) {
      console.error('Failed to save task:', err);
    }
  };

  const handleCreateTask = async (newTaskData: any) => {
    try {
      const res = await fetch('/api/v1/roadmap/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTaskData)
      });
      const data = await res.json();
      if (data.success) {
        setTasks(prev => [...prev, data.task]);
        showToast("Custom roadmap milestone added", "success");
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleResetRoadmap = async (country: string) => {
    if (!window.confirm(`Reset roadmap tasks tailored for ${country}? (Existing completed records will be regenerated)`)) {
      return;
    }
    try {
      const res = await fetch('/api/v1/roadmap/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetCountry: country })
      });
      const data = await res.json();
      if (data.success && data.tasks) {
        setTasks(data.tasks);
        showToast(`Roadmap synchronized for ${country} requirements`, "success");
      }
    } catch (err) {
      console.error('Failed to reset roadmap:', err);
    }
  };

  // Stats
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter(t => {
    if (selectedStage !== 'all' && t.stageNumber !== selectedStage) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-teal-500 text-slate-950 font-extrabold px-2 py-0.5 rounded uppercase">
                10-Stage Journey
              </span>
              <span className="text-xs text-slate-400">Chronological Milestone Tracker</span>
            </div>
            <h1 className="text-2xl font-black mt-1">My Study Abroad Roadmap</h1>
            <p className="text-xs text-slate-300 max-w-xl">
              From academic qualification assessment in Pakistan to your first day on campus abroad. Every milestone links to persistent database records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleResetRoadmap("Germany")}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
              title="Align milestones with German embassy & APS schedule"
            >
              <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
              <span>Sync Germany (APS)</span>
            </button>
            <button
              onClick={() => handleResetRoadmap("United Kingdom")}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
              title="Align milestones with UK CAS & 28-day rule"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sync UK</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Task</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-semibold">
              Milestones Cleared: {completedCount} of {tasks.length}
            </span>
            <span className="font-extrabold text-teal-300 text-sm">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stage Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedStage('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors shrink-0 ${
            selectedStage === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Stages ({tasks.length})
        </button>

        {STAGES.map((s) => {
          const count = tasks.filter(t => t.stageNumber === s.num).length;
          const completedInStage = tasks.filter(t => t.stageNumber === s.num && t.status === 'completed').length;
          const active = selectedStage === s.num;
          return (
            <button
              key={s.num}
              onClick={() => setSelectedStage(s.num)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                active
                  ? 'bg-teal-600 text-white font-bold shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{s.num}. {s.title}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${active ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {completedInStage}/{count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Status Filter Dropdown */}
      <div className="flex items-center justify-between text-xs bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Filter Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
          >
            <option value="all">All Statuses</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked / Pending</option>
          </select>
        </div>

        <span className="text-slate-400 font-medium">
          Showing {filteredTasks.length} milestones
        </span>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No tasks in this view</h3>
          <p className="text-xs text-slate-400">Try choosing a different stage or resetting your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isDone = task.status === 'completed';
            return (
              <div
                key={task.id}
                onClick={() => setActiveTask(task)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDone
                    ? 'bg-slate-50/70 border-slate-200/80 opacity-80'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  {/* Status Toggle Button */}
                  <button
                    onClick={(e) => handleToggleTask(task, e)}
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'border-2 border-slate-300 hover:border-teal-500 bg-white'
                    }`}
                    title={isDone ? 'Mark Incomplete' : 'Mark Completed'}
                  >
                    {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        Stage {task.stageNumber}: {task.stageName}
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

                    <h3 className={`font-bold text-sm ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {task.title}
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
                      {task.description}
                    </p>

                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="flex items-center gap-2 pt-1">
                        <div className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                          {task.subtasks.filter(s => s.completed).length} of {task.subtasks.length} Subtasks Cleared
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : task.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : task.status === 'blocked'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Detail Modal */}
      {activeTask && (
        <TaskDetailModal
          task={activeTask}
          onClose={() => setActiveTask(null)}
          onSave={handleSaveTask}
        />
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <TaskDetailModal
          task={{
            id: `task-${Date.now()}`,
            userId: 'student-demo-pk-1',
            stageNumber: selectedStage === 'all' ? 1 : selectedStage,
            stageName: STAGES[(selectedStage === 'all' ? 1 : selectedStage) - 1].title,
            title: '',
            description: '',
            status: 'not_started',
            priority: 'medium',
            dueDate: new Date().toISOString().split('T')[0],
            subtasks: []
          }}
          onClose={() => setShowAddModal(false)}
          onSave={handleCreateTask}
        />
      )}
    </div>
  );
};
