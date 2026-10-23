import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StudentProfile } from '../types';

interface AuthContextType {
  user: StudentProfile | null;
  role: 'student' | 'adviser' | 'admin';
  setRole: (role: 'student' | 'adviser' | 'admin') => void;
  currency: 'PKR' | 'USD' | 'EUR' | 'GBP';
  setCurrency: (c: 'PKR' | 'USD' | 'EUR' | 'GBP') => void;
  brandName: string;
  setBrandName: (name: string) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    targetDegree?: string;
    residenceCity?: string;
    role?: 'student' | 'adviser' | 'admin';
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  quickDemoLogin: (role: 'student' | 'adviser' | 'admin') => Promise<void>;
  updateProfile: (data: Partial<StudentProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StudentProfile | null>(null);
  const [role, setRole] = useState<'student' | 'adviser' | 'admin'>('student');
  const [currency, setCurrency] = useState<'PKR' | 'USD' | 'EUR' | 'GBP'>('PKR');
  const [brandName, setBrandName] = useState<string>('AbroadPilot AI');
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);

  const fetchProfile = async (activeUserId?: string) => {
    try {
      const storedId = activeUserId || localStorage.getItem('abroadpilot_user_id') || 'student-demo-pk-1';
      const storedToken = localStorage.getItem('abroadpilot_token');
      
      const res = await fetch('/api/v1/profile', {
        headers: { 'x-user-id': storedId }
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setUser(data.profile);
        setRole(data.profile.role || 'student');
        if (storedToken) setToken(storedToken);
      }
    } catch (err) {
      console.error('Failed to load student profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user previously logged in
    const storedToken = localStorage.getItem('abroadpilot_token');
    const storedId = localStorage.getItem('abroadpilot_user_id');
    if (storedToken && storedId) {
      setToken(storedToken);
      fetchProfile(storedId);
    } else {
      // By default for demo review or fresh visitor
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setRole(data.user.role || 'student');
        setToken(data.token);
        localStorage.setItem('abroadpilot_token', data.token);
        localStorage.setItem('abroadpilot_user_id', data.user.id);
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'Server communication error' };
    }
  };

  const register = async (regData: {
    fullName: string;
    email: string;
    password: string;
    targetDegree?: string;
    residenceCity?: string;
    role?: 'student' | 'adviser' | 'admin';
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setRole(data.user.role || 'student');
        setToken(data.token);
        localStorage.setItem('abroadpilot_token', data.token);
        localStorage.setItem('abroadpilot_user_id', data.user.id);
        return { success: true };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, message: 'Server communication error' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('abroadpilot_token');
    localStorage.removeItem('abroadpilot_user_id');
  };

  const quickDemoLogin = async (demoRole: 'student' | 'adviser' | 'admin') => {
    const credentials = {
      student: { email: 'hamza.tariq@example.com', pass: 'password123' },
      adviser: { email: 'adviser@abroadpilot.ai', pass: 'adviser123' },
      admin: { email: 'admin@abroadpilot.ai', pass: 'admin123' }
    };
    const cred = credentials[demoRole];
    await login(cred.email, cred.pass);
  };

  const updateProfile = async (updates: Partial<StudentProfile>): Promise<boolean> => {
    try {
      const res = await fetch('/api/v1/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || localStorage.getItem('abroadpilot_user_id') || 'student-demo-pk-1'
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setUser(data.profile);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update student profile:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        setRole,
        currency,
        setCurrency,
        brandName,
        setBrandName,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        quickDemoLogin,
        updateProfile,
        refreshProfile: () => fetchProfile(user?.id),
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
