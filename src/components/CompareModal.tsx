import React from 'react';
import { X, ExternalLink, Check, DollarSign, Calendar, GraduationCap, ShieldCheck, Plus } from 'lucide-react';
import { University, convertToPkr, formatCurrencyPkr } from '../types';

interface CompareModalProps {
  selectedUniversities: University[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onApply: (uni: University) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  selectedUniversities,
  onClose,
  onRemove,
  onApply
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-teal-500/20 text-teal-300 font-semibold px-2 py-0.5 rounded border border-teal-500/30">
                Multi-Destination Comparison
              </span>
              <span className="text-xs text-slate-400">({selectedUniversities.length} of 3 Universities)</span>
            </div>
            <h2 className="text-xl font-bold mt-1">Side-by-Side University Comparison</h2>
            <p className="text-xs text-slate-400">
              Objective comparison of academic criteria, annual PKR expenses, and official source data.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-6 overflow-x-auto">
          {selectedUniversities.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">No universities selected for comparison.</p>
              <p className="text-xs text-slate-400 mt-1">Click "Compare" on any university card in Discover to add them here.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="p-3 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4 rounded-l-xl">
                    Evaluation Metric
                  </th>
                  {selectedUniversities.map((uni) => (
                    <th key={uni.id} className="p-4 bg-slate-50 text-slate-900 align-top relative">
                      <button
                        onClick={() => onRemove(uni.id)}
                        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="font-bold text-sm text-slate-900 pr-6">{uni.name}</div>
                      <div className="text-xs text-teal-700 font-medium">{uni.city}, {uni.country}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {/* Global Ranking */}
                <tr>
                  <td className="p-3 font-semibold bg-slate-50/50 text-slate-600">Global QS Ranking</td>
                  {selectedUniversities.map((u) => (
                    <td key={u.id} className="p-3 font-bold text-slate-900">
                      {u.rankingQs ? `#${u.rankingQs} World` : 'Ranked top tier nationally'}
                    </td>
                  ))}
                </tr>

                {/* Primary Degree Level */}
                <tr>
                  <td className="p-3 font-semibold bg-slate-50/50 text-slate-600">Sample Program Title</td>
                  {selectedUniversities.map((u) => (
                    <td key={u.id} className="p-3 font-medium text-slate-800">
                      {u.programs?.[0]?.title || 'Master of Science'}
                    </td>
                  ))}
                </tr>

                {/* Annual Tuition (PKR Equivalent) */}
                <tr>
                  <td className="p-3 font-semibold bg-slate-50/50 text-slate-600">Annual Tuition (PKR)</td>
                  {selectedUniversities.map((u) => {
                    const prog = u.programs?.[0];
                    if (!prog) return <td key={u.id} className="p-3">-</td>;
                    const pkr = convertToPkr(prog.tuitionAnnual, prog.tuitionCurrency);
                    return (
                      <td key={u.id} className="p-3">
                        <div className="font-bold text-slate-900 text-sm">
                          {prog.tuitionAnnual === 0 ? (
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                              Tuition-Free (0 PKR)
                            </span>
                          ) : (
                            formatCurrencyPkr(pkr)
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Native: {prog.tuitionAnnual.toLocaleString()} {prog.tuitionCurrency}/yr
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Estimated Living Cost */}
                <tr>
                  <td className="p-3 font-semibold bg-slate-50/50 text-slate-600">Est. Living Cost (Annual)</td>
                  {selectedUniversities.map((u) => {
                    const prog = u.programs?.[0];
                    if (!prog) return <td key={u.id} className="p-3">-</td>;
                    const pkr = convertToPkr(prog.estimatedLivingAnnual, prog.tuitionCurrency);
                    return (
                      <td key={u.id} className="p-3">
                        <div className="font-semibold text-slate-800">{formatCurrencyPkr(pkr)}</div>
                        <div className="text-[11px] text-slate-400">
                          {prog.estimatedLivingAnnual.toLocaleString()} {prog.tuitionCurrency} standard
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Minimum Academic Entry Req */}
                <tr>
                  <td className="p-3 font-semibold bg-slate-50/50 text-slate-600">Minimum CGPA / Scale</td>
                  {selectedUniversities.map((u) => {
                    const prog = u.programs?.[0];
                    return (
                      <td key={u.id} className="p-3 font-medium text-slate-800">
                        {prog ? `Min CGPA ${prog.minCgpa} / 4.0` : '3.0 / 4.0 standard'}
                      </td>
                    );
                  })}
                </tr>

                {/* English Language Requirements */}
                <tr>
                  <td className="p-3 font-semibold bg-slate-50/50 text-slate-600">English Language Tests</td>
                  {selectedUniversities.map((u) => (
                    <td key={u.id} className="p-3 text-[11px] leading-relaxed text-slate-600">
                      {u.englishRequirementSummary}
                    </td>
                  ))}
                </tr>

                {/* Intake Seasons */}
                <tr>
                  <td className="p-3 font-semibold bg-slate-50/50 text-slate-600">Intake Terms</td>
                  {selectedUniversities.map((u) => (
                    <td key={u.id} className="p-3 text-slate-800 font-medium">
                      {u.intakes?.join(', ') || 'Fall / Winter'}
                    </td>
                  ))}
                </tr>

                {/* Official Verification Source */}
                <tr>
                  <td className="p-3 font-semibold bg-slate-50/50 text-slate-600">Verified Source</td>
                  {selectedUniversities.map((u) => (
                    <td key={u.id} className="p-3">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{u.verificationSource}</span>
                      </div>
                      <a
                        href={u.sourceUrl || u.admissionsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-teal-600 hover:underline flex items-center gap-1 mt-1 font-semibold"
                      >
                        Official Admissions Page <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  ))}
                </tr>

                {/* Actions */}
                <tr>
                  <td className="p-3 font-semibold bg-slate-50/50 text-slate-600">Platform Action</td>
                  {selectedUniversities.map((u) => (
                    <td key={u.id} className="p-3">
                      <button
                        onClick={() => {
                          onApply(u);
                          onClose();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-sm transition-colors text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Applications</span>
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>* Exchange rates calculated live based on official interbank PKR estimates.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
