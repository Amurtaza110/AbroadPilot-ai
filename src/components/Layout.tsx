// ============================================================
// App Layout — Sidebar + Content Area
// Uses React Router for proper URL-based navigation
// ============================================================
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Plane, LayoutDashboard, Compass, GraduationCap, Award,
  FileText, FolderOpen, Map, Calculator, ShieldCheck,
  Bot, Settings, LogOut, Menu, X, User, ChevronDown,
  Bell, Sparkles, Zap, PenTool, Mic
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const NAV_ITEMS = [
  { to: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard' },
  { to: '/advisor', icon: <Bot className="w-4 h-4" />, label: 'AI Advisor', badge: 'AI' },
  { to: '/discover', icon: <Compass className="w-4 h-4" />, label: 'Discover' },
  { to: '/applications', icon: <FileText className="w-4 h-4" />, label: 'Applications' },
  { to: '/auto-apply', icon: <Zap className="w-4 h-4" />, label: 'Auto-Apply Agent', badge: 'PILOT' },
  { to: '/scholarships', icon: <Award className="w-4 h-4" />, label: 'Scholarships' },
  { to: '/roadmap', icon: <Map className="w-4 h-4" />, label: 'My Roadmap' },
  { to: '/documents', icon: <FolderOpen className="w-4 h-4" />, label: 'Documents' },
  { to: '/sop-studio', icon: <PenTool className="w-4 h-4" />, label: 'SOP Studio', badge: 'AI' },
  { to: '/visa', icon: <ShieldCheck className="w-4 h-4" />, label: 'Visa Guide' },
  { to: '/visa-interview', icon: <Mic className="w-4 h-4" />, label: 'Mock Interview', badge: 'AI' },
  { to: '/cost-planner', icon: <Calculator className="w-4 h-4" />, label: 'Cost Planner' },
];

export const Layout: React.FC = () => {
  const { profile, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    showToast('Signed out successfully.', 'info');
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shrink-0">
          <Plane className="w-4 h-4 text-surface-950 -rotate-45" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-black text-white truncate">AbroadPilot</div>
          <div className="text-[10px] text-brand-400 font-semibold">AI Study Abroad</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="badge badge-brand text-[9px] px-1.5 py-0.5">{item.badge}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Agent Status Banner */}
      <div
        onClick={() => {
          navigate('/auto-apply');
          setSidebarOpen(false);
        }}
        className="mx-3 mb-3 p-3 rounded-xl bg-gradient-to-r from-accent-600/20 to-brand-600/20 border border-accent-500/20 hover:border-accent-500/40 cursor-pointer transition-all group"
      >
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-3.5 h-3.5 text-accent-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-accent-300">Auto-Apply Agent</span>
          <span className="ml-auto text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-bold animate-pulse">
            LIVE
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Autonomous dossier compilation & deadline monitoring radar.
        </p>
      </div>

      {/* User Profile */}
      <div className="border-t border-slate-800 p-3">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-surface-950 text-xs font-black shrink-0">
            {profile?.fullName?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-xs font-semibold text-slate-200 truncate">{profile?.fullName || 'Your Name'}</div>
            <div className="text-[10px] text-slate-500 truncate">{profile?.email}</div>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {userMenuOpen && (
          <div className="mt-2 space-y-0.5 animate-slide-up">
            <NavLink to="/profile" onClick={() => { setSidebarOpen(false); setUserMenuOpen(false); }}
              className="sidebar-item text-sm">
              <Settings className="w-3.5 h-3.5" /> Profile Settings
            </NavLink>
            <button onClick={handleLogout}
              className="sidebar-item w-full text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-surface-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-slate-800 bg-surface-900">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-surface-900 border-r border-slate-800 flex flex-col h-full animate-slide-up">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar (Mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-surface-900">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg gradient-brand flex items-center justify-center">
              <Plane className="w-3 h-3 text-surface-950 -rotate-45" />
            </div>
            <span className="text-sm font-black text-white">AbroadPilot AI</span>
          </div>
          <NavLink to="/advisor" className="p-2 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-slate-800">
            <Bot className="w-5 h-5" />
          </NavLink>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-surface-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
