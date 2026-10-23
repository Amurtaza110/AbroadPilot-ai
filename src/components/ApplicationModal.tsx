import React, { useState } from 'react';
import { X, FileText, CheckCircle2 } from 'lucide-react';
import { Application } from '../types';

interface ApplicationModalProps {
  initialData?: Partial<Application>;
  onClose: () => void;
  onSave: (app: Partial<Application>) => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  initialData,
  onClose,
  onSave
}) => {
  const [universityName, setUniversityName] = useState(initialData?.universityName || '');
  const [country, setCountry] = useState(initialData?.country || 'Germany');
  const [programTitle, setProgramTitle] = useState(initialData?.programTitle || '');
  const [degreeLevel, setDegreeLevel] = useState(initialData?.degreeLevel || 'Master');
  const [intakeTerm, setIntakeTerm] = useState(initialData?.intakeTerm || 'Winter 2026');
  const [deadline, setDeadline] = useState(initialData?.deadline || '2026-05-31');
  const [portalUrl, setPortalUrl] = useState(initialData?.portalUrl || 'https://');
  const [applicationRefNo, setApplicationRefNo] = useState(initialData?.applicationRefNo || '');
  const [status, setStatus] = useState<Application['status']>(initialData?.status || 'Preparing');
  const [feePkr, setFeePkr] = useState<number>(initialData?.feePkr || 0);
  const [scholarshipApplied, setScholarshipApplied] = useState(initialData?.scholarshipApplied || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const statuses: Application['status'][] = [
    'Considering',
    'Shortlisted',
    'Preparing',
    'Ready to submit',
    'Submitted',
    'Under review',
    'Additional information requested',
    'Interview stage',
    'Offer received',
    'Waitlisted',
    'Rejected',
    'Withdrawn',
    'Accepted',
    'Enrollment confirmed'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id,
      universityId: initialData?.universityId || `uni-custom-${Date.now()}`,
      universityName,
      country,
      programTitle,
      degreeLevel,
      intakeTerm,
      deadline,
      portalUrl,
      applicationRefNo,
      status,
      feePkr,
      scholarshipApplied,
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {initialData?.id ? 'Edit Application Details' : 'Track New University Application'}
              </h2>
              <p className="text-xs text-slate-400">Keep admissions references and deadlines synchronized.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">University Name *</label>
              <input
                type="text"
                required
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                placeholder="e.g. Technical University of Munich"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Destination Country *</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium bg-white"
              >
                <option value="Germany">Germany</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
                <option value="Italy">Italy</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Turkey">Turkey</option>
                <option value="Sweden">Sweden</option>
                <option value="Netherlands">Netherlands</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Program Title *</label>
              <input
                type="text"
                required
                value={programTitle}
                onChange={(e) => setProgramTitle(e.target.value)}
                placeholder="e.g. M.Sc. Data Engineering"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Degree Level *</label>
              <select
                value={degreeLevel}
                onChange={(e) => setDegreeLevel(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium bg-white"
              >
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
                <option value="PhD">PhD</option>
                <option value="Diploma">Diploma / Foundation</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Intake Term</label>
              <input
                type="text"
                value={intakeTerm}
                onChange={(e) => setIntakeTerm(e.target.value)}
                placeholder="Winter 2026"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Deadline Date *</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Application Fee (PKR)</label>
              <input
                type="number"
                value={feePkr}
                onChange={(e) => setFeePkr(parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Phase *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Application['status'])}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-bold text-slate-900 bg-white"
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Portal Reference #</label>
              <input
                type="text"
                value={applicationRefNo}
                onChange={(e) => setApplicationRefNo(e.target.value)}
                placeholder="e.g. TUM-2026-991"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Official Portal Link</label>
            <input
              type="url"
              value={portalUrl}
              onChange={(e) => setPortalUrl(e.target.value)}
              placeholder="https://campus.tum.de"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium text-teal-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Associated Scholarship (if any)</label>
            <input
              type="text"
              value={scholarshipApplied}
              onChange={(e) => setScholarshipApplied(e.target.value)}
              placeholder="e.g. DAAD EPOS, DSU Regional, or University Merit Waiver"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Personal Notes & Checklist</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Awaiting APS certificate issuance from Islamabad to upload on portal..."
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-500/20 transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Application</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
