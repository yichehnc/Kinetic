import React from 'react';
import { LayoutDashboard, Users, FilePlus, Settings, Activity, ShieldCheck, Share2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  credits: number;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, credits }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'intake', label: 'Patient Intake', icon: Users },
    { id: 'contribute', label: 'Contribute History', icon: FilePlus },
    { id: 'referrals', label: 'Referrals', icon: Share2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col shadow-xl z-20">
        <div className="p-6 flex items-center space-x-2 border-b border-slate-800">
          <div className="bg-kinetic-500 p-2 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Kinetic</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-kinetic-600 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 bg-slate-800 m-4 rounded-xl border border-slate-700">
          <div className="flex items-center space-x-2 mb-2 text-slate-300 text-xs uppercase font-semibold tracking-wider">
            <ShieldCheck className="w-4 h-4 text-kinetic-500" />
            <span>Riversdale Physio</span>
          </div>
          <div className="text-white font-medium">Opted In</div>
          <div className="text-xs text-slate-400 mt-1">Network Active</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10 sticky top-0">
          <h1 className="text-xl font-semibold text-slate-800 capitalize">
            {navItems.find(n => n.id === activeTab)?.label}
          </h1>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center bg-slate-100 rounded-full px-4 py-1.5 border border-slate-200">
              <span className="text-sm text-slate-500 mr-2 font-medium">History Credits</span>
              <div className={`text-lg font-bold ${credits > 0 ? 'text-kinetic-600' : 'text-red-500'}`}>
                {credits}
              </div>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-300">
              RP
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};