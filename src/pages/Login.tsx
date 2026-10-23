import React, { useState } from 'react';
import {
  Plane,
  Lock,
  Mail,
  User,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  KeyRound,
  Building2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface LoginProps {
  onSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { login, register, quickDemoLogin, brandName } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('hamza.tariq@example.com');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('');
  const [residenceCity, setResidenceCity] = useState('Lahore, Punjab');
  const [targetDegree, setTargetDegree] = useState<'Bachelor' | 'Master' | 'PhD'>('Master');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      showToast('Successfully signed in! Welcome back.', 'success');
      if (onSuccess) onSuccess();
    } else {
      setErrorMessage(res.message || 'Invalid email or password');
      showToast(res.message || 'Sign in failed', 'error');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    const res = await register({
      fullName,
      email,
      password,
      residenceCity,
      targetDegree,
      role: 'student'
    });
    setLoading(false);
    if (res.success) {
      showToast('Account registered! Your study abroad plan has been initialized.', 'success');
      if (onSuccess) onSuccess();
    } else {
      setErrorMessage(res.message || 'Registration failed');
      showToast(res.message || 'Registration failed', 'error');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setLoading(false);
      showToast(data.message || 'Reset instructions sent to your email', 'info');
      setMode('login');
    } catch (err) {
      setLoading(false);
      showToast('Error requesting reset link', 'error');
    }
  };

  const handleDemoClick = async (role: 'student' | 'adviser' | 'admin') => {
    setLoading(true);
    await quickDemoLogin(role);
    setLoading(false);
    showToast(`Signed in via One-Click Demo as ${role.toUpperCase()}`, 'success');
    if (onSuccess) onSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-3">
        {/* Brand Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-xl shadow-teal-500/20 font-bold">
          <Plane className="w-7 h-7 -rotate-45" />
        </div>

        <div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{brandName}</h1>
            <span className="text-[10px] bg-teal-500/20 text-teal-300 font-bold px-2 py-0.5 rounded border border-teal-500/30 uppercase">
              Pakistan
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            AI-Powered Study Abroad Admissions, Scholarships & Visa Platform
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-800 space-y-6">
          {/* Quick Demo Logins Banner */}
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-teal-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Instant Demo Access:
              </span>
              <span className="text-slate-500 text-[10px]">1-Click Login</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleDemoClick('student')}
                className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-teal-600/30 hover:border-teal-500/50 text-slate-200 text-[11px] font-semibold border border-slate-700/80 transition-all text-center"
              >
                Student (Hamza)
              </button>
              <button
                type="button"
                onClick={() => handleDemoClick('adviser')}
                className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-teal-600/30 hover:border-teal-500/50 text-slate-200 text-[11px] font-semibold border border-slate-700/80 transition-all text-center"
              >
                Adviser (Tariq)
              </button>
              <button
                type="button"
                onClick={() => handleDemoClick('admin')}
                className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-teal-600/30 hover:border-teal-500/50 text-slate-200 text-[11px] font-semibold border border-slate-700/80 transition-all text-center"
              >
                Admin Board
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => { setMode('login'); setErrorMessage(''); }}
              className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                mode === 'login' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setErrorMessage(''); }}
              className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                mode === 'register' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Mode 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. hamza.tariq@example.com"
                    className="w-full bg-slate-950 pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-teal-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('student')}
                className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs border border-slate-700/80 transition-colors flex items-center justify-center gap-2"
              >
                <span>Instant Candidate Preview (Hamza Tariq)</span>
              </button>
            </form>
          )}

          {/* Mode 2: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Legal Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Fatima Zahra"
                    className="w-full bg-slate-950 pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="fatima@example.com"
                    className="w-full bg-slate-950 pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City in Pakistan</label>
                  <input
                    type="text"
                    required
                    value={residenceCity}
                    onChange={(e) => setResidenceCity(e.target.value)}
                    placeholder="Lahore, Punjab"
                    className="w-full bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-800 text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Degree</label>
                  <select
                    value={targetDegree}
                    onChange={(e) => setTargetDegree(e.target.value as any)}
                    className="w-full bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-800 text-slate-100 focus:outline-none focus:border-teal-500"
                  >
                    <option value="Bachelor">Bachelor</option>
                    <option value="Master">Master</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-950 pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <span>{loading ? 'Creating Candidate File...' : 'Create Account & Initialize Roadmap'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Mode 3: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
              <p className="text-slate-400 leading-relaxed">
                Enter your registered email address to receive password recovery instructions and secure credential verification.
              </p>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full bg-slate-950 pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold transition-colors"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl shadow-md transition-colors"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          )}

          {/* Trust Footnote */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              256-Bit Encrypted Vault
            </span>
            <span>HEC & APS Aligned</span>
          </div>
        </div>
      </div>
    </div>
  );
};
