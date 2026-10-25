// ============================================================
// Gemini AI Service — Direct frontend integration
// Uses @google/genai with streaming support
// ============================================================
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { UserProfile, GroundingSource, ChatMessage, MatchAnalysis, OnboardingData } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

let genAI: GoogleGenAI | null = null;
if (API_KEY) {
  genAI = new GoogleGenAI({ apiKey: API_KEY });
}

const GEMINI_MODEL = 'gemini-flash-latest';
const GEMINI_PRO_MODEL = 'gemini-pro-latest';

// ─── System Prompt Builder ────────────────────────────────────

function buildSystemPrompt(profile?: UserProfile | null): string {
  const profileContext = profile
    ? `
## Active Student Profile
- **Name**: ${profile.fullName}
- **Nationality**: ${profile.nationality}
- **Degree Goal**: ${profile.targetDegree} in ${profile.intendedMajors.join(', ')}
- **Target Countries**: ${profile.preferredCountries.join(', ')}
- **Academic**: ${profile.degreeTitle} from ${profile.institutionName}, CGPA ${profile.cgpa}/${profile.maxCgpa}
- **Language**: IELTS ${profile.ieltsScore ? profile.ieltsScore : profile.ieltsStatus}
- **Budget**: Up to $${profile.maxTuitionBudgetUsd.toLocaleString()} USD/year
- **Funding**: ${profile.fundingPreference}
- **Work Experience**: ${profile.workExperienceYears} years
`
    : '(Student profile not yet complete — ask for relevant details as needed)';

  return `You are AbroadPilot AI, an expert international education consultant and AI advisor. You help students worldwide plan their study abroad journey with expert, personalized, and up-to-date guidance.

## Your Expertise Areas
1. **University Discovery**: Finding programs that match student profiles, deadlines, requirements
2. **Scholarship Hunting**: Fully-funded and partial scholarships, eligibility, application strategies
3. **Visa Guidance**: Country-specific student visa requirements, document checklists, timelines
4. **Application Strategy**: SOPs, LORs, interview preparation, application timelines
5. **Cost Planning**: Tuition, living costs, funding options, financial planning
6. **AI Auto-Apply Agent**: Monitoring portals and automating applications (Phase 2 feature)

## Communication Style
- Be specific, actionable, and empathetic
- Always cite sources and recommend official portals
- Use structured formatting (bullet points, tables) for complex information
- Proactively mention deadlines and time-sensitive information
- Flag potential issues in a student's profile honestly but constructively

## Important Rules
- Never make up university admission statistics — say "verify on the official portal"
- Always recommend Google Search verification for deadlines and fees
- Maintain conversation context across messages
- Be culturally sensitive and globally inclusive

${profileContext}`;
}

// ─── Main Chat Function (Streaming) ──────────────────────────

export interface ChatOptions {
  useWebSearch?: boolean;
  profile?: UserProfile | null;
  history?: { role: string; parts: { text: string }[] }[];
}

export interface StreamChunk {
  text: string;
  done: boolean;
  sources?: GroundingSource[];
  searchQueries?: string[];
}

export async function streamChat(
  message: string,
  options: ChatOptions = {},
  onChunk: (chunk: StreamChunk) => void
): Promise<void> {
  if (!genAI) {
    onChunk({ text: '⚠️ Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.', done: true });
    return;
  }

  const { useWebSearch = true, profile, history = [] } = options;
  const systemInstruction = buildSystemPrompt(profile);

  // Build message contents
  const contents = [
    ...history.map(h => ({
      role: h.role as 'user' | 'model',
      parts: h.parts
    })),
    {
      role: 'user' as const,
      parts: [{ text: message }]
    }
  ];

  try {
    let result;
    try {
      result = await genAI.models.generateContentStream({
        model: GEMINI_MODEL,
        contents,
        config: {
          systemInstruction,
          ...(useWebSearch ? { tools: [{ googleSearch: {} }] } : {}),
          temperature: 0.7,
          maxOutputTokens: 4096,
        }
      });
    } catch (initialErr: any) {
      // If search grounding or initial call hit rate limits/unsupported tools, retry with standard generation
      if (useWebSearch) {
        result = await genAI.models.generateContentStream({
          model: GEMINI_MODEL,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 4096,
          }
        });
      } else {
        throw initialErr;
      }
    }

    let sources: GroundingSource[] = [];
    let searchQueries: string[] = [];

    for await (const chunk of result) {
      const chunkText = chunk.text ?? '';

      // Extract grounding metadata from candidates
      const candidate = chunk.candidates?.[0];
      if (candidate?.groundingMetadata) {
        const meta = candidate.groundingMetadata;
        if (meta.groundingChunks?.length) {
          sources = (meta.groundingChunks as any[])
            .filter(c => c.web)
            .map(c => ({
              title: c.web.title || 'Web Source',
              uri: c.web.uri || '',
            }));
        }
        if (meta.webSearchQueries?.length) {
          searchQueries = meta.webSearchQueries as string[];
        }
      }

      onChunk({
        text: chunkText,
        done: false,
        sources: sources.length > 0 ? sources : undefined,
        searchQueries: searchQueries.length > 0 ? searchQueries : undefined,
      });
    }

    onChunk({ text: '', done: true, sources, searchQueries });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    const isRateLimit = error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED') || error.message?.includes('quota');
    const msg = isRateLimit
      ? '\n\n⏳ **Google AI Studio Rate Limit**: Your free API key is currently experiencing high request volume. Please wait 30 seconds and send your query again.'
      : `\n\n⚠️ AI advisor message: ${error.message || 'Unable to connect to model'}. Please try again shortly.`;

    onChunk({
      text: msg,
      done: true,
    });
  }
}

// ─── Onboarding: AI Roadmap Generator ────────────────────────

export async function generatePersonalizedRoadmap(profile: OnboardingData): Promise<string> {
  if (!genAI) return '';

  const prompt = `Based on this student profile, generate a detailed, personalized 10-stage study abroad roadmap.

**Profile**:
- Target: ${profile.targetDegree} in ${profile.intendedMajors.join(', ')}
- Countries: ${profile.preferredCountries.join(', ')}
- CGPA: ${profile.cgpa}/${profile.maxCgpa}
- Language: ${profile.ieltsStatus} (Score: ${profile.ieltsScore || 'not taken'})
- Budget: $${profile.maxTuitionBudgetUsd}/year
- Funding: ${profile.fundingPreference}
- Work Exp: ${profile.workExperienceYears} years

Return a JSON array of tasks with this structure:
{
  "stage": number (1-10),
  "stageName": string,
  "title": string,
  "description": string,
  "priority": "low" | "medium" | "high" | "urgent",
  "dueDate": "YYYY-MM-DD" (realistic based on current date ${new Date().toISOString().split('T')[0]}),
  "officialLink": string (relevant official URL),
  "subtasks": [{ "id": "s1", "title": string, "completed": false }]
}

Respond with ONLY the JSON array, no markdown.`;

  try {
    const result = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.3, maxOutputTokens: 4096 }
    });
    return result.text || '';
  } catch (err) {
    console.error('Roadmap generation error:', err);
    return '';
  }
}

// ─── AI University Match Analyzer ────────────────────────────

export async function analyzeUniversityMatch(
  profile: UserProfile,
  universityName: string,
  programTitle: string,
  programDetails: Record<string, unknown>
): Promise<MatchAnalysis | null> {
  if (!genAI) return null;

  const prompt = `Analyze how well this student matches this university program. Return ONLY a JSON object.

**Student Profile**: 
- CGPA: ${profile.cgpa}/${profile.maxCgpa}
- IELTS: ${profile.ieltsScore || 'not taken'}
- Budget: $${profile.maxTuitionBudgetUsd}/year
- Degree: ${profile.targetDegree} in ${profile.intendedMajors.join(', ')}
- Work Exp: ${profile.workExperienceYears} years

**Program**: ${universityName} — ${programTitle}
**Details**: ${JSON.stringify(programDetails)}

Return JSON:
{
  "matchScore": number (0-100),
  "verdict": "Strong Fit" | "Good Match" | "Reach Program" | "Safety School" | "Eligibility Check Needed",
  "factors": { "academic": number, "budget": number, "language": number, "timing": number },
  "strengths": string[],
  "concerns": string[],
  "recommendations": string[],
  "nextSteps": string[]
}`;

  try {
    const result = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.2, maxOutputTokens: 1024 }
    });
    const text = result.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as MatchAnalysis;
    return null;
  } catch (err) {
    console.error('Match analysis error:', err);
    return null;
  }
}

// ─── SOP Generator ───────────────────────────────────────────

export interface SopOptions {
  university: string;
  program: string;
  country: string;
  profile: UserProfile;
  wordLimit?: number;
  tone?: 'formal' | 'academic' | 'enthusiastic';
}

export async function generateSop(
  options: SopOptions,
  onChunk: (chunk: StreamChunk) => void
): Promise<void> {
  if (!genAI) {
    onChunk({ text: '⚠️ Gemini API key required', done: true });
    return;
  }

  const { university, program, country, profile, wordLimit = 800, tone = 'academic' } = options;

  const prompt = `Write a compelling Statement of Purpose (SOP) for:

**University**: ${university}
**Program**: ${program}
**Country**: ${country}
**Student**: ${profile.fullName}

**Profile Details**:
- Education: ${profile.degreeTitle} from ${profile.institutionName}, CGPA ${profile.cgpa}/${profile.maxCgpa}
- Work Experience: ${profile.workExperienceYears} years
- Research/Extra: ${profile.extracurriculars || 'Not specified'}
- Career Goal: Pursuing ${profile.targetDegree} in ${profile.intendedMajors.join(', ')}

**Requirements**:
- Approximately ${wordLimit} words
- Tone: ${tone}
- Structure: Opening hook → Academic background → Why this program/university → Career goals → Closing
- Highlight specific research interests relevant to ${program}
- Mention why ${country} / ${university} specifically
- Do NOT use generic phrases like "Since childhood I dreamed..."

Write the complete SOP:`;

  try {
    const result = await genAI.models.generateContentStream({
      model: GEMINI_PRO_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.8, maxOutputTokens: 2048 }
    });

    for await (const chunk of result) {
      onChunk({ text: chunk.text || '', done: false });
    }
    onChunk({ text: '', done: true });
  } catch (err: any) {
    onChunk({ text: `Error: ${err.message}`, done: true });
  }
}

// ─── Email Generator ─────────────────────────────────────────

export interface EmailOptions {
  type: 'professor_inquiry' | 'funding_request' | 'scholarship_followup' | 'application_followup';
  recipientName?: string;
  recipientTitle?: string;
  university: string;
  program: string;
  profile: UserProfile;
  researchTopic?: string;
}

export async function generateEmail(
  options: EmailOptions,
  onChunk: (chunk: StreamChunk) => void
): Promise<void> {
  if (!genAI) {
    onChunk({ text: '⚠️ Gemini API key required', done: true });
    return;
  }

  const { type, recipientName, university, program, profile, researchTopic } = options;

  const emailTypeDescriptions = {
    professor_inquiry: 'Cold email to a professor expressing interest in their research and asking about PhD/research opportunities',
    funding_request: 'Email requesting financial aid, scholarship, or waiver from the admissions committee',
    scholarship_followup: 'Follow-up email after submitting a scholarship application',
    application_followup: 'Professional follow-up on a submitted application requesting status update',
  };

  const prompt = `Write a professional ${emailTypeDescriptions[type]}.

**Student**: ${profile.fullName}
**Target**: ${recipientName || 'Admissions Committee'} at ${university}
**Program**: ${program}
**Student Background**: ${profile.degreeTitle} CGPA ${profile.cgpa}/${profile.maxCgpa}, ${profile.workExperienceYears} years experience
${researchTopic ? `**Research Interest**: ${researchTopic}` : ''}

Requirements:
- Professional, concise, and respectful
- Clear subject line
- Compelling opening paragraph
- Specific mention of the program/university
- Strong closing with clear next step
- 250-350 words maximum

Format as:
Subject: [subject line]

[email body]`;

  try {
    const result = await genAI.models.generateContentStream({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.6, maxOutputTokens: 1024 }
    });

    for await (const chunk of result) {
      onChunk({ text: chunk.text || '', done: false });
    }
    onChunk({ text: '', done: true });
  } catch (err: any) {
    onChunk({ text: `Error: ${err.message}`, done: true });
  }
}

// ─── Visa Checklist Generator ─────────────────────────────────

export async function generateVisaChecklist(
  country: string,
  nationality: string,
  degreeLevel: string,
  onChunk: (chunk: StreamChunk) => void
): Promise<void> {
  if (!genAI) {
    onChunk({ text: '⚠️ Gemini API key required', done: true });
    return;
  }

  const prompt = `Generate a detailed student visa checklist for:
- **Destination Country**: ${country}
- **Student Nationality**: ${nationality}
- **Degree Level**: ${degreeLevel}

Include:
1. Required documents (with specific details like format, validity requirements)
2. Application steps in chronological order
3. Financial requirements (amounts and proof needed)
4. Health/medical requirements
5. Language requirements
6. Average processing time
7. Official portal URL
8. Country-specific tips and common rejection reasons
9. Timeline recommendation (how many months before intake to start)

Be specific and practical. Use current 2024-2025 requirements.`;

  try {
    const result = await genAI.models.generateContentStream({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
        maxOutputTokens: 3072
      }
    });

    let sources: GroundingSource[] = [];
    for await (const chunk of result) {
      const chunkText = chunk.text || '';
      if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        sources = chunk.candidates[0].groundingMetadata.groundingChunks
          .filter((c: any) => c.web)
          .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));
      }
      onChunk({ text: chunkText, done: false, sources: sources.length > 0 ? sources : undefined });
    }
    onChunk({ text: '', done: true, sources });
  } catch (err: any) {
    onChunk({ text: `Error: ${err.message}`, done: true });
  }
}

// ─── Cost Estimate Generator ──────────────────────────────────

export async function estimateCosts(
  country: string,
  city: string,
  program: string,
  degreeLevel: string,
  durationMonths: number
): Promise<string> {
  if (!genAI) return '';

  const prompt = `Provide a realistic cost breakdown for a student studying in ${city}, ${country}.

**Program**: ${program} (${degreeLevel})
**Duration**: ${durationMonths} months

Return ONLY a JSON object with ALL amounts in USD:
{
  "tuitionAnnualUsd": number,
  "livingAnnualUsd": number,
  "healthInsuranceAnnualUsd": number,
  "visaFeeUsd": number,
  "flightUsd": number,
  "miscAnnualUsd": number,
  "totalFirstYearUsd": number,
  "aiAnalysis": "2-3 sentence summary of costs and funding tips"
}`;

  try {
    const result = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
        maxOutputTokens: 512
      }
    });
    return result.text || '';
  } catch (err) {
    console.error('Cost estimate error:', err);
    return '';
  }
}

export { genAI, GEMINI_MODEL };
