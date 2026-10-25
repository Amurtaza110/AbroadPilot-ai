// ============================================================
// AbroadPilot AI — Core Type Definitions
// Single source of truth for all shared types
// ============================================================

// ─── User & Auth ────────────────────────────────────────────

export type DegreeLevel = 'Bachelor' | 'Master' | 'PhD' | 'Diploma';
export type FundingPreference = 'Full Scholarship Only' | 'Partial Scholarship + Self' | 'Fully Self-Funded';
export type IeltsStatus = 'Completed' | 'Booked' | 'Preparing' | 'Exempt';
export type UserRole = 'student' | 'adviser' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  photoURL?: string;
  // Academic Background
  nationality: string;
  residenceCity: string;
  currentEducationLevel: string;
  degreeTitle: string;
  institutionName: string;
  cgpa: number;
  maxCgpa: number;
  percentage?: number;
  graduationYear: number;
  // Study Goals
  targetDegree: DegreeLevel;
  intendedMajors: string[];
  preferredCountries: string[];
  preferredCities?: string[];
  // Language & Tests
  ieltsStatus: IeltsStatus;
  ieltsScore?: number;
  toeflScore?: number;
  duolingoScore?: number;
  greScore?: number;
  gmatScore?: number;
  // Financial
  maxTuitionBudgetUsd: number;
  fundingPreference: FundingPreference;
  // Background
  workExperienceYears: number;
  studyGapYears: number;
  studyGapExplanation?: string;
  extracurriculars?: string;
  researchExperience?: string;
  publications?: string;
  // Onboarding
  isOnboarded: boolean;
  onboardingStep: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Onboarding ──────────────────────────────────────────────

export interface OnboardingData {
  step: number;
  fullName: string;
  nationality: string;
  residenceCity: string;
  currentEducationLevel: string;
  degreeTitle: string;
  institutionName: string;
  cgpa: number;
  maxCgpa: number;
  graduationYear: number;
  targetDegree: DegreeLevel;
  intendedMajors: string[];
  preferredCountries: string[];
  ieltsStatus: IeltsStatus;
  ieltsScore?: number;
  maxTuitionBudgetUsd: number;
  fundingPreference: FundingPreference;
  workExperienceYears: number;
  studyGapYears: number;
  extracurriculars?: string;
}

// ─── AI Advisor ──────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: GroundingSource[];
  searchQueries?: string[];
  isStreaming?: boolean;
}

export interface GroundingSource {
  title: string;
  uri: string;
  snippet?: string;
}

// ─── University & Programs ───────────────────────────────────

export interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  website: string;
  logoUrl?: string;
  rankingQs?: number;
  rankingTimes?: number;
  type: 'public' | 'private';
  acceptanceRate?: string;
  description: string;
  programs: Program[];
  aiMatchScore?: number;
  aiMatchReason?: string;
}

export interface Program {
  id: string;
  universityId: string;
  universityName: string;
  country: string;
  title: string;
  degreeLevel: DegreeLevel;
  subjectArea: string;
  durationMonths: number;
  tuitionAnnualUsd: number;
  languageOfInstruction: string;
  minCgpa?: number;
  ieltsScore?: number;
  toeflScore?: number;
  greRequired: boolean;
  applicationDeadline: string;
  intakeTerm: string;
  hasScholarship: boolean;
  officialUrl: string;
  notes?: string;
}

// ─── AI Match Analysis ──────────────────────────────────────

export type MatchVerdict = 
  | 'Strong Fit' 
  | 'Good Match' 
  | 'Reach Program' 
  | 'Safety School' 
  | 'Eligibility Check Needed';

export interface MatchAnalysis {
  matchScore: number;
  verdict: MatchVerdict;
  factors: {
    academic: number;
    budget: number;
    language: number;
    timing: number;
  };
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  nextSteps: string[];
}

// ─── Scholarship ─────────────────────────────────────────────

export type ScholarshipCoverage = 
  | 'Fully Funded' 
  | 'Tuition + Living' 
  | 'Tuition Only' 
  | 'Partial';

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  countries: string[];
  degreeLevels: DegreeLevel[];
  coverage: ScholarshipCoverage;
  valueUsd?: number;
  deadline: string;
  applicationUrl: string;
  eligibleNationalities: string[];
  minCgpa?: number;
  ieltsRequired: boolean;
  minIelts?: number;
  description: string;
  requiredDocuments: string[];
  aiMatchScore?: number;
  aiEligibilityNote?: string;
}

// ─── Application Tracker ─────────────────────────────────────

export type ApplicationStatus =
  | 'Considering'
  | 'Shortlisted'
  | 'Documents Preparing'
  | 'Ready to Submit'
  | 'Submitted'
  | 'Under Review'
  | 'Interview Scheduled'
  | 'Offer Received'
  | 'Accepted'
  | 'Waitlisted'
  | 'Rejected'
  | 'Withdrawn';

export interface Application {
  id: string;
  userId: string;
  universityName: string;
  country: string;
  programTitle: string;
  degreeLevel: DegreeLevel;
  intakeTerm: string;
  deadline: string;
  applicationUrl: string;
  refNumber?: string;
  status: ApplicationStatus;
  notes?: string;
  submittedAt?: string;
  decisionDate?: string;
  scholarshipApplied?: string;
  documents: string[]; // document IDs
  aiAgentEnabled: boolean; // Phase 2: auto-apply agent
  agentStatus?: 'pending' | 'monitoring' | 'ready_to_apply' | 'applying' | 'applied' | 'error';
  agentLog?: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Documents ───────────────────────────────────────────────

export type DocumentCategory =
  | 'Transcript'
  | 'Degree Certificate'
  | 'Passport'
  | 'National ID'
  | 'SOP'
  | 'CV / Resume'
  | 'Letter of Recommendation'
  | 'Language Test'
  | 'Bank Statement'
  | 'Visa Document'
  | 'Scholarship Document'
  | 'Other';

export type DocumentStatus = 'Draft' | 'Complete' | 'Needs Update' | 'Verified' | 'Attested';

export interface StudentDocument {
  id: string;
  userId: string;
  name: string;
  category: DocumentCategory;
  fileType: string;
  fileSizeKb: number;
  status: DocumentStatus;
  notes?: string;
  downloadUrl?: string;
  uploadedAt: string;
  updatedAt: string;
}

// ─── Roadmap ─────────────────────────────────────────────────

export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'skipped';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface RoadmapTask {
  id: string;
  userId: string;
  stage: number;
  stageName: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  completedAt?: string;
  officialLink?: string;
  notes?: string;
  subtasks: { id: string; title: string; completed: boolean }[];
  aiGenerated: boolean;
  relatedApplicationId?: string;
}

// ─── Visa Guide ──────────────────────────────────────────────

export interface VisaChecklist {
  country: string;
  countryCode: string;
  visaType: string;
  officialPortal: string;
  avgProcessingWeeks: number;
  financialRequirementUsd: number;
  items: VisaChecklistItem[];
  countrySpecificNotes: string[];
  aiGeneratedAt?: string;
}

export interface VisaChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  mandatory: boolean;
  completed?: boolean;
}

// ─── Cost Planner ────────────────────────────────────────────

export interface CostEstimate {
  countryCode: string;
  country: string;
  tuitionAnnualUsd: number;
  livingAnnualUsd: number;
  healthInsuranceAnnualUsd: number;
  visaFeeUsd: number;
  flightUsd: number;
  miscAnnualUsd: number;
  totalFirstYearUsd: number;
  totalProgramUsd: number;
  scholarshipDeductionUsd: number;
  netCostUsd: number;
  aiAnalysis?: string;
}

// ─── AI Agent (Phase 2) ──────────────────────────────────────

export interface AgentTask {
  id: string;
  applicationId: string;
  userId: string;
  type: 'monitor_portal' | 'fill_form' | 'upload_document' | 'submit_application';
  status: 'queued' | 'running' | 'completed' | 'failed' | 'waiting_user';
  targetUrl: string;
  instructions: string;
  result?: string;
  error?: string;
  screenshotUrl?: string;
  createdAt: string;
  completedAt?: string;
}

// ─── Utilities ───────────────────────────────────────────────

export const USD_TO_CURRENCIES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  AUD: 1.53,
  CAD: 1.36,
  PKR: 280,
  INR: 83.5,
  BDT: 110,
  NPR: 132,
  TRY: 32,
  SAR: 3.75,
};

export function formatUsd(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

export function formatCurrency(amountUsd: number, currency: string): string {
  const rate = USD_TO_CURRENCIES[currency] || 1;
  const converted = Math.round(amountUsd * rate);
  const symbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', AUD: 'A$', CAD: 'C$',
    PKR: '₨', INR: '₹', BDT: '৳', NPR: 'Rs.', TRY: '₺', SAR: '﷼'
  };
  const symbol = symbols[currency] || currency + ' ';
  if (converted >= 1_000_000) return `${symbol}${(converted / 1_000_000).toFixed(1)}M`;
  if (converted >= 1_000) return `${symbol}${(converted / 1_000).toFixed(0)}K`;
  return `${symbol}${converted.toLocaleString()}`;
}
