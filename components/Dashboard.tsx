import React, { useState } from 'react';
import { Award, TrendingUp, Users, Plus, Search, ArrowRight, LogOut, LogIn, Shield } from 'lucide-react';
import { PrivacyExplainer } from './PrivacyExplainer';

interface DashboardProps {
  credits: number;
  contributionCount: number;
  unlockedCount: number;
  lockedAttempts?: number;
  onNavigate: (tab: string) => void;
  isOptedIn: boolean;
  onOptIn: () => void;
  onOptOut: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  credits,
  contributionCount,
  unlockedCount,
  lockedAttempts = 0,
  onNavigate,
  isOptedIn,
  onOptIn,
  onOptOut
}) => {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const earned = contributionCount;
  const spent = unlockedCount;
  const loopMax = Math.max(earned, spent, 1);
  const earnedPct = Math.round((earned / loopMax) * 100);
  const spentPct = Math.round((spent / loopMax) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 pb-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-brand font-extrabold text-slate-900 tracking-tight mb-1">Dashboard</h2>
          <p className="text-sm text-slate-500 font-medium">Welcome back to the Kinetic Network</p>
        </div>
        {isOptedIn && (
          <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/50 shadow-sm ring-1 ring-black/[0.03]">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-brand font-bold text-xs shadow-inner transform -rotate-2">
              CP
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 leading-none mb-1">Clinic Active</p>
              <p className="text-xs font-brand font-bold text-slate-900">Cremorne Physio</p>
            </div>
          </div>
        )}
      </div>

      {/* Opt-in/Opt-out Banner */}
      {!isOptedIn && (
        <div className="mb-8 p-[1px] bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 rounded-2xl">
          <div className="bg-white rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <LogOut className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-brand font-bold text-slate-900 mb-1">
                    Network Connection Inactive
                  </h3>
                  <p className="text-sm text-slate-500 max-w-md">
                    You are currently opted out. Reconnecting allows you to securely access shared patient histories and clinical insights.
                  </p>
                </div>
              </div>
              <button
                onClick={onOptIn}
                className="flex items-center px-6 py-3 bg-slate-900 text-white rounded-xl font-brand font-bold text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Opt In to Network
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credit Loop — earned vs spent progress bars */}
      {isOptedIn && (
        <div className="mb-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Credit Loop</p>
            <button
              onClick={() => setPrivacyOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600 tracking-tight transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              How privacy works
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-600 w-14">Earned</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${earnedPct}%` }} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 w-8 text-right">{earned}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-blue-600 w-14">Spent</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${spentPct}%` }} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 w-8 text-right">{spent}</span>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid - Refined Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Credits Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:shadow-2xl hover:scale-[1.015] hover:bg-white/85 hover:border-white transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-125 transition-transform duration-700"></div>
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                <Award className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex items-center space-x-1 text-[11px] font-bold text-emerald-600 uppercase tracking-[0.1em]">
                <TrendingUp className="w-3 h-3" />
                <span>Active Rank</span>
              </div>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1">Available Credits</p>
            <p className="text-4xl font-brand font-extrabold text-slate-900 mb-4">{credits}</p>
            
            <div className="mt-auto">
              <p className="text-[11px] text-slate-400 pt-3 border-t border-slate-900/5 mb-3">
                {isOptedIn ? 'Share clinical data to boost liquidity' : 'Connect to start earning'}
              </p>
              <button 
                className="text-xs font-bold font-brand text-emerald-600 hover:text-emerald-700 flex items-center group/btn"
                onClick={() => {}}
              >
                Explore payment plan <ArrowRight className="w-3 h-3 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Contributions Card */}
        <div 
          onClick={() => isOptedIn && onNavigate('contribute')}
          className={`rounded-2xl p-5 border shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group transition-all duration-500 ${
            isOptedIn 
              ? 'bg-white/70 backdrop-blur-xl border-white/80 hover:shadow-2xl hover:scale-[1.015] hover:bg-white/85 hover:border-white cursor-pointer' 
              : 'bg-white/40 border-white/20 opacity-75'
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-125 transition-transform duration-700"></div>
          <div className="flex flex-col h-full relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-slate-100/50 rounded-xl flex items-center justify-center transition-colors group-hover:bg-blue-50/80 backdrop-blur-sm">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1">Total Contributions</p>
            <p className="text-4xl font-brand font-extrabold text-slate-900 mb-4">{contributionCount}</p>
            <div className="mt-auto">
              <p className="text-[11px] text-slate-400 pt-3 border-t border-slate-900/5 mb-3">Protocols shared</p>
              <button 
                disabled={!isOptedIn}
                className={`text-xs font-bold flex items-center font-brand tracking-tight transition-colors ${
                  isOptedIn ? 'text-blue-600 group-hover:text-blue-700' : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                Contribute <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Unlocked Records Card */}
        <div 
          onClick={() => isOptedIn && onNavigate('intake')}
          className={`rounded-2xl p-5 border shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group transition-all duration-500 ${
            isOptedIn 
              ? 'bg-white/70 backdrop-blur-xl border-white/80 hover:shadow-2xl hover:scale-[1.015] hover:bg-white/85 hover:border-white cursor-pointer' 
              : 'bg-white/40 border-white/20 opacity-75'
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-125 transition-transform duration-700"></div>
          <div className="flex flex-col h-full relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-slate-100/50 rounded-xl flex items-center justify-center transition-colors group-hover:bg-purple-50/80 backdrop-blur-sm">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1">Unlocked Records</p>
            <p className="text-4xl font-brand font-extrabold text-slate-900 mb-4">{unlockedCount}</p>
            <div className="mt-auto">
              <p className="text-[11px] text-slate-400 pt-3 border-t border-slate-900/5 mb-3">Histories accessed</p>
              <button 
                disabled={!isOptedIn}
                className={`text-xs font-bold flex items-center font-brand tracking-tight transition-colors ${
                  isOptedIn ? 'text-purple-600 group-hover:text-purple-700' : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                Open Intake <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Bento style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Patient Intake Card */}
        <div 
          onClick={() => isOptedIn && onNavigate('intake')}
          className={`bg-white rounded-2xl p-6 shadow-sm relative overflow-hidden group transition-all duration-500 ${
            isOptedIn 
              ? 'hover:shadow-2xl hover:scale-[1.015] cursor-pointer' 
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="absolute -bottom-6 -right-6 p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
            <Search className="w-32 h-32 text-slate-900" />
          </div>
          <div className="relative z-10 h-full flex flex-col">
            <div className={`w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 border border-emerald-100`}>
              <Search className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-brand font-extrabold text-slate-900 mb-1">Patient Intake</h3>
            <p className="text-xs text-slate-500 mb-6 max-w-xs leading-relaxed font-medium">
              Securely query the network for longitudinal patient history.
            </p>
            <div className="mt-auto pt-4 border-t border-slate-100">
              {isOptedIn ? (
                <div className="inline-flex items-center text-xs font-bold text-emerald-600 font-brand tracking-tight">
                  Begin search <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              ) : (
                <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                  Locked
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contribute Data Card */}
        <div 
          onClick={() => isOptedIn && onNavigate('contribute')}
          className={`rounded-2xl p-6 border shadow-sm relative overflow-hidden group transition-all duration-500 ${
            isOptedIn
              ? 'bg-slate-900 border-slate-800 hover:shadow-2xl hover:scale-[1.015] cursor-pointer text-white'
              : 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed text-slate-400'
          }`}
        >
          <div className="absolute -bottom-6 -right-6 p-6 opacity-10 group-hover:scale-110 transition-transform">
            <Plus className="w-32 h-32 text-white" />
          </div>
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                isOptedIn ? 'bg-white/10 shadow-lg' : 'bg-slate-100'
              }`}>
                <Plus className={`w-6 h-6 ${isOptedIn ? 'text-emerald-400' : 'text-slate-400'}`} />
              </div>
              {isOptedIn && (
                <div className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[9px] font-bold uppercase tracking-[0.1em] border border-emerald-500/30">
                  +1 Credit
                </div>
              )}
            </div>
            <h3 className="text-lg font-brand font-extrabold mb-1">Contribute Evidence</h3>
            <p className={`text-xs mb-6 max-w-xs leading-relaxed font-medium ${isOptedIn ? 'text-slate-300' : 'text-slate-400'}`}>
              Deposit structured outcomes to earn network credits.
            </p>
            <div className="mt-auto pt-4 border-t border-white/10">
              {isOptedIn ? (
                <div className="inline-flex items-center text-xs font-bold font-brand tracking-tight text-white hover:text-emerald-400">
                  Start contribution <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              ) : (
                <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                  Locked
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Network Status - Minimal Strip */}
      <div className={`rounded-2xl p-5 border flex items-center justify-between transition-colors ${
        isOptedIn 
          ? 'bg-emerald-50/30 border-emerald-100' 
          : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center space-x-4">
          <div className={`w-3 h-3 rounded-full ${
            isOptedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
          }`} />
          <div>
            <span className={`text-xs font-bold uppercase tracking-widest ${isOptedIn ? 'text-emerald-700' : 'text-slate-500'}`}>
              Network Status: {isOptedIn ? 'Encrypted & Active' : 'Disconnected'}
            </span>
          </div>
        </div>
        {isOptedIn && (
          <button
            onClick={onOptOut}
            className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-red-500 transition-colors"
          >
            Disconnect Network
          </button>
        )}
      </div>

      {/* Getting Started Guide - compact */}
      <div className="mt-8 bg-white/60 backdrop-blur-xl rounded-2xl p-5 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h3 className="text-sm font-brand font-extrabold text-slate-900 mb-4 tracking-tight">Getting Started</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-emerald-100">
              <span className="text-emerald-600 font-bold text-xs">1</span>
            </div>
            <div>
              <h4 className="text-xs font-brand font-bold text-slate-900 mb-0.5">Contribute Data</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Share outcomes to earn credits.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-100">
              <span className="text-blue-600 font-bold text-xs">2</span>
            </div>
            <div>
              <h4 className="text-xs font-brand font-bold text-slate-900 mb-0.5">Search History</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Look up patients in the network.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-purple-100">
              <span className="text-purple-600 font-bold text-xs">3</span>
            </div>
            <div>
              <h4 className="text-xs font-brand font-bold text-slate-900 mb-0.5">Unlock Records</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Use credits for patient safety.
              </p>
            </div>
          </div>
        </div>
      </div>

      <PrivacyExplainer open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </div>
  );
};