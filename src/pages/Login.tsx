// ============================================================
// Login Page — Firebase Auth (Email + Google)
// ============================================================
import React, { useState } from 'react';
import {
  Plane, Mail, Lock, User, Eye, EyeOff, ArrowRight,
  Chrome, GraduationCap, Globe, Award, Sparkles, AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

type Mode = 'login' | 'register' | 'forgot';

export const Login: React.FC = () => {
  const { loginWithEmail, loginWithGoogle, registerWithEmail, resetPassword, loginDemo } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<Mode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clearError = () => setError('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    const res = await loginWithEmail(email, password);
    setLoading(false);
    if (!res.success) setError(res.error || 'Login failed');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    const res = await registerWithEmail(email, password, fullName);
    setLoading(false);
    if (!res.success) setError(res.error || 'Registration failed');
    else showToast('Account created! Let\'s set up your profile.', 'success');
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    const res = await resetPassword(email);
    setLoading(false);
    if (res.success) {
      showToast('Reset link sent! Check your inbox.', 'success');
      setMode('login');
    } else {
      setError(res.error || 'Failed to send reset email.');
    }
  };

  const handleGoogle = async () => {
    clearError();
    setLoading(true);
    const res = await loginWithGoogle();
    setLoading(false);
    if (!res.success) setError(res.error || 'Google sign-in failed');
  };

  const features = [
    { icon: <Sparkles className="w-4 h-4" />, text: 'AI-powered university & scholarship matching' },
    { icon: <Globe className="w-4 h-4" />, text: 'Live visa guidance with web search grounding' },
    { icon: <GraduationCap className="w-4 h-4" />, text: 'Personalized AI roadmap generation' },
    { icon: <Award className="w-4 h-4" />, text: 'Auto-apply agent (coming soon)' },
  ];

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        {/* Background */}
        <div className="absolute inset-0 gradient-dark" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.05) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Plane className="w-5 h-5 text-surface-950 -rotate-45" />
            </div>
            <div>
              <div className="text-lg font-black text-white tracking-tight">AbroadPilot AI</div>
              <div className="text-xs text-slate-500 font-medium">Intelligent Study Abroad Platform</div>
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-black leading-tight">
              Your AI Guide to{' '}
              <span className="text-gradient">Global Education</span>
            </h2>
            <p className="mt-4 text-slate-400 text-base leading-relaxed max-w-sm">
              AI-powered platform helping students worldwide discover universities, win scholarships, and navigate their study abroad journey.
            </p>
          </div>

          <div className="space-y-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0">
                  {f.icon}
                </div>
                <span className="text-sm text-slate-300">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { value: '50K+', label: 'Students Helped' },
            { value: '120+', label: 'Countries' },
            { value: '98%', label: 'Satisfaction' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-black text-gradient-gold">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-20">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center">
            <Plane className="w-4 h-4 text-surface-950 -rotate-45" />
          </div>
          <span className="text-lg font-black text-white">AbroadPilot AI</span>
        </div>

        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-black text-white">
              {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Start your journey' : 'Reset password'}
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              {mode === 'login'
                ? 'Sign in to your AbroadPilot account'
                : mode === 'register'
                ? 'Create a free account to get personalized AI guidance'
                : 'Enter your email to receive a reset link'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-sm animate-slide-up">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In */}
          {mode !== 'forgot' && (
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          )}

          {mode !== 'forgot' && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-xs text-slate-500 font-medium">or</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => { setEmail(e.target.value); clearError(); }}
                    placeholder="you@example.com"
                    className="input-dark pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-300">Password</label>
                  <button type="button" onClick={() => setMode('forgot')} className="text-xs text-brand-400 hover:underline">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => { setPassword(e.target.value); clearError(); }}
                    placeholder="••••••••"
                    className="input-dark pl-10 pr-10"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-sm">
                {loading ? 'Signing in...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => { setFullName(e.target.value); clearError(); }}
                    placeholder="Your full name"
                    className="input-dark pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => { setEmail(e.target.value); clearError(); }}
                    placeholder="you@example.com"
                    className="input-dark pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => { setPassword(e.target.value); clearError(); }}
                    placeholder="Min 6 characters"
                    className="input-dark pl-10 pr-10"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-sm">
                {loading ? 'Creating account...' : 'Create Free Account'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-xs text-slate-500">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-brand-400 hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-brand-400 hover:underline">Privacy Policy</a>.
              </p>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <p className="text-sm text-slate-400 leading-relaxed">
                Enter your registered email address and we'll send you a secure reset link.
              </p>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-dark pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setMode('login')} className="btn-ghost flex-1 justify-center py-2.5 text-sm">
                  Back
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-2.5 text-sm">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Preview Option */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Quick Preview:</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Instant Access</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { loginDemo(true); showToast('Loaded Demo Student profile with sample applications!', 'info'); }}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-200 border border-slate-700/60 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  Explore Full App
                </button>
                <button
                  type="button"
                  onClick={() => { loginDemo(false); showToast('Starting 5-Step Onboarding Wizard...', 'info'); }}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-200 border border-slate-700/60 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                  Try Onboarding
                </button>
              </div>
            </div>
          </div>

          {/* Mode Toggle */}
          {mode !== 'forgot' && (
            <p className="text-center text-sm text-slate-400">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); clearError(); }}
                className="text-brand-400 font-semibold hover:underline"
              >
                {mode === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
