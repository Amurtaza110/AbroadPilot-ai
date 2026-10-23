import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Coins,
  Bot,
  Search,
  ExternalLink,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenMobile: () => void;
  onNavigateTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobile,
  onNavigateTab,
  searchQuery,
  setSearchQuery
}) => {
  const { user, currency, setCurrency, brandName } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const notifications = [
    {
      id: 1,
      title: "APS Islamabad Processing Alert",
      desc: "Pakistani applicants for German Winter 2026 must courier attested degrees to APS Islamabad at least 4-6 months before visa booking.",
      time: "2 hours ago",
      type: "urgent"
    },
    {
      id: 2,
      title: "Chevening Scholarship 2027/28",
      desc: "UK Government Chevening applications will open in August. 2 years of work experience required.",
      time: "1 day ago",
      type: "info"
    },
    {
      id: 3,
      title: "Politecnico di Milano Outcome",
      desc: "First semester admission ranking list release scheduled for late May on the Polimi Online Portal.",
      time: "2 days ago",
      type: "success"
    }
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="font-extrabold text-slate-900 tracking-tight text-lg">{brandName}</span>
          <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full border border-slate-200">
            Lahore / Islamabad Hub
          </span>
        </div>
      </div>

      {/* Middle: Universal Search */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search universities, programs, scholarships, or visa rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 hover:bg-slate-100/80 focus:bg-white pl-9 pr-4 py-2 text-xs rounded-xl border border-transparent focus:border-teal-500 focus:outline-none transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Right controls: Currency, Notifications, AI Advisor CTA */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Currency Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Coins className="w-3.5 h-3.5 text-teal-600" />
            <span>{currency}</span>
          </button>
          {showCurrencyDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs">
              <div className="px-3 py-1 font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                Display Currency
              </div>
              {(['PKR', 'USD', 'EUR', 'GBP'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => {
                    setCurrency(curr);
                    setShowCurrencyDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    currency === curr ? 'font-bold text-teal-600 bg-teal-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{curr === 'PKR' ? 'PKR (Pakistani Rupee)' : curr}</span>
                  {currency === curr && <CheckCircle className="w-3.5 h-3.5 text-teal-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-40 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-sm">Admissions & Visa Alerts</span>
                <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded-full">
                  3 New
                </span>
              </div>
              <div className="mt-3 space-y-3 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900">{n.title}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {n.time}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Advisor Button */}
        <button
          onClick={() => onNavigateTab('advisor')}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-semibold px-3.5 py-1.5 rounded-xl text-xs shadow-md shadow-teal-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask AI Advisor</span>
          <span className="sm:hidden">AI</span>
        </button>

        {/* User Account Button */}
        <div className="relative">
          <button
            onClick={() => onNavigateTab('profile')}
            className="flex items-center gap-2 p-1 pl-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-xs"
            title="Profile & Settings"
          >
            <span className="font-bold text-slate-800 max-w-[90px] truncate hidden md:inline">
              {user?.fullName?.split(' ')[0] || 'Profile'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-teal-300 font-bold flex items-center justify-center text-xs">
              {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
