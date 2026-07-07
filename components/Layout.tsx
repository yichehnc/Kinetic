import React from 'react';
import { LayoutDashboard, Users, Plus, MessageSquare, Share2, SlidersHorizontal, ChevronsUpDown } from 'lucide-react';

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

  return (
    <div className="flex min-h-screen bg-surface-page text-ink">
      {/* Sidebar */}
      <aside className="flex-none w-[216px] bg-surface-sidebar border-r border-line flex flex-col px-[10px] py-[14px] sticky top-0 h-screen">
        {/* Workspace row */}
        <div className="flex items-center gap-2 px-2 py-1.5 mb-[14px]">
          <div className="w-5 h-5 bg-accent rounded-[5px] flex items-center justify-center">
            <span className="text-white font-brand font-bold text-[11px]">K</span>
          </div>
          <span className="text-[13px] font-semibold text-ink">Cremorne Physio</span>
          <ChevronsUpDown className="w-3 h-3 text-ink-5 ml-auto" aria-hidden="true" />
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-px" role="navigation" aria-label="Main navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-[9px] px-2 py-1.5 rounded-md text-[12.5px] text-left transition-colors duration-[120ms] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive
                    ? 'bg-accent-tint text-accent-deep font-[550]'
                    : 'text-ink-3 font-[450] hover:bg-black/[.04] hover:text-ink'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${isActive ? 'text-accent' : ''}`}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom: credits widget + status + legal links */}
        <div className="mt-auto">
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
              onClick={() => onTabChange('privacy')}
              className="text-[11px] text-ink-5 hover:text-ink transition-colors duration-[120ms]"
            >
              Privacy
            </button>
            <button
              onClick={() => onTabChange('terms')}
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
      </aside>

      {/* Content pane */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between h-12 px-7 border-b border-[#ECECEF] flex-none">
          <span className="text-[13.5px] font-semibold text-ink">{PAGE_TITLES[activeTab] ?? 'Kinetic'}</span>
          <div className="flex items-center gap-2.5">
            <span className="hidden md:inline text-xs text-ink-5">Melbourne · 847 clinics · 24,312 episodes</span>
            <button
              onClick={() => onTabChange('contribute')}
              className="text-[12.5px] font-medium text-white bg-accent hover:bg-accent-hover rounded-md px-[11px] py-[5px] transition-colors duration-150"
            >
              Contribute
            </button>
          </div>
        </header>

        {/* Body */}
        <main key={activeTab} className="flex-1 p-7 motion-safe:animate-page-in" role="main">
          {children}
        </main>
      </div>
    </div>
  );
};
