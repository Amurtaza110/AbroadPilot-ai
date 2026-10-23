import React, { useState } from 'react';
import { X, Sparkles, Copy, Check, ShieldCheck, FileText, Download } from 'lucide-react';
import { StudentProfile } from '../types';
import { useToast } from '../context/ToastContext';

interface SopAssistantModalProps {
  profile: StudentProfile | null;
  onClose: () => void;
  onSaveToVault?: (title: string, content: string) => void;
}

export const SopAssistantModal: React.FC<SopAssistantModalProps> = ({
  profile,
  onClose,
  onSaveToVault
}) => {
  const { showToast } = useToast();
  const [universityName, setUniversityName] = useState('Technical University of Munich');
  const [programTitle, setProgramTitle] = useState('M.Sc. Informatics / Computer Science');
  const [country, setCountry] = useState('Germany');
  const [targetFocus, setTargetFocus] = useState<'draft' | 'improve' | 'critique'>('draft');
  const [userNotes, setUserNotes] = useState('');
  const [existingDraft, setExistingDraft] = useState('');

  const [loading, setLoading] = useState(false);
  const [sopResult, setSopResult] = useState<{
    content: string;
    wordCount: number;
    structureBreakdown: { section: string; advice: string }[];
    academicIntegrityAffirmation: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/ai/sop-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': profile?.id || 'student-demo-pk-1'
        },
        body: JSON.stringify({
          universityName,
          programTitle,
          country,
          targetFocus,
          userNotes,
          existingDraft
        })
      });
      const data = await res.json();
      if (data.success && data.content) {
        setSopResult({
          content: data.content,
          wordCount: data.wordCount,
          structureBreakdown: data.structureBreakdown || [],
          academicIntegrityAffirmation: data.academicIntegrityAffirmation
        });
        showToast("SOP generated with academic integrity validation", "success");
      }
    } catch (err) {
      console.error('Failed to generate SOP:', err);
      showToast("Connection issue with AI assistant. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (sopResult?.content) {
      navigator.clipboard.writeText(sopResult.content);
      setCopied(true);
      showToast("Copied SOP to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveToDocuments = () => {
    if (sopResult?.content && onSaveToVault) {
      onSaveToVault(`SOP_${universityName.replace(/\s+/g, '_')}.txt`, sopResult.content);
      showToast("Saved SOP draft into your Document Vault", "success");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-teal-500 text-slate-950 font-bold px-2 py-0.5 rounded uppercase">
                  Academic Integrity Guard
                </span>
                <span className="text-xs text-slate-400">Statement of Purpose Architect</span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">AI SOP & Motivation Letter Assistant</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 max-h-[78vh] overflow-y-auto">
          {/* Left Form: 5 cols */}
          <form onSubmit={handleGenerate} className="p-5 space-y-3.5 md:col-span-5 text-xs bg-slate-50/60">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target University *</label>
              <input
                type="text"
                required
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                placeholder="e.g. Technical University of Munich"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Program Title *</label>
                <input
                  type="text"
                  required
                  value={programTitle}
                  onChange={(e) => setProgramTitle(e.target.value)}
                  placeholder="M.Sc. Informatics"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Country *</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Germany"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">AI Objective</label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-white rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setTargetFocus('draft')}
                  className={`py-1.5 rounded-lg font-semibold text-[11px] transition-colors ${
                    targetFocus === 'draft' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Generate
                </button>
                <button
                  type="button"
                  onClick={() => setTargetFocus('improve')}
                  className={`py-1.5 rounded-lg font-semibold text-[11px] transition-colors ${
                    targetFocus === 'improve' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Polish Draft
                </button>
                <button
                  type="button"
                  onClick={() => setTargetFocus('critique')}
                  className={`py-1.5 rounded-lg font-semibold text-[11px] transition-colors ${
                    targetFocus === 'critique' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Audit Flow
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Your Authentic Projects, Research & Notes
              </label>
              <textarea
                rows={4}
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Mention your Bachelor Final Year Project (FYP), specific lab courses, professors you admire, and real reasons for choosing this university..."
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium bg-white leading-relaxed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Rule: AbroadPilot AI never fabricates fake jobs or experiences.
              </span>
            </div>

            {targetFocus !== 'draft' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Existing Draft</label>
                <textarea
                  rows={4}
                  value={existingDraft}
                  onChange={(e) => setExistingDraft(e.target.value)}
                  placeholder="Paste your existing paragraphs here for refinement..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium bg-white"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Synthesizing Statement...' : 'Generate Academic SOP'}</span>
            </button>
          </form>

          {/* Right Preview: 7 cols */}
          <div className="p-6 md:col-span-7 flex flex-col justify-between space-y-4">
            {loading ? (
              <div className="text-center py-24 space-y-3">
                <div className="w-8 h-8 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto" />
                <p className="font-semibold text-slate-800 text-sm">Structuring Paragraphs & Argumentation...</p>
                <p className="text-xs text-slate-400">Verifying logical alignment with {universityName} curriculum.</p>
              </div>
            ) : sopResult ? (
              <>
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">Statement of Purpose Draft</span>
                      <span className="text-[10px] text-slate-500 block">
                        Estimated {sopResult.wordCount} words • Program Specific
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>

                      {onSaveToVault && (
                        <button
                          onClick={handleSaveToDocuments}
                          className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Save to Vault</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* SOP Text Output Box */}
                  <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl max-h-80 overflow-y-auto text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-serif">
                    {sopResult.content}
                  </div>

                  {/* Structure Breakdown */}
                  {sopResult.structureBreakdown && sopResult.structureBreakdown.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Structural Breakdown:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        {sopResult.structureBreakdown.map((item, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-teal-50/50 border border-teal-100">
                            <span className="font-bold text-teal-900 block">{item.section}</span>
                            <span className="text-slate-600 mt-0.5 block leading-normal">{item.advice}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Academic Integrity Footer */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Academic Integrity Safeguard: </span>
                    {sopResult.academicIntegrityAffirmation}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-slate-400 space-y-2">
                <FileText className="w-12 h-12 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-700 text-sm">Your Generated SOP will appear here.</p>
                <p className="text-xs max-w-sm mx-auto text-slate-400">
                  Select your program and outline your authentic undergraduate projects to generate a personalized statement.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
