import React, { useState } from 'react';
import { X, Mail, Sparkles, Copy, Check } from 'lucide-react';
import { StudentProfile } from '../types';
import { useToast } from '../context/ToastContext';

interface EmailDraftModalProps {
  profile: StudentProfile | null;
  onClose: () => void;
}

export const EmailDraftModal: React.FC<EmailDraftModalProps> = ({
  profile,
  onClose
}) => {
  const { showToast } = useToast();
  const [recipientType, setRecipientType] = useState<'professor' | 'admissions' | 'scholarship_committee'>('professor');
  const [recipientName, setRecipientName] = useState('Prof. Dr. Klaus Müller');
  const [universityName, setUniversityName] = useState('RWTH Aachen University');
  const [programTitle, setProgramTitle] = useState('M.Sc. Software Systems Engineering');
  const [subjectContext, setSubjectContext] = useState('Inquiring regarding master thesis supervision in distributed consensus protocols.');

  const [loading, setLoading] = useState(false);
  const [emailResult, setEmailResult] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/ai/email-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': profile?.id || 'student-demo-pk-1'
        },
        body: JSON.stringify({
          recipientType,
          recipientName,
          universityName,
          programTitle,
          subjectContext
        })
      });
      const data = await res.json();
      if (data.success && data.subject && data.body) {
        setEmailResult({ subject: data.subject, body: data.body });
        showToast("Email draft generated successfully", "success");
      }
    } catch (err) {
      console.error('Failed to generate email:', err);
      showToast("Error generating email draft", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (emailResult) {
      navigator.clipboard.writeText(`Subject: ${emailResult.subject}\n\n${emailResult.body}`);
      setCopied(true);
      showToast("Email copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Academic Email & Professor Inquiry Draftsman</h2>
              <p className="text-xs text-slate-400">Generate respectful, formal emails to international faculty & admissions.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <form onSubmit={handleGenerate} className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recipient Type</label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium bg-white"
                >
                  <option value="professor">Prospective Professor / Supervisor</option>
                  <option value="admissions">University Admissions Office</option>
                  <option value="scholarship_committee">Scholarship Committee</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recipient Name / Title</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Prof. Dr. Müller"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target University</label>
                <input
                  type="text"
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Program of Interest</label>
                <input
                  type="text"
                  value={programTitle}
                  onChange={(e) => setProgramTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Inquiry Context & Core Topic</label>
              <textarea
                rows={2}
                value={subjectContext}
                onChange={(e) => setSubjectContext(e.target.value)}
                placeholder="Mention specific lab paper you read, your thesis topic, or your inquiry on prerequisite waivers..."
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Synthesizing Email...' : 'Generate Academic Email'}</span>
            </button>
          </form>

          {/* Result */}
          {emailResult && (
            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-3 border border-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[10px] uppercase font-bold text-teal-400">Ready to Send</span>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">SUBJECT:</span>
                <div className="font-semibold text-teal-300 select-all">{emailResult.subject}</div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-semibold mb-1">BODY:</span>
                <div className="p-3 bg-slate-950 rounded-lg text-slate-300 leading-relaxed whitespace-pre-wrap select-all font-mono text-[11px] border border-slate-800">
                  {emailResult.body}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
