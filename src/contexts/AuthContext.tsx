// ============================================================
// Authentication Context — Firebase Auth
// ============================================================
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { isFirebaseConfigured } from '../lib/firebase';
import { getUserProfile, createUserProfile, updateUserProfile } from '../lib/firestore';
import { UserProfile, OnboardingData, DegreeLevel } from '../types';

interface AuthContextType {
  firebaseUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isDemoUser: boolean;
  // Auth methods
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  loginDemo: (preloadOnboarding?: boolean) => void;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  // Profile methods
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  completeOnboarding: (data: OnboardingData) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_PRELOADED_PROFILE: UserProfile = {
  uid: 'demo-student-id',
  email: 'student.demo@abroadpilot.ai',
  fullName: 'Hamza Khan',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  role: 'student',
  nationality: 'Pakistan',
  residenceCity: 'Lahore',
  currentEducationLevel: 'Bachelor',
  degreeTitle: 'BS Computer Science',
  institutionName: 'FAST-NUCES',
  cgpa: 3.52,
  maxCgpa: 4.0,
  graduationYear: 2025,
  targetDegree: 'Master',
  intendedMajors: ['Artificial Intelligence', 'Data Science'],
  preferredCountries: ['Germany', 'United Kingdom', 'Canada'],
  ieltsStatus: 'Completed',
  ieltsScore: 7.5,
  maxTuitionBudgetUsd: 18000,
  fundingPreference: 'Partial Scholarship + Self',
  workExperienceYears: 1.5,
  studyGapYears: 0,
  extracurriculars: 'Winner of National Hackathon 2024, Lead Developer for University Tech Club',
  isOnboarded: true,
  onboardingStep: 10,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEFAULT_PROFILE_FIELDS: Partial<UserProfile> = {
  role: 'student',
  nationality: '',
  residenceCity: '',
  currentEducationLevel: 'Bachelor',
  degreeTitle: '',
  institutionName: '',
  cgpa: 0,
  maxCgpa: 4.0,
  graduationYear: new Date().getFullYear(),
  targetDegree: 'Master',
  intendedMajors: [],
  preferredCountries: [],
  ieltsStatus: 'Preparing',
  maxTuitionBudgetUsd: 20000,
  fundingPreference: 'Partial Scholarship + Self',
  workExperienceYears: 0,
  studyGapYears: 0,
  isOnboarded: false,
  onboardingStep: 0,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (user: User) => {
    try {
      const p = await getUserProfile(user.uid);
      if (p) {
        setProfile(p);
      } else {
        // Create minimal profile for new users
        const newProfile: UserProfile = {
          ...DEFAULT_PROFILE_FIELDS,
          uid: user.uid,
          email: user.email || '',
          fullName: user.displayName || '',
          photoURL: user.photoURL || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as UserProfile;
        await createUserProfile(newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      console.error('Profile load error:', err);
    }
  };

  useEffect(() => {
    // Check for saved demo session first
    const savedDemo = localStorage.getItem('abroadpilot_demo_session');
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        setProfile(parsed);
        setIsDemoUser(true);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('abroadpilot_demo_session');
      }
    }

    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        setIsDemoUser(false);
        await loadProfile(user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const loginDemo = (preloadOnboarding = true) => {
    const demoProfile = preloadOnboarding
      ? DEMO_PRELOADED_PROFILE
      : {
          ...DEFAULT_PROFILE_FIELDS,
          uid: 'demo-student-id',
          email: 'demo@abroadpilot.ai',
          fullName: 'Demo Student',
          isOnboarded: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as UserProfile;

    setProfile(demoProfile);
    setIsDemoUser(true);
    localStorage.setItem('abroadpilot_demo_session', JSON.stringify(demoProfile));
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err: any) {
      console.error('Email Login Error:', err);
      return { success: false, error: getFirebaseErrorMessage(err.code, err.message) };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      return { success: false, error: getFirebaseErrorMessage(err.code, err.message) };
    }
  };

  const registerWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: fullName });
      return { success: true };
    } catch (err: any) {
      console.error('Email Registration Error:', err);
      return { success: false, error: getFirebaseErrorMessage(err.code, err.message) };
    }
  };

  const logout = async () => {
    localStorage.removeItem('abroadpilot_demo_session');
    setIsDemoUser(false);
    setProfile(null);
    setFirebaseUser(null);
    if (auth) {
      try {
        await signOut(auth);
      } catch (e) {
        // ignore signOut errors in demo mode
      }
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: getFirebaseErrorMessage(err.code) };
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (isDemoUser) {
      setProfile(prev => {
        if (!prev) return null;
        const updated = { ...prev, ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem('abroadpilot_demo_session', JSON.stringify(updated));
        return updated;
      });
      return true;
    }
    if (!firebaseUser) return false;
    try {
      await updateUserProfile(firebaseUser.uid, updates);
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (err) {
      console.error('Update profile error:', err);
      return false;
    }
  };

  const completeOnboarding = async (data: OnboardingData): Promise<boolean> => {
    const updates: Partial<UserProfile> = {
      nationality: data.nationality,
      residenceCity: data.residenceCity,
      currentEducationLevel: data.currentEducationLevel,
      degreeTitle: data.degreeTitle,
      institutionName: data.institutionName,
      cgpa: data.cgpa,
      maxCgpa: data.maxCgpa,
      graduationYear: data.graduationYear,
      targetDegree: data.targetDegree,
      intendedMajors: data.intendedMajors,
      preferredCountries: data.preferredCountries,
      ieltsStatus: data.ieltsStatus,
      ieltsScore: data.ieltsScore,
      maxTuitionBudgetUsd: data.maxTuitionBudgetUsd,
      fundingPreference: data.fundingPreference,
      workExperienceYears: data.workExperienceYears,
      studyGapYears: data.studyGapYears,
      extracurriculars: data.extracurriculars,
      isOnboarded: true,
      onboardingStep: 10,
    };

    if (isDemoUser) {
      setProfile(prev => {
        const updated = { ...(prev || DEFAULT_PROFILE_FIELDS), ...updates, updatedAt: new Date().toISOString() } as UserProfile;
        localStorage.setItem('abroadpilot_demo_session', JSON.stringify(updated));
        return updated;
      });
      return true;
    }

    if (!firebaseUser) return false;
    try {
      await updateUserProfile(firebaseUser.uid, updates);
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (err) {
      console.error('Onboarding error:', err);
      return false;
    }
  };

  const refreshProfile = async () => {
    if (firebaseUser) await loadProfile(firebaseUser);
  };

  return (
    <AuthContext.Provider value={{
      firebaseUser,
      profile,
      loading,
      isAuthenticated: !!firebaseUser || isDemoUser,
      isOnboarded: !!profile?.isOnboarded,
      isDemoUser,
      loginWithEmail,
      loginWithGoogle,
      registerWithEmail,
      loginDemo,
      logout,
      resetPassword,
      updateProfile: handleUpdateProfile,
      completeOnboarding,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// ─── Helpers ──────────────────────────────────────────────────

function getFirebaseErrorMessage(code: string, rawMessage?: string): string {
  const messages: Record<string, string> = {
    'auth/operation-not-allowed': 'Google Sign-In is not enabled yet in your Firebase Console. Go to Authentication > Sign-in method and enable Google.',
    'auth/unauthorized-domain': 'This domain is not authorized in Firebase. Add localhost or your domain in Firebase Console > Authentication > Settings > Authorized domains.',
    'auth/popup-blocked': 'Sign-in popup was blocked by your browser. Please allow popups for this site.',
    'auth/popup-closed-by-user': 'Google sign-in popup was closed before completing.',
    'auth/cancelled-popup-request': 'Only one sign-in popup can be open at a time.',
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account already exists with this email.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many failed attempts. Please wait before trying again.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/invalid-credential': 'Invalid email or password.',
  };
  return messages[code] || (rawMessage ? `${rawMessage} (${code})` : `Error (${code || 'unknown'}). Please check Firebase configuration.`);
}
