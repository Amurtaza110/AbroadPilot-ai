// ============================================================
// App Router — React Router v7 with Protected Routes
// ============================================================
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Pages
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { AiAdvisor } from './pages/AiAdvisor';
import { Discover } from './pages/Discover';
import { Applications } from './pages/Applications';
import { Scholarships } from './pages/Scholarships';
import { Roadmap } from './pages/Roadmap';
import { Documents } from './pages/Documents';
import { VisaGuide } from './pages/VisaGuide';
import { CostPlanner } from './pages/CostPlanner';
import { Profile } from './pages/Profile';
import { SopStudio } from './pages/SopStudio';
import { VisaInterview } from './pages/VisaInterview';

// Layout
import { Layout } from './components/Layout';
import { SetupBanner } from './components/SetupBanner';

// ─── Route Guards ─────────────────────────────────────────────

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isOnboarded, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isOnboarded) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

const OnboardingRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isOnboarded, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isOnboarded) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// ─── Loading Screen ───────────────────────────────────────────

const LoadingScreen = () => (
  <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center gap-4">
    <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center animate-pulse">
      <svg className="w-6 h-6 text-surface-950 -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3m-9 13 3-3m0 0 3 3m-3-3v-9m6 1h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-1" />
      </svg>
    </div>
    <div className="text-center space-y-1">
      <div className="text-white font-bold text-sm">AbroadPilot AI</div>
      <div className="text-slate-500 text-xs">Loading your session...</div>
    </div>
    <div className="flex gap-1.5">
      {[0, 1, 2].map(i => (
        <div key={i} className={`w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce delay-${i * 100}`} />
      ))}
    </div>
  </div>
);

// ─── App Router ───────────────────────────────────────────────

function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute><Login /></PublicRoute>
      } />

      {/* Onboarding */}
      <Route path="/onboarding" element={
        <OnboardingRoute><Onboarding /></OnboardingRoute>
      } />

      {/* Protected App Routes */}
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/advisor" element={<AiAdvisor />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/scholarships" element={<Scholarships />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/sop-studio" element={<SopStudio />} />
        <Route path="/visa" element={<VisaGuide />} />
        <Route path="/visa-interview" element={<VisaInterview />} />
        <Route path="/cost-planner" element={<CostPlanner />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

// ─── Root App ─────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <SetupBanner />
          <AppRouter />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
