import React from 'react';
import {
  Compass,
  MapPin,
  FileText,
  FolderLock,
  Award,
  ShieldCheck,
  Calculator,
  Bot,
  UserCheck,
  Settings2,
  GraduationCap,
  Sparkles,
  Plane,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  mobileOpen,
  setMobileOpen
}) => {
  const { user, role, setRole, brandName, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Home Dashboard', icon: Compass, badge: undefined },
    { id: 'discover', label: 'Discover & Match', icon: GraduationCap, badge: 'Verified' },
    { id: 'roadmap', label: 'My Roadmap', icon: MapPin, badge: '10 Stages' },
    { id: 'applications', label: 'Applications', icon: FileText, badge: undefined },
    { id: 'documents', label: 'Document Vault', icon: FolderLock, badge: 'Vault' },
    { id: 'scholarships', label: 'Scholarships', icon: Award, badge: 'HEC/Intl' },
    { id: 'visa', label: 'Visa Preparation', icon: ShieldCheck, badge: 'Pakistan' },
    { id: 'calculator', label: 'PKR Cost Planner', icon: Calculator, badge: undefined },
    { id: 'advisor', label: 'AI Advisor Suite', icon: Bot, badge: 'AI Pro' },
    { id: 'profile', label: 'Student Profile', icon: UserCheck, badge: undefined }
  ];

  if (role === 'admin' || role === 'adviser') {
    navItems.push({ id: 'admin', label: 'Admin Management', icon: Settings2, badge: 'Admin' });
  }

  const handleNav = (id: string) => {
    setCurrentTab(id);
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/20 font-bold">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-base tracking-tight">{brandName}</span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 font-semibold px-1.5 py-0.5 rounded border border-teal-500/30">
                  PAKISTAN
                </span>
              </div>
              <p className="text-[11px] text-slate-400">AI Study Abroad Consultancy</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Quick Pill */}
        <div className="mx-4 mt-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Current Candidate</div>
            <div className="font-semibold text-slate-100 truncate max-w-[140px]">{user?.fullName || 'Hamza Tariq'}</div>
          </div>
          <div className="text-right">
            <div className="text-teal-400 font-bold text-xs">CGPA {user?.cgpa || '3.35'}</div>
            <div className="text-[10px] text-slate-400">{user?.targetDegree || 'Master'}</div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-teal-600/30 to-teal-500/10 text-teal-300 font-semibold border-l-4 border-teal-400 pl-3'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                      item.badge === 'AI Pro'
                        ? 'bg-teal-500 text-slate-950 font-bold'
                        : active
                        ? 'bg-teal-500/20 text-teal-300'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Role Switcher & Bottom Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-400">View Perspective:</span>
            <span className="text-[10px] text-teal-400 font-semibold uppercase">{role}</span>
          </div>
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setRole('student')}
              className={`py-1 rounded font-medium transition-colors ${
                role === 'student' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setRole('adviser')}
              className={`py-1 rounded font-medium transition-colors ${
                role === 'adviser' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Adviser
            </button>
            <button
              onClick={() => {
                setRole('admin');
                setCurrentTab('admin');
              }}
              className={`py-1 rounded font-medium transition-colors ${
                role === 'admin' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <button
              onClick={() => logout()}
              className="text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
            <span className="flex items-center gap-1 text-teal-400/80 text-[10px]">
              <Sparkles className="w-3 h-3" /> Gemini 3.8
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
