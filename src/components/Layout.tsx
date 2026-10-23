import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Dashboard } from '../pages/Dashboard';
import { Discover } from '../pages/Discover';
import { Roadmap } from '../pages/Roadmap';
import { Applications } from '../pages/Applications';
import { Documents } from '../pages/Documents';
import { Scholarships } from '../pages/Scholarships';
import { VisaGuide } from '../pages/VisaGuide';
import { CostPlanner } from '../pages/CostPlanner';
import { AiAdvisor } from '../pages/AiAdvisor';
import { Profile } from '../pages/Profile';
import { Admin } from '../pages/Admin';
import { SopAssistantModal } from './SopAssistantModal';
import { EmailDraftModal } from './EmailDraftModal';
import { useAuth } from '../context/AuthContext';

export const Layout: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Global modals
  const [showSopModal, setShowSopModal] = useState<boolean>(false);
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard
            onNavigateTab={setCurrentTab}
            onOpenSopAssistant={() => setShowSopModal(true)}
            onOpenEmailDraft={() => setShowEmailModal(true)}
          />
        );
      case 'discover':
        return <Discover searchQuery={searchQuery} />;
      case 'roadmap':
        return <Roadmap />;
      case 'applications':
        return <Applications />;
      case 'documents':
        return <Documents />;
      case 'scholarships':
        return <Scholarships />;
      case 'visa':
        return <VisaGuide />;
      case 'calculator':
        return <CostPlanner />;
      case 'advisor':
        return (
          <AiAdvisor
            onOpenSopAssistant={() => setShowSopModal(true)}
            onOpenEmailDraft={() => setShowEmailModal(true)}
          />
        );
      case 'profile':
        return <Profile />;
      case 'admin':
        return <Admin />;
      default:
        return (
          <Dashboard
            onNavigateTab={setCurrentTab}
            onOpenSopAssistant={() => setShowSopModal(true)}
            onOpenEmailDraft={() => setShowEmailModal(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Navbar
          onOpenMobile={() => setMobileOpen(true)}
          onNavigateTab={setCurrentTab}
          searchQuery={searchQuery}
          setSearchQuery={(q) => {
            setSearchQuery(q);
            if (currentTab !== 'discover' && q.trim()) {
              setCurrentTab('discover');
            }
          }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>

      {/* Global SOP Assistant Modal */}
      {showSopModal && (
        <SopAssistantModal
          profile={user}
          onClose={() => setShowSopModal(false)}
        />
      )}

      {/* Global Email Draft Modal */}
      {showEmailModal && (
        <EmailDraftModal
          profile={user}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  );
};
