import React, { useState } from 'react';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Plane,
  Home,
  Utensils,
  BookOpen,
  FileText,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrencyPkr, convertToPkr } from '../types';

export const CostPlanner: React.FC = () => {
  const { user } = useAuth();

  const [country, setCountry] = useState<'Germany' | 'UK' | 'USA' | 'Italy' | 'Turkey'>('Germany');
  const [tuitionAnnualNative, setTuitionAnnualNative] = useState<number>(3000);
  const [tuitionCurrency, setTuitionCurrency] = useState<'EUR' | 'GBP' | 'USD'>('EUR');
  const [livingAnnualNative, setLivingAnnualNative] = useState<number>(11208);

  // Upfront Pakistani pre-departure expenses in PKR
  const [flightTicketPkr, setFlightTicketPkr] = useState<number>(250000);
  const [visaFeePkr, setVisaFeePkr] = useState<number>(35000);
  const [ieltsFeePkr, setIeltsFeePkr] = useState<number>(65000);
  const [hecAttestationPkr, setHecAttestationPkr] = useState<number>(20000);
  const [initialSettlementPkr, setInitialSettlementPkr] = useState<number>(300000);

  // Currency rates to PKR
  const [eurRate, setEurRate] = useState<number>(310);
  const [gbpRate, setGbpRate] = useState<number>(365);
  const [usdRate, setUsdRate] = useState<number>(280);

  const handleCountryPreset = (selected: 'Germany' | 'UK' | 'USA' | 'Italy' | 'Turkey') => {
    setCountry(selected);
    if (selected === 'Germany') {
      setTuitionAnnualNative(0); // Public tuition free
      setTuitionCurrency('EUR');
      setLivingAnnualNative(11208); // Blocked account standard
      setFlightTicketPkr(240000);
      setVisaFeePkr(32000);
    } else if (selected === 'UK') {
      setTuitionAnnualNative(18000);
      setTuitionCurrency('GBP');
      setLivingAnnualNative(11000);
      setFlightTicketPkr(220000);
      setVisaFeePkr(175000); // Visa + IHS
    } else if (selected === 'USA') {
      setTuitionAnnualNative(22000);
      setTuitionCurrency('USD');
      setLivingAnnualNative(12000);
      setFlightTicketPkr(350000);
      setVisaFeePkr(150000); // MRV + SEVIS
    } else if (selected === 'Italy') {
      setTuitionAnnualNative(1000);
      setTuitionCurrency('EUR');
      setLivingAnnualNative(7000);
      setFlightTicketPkr(230000);
      setVisaFeePkr(35000);
    } else if (selected === 'Turkey') {
      setTuitionAnnualNative(1500);
      setTuitionCurrency('USD');
      setLivingAnnualNative(4500);
      setFlightTicketPkr(150000);
      setVisaFeePkr(40000);
    }
  };

  const activeRate = tuitionCurrency === 'EUR' ? eurRate : tuitionCurrency === 'GBP' ? gbpRate : usdRate;

  const tuitionTotalPkr = Math.round(tuitionAnnualNative * activeRate);
  const livingTotalPkr = Math.round(livingAnnualNative * activeRate);
  const upfrontPrepTotalPkr = flightTicketPkr + visaFeePkr + ieltsFeePkr + hecAttestationPkr + initialSettlementPkr;
  const firstYearGrandTotalPkr = tuitionTotalPkr + livingTotalPkr + upfrontPrepTotalPkr;

  const userBudget = user?.maxTuitionBudgetPkr || 2500000;
  const budgetDifference = userBudget - tuitionTotalPkr;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded uppercase">
            Financial Architecture
          </span>
          <span className="text-xs text-slate-500 font-medium">PKR Interbank Calibrated</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
          Study Abroad Cost & Currency Planner
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Accurate estimation of tuition, mandatory blocked accounts, living maintenance, and pre-departure Pakistan costs.
        </p>
      </div>

      {/* Preset Country Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['Germany', 'UK', 'USA', 'Italy', 'Turkey'] as const).map((c) => (
          <button
            key={c}
            onClick={() => handleCountryPreset(c)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              country === c
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {c} Preset
          </button>
        ))}
      </div>

      {/* Hero Grand Total Box */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="text-xs text-teal-400 font-bold uppercase tracking-wider block">
              Estimated 1st-Year Financial Requirement
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white mt-1">
              {formatCurrencyPkr(firstYearGrandTotalPkr)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Includes tuition ({tuitionAnnualNative.toLocaleString()} {tuitionCurrency}) + living + pre-departure travel & visas.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Your Registered Tuition Budget</span>
              <span className="font-bold text-white text-sm">{formatCurrencyPkr(userBudget)}</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Tuition Feasibility</span>
              <span className={`font-bold text-sm ${budgetDifference >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                {budgetDifference >= 0 ? `Under Budget (+${formatCurrencyPkr(budgetDifference)})` : `Deficit (-${formatCurrencyPkr(Math.abs(budgetDifference))})`}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Component Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-xs">
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block">1. Annual University Tuition</span>
            <span className="font-bold text-lg text-white mt-1 block">
              {tuitionTotalPkr === 0 ? '0 PKR (Tuition-Free)' : formatCurrencyPkr(tuitionTotalPkr)}
            </span>
            <span className="text-[10px] text-slate-500">
              {tuitionAnnualNative.toLocaleString()} {tuitionCurrency} at {activeRate} PKR/{tuitionCurrency}
            </span>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block">2. Living & Blocked Account</span>
            <span className="font-bold text-lg text-teal-300 mt-1 block">
              {formatCurrencyPkr(livingTotalPkr)}
            </span>
            <span className="text-[10px] text-slate-500">
              {livingAnnualNative.toLocaleString()} {tuitionCurrency} annual baseline
            </span>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block">3. Upfront Pre-Departure</span>
            <span className="font-bold text-lg text-amber-300 mt-1 block">
              {formatCurrencyPkr(upfrontPrepTotalPkr)}
            </span>
            <span className="text-[10px] text-slate-500">
              Flights, Visa, HEC, IELTS, Initial Settlement
            </span>
          </div>
        </div>
      </div>

      {/* Detail Form Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Overseas Tuition & Living (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Overseas Institutional Costs</h3>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
              Native Currency
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Annual University Tuition ({tuitionCurrency})
            </label>
            <input
              type="number"
              value={tuitionAnnualNative}
              onChange={(e) => setTuitionAnnualNative(parseInt(e.target.value, 10) || 0)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Annual Living Expenses / Blocked Account ({tuitionCurrency})
            </label>
            <input
              type="number"
              value={livingAnnualNative}
              onChange={(e) => setLivingAnnualNative(parseInt(e.target.value, 10) || 0)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
            />
          </div>

          {/* Exchange Rates Config */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="font-bold text-slate-700 block">Configured Conversion Rates (PKR)</span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block">1 EUR:</span>
                <input
                  type="number"
                  value={eurRate}
                  onChange={(e) => setEurRate(parseInt(e.target.value, 10) || 310)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">1 GBP:</span>
                <input
                  type="number"
                  value={gbpRate}
                  onChange={(e) => setGbpRate(parseInt(e.target.value, 10) || 365)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">1 USD:</span>
                <input
                  type="number"
                  value={usdRate}
                  onChange={(e) => setUsdRate(parseInt(e.target.value, 10) || 280)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Pakistani Pre-Departure Logistics (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Pakistan Pre-Departure Outlay (PKR)</h3>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Direct PKR
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">One-Way Flight Ticket</label>
              <input
                type="number"
                value={flightTicketPkr}
                onChange={(e) => setFlightTicketPkr(parseInt(e.target.value, 10) || 0)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Visa & Biometrics Fee</label>
              <input
                type="number"
                value={visaFeePkr}
                onChange={(e) => setVisaFeePkr(parseInt(e.target.value, 10) || 0)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">IELTS / TOEFL Exam</label>
              <input
                type="number"
                value={ieltsFeePkr}
                onChange={(e) => setIeltsFeePkr(parseInt(e.target.value, 10) || 0)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">HEC / IBCC / APS Fee</label>
              <input
                type="number"
                value={hecAttestationPkr}
                onChange={(e) => setHecAttestationPkr(parseInt(e.target.value, 10) || 0)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Initial Arrival & Cash Reserve (PKR)</label>
            <input
              type="number"
              value={initialSettlementPkr}
              onChange={(e) => setInitialSettlementPkr(parseInt(e.target.value, 10) || 0)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              For security deposit, first month groceries, and winter gear upon landing.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
