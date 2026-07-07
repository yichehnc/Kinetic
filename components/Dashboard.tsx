import React, { useState } from 'react';
import { PrivacyExplainer } from './PrivacyExplainer';

// ─── Mock network intelligence data ──────────────────────────────────────────

const TOP_CONDITIONS = [
  { name: 'Lower Back Pain',        pct: 28 },
  { name: 'Rotator Cuff',           pct: 19 },
  { name: 'Ankle / Foot Sprains',   pct: 14 },
  { name: 'Knee OA / Post-op',      pct: 12 },
  { name: 'Cervical Radiculopathy', pct: 9  },
];

const TOP_PROTOCOLS = [
  { name: 'McKenzie + Progressive Loading', rate: 84 },
  { name: 'Dry Needling + Eccentric Load',  rate: 79 },
  { name: 'Manual Therapy + HEP',           rate: 76 },
];

const NETWORK_META = { networkSize: 847, totalEpisodes: 24312 };

const NETWORK_SIGNALS = [
  { tag: 'Trending', label: 'Rotator cuff presentations up 22% in Melbourne this month' },
  { tag: 'Insight',  label: 'McKenzie + progressive loading shows strongest LBP outcomes at 90 days' },
  { tag: 'Pattern',  label: 'Average patient visits 2.4 clinics before full resolution — continuity matters' },
  { tag: 'New',      label: 'Post-op ACL now the fastest-growing knee contribution category' },
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

// Shared class fragments (Design 2b — Linear-refined light theme)
const card = 'bg-surface-card border border-line rounded-lg';
const navCard = `${card} transition-colors duration-150 hover:border-[#D9D9DE] cursor-pointer`;
const primaryBtn =
  'text-[12.5px] font-medium text-white bg-accent hover:bg-accent-hover rounded-md px-[11px] py-[5px] transition-colors duration-150';
const secondaryBtn =
  'text-xs font-medium text-accent-text border border-accent-line bg-accent-tint2 hover:bg-accent-tint rounded-md px-2.5 py-[5px] transition-colors duration-150';

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
    <div className="max-w-[1180px] mx-auto">
      {/* Opted-out banner */}
      {!isOptedIn && (
        <div className={`${card} mb-4 px-[18px] py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div>
            <h3 className="text-[13px] font-semibold text-ink mb-0.5">Network connection inactive</h3>
            <p className="text-xs text-ink-4">
              You are currently opted out. Reconnect to access shared patient histories and clinical insights.
            </p>
          </div>
          <button onClick={onOptIn} className={`${primaryBtn} shrink-0 self-start sm:self-auto`}>
            Opt in to network
          </button>
        </div>
      )}

      {/* Locked-attempts banner */}
      {isOptedIn && lockedAttempts > 0 && (
        <div className={`${card} mb-4 px-[18px] py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div>
            <p className="text-[13px] text-ink mb-0.5">
              <span className="font-semibold">{lockedAttempts} patient {lockedAttempts === 1 ? 'history' : 'histories'}</span>
              {' '}you tried to access {lockedAttempts === 1 ? 'is' : 'are'} locked
            </p>
            <p className="text-xs text-ink-4">Contribute one treatment record to earn a credit and unlock access.</p>
          </div>
          <button onClick={() => onNavigate('contribute')} className={`${secondaryBtn} shrink-0 self-start sm:self-auto whitespace-nowrap`}>
            Contribute now
          </button>
        </div>
      )}

      {/* 1 — Stat row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Available credits */}
        <div className={`${card} px-[18px] py-4 border-t-2 border-t-accent`}>
          <div className="text-xs text-ink-4 mb-2">Available credits</div>
          <div className="flex items-baseline gap-2">
            <span className="font-brand font-bold text-2xl tracking-[-0.02em] text-ink">{credits}</span>
            <span className="text-[11px] font-semibold text-accent-text bg-accent-tint rounded px-1.5 py-px">Active rank</span>
          </div>
          <div className="text-[11.5px] text-ink-5 mt-1.5">
            {isOptedIn ? 'Share clinical data to boost liquidity' : 'Connect to start earning'}
          </div>
        </div>

        {/* Total contributions */}
        <div
          onClick={() => isOptedIn && onNavigate('contribute')}
          className={`${isOptedIn ? navCard : `${card} opacity-60`} px-[18px] py-4`}
        >
          <div className="text-xs text-ink-4 mb-2">Total contributions</div>
          <div className="font-brand font-bold text-2xl tracking-[-0.02em] text-ink">{contributionCount}</div>
          <div className="text-[11.5px] text-ink-5 mt-1.5">Protocols shared</div>
        </div>

        {/* Unlocked records */}
        <div
          onClick={() => isOptedIn && onNavigate('intake')}
          className={`${isOptedIn ? navCard : `${card} opacity-60`} px-[18px] py-4`}
        >
          <div className="text-xs text-ink-4 mb-2">Unlocked records</div>
          <div className="font-brand font-bold text-2xl tracking-[-0.02em] text-ink">{unlockedCount}</div>
          <div className="text-[11.5px] text-ink-5 mt-1.5">Histories accessed</div>
        </div>
      </div>

      {/* 2 — Credit loop */}
      {isOptedIn && (
        <div className={`${card} px-[18px] py-4 mb-4`}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[12.5px] font-semibold text-ink">Credit loop</span>
            <button
              onClick={() => setPrivacyOpen(true)}
              className="text-[11.5px] font-medium text-accent hover:text-accent-hover transition-colors duration-[120ms]"
            >
              How privacy works
            </button>
          </div>

          <div className="flex gap-[5px] mb-[9px]">
            {MILESTONES.map((m, i) => {
              const pct = segmentPct(i);
              const reached = earned >= m.threshold;
              return (
                <div key={m.label} className="flex-1">
                  <div className="h-[3px] bg-line-soft rounded-full mb-1.5">
                    <div
                      className="h-full bg-accent rounded-full transition-[width] duration-[600ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10.5px]">
                    <span className={reached || nextMilestone?.label === m.label ? 'font-semibold text-accent-text' : 'text-ink-4'}>
                      {m.label}
                    </span>
                    <span className="text-ink-6">{m.threshold}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11.5px] text-ink-4">
            {nextMilestone ? (
              <>
                <span className="font-semibold text-accent-text">
                  {nextMilestone.threshold - earned} more contribution{nextMilestone.threshold - earned !== 1 ? 's' : ''}
                </span>
                {' '}to reach {nextMilestone.label} — {nextMilestone.perk}
              </>
            ) : (
              <span className="font-semibold text-accent-text">All milestones reached — you are a Network Leader</span>
            )}
          </div>
        </div>
      )}

      {/* 3 — Intelligence grid */}
      <div className="relative mb-4">
        <h3 className="sr-only">Network intelligence</h3>

        {/* Locked overlay when opted out */}
        {!isOptedIn && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-sm border border-line">
            <div className="text-center px-6">
              <p className="text-[13px] font-semibold text-ink mb-1">Network insights locked</p>
              <p className="text-xs text-ink-4 mb-4 max-w-xs">
                Opt in to access aggregate clinical signals from {NETWORK_META.networkSize} practices across the network.
              </p>
              <button onClick={onOptIn} className={primaryBtn}>
                Opt in to unlock
              </button>
            </div>
          </div>
        )}

        <div className={`grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 ${!isOptedIn ? 'blur-sm pointer-events-none select-none' : ''}`}>
          {/* Network signals */}
          <div className={card}>
            <div className="px-[18px] py-[13px] border-b border-line-soft text-[12.5px] font-semibold text-ink">
              Network signals
            </div>
            <div>
              {NETWORK_SIGNALS.map((signal, i) => (
                <div
                  key={signal.label}
                  className={`flex gap-3 items-start px-[18px] py-[11px] ${i < NETWORK_SIGNALS.length - 1 ? 'border-b border-line-softer' : ''}`}
                >
                  <span className="flex-none w-[60px] text-center text-[10px] font-semibold text-accent-text bg-accent-tint rounded py-0.5 mt-px">
                    {signal.tag}
                  </span>
                  <span className="text-[12.5px] text-ink-2 leading-[1.45]">{signal.label}</span>
                </div>
              ))}
            </div>
            <div className="px-[18px] py-2.5 border-t border-line-soft text-[11px] text-ink-5">
              Anonymised contributions · Melbourne · last 30 days
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* Top conditions */}
            <div className={`${card} px-[18px] py-[15px]`}>
              <div className="text-[12.5px] font-semibold text-ink mb-3">Top conditions</div>
              <div className="flex flex-col gap-[9px]">
                {TOP_CONDITIONS.map(c => (
                  <div key={c.name} className="flex items-center gap-2.5">
                    <span className="flex-1 text-xs text-ink-2">{c.name}</span>
                    <span className="w-20 h-[3px] bg-line-soft rounded-full">
                      <span
                        className="block h-full bg-accent-soft rounded-full transition-[width] duration-[600ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
                        style={{ width: `${c.pct}%` }}
                      />
                    </span>
                    <span className="w-[30px] text-right text-[11.5px] text-ink-5">{c.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top protocols */}
            <div className={`${card} px-[18px] py-[15px]`}>
              <div className="text-[12.5px] font-semibold text-ink mb-3">Top protocols</div>
              <div className="flex flex-col gap-2.5">
                {TOP_PROTOCOLS.map(p => (
                  <div key={p.name} className="flex items-center gap-2.5">
                    <span className="flex-1 text-xs text-ink-2">{p.name}</span>
                    <span className="text-[11.5px] font-semibold text-positive-text">{p.rate}%</span>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-ink-5 mt-[11px] pt-2.5 border-t border-line-soft">
                Resolution rate · anonymised
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 — Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => isOptedIn && onNavigate('intake')}
          className={`${isOptedIn ? navCard : `${card} opacity-60`} px-[18px] py-[15px] flex items-center justify-between gap-4`}
        >
          <div>
            <div className="text-[12.5px] font-semibold text-ink mb-0.5">Patient intake</div>
            <div className="text-[11.5px] text-ink-4">Query the network for prior-care history</div>
          </div>
          <span className={`${secondaryBtn} shrink-0 whitespace-nowrap`}>Begin search</span>
        </div>

        <div
          onClick={() => isOptedIn && onNavigate('contribute')}
          className={`${isOptedIn ? navCard : `${card} opacity-60`} px-[18px] py-[15px] flex items-center justify-between gap-4`}
        >
          <div>
            <div className="flex items-center gap-[7px] mb-0.5">
              <span className="text-[12.5px] font-semibold text-ink">Contribute evidence</span>
              <span className="text-[10px] font-semibold text-positive-deep bg-positive-tint rounded px-[5px] py-px">+1</span>
            </div>
            <div className="text-[11.5px] text-ink-4">Deposit structured outcomes to earn credits</div>
          </div>
          <span className={`${primaryBtn} shrink-0 whitespace-nowrap`}>Start</span>
        </div>
      </div>

      {/* Disconnect */}
      {isOptedIn && (
        <div className="mt-6 text-center">
          <button
            onClick={onOptOut}
            className="text-[11.5px] text-ink-5 hover:text-red-600 transition-colors duration-150"
          >
            Disconnect network
          </button>
        </div>
      )}

      <PrivacyExplainer open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </div>
  );
};
