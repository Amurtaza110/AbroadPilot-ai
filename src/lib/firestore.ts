// ============================================================
// Firestore Database Service
// All CRUD operations for user data
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
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import {
  UserProfile,
  Application,
  StudentDocument,
  RoadmapTask,
  ChatMessage
} from '../types';

// ─── User Profile ────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data() as UserProfile;
    return null;
  } catch (err) {
    console.error('getUserProfile error:', err);
    return null;
  }
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  const ref = doc(db, 'users', profile.uid);
  await setDoc(ref, { ...profile, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
}

// ─── Roadmap Tasks ────────────────────────────────────────────

export async function getRoadmapTasks(userId: string): Promise<RoadmapTask[]> {
  try {
    const q = query(
      collection(db, 'roadmapTasks'),
      where('userId', '==', userId),
      orderBy('stage', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as RoadmapTask));
  } catch (err) {
    console.error('getRoadmapTasks error:', err);
    return [];
  }
}

export async function createRoadmapTasks(tasks: Omit<RoadmapTask, 'id'>[]): Promise<void> {
  const batch = writeBatch(db);
  tasks.forEach(task => {
    const ref = doc(collection(db, 'roadmapTasks'));
    batch.set(ref, task);
  });
  await batch.commit();
}

export async function updateRoadmapTask(
  taskId: string,
  updates: Partial<RoadmapTask>
): Promise<void> {
  const ref = doc(db, 'roadmapTasks', taskId);
  await updateDoc(ref, updates);
}

export async function deleteRoadmapTask(taskId: string): Promise<void> {
  await deleteDoc(doc(db, 'roadmapTasks', taskId));
}

// ─── Applications ─────────────────────────────────────────────

export async function getApplications(userId: string): Promise<Application[]> {
  try {
    const q = query(
      collection(db, 'applications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Application));
  } catch (err) {
    console.error('getApplications error:', err);
    return [];
  }
}

export async function createApplication(app: Omit<Application, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'applications'), {
    ...app,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  return ref.id;
}

export async function updateApplication(
  appId: string,
  updates: Partial<Application>
): Promise<void> {
  const ref = doc(db, 'applications', appId);
  await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
}

export async function deleteApplication(appId: string): Promise<void> {
  await deleteDoc(doc(db, 'applications', appId));
}

// ─── Documents ────────────────────────────────────────────────

export async function getDocuments(userId: string): Promise<StudentDocument[]> {
  try {
    const q = query(
      collection(db, 'documents'),
      where('userId', '==', userId),
      orderBy('uploadedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as StudentDocument));
  } catch (err) {
    console.error('getDocuments error:', err);
    return [];
  }
}

export async function createDocument(doc_data: Omit<StudentDocument, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'documents'), {
    ...doc_data,
    uploadedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  return ref.id;
}

export async function updateDocument(
  docId: string,
  updates: Partial<StudentDocument>
): Promise<void> {
  const ref = doc(db, 'documents', docId);
  await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
}

export async function deleteDocument(docId: string): Promise<void> {
  await deleteDoc(doc(db, 'documents', docId));
}

// ─── Chat History ─────────────────────────────────────────────

export async function saveChatMessage(userId: string, message: ChatMessage): Promise<void> {
  await addDoc(collection(db, 'chatHistory'), {
    userId,
    ...message,
    savedAt: new Date().toISOString()
  });
}

export async function getChatHistory(userId: string, limit = 50): Promise<ChatMessage[]> {
  try {
    const q = query(
      collection(db, 'chatHistory'),
      where('userId', '==', userId),
      orderBy('timestamp', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.slice(-limit).map(d => d.data() as ChatMessage);
  } catch (err) {
    console.error('getChatHistory error:', err);
    return [];
  }
}
