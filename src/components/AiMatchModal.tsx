import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  DollarSign,
  GraduationCap,
  Calendar,
  Languages
} from 'lucide-react';
import { University, Program, MatchAnalysisResult, StudentProfile } from '../types';

interface AiMatchModalProps {
  university: University;
  program: Program;
  profile: StudentProfile | null;
  onClose: () => void;
  onAddToApplications: (uni: University, prog: Program) => void;
}

export const AiMatchModal: React.FC<AiMatchModalProps> = ({
  university,
  program,
  profile,
  onClose,
  onAddToApplications
}) => {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<MatchAnalysisResult | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/ai/match-explain', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': profile?.id || 'student-demo-pk-1'
          },
          body: JSON.stringify({
            universityId: university.id,
            programId: program.id
          })
        });
        const data = await res.json();
        if (isMounted && data.success && data.analysis) {
          setAnalysis(data.analysis);
        }
      } catch (err) {
        console.error('Failed to get match analysis:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAnalysis();
    return () => {
      isMounted = false;
    };
  }, [university.id, program.id, profile?.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-teal-500 text-slate-950 font-bold px-2 py-0.5 rounded uppercase">
                  AI Match Engine
                </span>
                <span className="text-xs text-slate-400">Ground Truth Evaluation</span>
              </div>
              <h2 className="text-base font-bold text-white mt-1 line-clamp-1">{program.title}</h2>
              <p className="text-xs text-slate-400">{university.name} • {university.country}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-800">
                Evaluating Academic Match & Pakistani Eligibility...
              </p>
              <p className="text-xs text-slate-400">
                Cross-referencing your CGPA ({profile?.cgpa || '3.35'}), English test scores, and PKR budget with {university.name}.
              </p>
            </div>
          ) : analysis ? (
            <>
              {/* Score Hero Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-5 border border-slate-700/60 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-slate-950 border-4 border-teal-400 text-2xl font-black text-teal-300">
                    {analysis.matchScore}%
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Evaluation Verdict</div>
                    <div className="text-lg font-bold text-white">{analysis.verdict}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Based on profile of <span className="text-slate-200 font-medium">{profile?.fullName}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onAddToApplications(university, program);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-500/20 transition-all hover:scale-[1.02]"
                >
                  <span>Add to Application Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* 4 Factor Breakdown */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Score Factor Breakdown
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="font-semibold">Academic Fit</span>
                    </div>
                    <div className="text-lg font-bold text-slate-900">{analysis.factors.academicFitScore}%</div>
                    <div className="text-[10px] text-slate-500">Min CGPA {program.minCgpa} vs You {profile?.cgpa}</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-semibold">Affordability</span>
                    </div>
                    <div className="text-lg font-bold text-slate-900">{analysis.factors.budgetAffordabilityScore}%</div>
                    <div className="text-[10px] text-slate-500">{program.tuitionAnnual === 0 ? 'Zero Tuition' : `${program.tuitionAnnual} ${program.tuitionCurrency}`}</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                      <Languages className="w-3.5 h-3.5 text-amber-600" />
                      <span className="font-semibold">Language Fit</span>
                    </div>
                    <div className="text-lg font-bold text-slate-900">{analysis.factors.languageFitScore}%</div>
                    <div className="text-[10px] text-slate-500">IELTS {program.ieltsScore} Required</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      <span className="font-semibold">Intake Timing</span>
                    </div>
                    <div className="text-lg font-bold text-slate-900">{analysis.factors.intakeTimingScore}%</div>
                    <div className="text-[10px] text-slate-500">{program.intakeTerm}</div>
                  </div>
                </div>
              </div>

              {/* Strengths */}
              {analysis.strengths && analysis.strengths.length > 0 && (
                <div className="p-4 bg-teal-50/60 border border-teal-200/80 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Candidate Strengths</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-teal-950">
                    {analysis.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-teal-600 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pakistan Specific Guidance */}
              {analysis.pakistanSpecificGuidance && analysis.pakistanSpecificGuidance.length > 0 && (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Pakistan Regulatory & Visa Guidance</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-emerald-950">
                    {analysis.pakistanSpecificGuidance.map((g, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actionable Next Steps */}
              {analysis.actionableNextSteps && analysis.actionableNextSteps.length > 0 && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <TrendingUp className="w-4 h-4 text-slate-700" />
                    <span>Recommended Next Steps</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {analysis.actionableNextSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-slate-400 font-bold">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6 text-xs text-slate-500">
              Could not load analysis details.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verified Against Official University Dataset
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
