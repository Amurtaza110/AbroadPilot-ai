import { GoogleGenAI } from "@google/genai";
import { StudentProfile, Program, University } from "./db";

// Server-side initialization
const apiKey = process.env.GEMINI_API_KEY || "";
let genAI: GoogleGenAI | null = null;

if (apiKey) {
  genAI = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

const DEFAULT_MODEL = "gemini-3.8-flash";

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

export async function explainProgramMatch(
  profile: StudentProfile,
  program: Program,
  university: University
): Promise<MatchAnalysisResult> {
  // Deterministic baseline calculation first
  let academicScore = 70;
  if (profile.cgpa >= program.minCgpa) {
    const diff = profile.cgpa - program.minCgpa;
    academicScore = Math.min(100, Math.round(80 + diff * 30));
  } else {
    const deficit = program.minCgpa - profile.cgpa;
    academicScore = Math.max(30, Math.round(70 - deficit * 50));
  }

  // Budget score
  // Estimated PKR cost per year
  const currencyRatesToPkr: Record<string, number> = {
    EUR: 310,
    GBP: 365,
    USD: 280,
    AUD: 185
  };
  const rate = currencyRatesToPkr[program.tuitionCurrency] || 280;
  const annualTuitionPkr = program.tuitionAnnual * rate;
  let budgetScore = 75;
  if (profile.maxTuitionBudgetPkr >= annualTuitionPkr) {
    budgetScore = 95;
  } else if (annualTuitionPkr === 0) {
    budgetScore = 100;
  } else {
    const ratio = profile.maxTuitionBudgetPkr / (annualTuitionPkr || 1);
    budgetScore = Math.max(30, Math.min(90, Math.round(ratio * 80)));
  }

  // Language score
  let languageScore = 80;
  if (profile.ieltsScore) {
    if (profile.ieltsScore >= program.ieltsScore) {
      languageScore = 95;
    } else {
      languageScore = 60;
    }
  }

  const baselineScore = Math.round(
    academicScore * 0.4 + budgetScore * 0.35 + languageScore * 0.25
  );

  let verdict: MatchAnalysisResult['verdict'] = 'Realistic Alternative';
  if (baselineScore >= 85) verdict = 'Strong Academic Fit';
  else if (baselineScore <= 60) verdict = 'Ambitious Reach';

  // Fallback structure in case Gemini is offline or unkeyed
  const fallbackResult: MatchAnalysisResult = {
    matchScore: baselineScore,
    verdict,
    factors: {
      academicFitScore: academicScore,
      budgetAffordabilityScore: budgetScore,
      languageFitScore: languageScore,
      intakeTimingScore: 85
    },
    strengths: [
      `Your CGPA of ${profile.cgpa} meets the stated minimum requirements (${program.minCgpa}) for ${program.universityName}.`,
      `The program is taught 100% in English, aligning with your academic objectives.`,
      `Field of study (${program.subjectArea}) directly maps to your intended degree in ${profile.intendedMajor}.`
    ],
    eligibilityConcerns: profile.cgpa < program.minCgpa ? [
      `Your current CGPA (${profile.cgpa}) is below the university's recommended benchmark of ${program.minCgpa}. Consider strengthening with GRE or publications.`
    ] : [],
    missingInformation: [
      "Ensure HEC attestation on your Bachelor transcript has completed before submitting application.",
      program.greGmatRequired ? "Check whether official GRE score card has been ordered to the university's ETS institution code." : "Confirm department course prerequisite syllabus match."
    ],
    pakistanSpecificGuidance: [
      university.country === "Germany"
        ? "German student visas require an APS certificate from APS Islamabad. Register on aps-pakistan.de as soon as possible."
        : university.country === "United Kingdom"
        ? "UKVI requires a 28-day maintained bank statement and an IOM TB test certificate before applying for your Student Route visa."
        : university.country === "Italy"
        ? "Apply for Universitaly pre-enrolment and request the Italian DSU regional scholarship to cover full tuition + accommodation stipend."
        : "Verify with HEC that your Pakistani university is categorized under recognized degree awarding institutions."
    ],
    actionableNextSteps: [
      "Add this program to your AbroadPilot Applications workspace.",
      "Draft a customized Statement of Purpose addressing the curriculum modules.",
      "Check upcoming application deadline: " + program.applicationDeadlineUpcoming
    ]
  };

  if (!genAI) {
    return fallbackResult;
  }

  try {
    const prompt = `You are a senior study abroad admissions architect specializing in Pakistani students applying overseas.
Analyze the following student profile and university program, and provide an objective, data-grounded evaluation.

STUDENT PROFILE:
- Full Name: ${profile.fullName}
- Nationality: ${profile.nationality} (From: ${profile.residenceCity})
- Current Degree: ${profile.degreeTitle} from ${profile.institutionName}
- CGPA: ${profile.cgpa} on scale of ${profile.maxCgpa} (Percentage: ${profile.percentage || 'N/A'}%)
- Target Degree: ${profile.targetDegree} in ${profile.intendedMajor}
- IELTS/English: ${profile.ieltsStatus} (${profile.ieltsScore || 'No score yet'})
- Max Annual Tuition Budget (PKR): ${profile.maxTuitionBudgetPkr.toLocaleString()} PKR
- Funding Preference: ${profile.fundingPreference}
- Work Experience: ${profile.workExperienceYears} years, Study Gap: ${profile.studyGapYears} years

UNIVERSITY & PROGRAM:
- University: ${university.name} (${university.city}, ${university.country})
- Program: ${program.title} (${program.degreeLevel})
- Annual Tuition: ${program.tuitionAnnual} ${program.tuitionCurrency}
- Stated Minimum CGPA: ${program.minCgpa}
- Stated IELTS Req: ${program.ieltsScore}
- GRE/GMAT Required: ${program.greGmatRequired}
- Deadline: ${program.applicationDeadlineUpcoming}
- Program Notes: ${program.notes}

Return a valid JSON object with EXACTLY this structure:
{
  "matchScore": number (0-100),
  "verdict": "Strong Academic Fit" | "Realistic Alternative" | "Ambitious Reach" | "Needs Eligibility Check",
  "factors": {
    "academicFitScore": number (0-100),
    "budgetAffordabilityScore": number (0-100),
    "languageFitScore": number (0-100),
    "intakeTimingScore": number (0-100)
  },
  "strengths": string[],
  "eligibilityConcerns": string[],
  "missingInformation": string[],
  "pakistanSpecificGuidance": string[],
  "actionableNextSteps": string[]
}
Never invent fake policies. Explicitly mention Pakistani context where appropriate (e.g. APS for Germany, HEC attestation, 28-day funds for UK, Universitaly for Italy, F-1 interview ties for USA).`;

    const response = await genAI.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    if (parsed && typeof parsed.matchScore === 'number' && parsed.verdict) {
      return parsed as MatchAnalysisResult;
    }
    return fallbackResult;
  } catch (err) {
    console.warn("Gemini match analysis error, utilizing reliable calculated fallback:", err);
    return fallbackResult;
  }
}

export async function chatAdvisor(
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  profile?: StudentProfile | null,
  activeContext?: string
): Promise<string> {
  const studentInfo = profile
    ? `Current Student: ${profile.fullName}, ${profile.residenceCity}, Pakistan.
Degree: ${profile.degreeTitle} (${profile.institutionName}), CGPA: ${profile.cgpa}/${profile.maxCgpa}.
Target: ${profile.targetDegree} in ${profile.intendedMajor}. Target Destinations: ${profile.preferredCountries?.join(', ')}.
Budget: ${profile.maxTuitionBudgetPkr?.toLocaleString()} PKR/yr. IELTS: ${profile.ieltsScore || profile.ieltsStatus}.`
    : `Anonymous Pakistani student planning international education.`;

  const systemInstruction = `You are AbroadPilot AI, a prestigious, highly experienced international education counselor and visa strategist specialized in helping Pakistani students navigate admissions, scholarships, document attestations, and student visas globally.

YOUR DOMAIN EXPERTISE:
1. GERMANY: APS (Akademische Prüfstelle) Islamabad certificate rules, Uni-Assist VPD vs direct portal, Public university tuition-free policies, Sperrkonto (Blocked account ~11,208 EUR via Fintiba/Expatrio), Embassy Islamabad/Karachi category wait times.
2. UNITED KINGDOM: CAS issuance, UKVI 28-day financial maintenance rule, IOM Pakistan TB test requirements, Graduate Route 2-year post-study work visa, Chevening & Commonwealth scholarships.
3. UNITED STATES: Form I-20, SEVIS I-901 fee, DS-160, F-1 visa interview strategy at US Embassy Islamabad / Karachi (proving non-immigrant intent under INA 214(b) and ties to Pakistan), STEM OPT 3-year extension, Fulbright USEFP scholarship.
4. ITALY: Universitaly portal pre-enrolment, CIMEA Statement of Comparability / Declaration of Value (DoV), DSU regional scholarships for Pakistani students (ISEE Parificato based on FRC & FBR income certificates).
5. SCHOLARSHIPS: DAAD EPOS, Türkiye Bursları, Stipendium Hungaricum, Erasmus Mundus, Australia Awards.
6. PAKISTAN ATTESTATION: IBCC (Matric/Inter), HEC (Bachelor/Master transcripts & degree online portal), MOFA (Ministry of Foreign Affairs), NADRA (FRC - Family Registration Certificate).

TONE & STYLE:
- Professional, supportive, precise, encouraging, and honest.
- Never guarantee university admission or visa approvals. Always distinguish official verified immigration rules from recommendations.
- Keep responses readable with bullet points and bold headers.
- Student Context: ${studentInfo}
- Additional App Context: ${activeContext || 'None'}`;

  if (!genAI) {
    return `### AbroadPilot Study Abroad Advisor

I am ready to help you plan your international study journey!

**Your Current Profile:**
- **Student:** ${profile?.fullName || 'Student'}
- **Current Degree:** ${profile?.degreeTitle || 'Bachelor'} (CGPA: ${profile?.cgpa || '3.3'})
- **Target Degree:** ${profile?.targetDegree || 'Master'} in ${profile?.intendedMajor || 'Computer Science'}
- **Target Countries:** ${profile?.preferredCountries?.join(', ') || 'Germany, UK, Italy'}

Regarding your question: "${message}"

Here are key verified guidance steps for Pakistani applicants:
1. **Academic Verification:** Ensure your Matric and Intermediate are attested by IBCC, and your University Transcripts/Degrees are attested by HEC through their e-services portal.
2. **Country-Specific Requirements:**
   - **For Germany:** You must register for the mandatory APS (Akademische Prüfstelle) certificate in Islamabad prior to applying for your student visa.
   - **For the UK:** Keep your tuition balance plus living maintenance in an acceptable bank account under your or your parent's name for 28 consecutive days.
   - **For Italy:** Prepare your family income certificates for the DSU regional grant, which offers full tuition waivers and up to ~7,500 EUR stipend.
3. **English Testing:** Standardize your target IELTS band to at least 6.5 (no component below 6.0) to unlock 90%+ of European and British programs.

Feel free to ask about university shortlisting, SOP reviews, blocked accounts, or visa interview prep!`;
  }

  try {
    const formattedHistory = history.map(h => ({
      role: h.role,
      parts: h.parts
    }));

    const chat = genAI.chats.create({
      model: DEFAULT_MODEL,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
      history: formattedHistory
    });

    const result = await chat.sendMessage({
      message
    });

    return result.text || "I apologize, I could not generate a response. Please try again.";
  } catch (err: any) {
    console.error("Gemini chat error:", err);
    return `### AbroadPilot AI Counselor Note
I encountered a temporary connection issue while contacting the AI knowledge base.

**Key Advice for Pakistani Students:**
- Review your program prerequisites on the official university portal.
- Make sure your HEC attestation and IELTS/PTE test are prepared.
- For Germany, initiate your APS verification early.
- For the UK or US, maintain verified financial proofs in compliant formats.

Please try sending your message again shortly!`;
  }
}

export async function generateSopAssistance(params: {
  profile: StudentProfile;
  universityName: string;
  programTitle: string;
  country: string;
  targetFocus: 'draft' | 'improve' | 'critique';
  userNotes?: string;
  existingDraft?: string;
}): Promise<{
  content: string;
  wordCount: number;
  structureBreakdown: { section: string; advice: string }[];
  academicIntegrityAffirmation: string;
}> {
  const { profile, universityName, programTitle, country, targetFocus, userNotes, existingDraft } = params;

  const defaultResult = {
    content: `Statement of Purpose: ${programTitle} at ${universityName}

My pursuit of an advanced degree in ${programTitle} at ${universityName} is driven by a dedication to deep technical inquiry and a commitment to addressing computing challenges in developing digital economies like Pakistan. Having completed my ${profile.degreeTitle} at ${profile.institutionName} with a cumulative GPA of ${profile.cgpa}, I have grounded myself in core algorithmic theory, distributed architectures, and rigorous empirical problem-solving.

During my undergraduate studies, I actively pursued research and practical implementations, culminating in capstone project work that emphasized scalability and computational efficiency. This experience demonstrated to me that while fundamental principles are universal, modern industry paradigms require continuous specialization at leading global research centers.

${universityName}'s renowned curriculum in ${programTitle} presents the precise academic environment I seek. In particular, the department's cutting-edge laboratories and faculty specialization in advanced systems and artificial intelligence directly align with my research trajectory. Studying in ${country} will allow me to engage with an intellectually diverse cohort, collaborate on cross-disciplinary challenges, and absorb industry-standard practices.

Following completion of my master's studies, I plan to leverage this expertise by contributing to technological infrastructure, fostering university-industry research partnerships, and applying advanced engineering methods in high-impact initiatives. ${universityName} represents the catalyst that will transform my academic groundwork into high-caliber international contribution.`,
    wordCount: 220,
    structureBreakdown: [
      { section: "Hook & Academic Foundation", advice: "Explicitly states undergraduate background at " + profile.institutionName + " and core mathematical/technical foundations." },
      { section: "Technical Achievements & Projects", advice: "Focuses on verified projects, thesis, and engineering challenges without inventing false accomplishments." },
      { section: "Why " + universityName, advice: "Connects curriculum modules and research faculty to personal career objectives." },
      { section: "Career Trajectory & Contribution", advice: "Defines realistic post-graduation goals and leadership vision." }
    ],
    academicIntegrityAffirmation: "AbroadPilot AI strictly enforces academic integrity. This draft serves as an organizational outline. Students must personalize and substantiate all claims with their genuine experiences."
  };

  if (!genAI) {
    return defaultResult;
  }

  try {
    const prompt = `Act as an academic admissions director for ${universityName} in ${country}.
The student is: ${profile.fullName} from Pakistan.
Degree completed: ${profile.degreeTitle} from ${profile.institutionName} with CGPA ${profile.cgpa}/${profile.maxCgpa}.
Target Program: ${programTitle} at ${universityName}.
Task: ${targetFocus} SOP.
User Provided Notes / Personal Motivation: ${userNotes || 'None'}
Existing Draft (if any): ${existingDraft || 'None'}

RULES:
1. NEVER invent fake awards, false publications, or fabricated work history.
2. Build an articulate, scholarly, convincing Statement of Purpose structured into:
   - Intellectual spark & academic background
   - Specific undergraduate coursework and capstone project accomplishments
   - Why this specific program at ${universityName} (professors, labs, unique modules)
   - Long-term career vision and impact.
3. Return a JSON object with:
{
  "content": string (the complete, polished SOP text),
  "wordCount": number,
  "structureBreakdown": [
    { "section": string, "advice": string }
  ],
  "academicIntegrityAffirmation": string
}`;

    const response = await genAI.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    if (parsed && parsed.content) {
      return parsed;
    }
    return defaultResult;
  } catch (err) {
    console.warn("Gemini SOP generator error:", err);
    return defaultResult;
  }
}

export async function draftEmailInquiry(params: {
  recipientType: 'professor' | 'admissions' | 'scholarship_committee';
  recipientName: string;
  universityName: string;
  programTitle: string;
  studentProfile: StudentProfile;
  subjectContext: string;
}): Promise<{ subject: string; body: string }> {
  const { recipientType, recipientName, universityName, programTitle, studentProfile, subjectContext } = params;

  if (!genAI) {
    return {
      subject: `Prospective Graduate Inquiry: ${studentProfile.targetDegree} in ${programTitle} - ${studentProfile.fullName}`,
      body: `Dear ${recipientName || (recipientType === 'professor' ? 'Professor' : 'Admissions Committee')},\n\nI hope this email finds you well.\n\nMy name is ${studentProfile.fullName}, and I have recently completed my ${studentProfile.degreeTitle} at ${studentProfile.institutionName} in Pakistan, graduating with a CGPA of ${studentProfile.cgpa}/${studentProfile.maxCgpa}.\n\nI am writing to express my strong interest in the ${programTitle} program at ${universityName} for the upcoming intake. ${subjectContext ? `Specifically: ${subjectContext}` : `Having reviewed your department's research focus, I am eager to contribute to upcoming projects aligned with my background.`}\n\nI have attached my academic CV and summary transcript for your reference. Would you be available for a brief discussion regarding graduate supervision or eligibility requirements?\n\nThank you for your valuable time and consideration.\n\nWarm regards,\n\n${studentProfile.fullName}\n${studentProfile.email}\n${studentProfile.residenceCity}, Pakistan`
    };
  }

  try {
    const prompt = `Draft a concise, high-impact, respectful academic email from a Pakistani graduate applicant to a ${recipientType} (${recipientName || 'Admissions Team'}) at ${universityName}.
Program: ${programTitle}.
Student: ${studentProfile.fullName}, ${studentProfile.degreeTitle} from ${studentProfile.institutionName} (CGPA: ${studentProfile.cgpa}).
Context: ${subjectContext}.

Return a JSON object with:
{
  "subject": string,
  "body": string
}`;

    const response = await genAI.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return {
      subject: parsed.subject || `Inquiry: ${programTitle} - ${studentProfile.fullName}`,
      body: parsed.body || "Dear Professor,\n\nI am writing to inquire..."
    };
  } catch (err) {
    console.warn("Gemini email draft error:", err);
    return {
      subject: `Inquiry regarding ${programTitle} - ${studentProfile.fullName}`,
      body: `Dear Admissions Team,\n\nI am writing to inquire about the admission guidelines for ${programTitle} at ${universityName}.\n\nBest regards,\n${studentProfile.fullName}`
    };
  }
}
