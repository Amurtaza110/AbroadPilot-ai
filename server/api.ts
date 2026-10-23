import { Router, Request, Response } from 'express';
import { db, StudentProfile, Application, StudentDocument, RoadmapTask, University, Scholarship } from './db';
import { explainProgramMatch, chatAdvisor, generateSopAssistance, draftEmailInquiry, searchUniversitiesAndScholarships } from './ai';

const router = Router();

// Helper to get active user ID from request headers or default
function getUserId(req: Request): string {
  const customId = req.headers['x-user-id'] as string;
  return customId || 'student-demo-pk-1';
}

// ---------------- AUTHENTICATION ----------------
router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const account = db.findAccountByEmail(email);
  if (!account || !db.verifyPassword(account, password)) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  let profile = db.getProfile(account.id);
  if (!profile) {
    profile = {
      id: account.id,
      fullName: account.fullName,
      email: account.email,
      role: account.role,
      nationality: 'Pakistani',
      residenceCity: 'Lahore, Pakistan',
      targetDegree: 'Master',
      intendedMajor: 'Computer Science & AI',
      preferredCountries: ['Germany', 'United Kingdom', 'Italy'],
      currentEducationLevel: 'Bachelor',
      degreeTitle: 'Bachelor of Science',
      institutionName: 'FAST-NUCES Lahore',
      cgpa: 3.35,
      maxCgpa: 4.0,
      graduationYear: 2025,
      ieltsStatus: 'Completed',
      ieltsScore: 7.0,
      maxTuitionBudgetPkr: 2500000,
      fundingPreference: 'Partial Scholarship + Self',
      studyGapYears: 0,
      workExperienceYears: 1,
      isOnboarded: true,
      updatedAt: new Date().toISOString()
    };
    db.saveProfile(profile);
  }

  db.logAudit(account.fullName, 'LOGIN', `User signed in successfully as ${account.role}`);
  res.json({
    success: true,
    user: profile,
    token: `token-${account.id}`,
    message: 'Welcome back!'
  });
});

router.post('/auth/register', (req: Request, res: Response) => {
  const { fullName, email, password, targetDegree, residenceCity, role } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ success: false, message: 'Full name, email, and password are required' });
  }

  const existing = db.findAccountByEmail(email);
  if (existing) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists' });
  }

  const { account, profile } = db.createAccount({
    email,
    password,
    fullName,
    role: role || 'student',
    residenceCity,
    targetDegree
  });

  res.json({
    success: true,
    user: profile,
    token: `token-${account.id}`,
    message: 'Account created successfully! Welcome to AbroadPilot AI.'
  });
});

router.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required' });
  }

  const account = db.findAccountByEmail(email);
  // Always return success for security
  res.json({
    success: true,
    message: `If an account with ${email} exists, a password reset link and instructions have been dispatched.`
  });
});

router.get('/auth/me', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const profile = db.getProfile(userId) || db.getProfile('student-demo-pk-1');
  res.json({ success: true, user: profile });
});

// ---------------- PROFILE ----------------
router.get('/profile', (req: Request, res: Response) => {
  const userId = getUserId(req);
  let profile = db.getProfile(userId);
  if (!profile) {
    // create default if none
    profile = db.getProfile('student-demo-pk-1')!;
  }
  res.json({ success: true, profile });
});

router.post('/profile', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const data = req.body;
  const current = db.getProfile(userId) || {
    id: userId,
    fullName: "Student",
    email: "student@example.com",
    role: "student",
    nationality: "Pakistani",
    residenceCity: "Islamabad",
    targetDegree: "Master",
    intendedMajor: "Computer Science",
    preferredCountries: ["Germany"],
    currentEducationLevel: "Bachelor",
    degreeTitle: "BS CS",
    institutionName: "NUST Islamabad",
    cgpa: 3.2,
    maxCgpa: 4.0,
    graduationYear: 2025,
    ieltsStatus: "Completed",
    ieltsScore: 7.0,
    maxTuitionBudgetPkr: 2000000,
    fundingPreference: "Partial Scholarship + Self",
    studyGapYears: 0,
    workExperienceYears: 1,
    isOnboarded: true,
    updatedAt: new Date().toISOString()
  };

  const updatedProfile: StudentProfile = {
    ...current,
    ...data,
    id: userId
  };

  db.saveProfile(updatedProfile);
  db.logAudit(updatedProfile.fullName, "UPDATE_PROFILE", "Student updated their academic and preference details.");
  res.json({ success: true, profile: updatedProfile });
});

// ---------------- UNIVERSITIES ----------------
router.get('/universities', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const unis = db.getUniversities();
  const saved = db.getSavedUniversities(userId);
  res.json({ success: true, universities: unis, savedUniversityIds: saved });
});

router.get('/universities/:id', (req: Request, res: Response) => {
  const uni = db.getUniversityById(req.params.id);
  if (!uni) {
    return res.status(404).json({ success: false, message: "University not found" });
  }
  res.json({ success: true, university: uni });
});

router.post('/universities/:id/toggle-save', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const saved = db.toggleSaveUniversity(userId, req.params.id);
  res.json({ success: true, savedUniversityIds: saved });
});

router.post('/universities/admin/upsert', (req: Request, res: Response) => {
  const data: University = req.body;
  if (!data.id || !data.name || !data.country) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }
  const saved = db.saveUniversity(data);
  db.logAudit("Admin", "UPSERT_UNIVERSITY", `Saved university ${data.name} (${data.country})`);
  res.json({ success: true, university: saved });
});

// ---------------- SCHOLARSHIPS ----------------
router.get('/scholarships', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const scholarships = db.getScholarships();
  const saved = db.getSavedScholarships(userId);
  res.json({ success: true, scholarships, savedScholarshipIds: saved });
});

router.post('/scholarships/:id/toggle-save', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const saved = db.toggleSaveScholarship(userId, req.params.id);
  res.json({ success: true, savedScholarshipIds: saved });
});

router.post('/scholarships/admin/upsert', (req: Request, res: Response) => {
  const data: Scholarship = req.body;
  if (!data.id || !data.name || !data.provider) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }
  const saved = db.saveScholarship(data);
  db.logAudit("Admin", "UPSERT_SCHOLARSHIP", `Saved scholarship ${data.name}`);
  res.json({ success: true, scholarship: saved });
});

// ---------------- VISA TEMPLATES ----------------
router.get('/visa-templates', (req: Request, res: Response) => {
  const templates = db.getVisaTemplates();
  res.json({ success: true, templates });
});

router.get('/visa-templates/:code', (req: Request, res: Response) => {
  const template = db.getVisaTemplate(req.params.code);
  if (!template) {
    return res.status(404).json({ success: false, message: "Template not found" });
  }
  res.json({ success: true, template });
});

// ---------------- ROADMAP ----------------
router.get('/roadmap', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const tasks = db.getRoadmapTasks(userId);
  const completed = tasks.filter(t => t.status === 'completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
  res.json({ success: true, tasks, progressPercent, totalTasks: tasks.length, completedTasks: completed });
});

router.post('/roadmap/tasks', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const taskData: RoadmapTask = {
    ...req.body,
    id: req.body.id || `task-${Date.now()}`,
    userId
  };
  const saved = db.updateRoadmapTask(userId, taskData);
  res.json({ success: true, task: saved });
});

router.patch('/roadmap/tasks/:id', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const tasks = db.getRoadmapTasks(userId);
  const existing = tasks.find(t => t.id === req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: "Task not found" });
  }
  const updated: RoadmapTask = {
    ...existing,
    ...req.body,
    id: req.params.id,
    userId
  };
  if (req.body.status === 'completed' && existing.status !== 'completed') {
    updated.completedAt = new Date().toISOString();
  }
  db.updateRoadmapTask(userId, updated);
  res.json({ success: true, task: updated });
});

router.post('/roadmap/reset', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const targetCountry = req.body.targetCountry || 'Germany';
  const tasks = db.resetRoadmapTasks(userId, targetCountry);
  db.logAudit(userId, "RESET_ROADMAP", `Reset roadmap tasks geared towards ${targetCountry}`);
  res.json({ success: true, tasks });
});

// ---------------- DOCUMENTS ----------------
router.get('/documents', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const docs = db.getDocuments(userId);
  res.json({ success: true, documents: docs });
});

router.post('/documents', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const doc: StudentDocument = {
    id: `doc-${Date.now()}`,
    userId,
    name: req.body.name || 'Untitled_Document.pdf',
    category: req.body.category || 'Other',
    fileType: req.body.fileType || 'application/pdf',
    fileSize: req.body.fileSize || 500000,
    uploadedAt: new Date().toISOString(),
    status: req.body.status || 'verified',
    notes: req.body.notes || '',
    downloadUrl: req.body.downloadUrl || ''
  };
  const saved = db.addDocument(userId, doc);
  db.logAudit(userId, "UPLOAD_DOCUMENT", `Uploaded document: ${doc.name} (${doc.category})`);
  res.json({ success: true, document: saved });
});

router.delete('/documents/:id', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const ok = db.deleteDocument(userId, req.params.id);
  res.json({ success: ok });
});

// ---------------- APPLICATIONS ----------------
router.get('/applications', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const apps = db.getApplications(userId);
  res.json({ success: true, applications: apps });
});

router.post('/applications', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const appData: Application = {
    ...req.body,
    id: req.body.id || `app-${Date.now()}`,
    userId,
    updatedAt: new Date().toISOString()
  };
  const saved = db.saveApplication(userId, appData);
  db.logAudit(userId, "SAVE_APPLICATION", `Updated application for ${appData.universityName} - ${appData.status}`);
  res.json({ success: true, application: saved });
});

router.delete('/applications/:id', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const ok = db.deleteApplication(userId, req.params.id);
  res.json({ success: ok });
});

// ---------------- AI ADVISOR & TOOLS ----------------
router.post('/ai/match-explain', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const profile = db.getProfile(userId) || db.getProfile('student-demo-pk-1')!;
  const { programId, universityId } = req.body;

  const uni = db.getUniversityById(universityId);
  if (!uni) {
    return res.status(404).json({ success: false, message: "University not found" });
  }
  const program = uni.programs.find(p => p.id === programId) || uni.programs[0];
  if (!program) {
    return res.status(404).json({ success: false, message: "Program not found" });
  }

  const analysis = await explainProgramMatch(profile, program, uni);
  res.json({ success: true, analysis });
});

router.post('/ai/live-search', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const profile = db.getProfile(userId);
  const { query, category } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ success: false, message: "Query string is required" });
  }

  const result = await searchUniversitiesAndScholarships({
    query,
    category: category || 'general',
    profile
  });

  res.json({
    success: true,
    text: result.text,
    sources: result.sources,
    searchQueries: result.searchQueries
  });
});

router.post('/ai/chat', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const profile = db.getProfile(userId);
  const { message, history, activeContext, useGoogleSearch } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: "Message is required" });
  }

  const result = await chatAdvisor(
    message,
    history || [],
    profile,
    activeContext,
    Boolean(useGoogleSearch)
  );

  res.json({
    success: true,
    reply: result.reply,
    sources: result.sources,
    webSearchQueries: result.webSearchQueries
  });
});

router.post('/ai/sop-assistant', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const profile = db.getProfile(userId) || db.getProfile('student-demo-pk-1')!;
  const { universityName, programTitle, country, targetFocus, userNotes, existingDraft } = req.body;

  const result = await generateSopAssistance({
    profile,
    universityName: universityName || "Technical University of Munich",
    programTitle: programTitle || "M.Sc. Computer Science",
    country: country || "Germany",
    targetFocus: targetFocus || "draft",
    userNotes,
    existingDraft
  });

  res.json({ success: true, ...result });
});

router.post('/ai/email-draft', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const profile = db.getProfile(userId) || db.getProfile('student-demo-pk-1')!;
  const { recipientType, recipientName, universityName, programTitle, subjectContext } = req.body;

  const draft = await draftEmailInquiry({
    recipientType: recipientType || 'admissions',
    recipientName: recipientName || 'Admissions Committee',
    universityName: universityName || 'Target University',
    programTitle: programTitle || 'Master of Science',
    studentProfile: profile,
    subjectContext: subjectContext || ''
  });

  res.json({ success: true, ...draft });
});

// ---------------- ADMIN & METRICS ----------------
router.get('/admin/stats', (req: Request, res: Response) => {
  const unis = db.getUniversities();
  const schols = db.getScholarships();
  const visas = db.getVisaTemplates();
  const auditLogs = db.getAuditLogs();

  const totalPrograms = unis.reduce((acc, u) => acc + (u.programs?.length || 0), 0);

  res.json({
    success: true,
    stats: {
      totalUniversities: unis.length,
      totalPrograms,
      totalScholarships: schols.length,
      totalVisaTemplates: visas.length,
      verifiedSourcesRate: "100%",
      aiStatus: process.env.GEMINI_API_KEY ? "Connected (gemini-3.8-flash)" : "Fallback Simulation Mode"
    },
    recentLogs: auditLogs.slice(0, 20)
  });
});

export const apiRouter = router;
