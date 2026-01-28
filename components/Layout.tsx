import React from 'react';
import { LayoutDashboard, Users, Plus, Share2, Settings, Award, MessageSquare } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  credits: number;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, credits }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'intake', label: 'Patient Intake', icon: Users },
    { id: 'contribute', label: 'Contribute', icon: Plus },
    { id: 'community', label: 'Community (Soon)', icon: MessageSquare },
    { id: 'referrals', label: 'Referrals', icon: Share2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 gap-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Kinetic Network</h1>
                <p className="text-xs text-slate-500">Continuity through collaboration</p>
              </div>
            </div>

            {/* Credits Badge */}
            <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
              <Award className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xs text-emerald-600 font-medium">Credits</p>
                <p className="text-lg font-bold text-emerald-900">{credits}</p>
              </div>
            </div>
          </div>

          {/* Navigation - Responsive */}
          <nav 
            className="border-t border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 overflow-x-auto"
            role="navigation"
            aria-label="Main navigation"
          >
            <div className="flex space-x-1 min-w-max sm:min-w-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                      isActive
                        ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>© 2026 Kinetic Network. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-4 justify-center">
              <a href="#" className="hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded">
                Privacy Policy
              </a>
              <span className="hidden sm:inline" aria-hidden="true">•</span>
              <a href="#" className="hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded">
                Terms of Service
              </a>
              <span className="hidden sm:inline" aria-hidden="true">•</span>
              <a href="#" className="hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded">
                Documentation
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};