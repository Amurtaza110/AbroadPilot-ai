import React, { useState } from 'react';
import {
  Bookmark,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Scale,
  Plus,
  Check,
  Calendar,
  Languages,
  DollarSign,
  GraduationCap
} from 'lucide-react';
import { University, Program, StudentProfile, convertToPkr, formatCurrencyPkr } from '../types';

interface UniversityCardProps {
  university: University;
  profile: StudentProfile | null;
  isSaved: boolean;
  isCompared: boolean;
  onToggleSave: (id: string) => void;
  onToggleCompare: (uni: University) => void;
  onOpenAiMatch: (uni: University, prog: Program) => void;
  onAddToApplications: (uni: University, prog: Program) => void;
}

export const UniversityCard: React.FC<UniversityCardProps> = ({
  university,
  profile,
  isSaved,
  isCompared,
  onToggleSave,
  onToggleCompare,
  onOpenAiMatch,
  onAddToApplications
}) => {
  const [selectedProgramIndex, setSelectedProgramIndex] = useState(0);
  const programs = university.programs || [];
  const currentProgram = programs[selectedProgramIndex] || programs[0];

  // Quick client-side score approximation for badge
  const calculateMatch = (prog?: Program): number => {
    if (!prog || !profile) return 80;
    let score = 70;
    if (profile.cgpa >= prog.minCgpa) {
      score += 15;
    } else {
      score -= 15;
    }
    if (profile.ieltsScore && profile.ieltsScore >= prog.ieltsScore) {
      score += 10;
    }
    const pkr = convertToPkr(prog.tuitionAnnual, prog.tuitionCurrency);
    if (profile.maxTuitionBudgetPkr >= pkr) {
      score += 5;
    }
    return Math.min(99, Math.max(45, score));
  };

  const matchScore = calculateMatch(currentProgram);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Banner image or fallback with badges */}
        <div className="relative h-36 bg-slate-900 overflow-hidden">
          <img
            src={university.bannerImage}
            alt={university.name}
            className="w-full h-full object-cover opacity-60"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-700/60 shadow">
              <span>{university.country}</span>
              <span>•</span>
              <span className="text-teal-400">{university.city}</span>
            </div>

            <button
              onClick={() => onToggleSave(university.id)}
              className={`p-2 rounded-xl backdrop-blur-md transition-colors ${
                isSaved
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
              title={isSaved ? "Saved to Favorites" : "Save to Favorites"}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Ranking & Match Score floating over banner bottom */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {university.rankingQs && (
                <span className="text-[10px] font-extrabold bg-amber-400 text-slate-950 px-2 py-0.5 rounded shadow">
                  QS #{university.rankingQs}
                </span>
              )}
              {university.popularForPakistaniStudents && (
                <span className="text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded shadow">
                  Top Choice PK
                </span>
              )}
            </div>

            {currentProgram && (
              <button
                onClick={() => onOpenAiMatch(university, currentProgram)}
                className="flex items-center gap-1 text-[11px] font-bold bg-teal-500/95 hover:bg-teal-400 text-slate-950 px-2.5 py-1 rounded-lg shadow transition-all hover:scale-105"
              >
                <Sparkles className="w-3 h-3" />
                <span>{matchScore}% Match</span>
              </button>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3.5">
          <div>
            <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1 hover:text-teal-700 transition-colors">
              {university.name}
            </h3>
            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
              {university.description}
            </p>
          </div>

          {/* Program Selector if multiple programs */}
          {programs.length > 0 && (
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold uppercase">
                <span>Featured Program</span>
                {programs.length > 1 && (
                  <span>{programs.length} Available</span>
                )}
              </div>

              {programs.length > 1 ? (
                <select
                  value={selectedProgramIndex}
                  onChange={(e) => setSelectedProgramIndex(parseInt(e.target.value, 10))}
                  className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:border-teal-500"
                >
                  {programs.map((p, idx) => (
                    <option key={p.id} value={idx}>
                      {p.degreeLevel}: {p.title}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="font-semibold text-xs text-slate-800 line-clamp-1">
                  {currentProgram.degreeLevel}: {currentProgram.title}
                </div>
              )}

              {/* Financial Quick Glance */}
              {currentProgram && (
                <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Est. Annual Tuition:</span>
                    <span className="font-bold text-slate-900">
                      {currentProgram.tuitionAnnual === 0 ? (
                        <span className="text-emerald-600 font-bold">Tuition-Free (0 PKR)</span>
                      ) : (
                        formatCurrencyPkr(convertToPkr(currentProgram.tuitionAnnual, currentProgram.tuitionCurrency))
                      )}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Min Academic Req:</span>
                    <span className="font-semibold text-slate-700">
                      CGPA {currentProgram.minCgpa} • IELTS {currentProgram.ieltsScore}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Verification Badge */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Source
            </span>
            <a
              href={university.admissionsUrl || university.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-teal-600 hover:text-teal-800 font-semibold flex items-center gap-1 hover:underline"
            >
              Admissions Link <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={() => onToggleCompare(university)}
          className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border ${
            isCompared
              ? 'bg-teal-50 border-teal-300 text-teal-800'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{isCompared ? 'Compared' : 'Compare'}</span>
        </button>

        <button
          onClick={() => {
            if (currentProgram) onAddToApplications(university, currentProgram);
          }}
          className="flex-1 py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Track Application</span>
        </button>
      </div>
    </div>
  );
};
