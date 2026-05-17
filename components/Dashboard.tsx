import React, { useState } from 'react';
import { Award, TrendingUp, Users, Plus, Search, ArrowRight, LogOut, LogIn, Shield, BarChart2, Zap, CheckCircle2, Circle } from 'lucide-react';
import { PrivacyExplainer } from './PrivacyExplainer';

// ─── Mock network intelligence data ──────────────────────────────────────────

const TOP_CONDITIONS = [
  { name: 'Lower Back Pain',          pct: 28 },
  { name: 'Rotator Cuff Tendinopathy', pct: 19 },
  { name: 'Ankle / Foot Sprains',     pct: 14 },
  { name: 'Knee OA / Post-op Rehab',  pct: 12 },
  { name: 'Cervical Radiculopathy',   pct: 9  },
];

const TOP_PROTOCOLS = [
  { name: 'McKenzie + Progressive Loading', rate: 84, n: 47 },
  { name: 'Dry Needling + Eccentric Load',  rate: 79, n: 31 },
  { name: 'Manual Therapy + HEP',           rate: 76, n: 89 },
];

const NETWORK_META = { networkSize: 847, totalEpisodes: 24312 };

const NETWORK_SIGNALS = [
  {
    label: 'Rotator cuff presentations up 22% in Melbourne this month',
    tag: 'Trending', tagColor: 'bg-rose-50 text-rose-600 border-rose-100',
  },
  {
    label: 'McKenzie + progressive loading shows strongest LBP outcomes at 90 days',
    tag: 'Insight', tagColor: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    label: 'Average patient visits 2.4 clinics before full resolution — continuity matters',
    tag: 'Pattern', tagColor: 'bg-purple-50 text-purple-600 border-purple-100',
  },
  {
    label: 'Post-op ACL now the fastest-growing knee contribution category',
    tag: 'New', tagColor: 'bg-amber-50 text-amber-600 border-amber-100',
  },
];

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

  const MILESTONES = [
    { label: 'Starter',     threshold: 10, perk: 'unlock priority case matching' },
    { label: 'Contributor', threshold: 30, perk: 'unlock advanced network analytics' },
    { label: 'Leader',      threshold: 60, perk: 'unlock full network leaderboard'  },
  ];

  const segmentPct = (i: number) => {
    const prev = i === 0 ? 0 : MILESTONES[i - 1].threshold;
    const curr = MILESTONES[i].threshold;
    if (earned >= curr) return 100;
    if (earned <= prev) return 0;
    return Math.round(((earned - prev) / (curr - prev)) * 100);
  };

  const nextMilestone = MILESTONES.find(m => earned < m.threshold);

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

      {/* Unmet Demand Banner */}
      {isOptedIn && lockedAttempts > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <Search className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-0.5">
                {lockedAttempts} patient {lockedAttempts === 1 ? 'history' : 'histories'} you tried to access {lockedAttempts === 1 ? 'is' : 'are'} locked
              </p>
              <p className="text-xs text-slate-600">
                Contribute one treatment record to earn a credit and unlock access.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('contribute')}
            className="shrink-0 px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition-colors whitespace-nowrap"
          >
            Contribute now
          </button>
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

          <div className="flex gap-2 mb-3">
            {MILESTONES.map((m, i) => {
              const pct = segmentPct(i);
              const reached = earned >= m.threshold;
              return (
                <div key={m.label} className="flex-1">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${reached ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    {reached
                      ? <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      : <Circle className="w-3 h-3 text-slate-300 shrink-0" />
                    }
                    <span className={`text-[9px] font-bold uppercase tracking-wider truncate ${reached ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {m.label}
                    </span>
                    <span className="text-[9px] text-slate-300 ml-auto shrink-0">{m.threshold}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-900/5">
            {nextMilestone ? (
              <p className="text-[10px] text-slate-500">
                <span className="font-bold text-slate-700">{nextMilestone.threshold - earned} more contribution{nextMilestone.threshold - earned !== 1 ? 's' : ''}</span>
                {' '}to reach <span className="font-bold text-emerald-600">{nextMilestone.label}</span> — {nextMilestone.perk}
              </p>
            ) : (
              <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> All milestones reached — you are a Network Leader
              </p>
            )}
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

      {/* Network Intelligence */}
      <div className="mb-8 relative">
        {/* Blurred overlay when opted out */}
        {!isOptedIn && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200">
            <div className="text-center px-6">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-5 h-5 text-slate-400" />
              </div>
              <p className="font-brand font-bold text-slate-900 mb-1">Network insights locked</p>
              <p className="text-xs text-slate-500 mb-4 max-w-xs">Opt in to access aggregate clinical signals from {NETWORK_META.networkSize} practices across the network.</p>
              <button
                onClick={onOptIn}
                className="px-5 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors"
              >
                Opt in to unlock
              </button>
            </div>
          </div>
        )}

        <div className={!isOptedIn ? 'blur-sm pointer-events-none select-none' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-brand font-extrabold text-slate-900 tracking-tight">Network Intelligence</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Melbourne · {NETWORK_META.networkSize} clinics · {NETWORK_META.totalEpisodes.toLocaleString()} episodes</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Network Signals */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-amber-500" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Network signals</p>
              </div>
              <div className="space-y-3">
                {NETWORK_SIGNALS.map((signal) => (
                  <div key={signal.label} className="flex items-start gap-3">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 w-[68px] text-center ${signal.tagColor}`}>
                      {signal.tag}
                    </span>
                    <p className="text-xs text-slate-700 leading-snug font-medium">{signal.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
                Derived from anonymised contributions in Melbourne, last 30 days.
              </p>
            </div>

            {/* Top conditions in region */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="w-4 h-4 text-blue-500" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Top conditions · region</p>
              </div>
              <div className="space-y-2.5">
                {TOP_CONDITIONS.map(c => (
                  <div key={c.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-700 font-medium truncate pr-2">{c.name}</span>
                      <span className="text-slate-400 shrink-0">{c.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: `${c.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-4">Based on contributed episodes in Melbourne, last 90 days.</p>
            </div>

            {/* Top protocols */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Top protocols · this month</p>
              </div>
              <div className="space-y-3">
                {TOP_PROTOCOLS.map((p, i) => (
                  <div key={p.name} className="flex items-start gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                      i === 0 ? 'bg-amber-100 text-amber-700' :
                      i === 1 ? 'bg-slate-100 text-slate-600' :
                                'bg-orange-50 text-orange-600'
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 leading-snug">{p.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.rate}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 shrink-0">{p.rate}%</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">n={p.n} episodes</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-4">Resolution rate across contributing clinics. All data anonymised.</p>
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

      <PrivacyExplainer open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </div>
  );
};