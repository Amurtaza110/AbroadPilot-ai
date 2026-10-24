// Static catalog data, shared types and demo seeds used by the API function.
// User-specific data is persisted in Netlify Database (see db/schema.ts).

// Data types
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
  tuitionAnnual: number; // In native currency
  tuitionCurrency: string;
  estimatedLivingAnnual: number; // In native currency
  languageOfInstruction: string;
  minCgpa: number; // 4.0 scale
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
  fileContentBase64?: string;
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

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

export type UserRole = 'student' | 'adviser' | 'admin';

// Initial Seeds
export const SEED_UNIVERSITIES: University[] = [
  {
    id: "uni-tum-de",
    name: "Technical University of Munich (TUM)",
    country: "Germany",
    city: "Munich",
    website: "https://www.tum.de",
    admissionsUrl: "https://www.tum.de/en/studies/application",
    rankingQs: 28,
    rankingTimes: 30,
    description: "One of Europe's top technical universities, renowned for computer science, robotics, data engineering, and management.",
    logo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=160&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80",
    type: "public",
    acceptanceRateRange: "8% - 15%",
    popularForPakistaniStudents: true,
    englishRequirementSummary: "IELTS 6.5 - 7.0 or TOEFL 88+. Requires APS certificate for Pakistani degrees.",
    intakes: ["Winter (October)", "Summer (April)"],
    lastVerified: "2026-03-15",
    verificationSource: "TUM International Admissions & DAAD Portal",
    sourceUrl: "https://www.tum.de/en/studies/international-students",
    isDemoData: false,
    programs: [
      {
        id: "prog-tum-cs-msc",
        universityId: "uni-tum-de",
        universityName: "Technical University of Munich (TUM)",
        country: "Germany",
        title: "M.Sc. Informatics (Computer Science)",
        degreeLevel: "Master",
        subjectArea: "Computer Science & IT",
        durationMonths: 24,
        tuitionAnnual: 6000, // Non-EU semester fees recently introduced in Bavaria (~3000 EUR/sem)
        tuitionCurrency: "EUR",
        estimatedLivingAnnual: 11208, // German Blocked Account standard
        languageOfInstruction: "English",
        minCgpa: 3.2,
        minPercentage: 75,
        ieltsScore: 6.5,
        toeflScore: 88,
        greGmatRequired: false,
        applicationDeadlineUpcoming: "2026-05-31",
        intakeTerm: "Winter 2026",
        hasScholarshipOpportunity: true,
        officialProgramUrl: "https://www.cit.tum.de/en/cit/studies/degree-programs/master-informatics/",
        notes: "Strict aptitude assessment based on bachelor mathematics and computer architecture credits. APS certificate mandatory."
      },
      {
        id: "prog-tum-data-msc",
        universityId: "uni-tum-de",
        universityName: "Technical University of Munich (TUM)",
        country: "Germany",
        title: "M.Sc. Data Engineering and Analytics",
        degreeLevel: "Master",
        subjectArea: "Data Science & AI",
        durationMonths: 24,
        tuitionAnnual: 6000,
        tuitionCurrency: "EUR",
        estimatedLivingAnnual: 11208,
        languageOfInstruction: "English",
        minCgpa: 3.3,
        ieltsScore: 7.0,
        toeflScore: 92,
        greGmatRequired: false,
        applicationDeadlineUpcoming: "2026-05-31",
        intakeTerm: "Winter 2026",
        hasScholarshipOpportunity: true,
        officialProgramUrl: "https://www.cit.tum.de/en/cit/studies/degree-programs/master-data-engineering-analytics/",
        notes: "High mathematics prerequisite; requires verified syllabus matching."
      }
    ]
  },
  {
    id: "uni-rwth-de",
    name: "RWTH Aachen University",
    country: "Germany",
    city: "Aachen",
    website: "https://www.rwth-aachen.de",
    admissionsUrl: "https://www.rwth-aachen.de/go/id/bdzb",
    rankingQs: 99,
    rankingTimes: 90,
    description: "The largest technical university in Germany, globally respected for Mechanical, Electrical, Civil Engineering and Software Systems.",
    logo: "https://images.unsplash.com/photo-1562774053-701939374585?w=160&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80",
    type: "public",
    acceptanceRateRange: "10% - 20%",
    popularForPakistaniStudents: true,
    englishRequirementSummary: "IELTS 6.5 or TOEFL 90. No tuition fees! Only semester contribution ~320 EUR.",
    intakes: ["Winter (October)", "Summer (April)"],
    lastVerified: "2026-04-01",
    verificationSource: "RWTH International Office & DAAD",
    sourceUrl: "https://www.rwth-aachen.de/cms/root/Studium/Vor-dem-Studium/Bewerbung-um-einen-Studienplatz/Internationale-Studierende/~bdzb/Master-Bewerbung-Internationale-/?lidx=1",
    isDemoData: false,
    programs: [
      {
        id: "prog-rwth-mech-msc",
        universityId: "uni-rwth-de",
        universityName: "RWTH Aachen University",
        country: "Germany",
        title: "M.Sc. Mechanical Engineering / Production Systems",
        degreeLevel: "Master",
        subjectArea: "Engineering",
        durationMonths: 24,
        tuitionAnnual: 0, // Tuition Free!
        tuitionCurrency: "EUR",
        estimatedLivingAnnual: 10500,
        languageOfInstruction: "English",
        minCgpa: 3.0,
        minPercentage: 70,
        ieltsScore: 6.5,
        toeflScore: 90,
        greGmatRequired: true,
        applicationDeadlineUpcoming: "2026-03-01",
        intakeTerm: "Winter 2026",
        hasScholarshipOpportunity: true,
        officialProgramUrl: "https://www.rwth-aachen.de/go/id/bonr",
        notes: "GRE General test is mandatory for non-EU applicants. Strict subject-matching catalog."
      },
      {
        id: "prog-rwth-se-msc",
        universityId: "uni-rwth-de",
        universityName: "RWTH Aachen University",
        country: "Germany",
        title: "M.Sc. Software Systems Engineering",
        degreeLevel: "Master",
        subjectArea: "Computer Science & IT",
        durationMonths: 24,
        tuitionAnnual: 0,
        tuitionCurrency: "EUR",
        estimatedLivingAnnual: 10500,
        languageOfInstruction: "English",
        minCgpa: 3.2,
        ieltsScore: 6.5,
        toeflScore: 90,
        greGmatRequired: true,
        applicationDeadlineUpcoming: "2026-03-01",
        intakeTerm: "Winter 2026",
        hasScholarshipOpportunity: false,
        officialProgramUrl: "https://www.rwth-aachen.de/go/id/boof",
        notes: "GRE minimum quantitative score 160 required."
      }
    ]
  },
  {
    id: "uni-manchester-uk",
    name: "The University of Manchester",
    country: "United Kingdom",
    city: "Manchester",
    website: "https://www.manchester.ac.uk",
    admissionsUrl: "https://www.manchester.ac.uk/study/masters/admissions/",
    rankingQs: 34,
    rankingTimes: 51,
    description: "Prestigious Russell Group university in England, offering world-class research, industry links, and high graduate employability.",
    logo: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=160&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
    type: "public",
    acceptanceRateRange: "25% - 35%",
    popularForPakistaniStudents: true,
    englishRequirementSummary: "IELTS 6.5 - 7.0 (no band less than 6.0) or PTE 65-70.",
    intakes: ["September"],
    lastVerified: "2026-02-20",
    verificationSource: "University of Manchester International Office",
    sourceUrl: "https://www.manchester.ac.uk/study/international/country-specific-information/pakistan/",
    isDemoData: false,
    programs: [
      {
        id: "prog-uom-fin-msc",
        universityId: "uni-manchester-uk",
        universityName: "The University of Manchester",
        country: "United Kingdom",
        title: "M.Sc. Finance",
        degreeLevel: "Master",
        subjectArea: "Business & Finance",
        durationMonths: 12,
        tuitionAnnual: 36000,
        tuitionCurrency: "GBP",
        estimatedLivingAnnual: 12500,
        languageOfInstruction: "English",
        minCgpa: 3.3,
        minPercentage: 75,
        ieltsScore: 7.0,
        toeflScore: 100,
        greGmatRequired: false,
        applicationDeadlineUpcoming: "2026-06-30",
        intakeTerm: "Autumn 2026",
        hasScholarshipOpportunity: true,
        officialProgramUrl: "https://www.manchester.ac.uk/study/masters/courses/list/01648/msc-finance/",
        notes: "Accepts 4-year Bachelor degrees from recognized Pakistani institutions (HEC tier 1/2)."
      },
      {
        id: "prog-uom-ai-msc",
        universityId: "uni-manchester-uk",
        universityName: "The University of Manchester",
        country: "United Kingdom",
        title: "M.Sc. Artificial Intelligence",
        degreeLevel: "Master",
        subjectArea: "Data Science & AI",
        durationMonths: 12,
        tuitionAnnual: 34500,
        tuitionCurrency: "GBP",
        estimatedLivingAnnual: 12500,
        languageOfInstruction: "English",
        minCgpa: 3.4,
        ieltsScore: 7.0,
        toeflScore: 100,
        greGmatRequired: false,
        applicationDeadlineUpcoming: "2026-05-15",
        intakeTerm: "Autumn 2026",
        hasScholarshipOpportunity: true,
        officialProgramUrl: "https://www.manchester.ac.uk/study/masters/courses/list/08051/msc-artificial-intelligence/",
        notes: "Strong programming background in Python, Java, or C++ required."
      }
    ]
  },
  {
    id: "uni-polimi-it",
    name: "Politecnico di Milano",
    country: "Italy",
    city: "Milan",
    website: "https://www.polimi.it",
    admissionsUrl: "https://www.polimi.it/en/international-prospective-students",
    rankingQs: 111,
    rankingTimes: 160,
    description: "Italy's top technical university, globally ranked #7 in Design and #18 in Engineering. Extremely affordable with DSU scholarships.",
    logo: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=160&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80",
    type: "public",
    acceptanceRateRange: "20% - 30%",
    popularForPakistaniStudents: true,
    englishRequirementSummary: "IELTS 6.0 or TOEFL 78 minimum. Low tuition (~3,900 EUR max, usually reduced to ~180 EUR with ISEE Parificato).",
    intakes: ["First Semester (September)", "Second Semester (February)"],
    lastVerified: "2026-03-10",
    verificationSource: "Polimi International Prospective Students Portal & Universitaly",
    sourceUrl: "https://www.polimi.it/en/international-prospective-students/laurea-magistrale-programmes-equivalent-to-master-of-science/application-procedures",
    isDemoData: false,
    programs: [
      {
        id: "prog-polimi-cs-msc",
        universityId: "uni-polimi-it",
        universityName: "Politecnico di Milano",
        country: "Italy",
        title: "M.Sc. Computer Science and Engineering",
        degreeLevel: "Master",
        subjectArea: "Computer Science & IT",
        durationMonths: 24,
        tuitionAnnual: 3900,
        tuitionCurrency: "EUR",
        estimatedLivingAnnual: 8500,
        languageOfInstruction: "English",
        minCgpa: 2.8,
        minPercentage: 65,
        ieltsScore: 6.0,
        toeflScore: 78,
        greGmatRequired: false,
        applicationDeadlineUpcoming: "2026-03-15",
        intakeTerm: "Autumn 2026",
        hasScholarshipOpportunity: true,
        officialProgramUrl: "https://www.polimi.it/en/programmes/laurea-magistrale-equivalent-to-master-of-science/computer-science-and-engineering",
        notes: "Eligible for DSU Regional scholarship which covers complete tuition waiver + 7,000 EUR cash stipend for Pakistani students."
      },
      {
        id: "prog-polimi-mgmt-msc",
        universityId: "uni-polimi-it",
        universityName: "Politecnico di Milano",
        country: "Italy",
        title: "M.Sc. Management Engineering",
        degreeLevel: "Master",
        subjectArea: "Business & Engineering",
        durationMonths: 24,
        tuitionAnnual: 3900,
        tuitionCurrency: "EUR",
        estimatedLivingAnnual: 8500,
        languageOfInstruction: "English",
        minCgpa: 3.0,
        ieltsScore: 6.5,
        greGmatRequired: false,
        applicationDeadlineUpcoming: "2026-03-15",
        intakeTerm: "Autumn 2026",
        hasScholarshipOpportunity: true,
        officialProgramUrl: "https://www.polimi.it/en/programmes/laurea-magistrale-equivalent-to-master-of-science/management-engineering",
        notes: "Detailed syllabus translation and course description document required."
      }
    ]
  },
  {
    id: "uni-uta-us",
    name: "University of Texas at Arlington",
    country: "United States",
    city: "Arlington, Texas",
    website: "https://www.uta.edu",
    admissionsUrl: "https://www.uta.edu/admissions/apply/international",
    rankingQs: 480,
    rankingTimes: 400,
    description: "Carnegie R1 Top Tier Research University in the Dallas-Fort Worth metroplex. High STEM OPT placement and in-state tuition waiver opportunities.",
    logo: "https://images.unsplash.com/photo-1568792923760-d70635a89fa1?w=160&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1568792923760-d70635a89fa1?w=800&auto=format&fit=crop&q=80",
    type: "public",
    acceptanceRateRange: "60% - 75%",
    popularForPakistaniStudents: true,
    englishRequirementSummary: "IELTS 6.5 or TOEFL 79 or Duolingo 110. GRE waiver available for select GPA brackets.",
    intakes: ["Fall (August)", "Spring (January)"],
    lastVerified: "2026-01-25",
    verificationSource: "UTA International Admissions & ISSS",
    sourceUrl: "https://www.uta.edu/admissions/apply/international/graduate",
    isDemoData: false,
    programs: [
      {
        id: "prog-uta-cs-ms",
        universityId: "uni-uta-us",
        universityName: "University of Texas at Arlington",
        country: "United States",
        title: "M.S. Computer Science",
        degreeLevel: "Master",
        subjectArea: "Computer Science & IT",
        durationMonths: 24,
        tuitionAnnual: 22000,
        tuitionCurrency: "USD",
        estimatedLivingAnnual: 12000,
        languageOfInstruction: "English",
        minCgpa: 3.0,
        ieltsScore: 6.5,
        toeflScore: 79,
        duolingoScore: 110,
        greGmatRequired: false,
        applicationDeadlineUpcoming: "2026-06-15",
        intakeTerm: "Fall 2026",
        hasScholarshipOpportunity: true,
        officialProgramUrl: "https://www.uta.edu/academics/schools-colleges/engineering/academics/departments/cse/degrees/graduate/ms-cs",
        notes: "Qualifies for 36-month STEM OPT in the US. Graduate assistantships grant Texas in-state tuition rate (~50% discount)."
      }
    ]
  },
  {
    id: "uni-metu-tr",
    name: "Middle East Technical University (METU)",
    country: "Turkey",
    city: "Ankara",
    website: "https://www.metu.edu.tr",
    admissionsUrl: "https://iso.metu.edu.tr",
    rankingQs: 336,
    rankingTimes: 350,
    description: "Turkey's premier public research university, teaching 100% in English. High historical brotherly bond with Pakistan, very low fees and living costs.",
    logo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=160&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80",
    type: "public",
    acceptanceRateRange: "15% - 25%",
    popularForPakistaniStudents: true,
    englishRequirementSummary: "METU EPE exam or TOEFL IBT 79+. IELTS not accepted for Turkish national accreditation (TOEFL preferred).",
    intakes: ["Fall (September)"],
    lastVerified: "2026-02-14",
    verificationSource: "METU International Students Office (ISO)",
    sourceUrl: "https://iso.metu.edu.tr/en/application-requirements",
    isDemoData: false,
    programs: [
      {
        id: "prog-metu-ee-msc",
        universityId: "uni-metu-tr",
        universityName: "Middle East Technical University (METU)",
        country: "Turkey",
        title: "M.Sc. Electrical and Electronics Engineering",
        degreeLevel: "Master",
        subjectArea: "Engineering",
        durationMonths: 24,
        tuitionAnnual: 1800,
        tuitionCurrency: "USD",
        estimatedLivingAnnual: 4500,
        languageOfInstruction: "English",
        minCgpa: 2.8,
        minPercentage: 65,
        ieltsScore: 6.5,
        toeflScore: 84,
        greGmatRequired: true,
        applicationDeadlineUpcoming: "2026-07-10",
        intakeTerm: "Fall 2026",
        hasScholarshipOpportunity: true,
        officialProgramUrl: "https://eee.metu.edu.tr/graduate-programs",
        notes: "GRE Quantitative score minimum 155 or ALES required. High visa success rate for Pakistanis."
      }
    ]
  },
  {
    id: "uni-melb-au",
    name: "The University of Melbourne",
    country: "Australia",
    city: "Melbourne",
    website: "https://www.unimelb.edu.au",
    admissionsUrl: "https://study.unimelb.edu.au/how-to-apply",
    rankingQs: 13,
    rankingTimes: 37,
    description: "Australia's #1 ranked university and Group of Eight member. Generous post-study work rights and high quality of life.",
    logo: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=160&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
    type: "public",
    acceptanceRateRange: "30% - 40%",
    popularForPakistaniStudents: true,
    englishRequirementSummary: "IELTS 6.5 (no band < 6.0) or PTE 58-64.",
    intakes: ["Semester 1 (Feb/March)", "Semester 2 (July)"],
    lastVerified: "2026-03-01",
    verificationSource: "Study University of Melbourne International Guide",
    sourceUrl: "https://study.unimelb.edu.au/how-to-apply/international-applications",
    isDemoData: false,
    programs: [
      {
        id: "prog-melb-is-mis",
        universityId: "uni-melb-au",
        universityName: "The University of Melbourne",
        country: "Australia",
        title: "Master of Information Systems",
        degreeLevel: "Master",
        subjectArea: "Computer Science & IT",
        durationMonths: 24,
        tuitionAnnual: 48000,
        tuitionCurrency: "AUD",
        estimatedLivingAnnual: 24500,
        languageOfInstruction: "English",
        minCgpa: 3.2,
        ieltsScore: 6.5,
        toeflScore: 79,
        greGmatRequired: false,
        applicationDeadlineUpcoming: "2026-05-31",
        intakeTerm: "Semester 2 (July 2026)",
        hasScholarshipOpportunity: true,
        officialProgramUrl: "https://study.unimelb.edu.au/find/courses/graduate/master-of-information-systems/",
        notes: "Genuine Student (GS) assessment required for Subclass 500 visa. OSHC mandatory."
      }
    ]
  }
];

export const SEED_SCHOLARSHIPS: Scholarship[] = [
  {
    id: "sch-chevening-uk",
    name: "Chevening Scholarship (UK Government)",
    provider: "UK Foreign, Commonwealth & Development Office (FCDO)",
    destinationCountries: ["United Kingdom"],
    degreeLevels: ["Master"],
    coverageType: "Fully Funded",
    estimatedValueUsd: 45000,
    academicCriteria: "Equivalent to UK upper second-class 2:1 honours (typically 3.0+ CGPA in Pakistan). Minimum 2 years (2,800 hours) work or volunteer experience.",
    minCgpa: 3.0,
    ieltsRequired: false,
    deadline: "2026-11-05",
    applicationUrl: "https://www.chevening.org/scholarship/pakistan/",
    officialSource: "UK Government Chevening Secretariat",
    description: "The UK government's flagship global scholarship program for future leaders. Covers full university tuition fees, monthly living allowance, return economy flights, and arrival grants.",
    eligibleNationalities: ["Pakistan", "International"],
    isPakistanSpecificOrPriority: true,
    requiredDocuments: [
      "Three master course choices at UK universities",
      "Two professional/academic reference letters",
      "Valid passport / Pakistani CNIC",
      "Undergraduate transcripts and degree certificate",
      "Four leadership essays (Leadership, Networking, Studying in UK, Career Plan)"
    ],
    lastVerified: "2026-03-20"
  },
  {
    id: "sch-daad-epos-de",
    name: "DAAD EPOS (Development-Related Postgraduate Courses)",
    provider: "German Academic Exchange Service (DAAD)",
    destinationCountries: ["Germany"],
    degreeLevels: ["Master", "PhD"],
    coverageType: "Fully Funded",
    estimatedValueUsd: 35000,
    academicCriteria: "Bachelor degree completed not older than 6 years. At least 2 years of relevant professional work experience after graduation.",
    minCgpa: 3.0,
    ieltsRequired: true,
    minIeltsScore: 6.0,
    deadline: "2026-09-30",
    applicationUrl: "https://www.daad.de/en/study-and-research-in-germany/scholarships/postgraduate-courses-epos/",
    officialSource: "DAAD Portal Germany & DAAD Information Center Islamabad",
    description: "Fully funded postgraduate scholarships for candidates from developing nations (including Pakistan). Monthly stipend of 934 EUR for master or 1,300 EUR for PhD, health insurance, and travel allowance.",
    eligibleNationalities: ["Pakistan", "DAC-list developing countries"],
    isPakistanSpecificOrPriority: true,
    requiredDocuments: [
      "DAAD application form",
      "Hand-signed Europass CV",
      "Hand-signed Letter of Motivation with reference to current job",
      "Letter of recommendation from employer",
      "Proof of at least 2 years work experience",
      "University certificates & transcripts",
      "English proficiency certificate"
    ],
    lastVerified: "2026-04-05"
  },
  {
    id: "sch-fulbright-us",
    name: "Fulbright Foreign Student Program (USEFP Pakistan)",
    provider: "US Department of State & USEFP Pakistan",
    destinationCountries: ["United States"],
    degreeLevels: ["Master", "PhD"],
    coverageType: "Fully Funded",
    estimatedValueUsd: 80000,
    academicCriteria: "Minimum 4-year Bachelor degree (for Master) or MPhil/MS (for PhD) from an HEC-recognized university. GRE General score mandatory.",
    minCgpa: 3.0,
    ieltsRequired: false,
    deadline: "2026-05-13",
    applicationUrl: "https://usefp.org/scholarships/fulbright.cfm",
    officialSource: "United States Educational Foundation in Pakistan (USEFP)",
    description: "The largest Fulbright program in the world, funded by the US Government specifically for Pakistani citizens. Covers full tuition, textbooks, airfare, a living stipend, and health insurance. J-1 visa requires 2-year home residency return.",
    eligibleNationalities: ["Pakistan"],
    isPakistanSpecificOrPriority: true,
    requiredDocuments: [
      "USEFP Online Application",
      "Official GRE General Score Card",
      "Three letters of recommendation",
      "Personal Statement Essay",
      "Study Objective Essay",
      "HEC attested transcripts and degrees"
    ],
    lastVerified: "2026-03-01"
  },
  {
    id: "sch-turkiye-burslari",
    name: "Türkiye Bursları Scholarship",
    provider: "Presidency for Turks Abroad and Related Communities (YTB)",
    destinationCountries: ["Turkey"],
    degreeLevels: ["Bachelor", "Master", "PhD"],
    coverageType: "Fully Funded",
    estimatedValueUsd: 25000,
    academicCriteria: "Minimum 70% academic achievement for Bachelor, 75% for Master & PhD, 90% for Health Sciences.",
    minCgpa: 2.8,
    ieltsRequired: false,
    deadline: "2026-02-20",
    applicationUrl: "https://turkiyeburslari.gov.tr",
    officialSource: "Government of Republic of Türkiye",
    description: "All-inclusive government scholarship covering university placement, 1-year Turkish language course, monthly stipend, university tuition, accommodation, health insurance, and one-time flight ticket.",
    eligibleNationalities: ["Pakistan", "International"],
    isPakistanSpecificOrPriority: true,
    requiredDocuments: [
      "National Identity Document (CNIC / Passport)",
      "Recent photo",
      "National exam / Board results / University transcripts",
      "Diploma or graduation certificate",
      "Letter of intent and research proposal (for Master/PhD)"
    ],
    lastVerified: "2026-02-10"
  },
  {
    id: "sch-italy-dsu",
    name: "Italian DSU Regional Scholarship (Right to Study)",
    provider: "Italian Regional Authorities (Lombardy, Emilia Romagna, Lazio, etc.)",
    destinationCountries: ["Italy"],
    degreeLevels: ["Bachelor", "Master"],
    coverageType: "Living Stipend",
    estimatedValueUsd: 15000,
    academicCriteria: "Need-based financial assessment using 'ISEE Parificato' (equivalent family income under ~25,000 EUR/year) + university enrollment merit credits.",
    minCgpa: 2.5,
    ieltsRequired: false,
    deadline: "2026-08-30",
    applicationUrl: "https://www.polimi.it/en/international-prospective-students/laurea-magistrale-programmes-equivalent-to-master-of-science/scholarships/dsu-benefits",
    officialSource: "Regional Education Authorities (ALISEI / ER.GO / DiscoLazio)",
    description: "Regional Italian government scholarship providing free university canteen meals, university residence or accommodation contribution (~3,000 EUR), and direct cash stipend up to ~7,500 EUR per year, plus 100% tuition tax exemption.",
    eligibleNationalities: ["Pakistan", "International"],
    isPakistanSpecificOrPriority: false,
    requiredDocuments: [
      "Family Income Certificate from Pakistan (translated & legalized by Italian Embassy)",
      "Family Registration Certificate (FRC) from NADRA",
      "Property / Real Estate document of family home in Pakistan",
      "Bank balance certificate of all family members as of Dec 31",
      "CAF legal calculation of ISEE Parificato in Italy"
    ],
    lastVerified: "2026-03-12"
  }
];

export const SEED_VISA_TEMPLATES: VisaTemplate[] = [
  {
    countryCode: "DE",
    countryName: "Germany",
    visaType: "National Visa - Type D (Study / Master / Bachelor)",
    immigrationAuthority: "German Federal Foreign Office (Auswärtiges Amt)",
    officialPortalUrl: "https://pakistan.diplo.de/pk-en/service/visa-einreise/-/2073714",
    embassyInPakistan: "German Embassy Islamabad & German Consulate General Karachi",
    appointmentSystem: "Online waiting list system via diplo.de portal. Category A for high GPA/DAAD scholars (faster); Category B for standard applicants (wait times 6-12 months).",
    avgProcessingWeeks: 6,
    financialRequirementDesc: "Mandatory German Blocked Account (Sperrkonto) with 11,208 EUR per year (approx. 3.3 - 3.5 Million PKR depending on currency rate).",
    financialRequirementEstimatedPkr: 3450000,
    blockedAccountRequired: true,
    blockedAccountProvider: "Fintiba, Expatrio, Coracle, or Deutsche Bank",
    tbTestRequired: false,
    insuranceRequired: true,
    interviewRequired: true,
    policeCertificateRequired: false,
    hecAttestationRequired: true,
    lastVerified: "2026-04-01",
    pakistanSpecificNotes: "CRITICAL: APS (Akademische Prüfstelle) Certificate is now mandatory for Pakistani students before applying for a student visa! The certificate verifies Pakistani HEC-recognized degrees and transcripts. Book your appointment slot early as waiting times can be long.",
    keyChecklistItems: [
      { id: "de-1", title: "Valid Passport", desc: "Signed, at least 2 blank pages, valid for at least 12 months beyond intended stay.", category: "Identity", mandatory: true },
      { id: "de-2", title: "APS Certificate Pakistan", desc: "Original APS certificate issued by APS Islamabad verifying authenticity of academic records.", category: "Academic", mandatory: true },
      { id: "de-3", title: "University Admission Letter (Zulassungsbescheid)", desc: "Unconditional or conditional admission letter in an English- or German-taught study program.", category: "Academic", mandatory: true },
      { id: "de-4", title: "Proof of Financial Resources (Blocked Account)", desc: "Confirmation letter of Sperrkonto funded with min. 11,208 EUR or official formal obligation (Verpflichtungserklärung).", category: "Financial", mandatory: true },
      { id: "de-5", title: "Incoming Health Insurance (Incoming-Versicherung)", desc: "Valid from date of arrival until registration with statutory German health insurance (TK/Barmer/AOK).", category: "Insurance", mandatory: true },
      { id: "de-6", title: "HEC & IBCC Attested Academic Degrees", desc: "Original Matric/FSc and Bachelor transcripts attested by IBCC and HEC Pakistan with stamp & QR code.", category: "Academic", mandatory: true },
      { id: "de-7", title: "Curriculum Vitae (CV) & Motivation Letter", desc: "Chronological Europass CV without gaps, plus a 1-2 page genuine statement explaining why Germany and this specific university.", category: "SOP", mandatory: true },
      { id: "de-8", title: "Proof of Language Proficiency", desc: "IELTS/TOEFL for English-taught degrees, or Goethe/TestDaF certificate for German-taught degrees.", category: "Language", mandatory: true }
    ]
  },
  {
    countryCode: "GB",
    countryName: "United Kingdom",
    visaType: "Student Route Visa (formerly Tier 4)",
    immigrationAuthority: "UK Visas and Immigration (UKVI)",
    officialPortalUrl: "https://www.gov.uk/student-visa",
    embassyInPakistan: "British High Commission Islamabad (Biometrics via VFS Global Islamabad/Lahore/Karachi/Mirpur)",
    appointmentSystem: "Apply online at Gov.uk, pay Immigration Health Surcharge (IHS) + visa fee, book VFS Global biometrics appointment.",
    avgProcessingWeeks: 3,
    financialRequirementDesc: "Course fees for first year + 9,207 GBP (outside London) or 12,006 GBP (inside London) held in a recognized bank account for a consecutive 28-day period.",
    financialRequirementEstimatedPkr: 4200000,
    blockedAccountRequired: false,
    tbTestRequired: true,
    insuranceRequired: true, // via UKVI IHS fee (~776 GBP/yr)
    interviewRequired: false, // Random credibility interview possible via Teams
    policeCertificateRequired: false,
    hecAttestationRequired: true,
    lastVerified: "2026-03-15",
    pakistanSpecificNotes: "Tuberculosis (TB) test certificate must only be from an approved IOM (International Organization for Migration) clinic in Islamabad, Lahore, Karachi, or Mirpur. 28-day bank maintenance rule must be strictly followed without dropping below the threshold for even one day.",
    keyChecklistItems: [
      { id: "uk-1", title: "Confirmation of Acceptance for Studies (CAS)", desc: "14-digit electronic CAS reference number issued by the UK university.", category: "Academic", mandatory: true },
      { id: "uk-2", title: "28-Day Bank Statement & Bank Letter", desc: "Personal or parent's bank statement showing total tuition + living expenses maintained for 28 consecutive days before application.", category: "Financial", mandatory: true },
      { id: "uk-3", title: "Parental Consent & Birth Certificate (If using parent funds)", desc: "Affidavit of financial sponsorship, FRC/Birth certificate proving relationship, and consent letter.", category: "Financial", mandatory: true },
      { id: "uk-4", title: "IOM Tuberculosis (TB) Medical Certificate", desc: "Valid clearance certificate issued by IOM Pakistan.", category: "Medical", mandatory: true },
      { id: "uk-5", title: "ATAS Clearance Certificate (if applicable)", desc: "Academic Technology Approval Scheme clearance if studying sensitive STEM/Nuclear/Aerospace subjects.", category: "Academic", mandatory: false },
      { id: "uk-6", title: "English Language Qualifications", desc: "IELTS for UKVI (SELT) or degree qualification listed on CAS.", category: "Language", mandatory: true }
    ]
  },
  {
    countryCode: "US",
    countryName: "United States",
    visaType: "F-1 Academic Student Visa",
    immigrationAuthority: "US Department of State & USCIS",
    officialPortalUrl: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
    embassyInPakistan: "US Embassy Islamabad & US Consulate General Karachi",
    appointmentSystem: "Complete Form DS-160 online, pay MRV fee via Allied Bank or online, schedule biometrics & consular interview on ustraveldocs.com.",
    avgProcessingWeeks: 4,
    financialRequirementDesc: "Proof of immediate liquid funds (bank statement, sponsor affidavit I-134, scholarship letter) covering the full 1-year total estimate on Form I-20.",
    financialRequirementEstimatedPkr: 8500000,
    blockedAccountRequired: false,
    tbTestRequired: false,
    insuranceRequired: true,
    interviewRequired: true, // In-person Consular interview is critical!
    policeCertificateRequired: false,
    hecAttestationRequired: false,
    lastVerified: "2026-02-28",
    pakistanSpecificNotes: "The F-1 visa interview in Islamabad/Karachi is oral and fast-paced (typically 2-4 minutes). The Consular Officer looks for strong academic intention, genuine non-immigrant intent (INA 214b ties to Pakistan), and verified financial sponsorship.",
    keyChecklistItems: [
      { id: "us-1", title: "Form I-20 issued by SEVP-certified school", desc: "Signed Certificate of Eligibility for Nonimmigrant Student Status.", category: "Academic", mandatory: true },
      { id: "us-2", title: "SEVIS I-901 Fee Payment Receipt ($350)", desc: "Proof of payment on fmjfee.com before attending visa interview.", category: "Financial", mandatory: true },
      { id: "us-3", title: "DS-160 Barcode Confirmation Page", desc: "Confirmation printout of online nonimmigrant visa application.", category: "Application", mandatory: true },
      { id: "us-4", title: "Bank Statements & Source of Income", desc: "Original bank statements, tax returns (FBR Active Taxpayer), salary slips, and affidavit of support.", category: "Financial", mandatory: true },
      { id: "us-5", title: "Academic Transcripts, Degrees & Standardized Tests", desc: "Bachelor transcripts, GRE/GMAT scorecards, TOEFL/IELTS test reports.", category: "Academic", mandatory: true }
    ]
  },
  {
    countryCode: "IT",
    countryName: "Italy",
    visaType: "National Study Visa - Type D",
    immigrationAuthority: "Italian Ministry of Foreign Affairs (MAECI) & Universitaly",
    officialPortalUrl: "https://www.universitaly.it",
    embassyInPakistan: "Embassy of Italy in Islamabad & Consulate General in Karachi",
    appointmentSystem: "Online pre-enrolment via Universitaly.it, followed by legalization of educational documents and visa appointment via Gerry's / BLS / Embassy portal.",
    avgProcessingWeeks: 8,
    financialRequirementDesc: "Proof of economic sustenance of approx. 6,000 EUR (~1.8 Million PKR) plus return flight ticket and accommodation proof.",
    financialRequirementEstimatedPkr: 2000000,
    blockedAccountRequired: false,
    tbTestRequired: false,
    insuranceRequired: true,
    interviewRequired: true,
    policeCertificateRequired: false,
    hecAttestationRequired: true,
    lastVerified: "2026-03-25",
    pakistanSpecificNotes: "Requires pre-enrolment validation on Universitaly portal. Academic transcripts must be attested by MOFA Pakistan and then legalized by Italian Embassy or verified through CIMEA Comparability & Verification Statement.",
    keyChecklistItems: [
      { id: "it-1", title: "Universitaly Pre-enrolment Summary (Form A)", desc: "Validated pre-enrolment summary confirmed by the Italian University.", category: "Academic", mandatory: true },
      { id: "it-2", title: "Declaration of Value (DoV) or CIMEA Statement", desc: "Document proving equivalency of Pakistani degree in the Italian educational framework.", category: "Academic", mandatory: true },
      { id: "it-3", title: "Financial Guarantee (Bank Account / DSU Award)", desc: "Bank statement showing at least 6,000 EUR in student or parent account with proof of regular family income.", category: "Financial", mandatory: true },
      { id: "it-4", title: "Proof of Accommodation in Italy", desc: "University dorm contract, host invitation (Dichiarazione di Ospitalità), or hotel booking for 30 days.", category: "Accommodation", mandatory: true },
      { id: "it-5", title: "International Health Insurance", desc: "Policy covering emergency hospitalization and repatriation expenses with min. 30,000 EUR coverage.", category: "Insurance", mandatory: true }
    ]
  }
];

const DEFAULT_ROADMAP_STAGES = [
  { stage: 1, name: "Student Assessment & Profile Setup" },
  { stage: 2, name: "Destination & Budget Planning" },
  { stage: 3, name: "University & Program Shortlisting" },
  { stage: 4, name: "Funding & Scholarship Strategy" },
  { stage: 5, name: "Academic & Document Vault Preparation" },
  { stage: 6, name: "Admission Application Submissions" },
  { stage: 7, name: "Offers Evaluation & Financial Decisions" },
  { stage: 8, name: "Student Visa / Residence Permit Preparation" },
  { stage: 9, name: "Pre-Departure & Accommodation Logistics" },
  { stage: 10, name: "Arrival, University Registration & Settlement" }
];

export function generateInitialTasks(userId: string, targetCountry: string = "Germany"): RoadmapTask[] {
  return [
    {
      id: `task-${Date.now()}-1`,
      userId,
      stageNumber: 1,
      stageName: "Student Assessment & Profile Setup",
      title: "Complete Academic & Budget Profile",
      description: "Fill in your exact CGPA, degree title, Pakistani university, and annual PKR budget on AbroadPilot.",
      status: "completed",
      priority: "urgent",
      dueDate: "2026-05-01",
      completedAt: new Date().toISOString(),
      subtasks: [
        { id: "sub-1-1", title: "Confirm CGPA and maximum grading scale", completed: true },
        { id: "sub-1-2", title: "Set realistic tuition and living cost ceiling in PKR", completed: true },
        { id: "sub-1-3", title: "Define target degree level and subject majors", completed: true }
      ]
    },
    {
      id: `task-${Date.now()}-2`,
      userId,
      stageNumber: 2,
      stageName: "Destination & Budget Planning",
      title: "Evaluate Target Countries & Work Rights",
      description: `Compare ${targetCountry} with alternate destinations regarding post-study work visa rights, cost of living, and language barriers.`,
      status: "in_progress",
      priority: "high",
      dueDate: "2026-05-15",
      subtasks: [
        { id: "sub-2-1", title: "Check tuition fee policies (free in Germany/low in Italy vs high in UK/US)", completed: true },
        { id: "sub-2-2", title: "Review post-study work visa duration (e.g. 18 months for Germany, 2 yrs for UK)", completed: false },
        { id: "sub-2-3", title: "Calculate currency exchange impact on PKR budget", completed: false }
      ]
    },
    {
      id: `task-${Date.now()}-3`,
      userId,
      stageNumber: 3,
      stageName: "University & Program Shortlisting",
      title: "Select 3 Reach, 3 Target, and 2 Safe Universities",
      description: "Use the Discover tool to filter verified programs matching your CGPA and English language level.",
      status: "in_progress",
      priority: "high",
      dueDate: "2026-05-30",
      subtasks: [
        { id: "sub-3-1", title: "Review official program prerequisites and credit requirements", completed: false },
        { id: "sub-3-2", title: "Compare tuition and living expenses side-by-side", completed: false },
        { id: "sub-3-3", title: "Check intake deadlines (Winter / Fall)", completed: false }
      ]
    },
    {
      id: `task-${Date.now()}-4`,
      userId,
      stageNumber: 4,
      stageName: "Funding & Scholarship Strategy",
      title: "Apply for Destination & Government Scholarships",
      description: "Prepare applications for fully funded opportunities (DAAD EPOS, Chevening, Fulbright, or DSU Regional).",
      status: "not_started",
      priority: "high",
      dueDate: "2026-06-15",
      subtasks: [
        { id: "sub-4-1", title: "Review eligibility criteria and document checklists", completed: false },
        { id: "sub-4-2", title: "Request 2 academic/professional recommendation letters", completed: false },
        { id: "sub-4-3", title: "Draft targeted scholarship personal statement", completed: false }
      ]
    },
    {
      id: `task-${Date.now()}-5`,
      userId,
      stageNumber: 5,
      stageName: "Academic & Document Vault Preparation",
      title: "Initiate HEC & IBCC Attestation / APS Certificate",
      description: "Ensure all educational degrees from Matric to Bachelor have original seals and QR codes from Pakistani verification boards.",
      status: "not_started",
      priority: "urgent",
      dueDate: "2026-06-30",
      subtasks: [
        { id: "sub-5-1", title: "Get Matric and FSc attested from IBCC", completed: false },
        { id: "sub-5-2", title: "Get Bachelor transcripts and degree attested online via HEC e-portal", completed: false },
        { id: "sub-5-3", title: "Submit dossier to APS Islamabad (mandatory for Germany)", completed: false },
        { id: "sub-5-4", title: "Upload scanned copies to AbroadPilot Document Vault", completed: false }
      ]
    },
    {
      id: `task-${Date.now()}-6`,
      userId,
      stageNumber: 6,
      stageName: "Admission Application Submissions",
      title: "Submit Direct University Online Applications",
      description: "Complete university portal submissions (Uni-Assist, direct portals, or UCAS) before deadline cut-offs.",
      status: "not_started",
      priority: "high",
      dueDate: "2026-07-15",
      subtasks: [
        { id: "sub-6-1", title: "Upload tailored Statement of Purpose (SOP)", completed: false },
        { id: "sub-6-2", title: "Submit verified English test scores (IELTS/PTE)", completed: false },
        { id: "sub-6-3", title: "Pay application evaluation fees where required", completed: false },
        { id: "sub-6-4", title: "Record application reference number in Applications Tracker", completed: false }
      ]
    },
    {
      id: `task-${Date.now()}-7`,
      userId,
      stageNumber: 7,
      stageName: "Offers Evaluation & Financial Decisions",
      title: "Evaluate Offer Letters & Accept Primary Admission",
      description: "Review conditions (conditional vs unconditional), pay seat confirmation deposit if applicable, and receive formal enrollment certificate.",
      status: "not_started",
      priority: "medium",
      dueDate: "2026-08-01",
      subtasks: [
        { id: "sub-7-1", title: "Compare total cost and scholarships across received offers", completed: false },
        { id: "sub-7-2", title: "Accept primary university offer before confirmation deadline", completed: false },
        { id: "sub-7-3", title: "Request CAS (UK), I-20 (US), or Zulassungsbescheid (Germany)", completed: false }
      ]
    },
    {
      id: `task-${Date.now()}-8`,
      userId,
      stageNumber: 8,
      stageName: "Student Visa / Residence Permit Preparation",
      title: "Fund Blocked Account / 28-day Bank & Attend Embassy Visa Interview",
      description: "Gather visa checklist items, complete embassy application forms, and prepare for oral consular questions.",
      status: "not_started",
      priority: "urgent",
      dueDate: "2026-08-20",
      subtasks: [
        { id: "sub-8-1", title: "Open & fund blocked account (or maintain 28-day bank balance)", completed: false },
        { id: "sub-8-2", title: "Book visa appointment slot at Embassy / VFS / Gerry's", completed: false },
        { id: "sub-8-3", title: "Obtain travel health insurance and TB test clearance (if UK)", completed: false },
        { id: "sub-8-4", title: "Practice visa interview questions using AI Visa Coach", completed: false }
      ]
    },
    {
      id: `task-${Date.now()}-9`,
      userId,
      stageNumber: 9,
      stageName: "Pre-Departure & Accommodation Logistics",
      title: "Secure Student Accommodation & Flight Tickets",
      description: "Reserve student dorm (Studentenwerk / private hall) and purchase one-way flight from Pakistan.",
      status: "not_started",
      priority: "medium",
      dueDate: "2026-09-15",
      subtasks: [
        { id: "sub-9-1", title: "Apply for university housing or flat-share (WG / Zoopla)", completed: false },
        { id: "sub-9-2", title: "Book international flight ticket with student baggage allowance", completed: false },
        { id: "sub-9-3", title: "Pack essentials, winter clothing, and attested original documents", completed: false }
      ]
    },
    {
      id: `task-${Date.now()}-10`,
      userId,
      stageNumber: 10,
      stageName: "Arrival, University Registration & Settlement",
      title: "City Registration (Anmeldung) & University Matriculation",
      description: "Register your address at local city hall, open local bank account, activate health insurance, and attend campus orientation.",
      status: "not_started",
      priority: "low",
      dueDate: "2026-10-15",
      subtasks: [
        { id: "sub-10-1", title: "Complete city hall resident registration upon landing", completed: false },
        { id: "sub-10-2", title: "Activate local student bank account and blocked account payouts", completed: false },
        { id: "sub-10-3", title: "Finalize university in-person enrollment and collect student ID", completed: false }
      ]
    }
  ];
}

export const DEMO_STUDENT_ID = "student-demo-pk-1";

export const DEMO_ACCOUNTS: Record<UserRole, { id: string; fullName: string; email: string }> = {
  student: { id: DEMO_STUDENT_ID, fullName: "Hamza Tariq", email: "hamza.tariq@example.com" },
  adviser: { id: "adviser-pk-1", fullName: "Dr. Tariq Mahmood", email: "adviser@abroadpilot.ai" },
  admin: { id: "admin-pk-1", fullName: "Admissions Board Admin", email: "admin@abroadpilot.ai" }
};

export function buildDefaultProfile(params: {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  residenceCity?: string;
  targetDegree?: StudentProfile['targetDegree'];
}): StudentProfile {
  return {
    id: params.id,
    fullName: params.fullName,
    email: params.email,
    role: params.role,
    nationality: 'Pakistani',
    residenceCity: params.residenceCity || 'Lahore, Pakistan',
    targetDegree: params.targetDegree || 'Master',
    intendedMajor: 'Computer Science & Artificial Intelligence',
    preferredCountries: ['Germany', 'United Kingdom', 'Italy'],
    currentEducationLevel: 'Bachelor (4 Years BS CS)',
    degreeTitle: 'Bachelor of Science',
    institutionName: 'FAST-NUCES / NUST',
    cgpa: 3.3,
    maxCgpa: 4.0,
    graduationYear: 2025,
    ieltsStatus: 'Preparing',
    maxTuitionBudgetPkr: 2500000,
    fundingPreference: 'Partial Scholarship + Self',
    studyGapYears: 0,
    workExperienceYears: 1,
    isOnboarded: true,
    updatedAt: new Date().toISOString()
  };
}

// Full sample workspace for the "Hamza Tariq" demo student
export function buildDemoStudentSeed() {
  // Default demo student profile
  const defaultStudentId = DEMO_STUDENT_ID;
  const defaultProfile: StudentProfile = {
    id: defaultStudentId,
    fullName: "Hamza Tariq",
    email: "hamza.tariq@example.com",
    role: "student",
    phone: "+92 300 1234567",
    nationality: "Pakistani",
    residenceCity: "Lahore, Punjab",
    targetDegree: "Master",
    intendedMajor: "Computer Science & Artificial Intelligence",
    preferredCountries: ["Germany", "United Kingdom", "Italy"],
    currentEducationLevel: "Bachelor (4 Years BS CS)",
    degreeTitle: "BS Computer Science",
    institutionName: "FAST-NUCES Lahore",
    cgpa: 3.35,
    maxCgpa: 4.0,
    percentage: 78,
    graduationYear: 2025,
    ieltsStatus: "Completed",
    ieltsScore: 7.0,
    toeflScore: undefined,
    duolingoScore: undefined,
    greScore: undefined,
    maxTuitionBudgetPkr: 2500000,
    fundingPreference: "Partial Scholarship + Self",
    studyGapYears: 0,
    workExperienceYears: 1,
    isOnboarded: true,
    updatedAt: new Date().toISOString()
  };

  const initialTasks = generateInitialTasks(defaultStudentId, "Germany");

  const initialDocs: StudentDocument[] = [
    {
      id: "doc-1",
      userId: defaultStudentId,
      name: "Official_Bachelor_Transcript_FAST.pdf",
      category: "Transcript",
      fileType: "application/pdf",
      fileSize: 1420000,
      uploadedAt: "2026-04-10T10:30:00Z",
      status: "attested",
      notes: "Attested by HEC Pakistan with QR verification code."
    },
    {
      id: "doc-2",
      userId: defaultStudentId,
      name: "IELTS_Academic_TRF_Hamza.pdf",
      category: "English Test",
      fileType: "application/pdf",
      fileSize: 850000,
      uploadedAt: "2026-04-12T14:15:00Z",
      status: "verified",
      notes: "Overall 7.0 (L: 7.5, R: 7.0, W: 6.5, S: 7.0)."
    },
    {
      id: "doc-3",
      userId: defaultStudentId,
      name: "Hamza_Tariq_Europass_Resume.pdf",
      category: "CV",
      fileType: "application/pdf",
      fileSize: 420000,
      uploadedAt: "2026-04-15T09:00:00Z",
      status: "verified",
      notes: "Updated with Final Year Project & 1 year software development experience."
    }
  ];

  const initialApps: Application[] = [
    {
      id: "app-1",
      userId: defaultStudentId,
      universityId: "uni-tum-de",
      universityName: "Technical University of Munich (TUM)",
      country: "Germany",
      programTitle: "M.Sc. Informatics (Computer Science)",
      degreeLevel: "Master",
      intakeTerm: "Winter 2026",
      deadline: "2026-05-31",
      portalUrl: "https://campus.tum.de",
      applicationRefNo: "TUM-2026-89214",
      status: "Preparing",
      feePkr: 0,
      scholarshipApplied: "DAAD EPOS / TUM Merit Grant",
      notes: "Waiting for APS certificate issuance to upload on TUMonline.",
      updatedAt: new Date().toISOString()
    },
    {
      id: "app-2",
      userId: defaultStudentId,
      universityId: "uni-polimi-it",
      universityName: "Politecnico di Milano",
      country: "Italy",
      programTitle: "M.Sc. Computer Science and Engineering",
      degreeLevel: "Master",
      intakeTerm: "Autumn 2026",
      deadline: "2026-03-15",
      portalUrl: "https://www.polimi.it/online-services",
      applicationRefNo: "POLIMI-MS-4410",
      status: "Submitted",
      submissionDate: "2026-03-10",
      feePkr: 16500,
      scholarshipApplied: "DSU Regional Grant",
      notes: "Documents evaluated, awaiting committee outcome in late May.",
      updatedAt: new Date().toISOString()
    }
  ];


  return {
    profile: defaultProfile,
    tasks: initialTasks,
    documents: initialDocs,
    applications: initialApps,
    savedUniversityIds: ["uni-tum-de", "uni-rwth-de", "uni-polimi-it"],
    savedScholarshipIds: ["sch-daad-epos-de", "sch-italy-dsu"]
  };
}
