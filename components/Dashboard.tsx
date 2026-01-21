import React from 'react';
import { TrendingUp, Users, ArrowUpRight, Lock, AlertCircle } from 'lucide-react';

interface DashboardProps {
  credits: number;
  contributionCount: number;
  unlockedCount: number;
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ credits, contributionCount, unlockedCount, onNavigate }) => {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <h2 className="text-3xl font-bold mb-2 relative z-10">Welcome back, Riversdale Physiotherapy</h2>
        <p className="text-slate-300 max-w-xl relative z-10">
          You are currently in Phase 2 of the network. Contributing patient history increases your access depth and speed.
        </p>
        
        {credits < 2 && (
          <div className="mt-6 inline-flex items-center bg-orange-500/20 border border-orange-500/50 rounded-lg px-4 py-2 text-orange-200 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            Low credit balance. Contribute a history to earn more points.
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wide">Credit Balance</span>
            <div className="p-2 bg-kinetic-50 rounded-lg">
              <Lock className="w-5 h-5 text-kinetic-600" />
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900 mb-1">{credits}</div>
          <p className="text-sm text-slate-500">Available to unlock histories</p>
          <button 
            onClick={() => onNavigate('contribute')}
            className="mt-6 text-sm font-semibold text-kinetic-600 flex items-center hover:text-kinetic-700 transition-colors"
          >
            Earn credits <ArrowUpRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wide">Contributions</span>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900 mb-1">{contributionCount}</div>
          <p className="text-sm text-slate-500">Histories shared with network</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wide">Intakes Assisted</span>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900 mb-1">{unlockedCount}</div>
          <p className="text-sm text-slate-500">Patients treated with prior data</p>
        </div>
      </div>
    </div>
  );
};