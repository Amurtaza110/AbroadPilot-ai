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
  // Auth methods
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  // Profile methods
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  completeOnboarding: (data: OnboardingData) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await loadProfile(user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: getFirebaseErrorMessage(err.code) };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: getFirebaseErrorMessage(err.code) };
    }
  };

  const registerWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: fullName });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: getFirebaseErrorMessage(err.code) };
    }
  };

  const logout = async () => {
    await signOut(auth);
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
    if (!firebaseUser) return false;
    try {
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
      isAuthenticated: !!firebaseUser,
      isOnboarded: !!profile?.isOnboarded,
      loginWithEmail,
      loginWithGoogle,
      registerWithEmail,
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

function getFirebaseErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account already exists with this email.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many failed attempts. Please wait before trying again.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/invalid-credential': 'Invalid email or password.',
  };
  return messages[code] || 'An unexpected error occurred. Please try again.';
}
