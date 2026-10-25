// ============================================================
// Firestore Database Service
// All CRUD operations for user data with robust LocalStorage fallback
// ============================================================
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import {
  UserProfile,
  Application,
  StudentDocument,
  RoadmapTask,
  ChatMessage
} from '../types';

// ─── Preloaded Demo Data ──────────────────────────────────────

const DEMO_APPLICATIONS: Application[] = [
  {
    id: 'app-tum-1',
    userId: 'demo-student-id',
    universityName: 'Technical University of Munich (TUM)',
    programTitle: 'M.Sc. Informatics / Computer Science',
    country: 'Germany',
    degreeLevel: 'Master',
    status: 'Accepted',
    intakeTerm: 'Winter 2026',
    deadline: '2026-05-31',
    applicationUrl: 'https://campus.tum.de',
    notes: 'Admitted! Need to accept offer letter and submit enrollment documents.',
    documents: ['doc-1', 'doc-2', 'doc-4'],
    aiAgentEnabled: true,
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-03-20T00:00:00.000Z',
  },
  {
    id: 'app-manchester-2',
    userId: 'demo-student-id',
    universityName: 'University of Manchester',
    programTitle: 'M.Sc. Advanced Computer Science',
    country: 'United Kingdom',
    degreeLevel: 'Master',
    status: 'Under Review',
    intakeTerm: 'Fall 2026',
    deadline: '2026-06-15',
    applicationUrl: 'https://www.manchester.ac.uk',
    notes: 'Conditional offer expected pending final semester transcript.',
    documents: ['doc-1', 'doc-3'],
    aiAgentEnabled: false,
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
  },
  {
    id: 'app-toronto-3',
    userId: 'demo-student-id',
    universityName: 'University of Toronto',
    programTitle: 'Master of Science in Applied Computing (MScAC)',
    country: 'Canada',
    degreeLevel: 'Master',
    status: 'Shortlisted',
    intakeTerm: 'Fall 2026',
    deadline: '2026-12-01',
    applicationUrl: 'https://web.cs.toronto.edu/graduate/mscac',
    notes: 'Drafting research statement; contacting alumni.',
    documents: ['doc-1'],
    aiAgentEnabled: true,
    createdAt: '2026-02-10T00:00:00.000Z',
    updatedAt: '2026-02-10T00:00:00.000Z',
  }
];

const DEMO_ROADMAP_TASKS: RoadmapTask[] = [
  {
    id: 'task-1',
    userId: 'demo-student-id',
    stage: 1,
    stageName: 'Profile & Academic Attestation',
    title: 'Attest Degree & Transcripts via HEC & IBCC',
    description: 'Verify intermediate credentials with IBCC and Bachelor degree with Higher Education Commission.',
    status: 'completed',
    priority: 'high',
    dueDate: '2026-02-15',
    officialLink: 'https://eservices.hec.gov.pk',
    aiGenerated: true,
    subtasks: [
      { id: 'st-1', title: 'Collect official sealed transcripts from university registrar', completed: true },
      { id: 'st-2', title: 'Schedule HEC walk-in attestation appointment', completed: true }
    ],
  },
  {
    id: 'task-2',
    userId: 'demo-student-id',
    stage: 2,
    stageName: 'Language Proficiency Exam',
    title: 'Complete IELTS Academic Test',
    description: 'Achieve overall band 7.5+ with no sub-band lower than 6.5 for European & UK universities.',
    status: 'completed',
    priority: 'urgent',
    dueDate: '2026-03-01',
    officialLink: 'https://takeielts.britishcouncil.org',
    aiGenerated: true,
    subtasks: [
      { id: 'st-3', title: 'Cambridge practice tests 14-18', completed: true },
      { id: 'st-4', title: 'Target 7.5+ in Listening & Reading', completed: true }
    ],
  },
  {
    id: 'task-3',
    userId: 'demo-student-id',
    stage: 3,
    stageName: 'Application Dossier Prep',
    title: 'Finalize Statement of Purpose (SOP) & EuroPass CV',
    description: 'Tailor SOP specifically for TU Munich and UK university research labs.',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2026-05-10',
    officialLink: 'https://europa.eu/europass/en',
    aiGenerated: true,
    subtasks: [
      { id: 'st-5', title: 'Review SOP with AbroadPilot AI SOP Reviewer', completed: true },
      { id: 'st-6', title: 'Request academic LORs from 2 senior faculty members', completed: false }
    ],
  },
  {
    id: 'task-4',
    userId: 'demo-student-id',
    stage: 4,
    stageName: 'Funding & Scholarships',
    title: 'Submit DAAD Study Scholarships Application',
    description: 'Apply for German Academic Exchange Service full master study scholarship.',
    status: 'not_started',
    priority: 'urgent',
    dueDate: '2026-05-30',
    officialLink: 'https://www.daad.de',
    aiGenerated: true,
    subtasks: [
      { id: 'st-7', title: 'Prepare letter of motivation tailored to DAAD', completed: false },
      { id: 'st-8', title: 'Submit online portal before deadline', completed: false }
    ],
  },
  {
    id: 'task-5',
    userId: 'demo-student-id',
    stage: 5,
    stageName: 'Visa Appointment & Financial Proof',
    title: 'Open Blocked Bank Account & Book Embassy Slot',
    description: 'Set up Expatrio / Fintiba blocked account (€11,208/year) and book German national visa appointment.',
    status: 'not_started',
    priority: 'high',
    dueDate: '2026-06-30',
    officialLink: 'https://www.expatrio.com',
    aiGenerated: true,
    subtasks: [
      { id: 'st-9', title: 'Register on German Embassy waitlist', completed: false },
      { id: 'st-10', title: 'Transfer blocked amount and health insurance', completed: false }
    ],
  }
];

const DEMO_DOCUMENTS: StudentDocument[] = [
  {
    id: 'doc-1',
    userId: 'demo-student-id',
    name: 'International Passport',
    category: 'Passport',
    status: 'Verified',
    fileType: 'application/pdf',
    fileSizeKb: 1200,
    uploadedAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-01-10T00:00:00.000Z',
  },
  {
    id: 'doc-2',
    userId: 'demo-student-id',
    name: 'Official Academic Transcript (BS CS)',
    category: 'Transcript',
    status: 'Attested',
    fileType: 'application/pdf',
    fileSizeKb: 3400,
    uploadedAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-01-20T00:00:00.000Z',
  },
  {
    id: 'doc-3',
    userId: 'demo-student-id',
    name: 'IELTS Academic TRF (Band 7.5)',
    category: 'Language Test',
    status: 'Verified',
    fileType: 'application/pdf',
    fileSizeKb: 850,
    uploadedAt: '2026-02-28T00:00:00.000Z',
    updatedAt: '2026-02-28T00:00:00.000Z',
  },
  {
    id: 'doc-4',
    userId: 'demo-student-id',
    name: 'Statement of Purpose - TUM Informatics',
    category: 'SOP',
    status: 'Draft',
    fileType: 'application/pdf',
    fileSizeKb: 450,
    uploadedAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-05T00:00:00.000Z',
  },
  {
    id: 'doc-5',
    userId: 'demo-student-id',
    name: 'Academic Recommendation Letter 1',
    category: 'Letter of Recommendation',
    status: 'Complete',
    fileType: 'application/pdf',
    fileSizeKb: 600,
    uploadedAt: '2026-02-20T00:00:00.000Z',
    updatedAt: '2026-02-20T00:00:00.000Z',
  }
];

// Helper to get / set LocalStorage arrays
function getLocalItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalItem<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('LocalStorage write failed:', err);
  }
}

// ─── User Profile ────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured || !db) {
    return getLocalItem<UserProfile | null>('abroadpilot_demo_session', null);
  }
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data() as UserProfile;
    return null;
  } catch (err) {
    console.error('getUserProfile error:', err);
    return getLocalItem<UserProfile | null>('abroadpilot_demo_session', null);
  }
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    setLocalItem('abroadpilot_demo_session', profile);
    return;
  }
  try {
    const ref = doc(db, 'users', profile.uid);
    await setDoc(ref, { ...profile, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  } catch (err) {
    setLocalItem('abroadpilot_demo_session', profile);
  }
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    const current = getLocalItem<UserProfile | null>('abroadpilot_demo_session', null);
    if (current) {
      setLocalItem('abroadpilot_demo_session', { ...current, ...updates, updatedAt: new Date().toISOString() });
    }
    return;
  }
  try {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
  } catch (err) {
    const current = getLocalItem<UserProfile | null>('abroadpilot_demo_session', null);
    if (current) {
      setLocalItem('abroadpilot_demo_session', { ...current, ...updates, updatedAt: new Date().toISOString() });
    }
  }
}

// ─── Roadmap Tasks ────────────────────────────────────────────

export async function getRoadmapTasks(userId: string): Promise<RoadmapTask[]> {
  if (!isFirebaseConfigured || !db) {
    return getLocalItem<RoadmapTask[]>('abroadpilot_tasks', DEMO_ROADMAP_TASKS);
  }
  try {
    const q = query(
      collection(db, 'roadmapTasks'),
      where('userId', '==', userId),
      orderBy('stage', 'asc')
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      return getLocalItem<RoadmapTask[]>('abroadpilot_tasks', DEMO_ROADMAP_TASKS);
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as RoadmapTask));
  } catch (err) {
    console.error('getRoadmapTasks error, using fallback:', err);
    return getLocalItem<RoadmapTask[]>('abroadpilot_tasks', DEMO_ROADMAP_TASKS);
  }
}

export async function createRoadmapTasks(tasks: Omit<RoadmapTask, 'id'>[]): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    const current = getLocalItem<RoadmapTask[]>('abroadpilot_tasks', DEMO_ROADMAP_TASKS);
    const newTasks = tasks.map((t, idx) => ({ ...t, id: `local-task-${Date.now()}-${idx}` } as RoadmapTask));
    setLocalItem('abroadpilot_tasks', [...current, ...newTasks]);
    return;
  }
  try {
    const batch = writeBatch(db);
    tasks.forEach(task => {
      const ref = doc(collection(db, 'roadmapTasks'));
      batch.set(ref, task);
    });
    await batch.commit();
  } catch (err) {
    const current = getLocalItem<RoadmapTask[]>('abroadpilot_tasks', DEMO_ROADMAP_TASKS);
    const newTasks = tasks.map((t, idx) => ({ ...t, id: `local-task-${Date.now()}-${idx}` } as RoadmapTask));
    setLocalItem('abroadpilot_tasks', [...current, ...newTasks]);
  }
}

export async function updateRoadmapTask(
  taskId: string,
  updates: Partial<RoadmapTask>
): Promise<void> {
  const current = getLocalItem<RoadmapTask[]>('abroadpilot_tasks', DEMO_ROADMAP_TASKS);
  const updated = current.map(t => t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t);
  setLocalItem('abroadpilot_tasks', updated);

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'roadmapTasks', taskId);
      await updateDoc(ref, updates);
    } catch (e) {
      // Local fallback already saved
    }
  }
}

export async function deleteRoadmapTask(taskId: string): Promise<void> {
  const current = getLocalItem<RoadmapTask[]>('abroadpilot_tasks', DEMO_ROADMAP_TASKS);
  setLocalItem('abroadpilot_tasks', current.filter(t => t.id !== taskId));

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'roadmapTasks', taskId));
    } catch (e) {
      // Local fallback already saved
    }
  }
}

// ─── Applications ─────────────────────────────────────────────

export async function getApplications(userId: string): Promise<Application[]> {
  if (!isFirebaseConfigured || !db) {
    return getLocalItem<Application[]>('abroadpilot_applications', DEMO_APPLICATIONS);
  }
  try {
    const q = query(
      collection(db, 'applications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      return getLocalItem<Application[]>('abroadpilot_applications', DEMO_APPLICATIONS);
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Application));
  } catch (err) {
    console.error('getApplications error, using fallback:', err);
    return getLocalItem<Application[]>('abroadpilot_applications', DEMO_APPLICATIONS);
  }
}

export async function createApplication(app: Omit<Application, 'id'>): Promise<string> {
  const newId = `app-${Date.now()}`;
  const newApp: Application = {
    ...app,
    id: newId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const current = getLocalItem<Application[]>('abroadpilot_applications', DEMO_APPLICATIONS);
  setLocalItem('abroadpilot_applications', [newApp, ...current]);

  if (isFirebaseConfigured && db) {
    try {
      const ref = await addDoc(collection(db, 'applications'), {
        ...app,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return ref.id;
    } catch (e) {
      return newId;
    }
  }
  return newId;
}

export async function updateApplication(
  appId: string,
  updates: Partial<Application>
): Promise<void> {
  const current = getLocalItem<Application[]>('abroadpilot_applications', DEMO_APPLICATIONS);
  const updated = current.map(a => a.id === appId ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a);
  setLocalItem('abroadpilot_applications', updated);

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'applications', appId);
      await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
    } catch (e) {
      // Local fallback already saved
    }
  }
}

export async function deleteApplication(appId: string): Promise<void> {
  const current = getLocalItem<Application[]>('abroadpilot_applications', DEMO_APPLICATIONS);
  setLocalItem('abroadpilot_applications', current.filter(a => a.id !== appId));

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'applications', appId));
    } catch (e) {
      // Local fallback already saved
    }
  }
}

// ─── Documents ────────────────────────────────────────────────

export async function getDocuments(userId: string): Promise<StudentDocument[]> {
  if (!isFirebaseConfigured || !db) {
    return getLocalItem<StudentDocument[]>('abroadpilot_documents', DEMO_DOCUMENTS);
  }
  try {
    const q = query(
      collection(db, 'documents'),
      where('userId', '==', userId),
      orderBy('uploadedAt', 'desc')
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      return getLocalItem<StudentDocument[]>('abroadpilot_documents', DEMO_DOCUMENTS);
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as StudentDocument));
  } catch (err) {
    console.error('getDocuments error, using fallback:', err);
    return getLocalItem<StudentDocument[]>('abroadpilot_documents', DEMO_DOCUMENTS);
  }
}

export async function createDocument(doc_data: Omit<StudentDocument, 'id'>): Promise<string> {
  const newId = `doc-${Date.now()}`;
  const newDoc: StudentDocument = {
    ...doc_data,
    id: newId,
    uploadedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const current = getLocalItem<StudentDocument[]>('abroadpilot_documents', DEMO_DOCUMENTS);
  setLocalItem('abroadpilot_documents', [newDoc, ...current]);

  if (isFirebaseConfigured && db) {
    try {
      const ref = await addDoc(collection(db, 'documents'), {
        ...doc_data,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return ref.id;
    } catch (e) {
      return newId;
    }
  }
  return newId;
}

export async function updateDocument(
  docId: string,
  updates: Partial<StudentDocument>
): Promise<void> {
  const current = getLocalItem<StudentDocument[]>('abroadpilot_documents', DEMO_DOCUMENTS);
  const updated = current.map(d => d.id === docId ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d);
  setLocalItem('abroadpilot_documents', updated);

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'documents', docId);
      await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
    } catch (e) {
      // Local fallback already saved
    }
  }
}

export async function deleteDocument(docId: string): Promise<void> {
  const current = getLocalItem<StudentDocument[]>('abroadpilot_documents', DEMO_DOCUMENTS);
  setLocalItem('abroadpilot_documents', current.filter(d => d.id !== docId));

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'documents', docId));
    } catch (e) {
      // Local fallback already saved
    }
  }
}

// ─── Chat History ─────────────────────────────────────────────

export async function saveChatMessage(userId: string, message: ChatMessage): Promise<void> {
  const key = `abroadpilot_chat_${userId}`;
  const current = getLocalItem<ChatMessage[]>(key, []);
  setLocalItem(key, [...current.slice(-49), message]);

  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, 'chatHistory'), {
        userId,
        ...message,
        savedAt: new Date().toISOString()
      });
    } catch (e) {
      // Local fallback already saved
    }
  }
}

export async function getChatHistory(userId: string, limit = 50): Promise<ChatMessage[]> {
  const key = `abroadpilot_chat_${userId}`;
  const localHistory = getLocalItem<ChatMessage[]>(key, []);

  if (!isFirebaseConfigured || !db) {
    return localHistory;
  }
  try {
    const q = query(
      collection(db, 'chatHistory'),
      where('userId', '==', userId),
      orderBy('timestamp', 'asc')
    );
    const snap = await getDocs(q);
    if (snap.empty) return localHistory;
    return snap.docs.slice(-limit).map(d => d.data() as ChatMessage);
  } catch (err) {
    console.error('getChatHistory error, using fallback:', err);
    return localHistory;
  }
}
