// ============================================================
// Cost Planner — AI-Powered Budget Analysis
// ============================================================
import React, { useState } from 'react';
import {
  Calculator, Sparkles, Loader2, DollarSign, Globe,
  PieChart, TrendingUp, Bot, RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { estimateCosts } from '../lib/gemini';
import { formatCurrency, USD_TO_CURRENCIES } from '../types';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'PKR', 'INR', 'BDT', 'CAD', 'AUD'] as const;
type Currency = typeof CURRENCIES[number];

interface CostData {
  tuitionAnnualUsd: number;
  livingAnnualUsd: number;
  healthInsuranceAnnualUsd: number;
  visaFeeUsd: number;
  flightUsd: number;
  miscAnnualUsd: number;
  totalFirstYearUsd: number;
  aiAnalysis: string;
}

export const CostPlanner: React.FC = () => {
  const { profile } = useAuth();
  const [country, setCountry] = useState(profile?.preferredCountries?.[0] || '');
  const [city, setCity] = useState('');
  const [program, setProgram] = useState(profile?.intendedMajors?.[0] || '');
  const [degreeLevel, setDegreeLevel] = useState<string>(profile?.targetDegree || 'Master');
  const [duration, setDuration] = useState(24);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [loading, setLoading] = useState(false);
  const [costs, setCosts] = useState<CostData | null>(null);

  const handleEstimate = async () => {
    if (!country.trim() || !program.trim()) return;
    setLoading(true);
    setCosts(null);

    const result = await estimateCosts(country, city || country, program, degreeLevel, duration);
    if (result) {
      try {
        const json = result.match(/\{[\s\S]*\}/)?.[0];
        if (json) {
          const parsed = JSON.parse(json);
          // Calculate total
          const years = duration / 12;
          parsed.totalFirstYearUsd = parsed.tuitionAnnualUsd + parsed.livingAnnualUsd +
            parsed.healthInsuranceAnnualUsd + parsed.visaFeeUsd + parsed.flightUsd + parsed.miscAnnualUsd;
          setCosts(parsed);
        }
      } catch (err) {
        console.error('Cost parse error:', err);
      }
    }
    setLoading(false);
  };

  const years = duration / 12;
  const totalProgramUsd = costs
    ? (costs.tuitionAnnualUsd + costs.livingAnnualUsd + costs.healthInsuranceAnnualUsd + costs.miscAnnualUsd) * years + costs.visaFeeUsd + costs.flightUsd
    : 0;

  const fmt = (usd: number) => formatCurrency(usd, currency);

  const budgetGap = profile?.isOnboarded && costs
    ? profile.maxTuitionBudgetUsd - costs.tuitionAnnualUsd
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-brand"><Sparkles className="w-3 h-3" /> AI Estimated</span>
        </div>
        <h1 className="text-2xl font-black text-white">Cost Planner</h1>
        <p className="text-slate-400 text-sm mt-1">AI-powered education cost estimator with live market data</p>
      </div>

      {/* Input Form */}
      <div className="card p-6 space-y-5">
        <h2 className="font-bold text-white text-sm">Program Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Destination Country *</label>
            <input className="input-dark" placeholder="e.g. Germany, UK, Canada"
              value={country} onChange={e => setCountry(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">City (optional)</label>
            <input className="input-dark" placeholder="e.g. Munich, London"
              value={city} onChange={e => setCity(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Field of Study *</label>
            <input className="input-dark" placeholder="e.g. Computer Science, MBA"
              value={program} onChange={e => setProgram(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Degree Level</label>
            <select className="input-dark" value={degreeLevel} onChange={e => setDegreeLevel(e.target.value)}>
              {['Bachelor', 'Master', 'PhD', 'Diploma'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Program Duration</label>
            <select className="input-dark" value={duration} onChange={e => setDuration(parseInt(e.target.value))}>
              {[12, 18, 24, 36, 48, 60].map(m => <option key={m} value={m}>{m / 12 === 1 ? '1 year' : `${m / 12} years`} ({m} months)</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Display Currency</label>
            <select className="input-dark" value={currency} onChange={e => setCurrency(e.target.value as Currency)}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <button onClick={handleEstimate} disabled={!country.trim() || !program.trim() || loading}
          className="btn-primary disabled:opacity-40">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Estimating...</> : <><Calculator className="w-4 h-4" /> Generate Cost Estimate</>}
        </button>
      </div>

      {/* Results */}
      {loading && !costs && (
        <div className="card p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-400 mx-auto" />
          <p className="text-sm text-slate-400">AI is researching current costs in {country}...</p>
        </div>
      )}

      {costs && (
        <div className="space-y-4 animate-slide-up">
          {/* Summary Banner */}
          <div className="card p-6 bg-gradient-to-r from-slate-900 to-brand-950/30 border-brand-500/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Estimated Total Program Cost</p>
                <p className="text-3xl font-black text-gradient">{fmt(totalProgramUsd)}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {years} year{years !== 1 ? 's' : ''} · {country}{city ? `, ${city}` : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 mb-1">First Year Total</p>
                <p className="text-2xl font-black text-white">{fmt(costs.totalFirstYearUsd)}</p>
                {budgetGap !== null && (
                  <p className={`text-xs font-semibold mt-1 ${budgetGap >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {budgetGap >= 0
                      ? `✓ Within your $${profile!.maxTuitionBudgetUsd.toLocaleString()} budget`
                      : `⚠ Exceeds budget by ${fmt(Math.abs(budgetGap))}`}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="card p-6">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-brand-400" />
              Annual Cost Breakdown (in {currency})
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Tuition Fees', value: costs.tuitionAnnualUsd, color: 'bg-brand-500', icon: '🎓' },
                { label: 'Living Expenses', value: costs.livingAnnualUsd, color: 'bg-blue-500', icon: '🏠' },
                { label: 'Health Insurance', value: costs.healthInsuranceAnnualUsd, color: 'bg-emerald-500', icon: '🏥' },
                { label: 'Miscellaneous', value: costs.miscAnnualUsd, color: 'bg-purple-500', icon: '📦' },
              ].map((item, i) => {
                const pct = costs.totalFirstYearUsd > 0
                  ? Math.round((item.value / costs.totalFirstYearUsd) * 100)
                  : 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-slate-300">{item.icon} {item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs">{pct}%</span>
                        <span className="font-bold text-white">{fmt(item.value)}/year</span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* One-time costs */}
            <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3">
              {[
                { label: '✈️ Flights (one-way)', value: costs.flightUsd },
                { label: '📋 Visa Fee', value: costs.visaFeeUsd },
              ].map((item, i) => (
                <div key={i} className="bg-slate-900 rounded-xl p-3">
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-sm font-bold text-white mt-0.5">{fmt(item.value)}</p>
                  <p className="text-[10px] text-slate-600">one-time</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis */}
          {costs.aiAnalysis && (
            <div className="card p-5 bg-brand-500/5 border-brand-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-4 h-4 text-brand-400" />
                <span className="text-sm font-bold text-white">AI Cost Analysis</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{costs.aiAnalysis}</p>
            </div>
          )}

          <button onClick={handleEstimate} className="btn-ghost text-sm w-full justify-center">
            <RefreshCw className="w-4 h-4" /> Recalculate with Updated Data
          </button>
        </div>
      )}
    </div>
  );
};
