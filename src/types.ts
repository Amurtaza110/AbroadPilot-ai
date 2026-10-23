export interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  website: string;
  admissionsUrl: string;
  rankingQs?: number;
  rankingTimes?: number;
  description: string;
  logo: string;
  bannerImage: string;
  type: 'public' | 'private';
  acceptanceRateRange: string;
  popularForPakistaniStudents: boolean;
  englishRequirementSummary: string;
  intakes: string[];
  lastVerified: string;
  verificationSource: string;
  sourceUrl: string;
  isDemoData: boolean;
  programs: Program[];
}

export interface Program {
  id: string;
  universityId: string;
  universityName: string;
  country: string;
  title: string;
  degreeLevel: 'Bachelor' | 'Master' | 'PhD' | 'Diploma' | 'Exchange';
  subjectArea: string;
  durationMonths: number;
  tuitionAnnual: number;
  tuitionCurrency: string;
  estimatedLivingAnnual: number;
  languageOfInstruction: string;
  minCgpa: number;
  minPercentage?: number;
  ieltsScore: number;
  toeflScore?: number;
  duolingoScore?: number;
  greGmatRequired: boolean;
  applicationDeadlineUpcoming: string;
  intakeTerm: string;
  hasScholarshipOpportunity: boolean;
  officialProgramUrl: string;
  notes: string;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  destinationCountries: string[];
  degreeLevels: string[];
  coverageType: 'Fully Funded' | 'Tuition Waiver' | 'Partial Allowance' | 'Living Stipend';
  estimatedValueUsd: number;
  academicCriteria: string;
  minCgpa: number;
  ieltsRequired: boolean;
  minIeltsScore?: number;
  deadline: string;
  applicationUrl: string;
  officialSource: string;
  description: string;
  eligibleNationalities: string[];
  isPakistanSpecificOrPriority: boolean;
  requiredDocuments: string[];
  lastVerified: string;
}

export interface VisaTemplate {
  countryCode: string;
  countryName: string;
  visaType: string;
  immigrationAuthority: string;
  officialPortalUrl: string;
  embassyInPakistan: string;
  appointmentSystem: string;
  avgProcessingWeeks: number;
  financialRequirementDesc: string;
  financialRequirementEstimatedPkr: number;
  blockedAccountRequired: boolean;
  blockedAccountProvider?: string;
  tbTestRequired: boolean;
  insuranceRequired: boolean;
  interviewRequired: boolean;
  policeCertificateRequired: boolean;
  hecAttestationRequired: boolean;
  keyChecklistItems: { id: string; title: string; desc: string; category: string; mandatory: boolean }[];
  pakistanSpecificNotes: string;
  lastVerified: string;
}

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  role: 'student' | 'adviser' | 'admin';
  phone?: string;
  nationality: string;
  residenceCity: string;
  targetDegree: 'Bachelor' | 'Master' | 'PhD' | 'Diploma';
  intendedMajor: string;
  preferredCountries: string[];
  currentEducationLevel: string;
  degreeTitle: string;
  institutionName: string;
  cgpa: number;
  maxCgpa: number;
  percentage?: number;
  graduationYear: number;
  ieltsStatus: 'Completed' | 'Booked' | 'Preparing' | 'Exempt';
  ieltsScore?: number;
  toeflScore?: number;
  duolingoScore?: number;
  greScore?: number;
  maxTuitionBudgetPkr: number;
  fundingPreference: 'Full Scholarship Only' | 'Partial Scholarship + Self' | 'Fully Self-Funded';
  studyGapYears: number;
  studyGapExplanation?: string;
  workExperienceYears: number;
  isOnboarded: boolean;
  updatedAt: string;
}

export interface RoadmapTask {
  id: string;
  userId: string;
  stageNumber: number;
  stageName: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'not_applicable';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  completedAt?: string;
  relatedUniversityId?: string;
  relatedScholarshipId?: string;
  officialLink?: string;
  notes?: string;
  subtasks: { id: string; title: string; completed: boolean }[];
}

export interface StudentDocument {
  id: string;
  userId: string;
  name: string;
  category: 'Transcript' | 'Degree Certificate' | 'Passport' | 'SOP' | 'CV' | 'LOR' | 'English Test' | 'Bank Statement' | 'Attestation' | 'Other';
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  status: 'verified' | 'pending_review' | 'needs_update' | 'attested';
  notes?: string;
  downloadUrl?: string;
}

export interface Application {
  id: string;
  userId: string;
  universityId: string;
  universityName: string;
  country: string;
  programTitle: string;
  degreeLevel: string;
  intakeTerm: string;
  deadline: string;
  portalUrl: string;
  applicationRefNo?: string;
  status: 'Considering' | 'Shortlisted' | 'Preparing' | 'Ready to submit' | 'Submitted' | 'Under review' | 'Additional information requested' | 'Interview stage' | 'Offer received' | 'Waitlisted' | 'Rejected' | 'Withdrawn' | 'Accepted' | 'Enrollment confirmed';
  feePkr?: number;
  scholarshipApplied?: string;
  notes?: string;
  submissionDate?: string;
  decisionDate?: string;
  updatedAt: string;
}

export interface MatchAnalysisResult {
  matchScore: number;
  verdict: 'Strong Academic Fit' | 'Realistic Alternative' | 'Ambitious Reach' | 'Needs Eligibility Check';
  factors: {
    academicFitScore: number;
    budgetAffordabilityScore: number;
    languageFitScore: number;
    intakeTimingScore: number;
  };
  strengths: string[];
  eligibilityConcerns: string[];
  missingInformation: string[];
  pakistanSpecificGuidance: string[];
  actionableNextSteps: string[];
}

// Exchange rates to PKR for accurate financial planning
export const CURRENCY_RATES_TO_PKR: Record<string, number> = {
  PKR: 1,
  EUR: 310,
  GBP: 365,
  USD: 280,
  AUD: 185,
  CAD: 205,
  TRY: 8.7
};

export function formatCurrencyPkr(amountPkr: number): string {
  if (amountPkr >= 10000000) {
    return `${(amountPkr / 10000000).toFixed(2)} Crore PKR`;
  }
  if (amountPkr >= 100000) {
    return `${(amountPkr / 100000).toFixed(1)} Lakh PKR`;
  }
  return `${amountPkr.toLocaleString()} PKR`;
}

export function convertToPkr(amount: number, currency: string): number {
  const rate = CURRENCY_RATES_TO_PKR[currency] || 280;
  return Math.round(amount * rate);
}
