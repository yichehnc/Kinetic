import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Plus, MessageSquare, Share2, SlidersHorizontal, ChevronsUpDown, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  credits: number;
  contributionCount?: number;
  isOptedIn?: boolean;
}

const MILESTONES = [
  { label: 'Starter', threshold: 10 },
  { label: 'Contributor', threshold: 30 },
  { label: 'Leader', threshold: 60 },
];

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  intake: 'Patient intake',
  contribute: 'Contribute',
  community: 'Community',
  referrals: 'Referrals',
  settings: 'Settings',
  privacy: 'Privacy policy',
  terms: 'Terms of service',
};

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  credits,
  contributionCount = 0,
  isOptedIn = true,
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close the mobile drawer whenever the active tab changes.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [activeTab]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'intake', label: 'Patient intake', icon: Users },
    { id: 'contribute', label: 'Contribute', icon: Plus },
    { id: 'community', label: 'Community', icon: MessageSquare },
    { id: 'referrals', label: 'Referrals', icon: Share2 },
    { id: 'settings', label: 'Settings', icon: SlidersHorizontal },
  ];

  const nextMilestone = MILESTONES.find(m => contributionCount < m.threshold);
  const progressPct = nextMilestone
    ? Math.min(100, Math.round((contributionCount / nextMilestone.threshold) * 100))
    : 100;

  const handleNav = (tab: string) => {
    onTabChange(tab);
    setMobileNavOpen(false);
  };

  const sidebarContent = (
    <>
      {/* Workspace row — full row on mobile drawer & desktop, icon-only on tablet rail */}
      <div className="flex items-center gap-2 px-2 py-1.5 mb-[14px] md:justify-center lg:justify-start">
        <div className="w-5 h-5 bg-accent rounded-[5px] flex items-center justify-center shrink-0">
          <span className="text-white font-brand font-bold text-[11px]">K</span>
        </div>
        <span className="text-[13px] font-semibold text-ink md:hidden lg:inline">Cremorne Physio</span>
        <ChevronsUpDown className="w-3 h-3 text-ink-5 ml-auto md:hidden lg:inline" aria-hidden="true" />
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-px" role="navigation" aria-label="Main navigation">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleNav(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              title={tab.label}
              className={`flex items-center gap-[9px] px-2 py-1.5 rounded-md text-[12.5px] text-left transition-colors duration-[120ms] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent md:justify-center lg:justify-start ${
                isActive
                  ? 'bg-accent-tint text-accent-deep font-[550]'
                  : 'text-ink-3 font-[450] hover:bg-black/[.04] hover:text-ink'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-accent' : ''}`}
                strokeWidth={1.8}
                aria-hidden="true"
              />
              <span className="md:hidden lg:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom: credits widget + status + legal links — collapsed on tablet rail */}
      <div className="mt-auto md:hidden lg:block">
        <div className="border border-accent-line2 bg-accent-tint2 rounded-lg px-3 py-2.5 mb-2">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-[11px] font-[550] text-accent-text">Credits</span>
            <span className="font-brand font-bold text-[14px] text-accent-strong">{credits}</span>
          </div>
          <div className="h-[3px] bg-[#E2E5F8] rounded-full mb-2">
            <div
              className="h-full bg-accent rounded-full transition-[width] duration-[600ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="text-[11px] text-[#7A83C9] leading-[1.4]">
            {nextMilestone
              ? `${nextMilestone.threshold - contributionCount} contributions to ${nextMilestone.label} tier`
              : 'All tiers reached'}
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-1">
          <span className={`w-1.5 h-1.5 rounded-full ${isOptedIn ? 'bg-positive' : 'bg-zinc-300'}`} />
          <span className="text-[11.5px] text-ink-4">{isOptedIn ? 'Network active' : 'Network inactive'}</span>
        </div>
        <div className="flex items-center gap-3 px-2 pt-2">
          <button
            onClick={() => handleNav('privacy')}
            className="text-[11px] text-ink-5 hover:text-ink transition-colors duration-[120ms]"
          >
            Privacy
          </button>
          <button
            onClick={() => handleNav('terms')}
            className="text-[11px] text-ink-5 hover:text-ink transition-colors duration-[120ms]"
          >
            Terms
          </button>
          <a
            href="https://github.com/yichenc/kinetic#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-ink-5 hover:text-ink transition-colors duration-[120ms]"
          >
            Documentation
          </a>
        </div>
      </div>

      {/* Tablet rail: just the status dot, no label */}
      <div className="mt-auto hidden md:flex lg:hidden justify-center py-2">
        <span className={`w-1.5 h-1.5 rounded-full ${isOptedIn ? 'bg-positive' : 'bg-zinc-300'}`} title={isOptedIn ? 'Network active' : 'Network inactive'} />
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-surface-page text-ink">
      {/* Mobile backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-ink/40 z-40 md:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — mobile: fixed slide-over drawer; tablet: static icon rail; desktop: static full sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[216px] bg-surface-sidebar border-r border-line flex flex-col px-[10px] py-[14px] transition-transform duration-200 ease-out
          md:static md:z-auto md:translate-x-0 md:w-16 md:h-screen md:sticky md:top-0
          lg:w-[216px]
          ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Close button — mobile drawer only */}
        <button
          onClick={() => setMobileNavOpen(false)}
          aria-label="Close menu"
          className="md:hidden self-end mb-2 p-1 text-ink-5 hover:text-ink transition-colors duration-150"
        >
          <X className="w-4 h-4" />
        </button>
        {sidebarContent}
      </aside>

      {/* Content pane */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between h-12 px-4 sm:px-5 lg:px-7 border-b border-[#ECECEF] flex-none">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              className="md:hidden p-1 -ml-1 text-ink-3 hover:text-ink transition-colors duration-150"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
            <span className="text-[13.5px] font-semibold text-ink truncate">{PAGE_TITLES[activeTab] ?? 'Kinetic'}</span>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="hidden lg:inline text-xs text-ink-5">Melbourne · 847 clinics · 24,312 episodes</span>
            <button
              onClick={() => onTabChange('contribute')}
              className="text-[12.5px] font-medium text-white bg-accent hover:bg-accent-hover rounded-md px-[11px] py-[5px] transition-colors duration-150"
            >
              Contribute
            </button>
          </div>
        </header>

        {/* Body */}
        <main key={activeTab} className="flex-1 p-4 sm:p-5 lg:p-7 motion-safe:animate-page-in" role="main">
          {children}
        </main>
      </div>
    </div>
  );
};
