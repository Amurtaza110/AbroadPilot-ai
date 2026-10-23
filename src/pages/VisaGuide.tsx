import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  DollarSign,
  Clock,
  Building2,
  FileCheck2,
  HelpCircle,
  Check
} from 'lucide-react';
import { VisaTemplate, formatCurrencyPkr } from '../types';

export const VisaGuide: React.FC = () => {
  const [templates, setTemplates] = useState<VisaTemplate[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('DE');
  const [loading, setLoading] = useState(true);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch('/api/v1/visa-templates');
        const data = await res.json();
        if (data.success && data.templates) {
          setTemplates(data.templates);
        }
      } catch (err) {
        console.error('Failed to load visa templates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const currentTemplate = templates.find(t => t.countryCode.toLowerCase() === selectedCountryCode.toLowerCase()) || templates[0];

  const handleToggleCheck = (itemId: string) => {
    setCompletedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const clearedItems = currentTemplate?.keyChecklistItems?.filter(i => completedItems[i.id]).length || 0;
  const totalItems = currentTemplate?.keyChecklistItems?.length || 1;
  const checklistPercent = Math.round((clearedItems / totalItems) * 100);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase">
              Embassy Guidelines
            </span>
            <span className="text-xs text-slate-500 font-medium">Pakistani Passport Applicant Protocols</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Destination Visa Preparation Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified financial proofs, attestation pipelines (HEC/IBCC), and consular interview strategies.
          </p>
        </div>
      </div>

      {/* Country Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {templates.map((tpl) => (
          <button
            key={tpl.countryCode}
            onClick={() => setSelectedCountryCode(tpl.countryCode)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              selectedCountryCode === tpl.countryCode
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tpl.countryName}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${selectedCountryCode === tpl.countryCode ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-500'}`}>
              {tpl.visaType.split('(')[0]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : currentTemplate ? (
        <div className="space-y-6">
          {/* Top Country Visa Summary Hero */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-teal-400 font-bold uppercase tracking-wider">
                    {currentTemplate.immigrationAuthority}
                  </span>
                  <span>•</span>
                  <span className="text-xs text-slate-400">Verified: {currentTemplate.lastVerified}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black">{currentTemplate.countryName}: {currentTemplate.visaType}</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Mission in Pakistan: <strong className="text-white">{currentTemplate.embassyInPakistan}</strong>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href={currentTemplate.officialPortalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Official Embassy Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Min. Financial Proof:</span>
                <span className="font-extrabold text-teal-300 text-sm">
                  {formatCurrencyPkr(currentTemplate.financialRequirementEstimatedPkr)}
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Avg. Decision Window:</span>
                <span className="font-bold text-white text-sm">
                  {currentTemplate.avgProcessingWeeks} Weeks
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Consular Interview:</span>
                <span className="font-bold text-white text-sm">
                  {currentTemplate.interviewRequired ? 'Mandatory In-Person' : 'Random / Waived'}
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">HEC Attestation:</span>
                <span className="font-bold text-white text-sm">
                  {currentTemplate.hecAttestationRequired ? 'Mandatory Prior' : 'Recommended'}
                </span>
              </div>
            </div>
          </div>

          {/* Pakistan Specific Notice Card */}
          {currentTemplate.pakistanSpecificNotes && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm block mb-1">Crucial Directive for Pakistani Applicants:</span>
                <p className="leading-relaxed">{currentTemplate.pakistanSpecificNotes}</p>
              </div>
            </div>
          )}

          {/* Two Column: Interactive Checklist & Financial Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Checklist: 7 cols */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Personalized Visa Dossier Checklist</h3>
                  <p className="text-xs text-slate-400">
                    Tick off each verified document as you prepare for your embassy appointment.
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-black text-teal-700 text-sm">{checklistPercent}%</span>
                  <span className="text-[10px] text-slate-400 block">{clearedItems}/{totalItems} Prepared</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {currentTemplate.keyChecklistItems?.map((item) => {
                  const checked = !!completedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleCheck(item.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        checked
                          ? 'bg-teal-50/50 border-teal-200/80 text-teal-950'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <button
                        type="button"
                        className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                          checked
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'border-2 border-slate-300 bg-white'
                        }`}
                      >
                        {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${checked ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {item.title}
                          </span>
                          <span className="text-[9px] font-bold uppercase bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Requirements Details: 5 cols */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <DollarSign className="w-4 h-4 text-teal-600" />
                  <h3 className="font-bold text-slate-900 text-base">Financial Guarantee Rules</h3>
                </div>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>{currentTemplate.financialRequirementDesc}</p>

                  {currentTemplate.blockedAccountRequired && (
                    <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl space-y-1">
                      <span className="font-bold text-teal-900 block">Blocked Account (Sperrkonto):</span>
                      <p className="text-teal-950 text-[11px]">
                        Approved providers for Pakistani residents include <strong>{currentTemplate.blockedAccountProvider}</strong>. Transfer can be sent via authorized Pakistani forex bank remittance (State Bank Form A2).
                      </p>
                    </div>
                  )}

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-800 block">Appointment System Note:</span>
                    <p className="text-slate-600 text-[11px] leading-normal">
                      {currentTemplate.appointmentSystem}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
