import React, { useState } from 'react';
import {
  Search, Lock, Unlock, Clock, CheckCircle, AlertCircle,
  Download, FileText, ChevronRight, Share2,
  Plus, Upload, Filter, AlertTriangle, Zap,
  ArrowLeft, X as XIcon, PanelRight,
} from 'lucide-react';
import { Patient, HistoryEntry, Status } from '../types';

interface PatientSearchProps {
  patients: Patient[];
  histories: HistoryEntry[];
  unlockedPatients: string[];
  credits: number;
  onUnlock: (patientId: string) => void;
  isOptedIn?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const initials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

const calcAge = (dob: string) => {
  const b = new Date(dob);
  const t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) age--;
  return age;
};

const statusColors = (s: string) => {
  if (s === 'Resolved') return { bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' };
  if (s === 'Ongoing')  return { bar: 'bg-blue-500',    badge: 'bg-blue-100 text-blue-700' };
  return                       { bar: 'bg-amber-400',   badge: 'bg-amber-100 text-amber-700' };
};

// ─── Mock per-patient enrichment data ─────────────────────────────────────────

const MOCK_SESSIONS: Record<string, number> = {
  '3482 91024 1': 28, '8291 03845 2': 14, '5521 90124 3': 9,
  '2938 10045 1': 17, '2291 88471 1': 22, '4432 10985 1': 11,
  '7721 03948 2': 6,
};

const MOCK_COVERAGE: Record<string, { plan: string; used: number; total: number; resets: string }> = {
  '3482 91024 1': { plan: 'Medicare CDM Plan',  used: 3, total: 5,  resets: '2027-01-01' },
  '8291 03845 2': { plan: 'Medibank Private',   used: 7, total: 10, resets: '2026-12-31' },
  '5521 90124 3': { plan: 'Bupa Extras',        used: 2, total: 8,  resets: '2026-12-31' },
  '2938 10045 1': { plan: 'Medicare CDM Plan',  used: 4, total: 5,  resets: '2027-01-01' },
  '2291 88471 1': { plan: 'HCF Silver Plus',    used: 6, total: 12, resets: '2026-12-31' },
};

const MOCK_INSIGHTS: Record<string, { headline: string; detail: string }> = {
  '3482 91024 1': {
    headline: 'Pattern detected',
    detail: 'Patients with this lumbar pattern responded 2.4× faster to McKenzie protocols vs. passive modalities (n=18 across network).',
  },
  '8291 03845 2': {
    headline: 'Treatment signal',
    detail: 'Dry needling combined with progressive loading shows 78% resolution rate for this tendinopathy profile (n=9).',
  },
  '5521 90124 3': {
    headline: 'Recovery trend',
    detail: 'Grade II ankle sprains with early taping and loading average 6.2 weeks to full return-to-sport (n=24).',
  },
};

const MOCK_REFERRAL_PATH: Record<string, { name: string; period?: string; isCurrent?: boolean }[]> = {
  '3482 91024 1': [
    { name: 'Cremorne Physio', isCurrent: true },
    { name: 'CLINIC_XYZ_42A', period: '2024-08 → 2024-11' },
    { name: 'CLINIC_XYZ_42A', period: '2023-01 → 2023-06' },
  ],
  '8291 03845 2': [
    { name: 'Cremorne Physio', isCurrent: true },
    { name: 'CLINIC_ABC_HASH', period: '2023-11 → present' },
  ],
};

const MOCK_AUDIT = [
  { time: '2026-04-22 14:22', action: 'Record viewed',           actor: 'Cremorne Physio' },
  { time: '2026-04-15 09:08', action: 'Episode updated',         actor: 'Cremorne Physio' },
  { time: '2024-11-02 11:34', action: 'Record unlocked',         actor: 'CLINIC_XYZ_42A' },
  { time: '2024-08-14 16:02', action: 'Record viewed',           actor: 'CLINIC_XYZ_42A' },
  { time: '2023-06-20 10:11', action: 'Contribution submitted',  actor: 'Cremorne Physio' },
];

// ─── Episode Timeline ─────────────────────────────────────────────────────────

const EpisodeTimeline: React.FC<{ histories: HistoryEntry[] }> = ({ histories }) => {
  if (!histories.length) return null;

  const now = new Date();
  const allDates = histories.flatMap(h => [
    new Date(h.timelineStart),
    h.timelineEnd ? new Date(h.timelineEnd) : now,
  ]);
  const minMs = Math.min(...allDates.map(d => d.getTime()));
  const maxMs = Math.max(...allDates.map(d => d.getTime()));
  const spanMs = maxMs - minMs || 1;

  const minYear = new Date(minMs).getFullYear();
  const maxYear = new Date(maxMs).getFullYear();
  const yearMarkers: number[] = [];
  for (let y = minYear; y <= maxYear; y++) yearMarkers.push(y);

  const toPercent = (d: Date) => ((d.getTime() - minMs) / spanMs) * 100;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" /> Episode Timeline
      </h4>

      <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
        {yearMarkers.map(y => <span key={y}>{y}</span>)}
      </div>

      <div
        className="relative bg-slate-50 rounded-lg overflow-hidden border border-slate-100"
        style={{ height: `${histories.length * 32 + 16}px` }}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 flex">
          {yearMarkers.map((_, i) => (
            <div key={i} className="flex-1 border-r border-slate-200 border-dashed last:border-0" />
          ))}
        </div>

        {/* Bars */}
        {histories.map((h, i) => {
          const start = toPercent(new Date(h.timelineStart));
          const end = toPercent(h.timelineEnd ? new Date(h.timelineEnd) : now);
          const width = Math.max(end - start, 1.5);
          const colors = statusColors(h.status);
          return (
            <div
              key={h.id}
              title={`${h.condition} (${h.status})`}
              className="absolute flex items-center"
              style={{ top: `${i * 32 + 8}px`, left: `${start}%`, width: `${width}%`, height: '20px' }}
            >
              <div className={`${colors.bar} rounded h-full w-full opacity-85 flex items-center px-1.5 min-w-[6px]`}>
                <span className="text-white text-[9px] font-medium truncate leading-none">{h.condition}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-2.5 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" /> Resolved</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" /> Ongoing</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" /> Plateaued</span>
      </div>
    </div>
  );
};

// ─── Summary Tab ──────────────────────────────────────────────────────────────

const SummaryTab: React.FC<{
  patient: Patient;
  histories: HistoryEntry[];
  unlockedPatients: string[];
  onUnlock: (id: string) => void;
  credits: number;
}> = ({ patient, histories, unlockedPatients, onUnlock, credits }) => {
  const unlocked = unlockedPatients.includes(patient.id);
  const resolved = histories.filter(h => h.status === Status.RESOLVED).length;
  const ongoing  = histories.filter(h => h.status === Status.ONGOING).length;
  const sessions = MOCK_SESSIONS[patient.id] ?? 0;

  const effectiveTreatments = [...new Set(histories.flatMap(h => h.successfulTreatments))];
  const flags = [...new Set(histories.flatMap(h => h.contraindications))];
  const latestH = histories[histories.length - 1];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Network Episodes', value: histories.length },
          { label: 'Resolved',         value: resolved },
          { label: 'Ongoing',          value: ongoing },
          { label: 'Sessions Logged',  value: sessions },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Unlock gate */}
      {!unlocked && patient.historyAvailable && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 text-sm">Network history locked</p>
              <p className="text-xs text-amber-700">Unlock for 1 credit to view the full clinical chart</p>
            </div>
          </div>
          <button
            onClick={() => onUnlock(patient.id)}
            disabled={credits < 1}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shrink-0 ${
              credits >= 1 ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" /> Unlock (1 Credit)
          </button>
        </div>
      )}

      {/* Clinical synopsis + flags */}
      {(unlocked || !patient.historyAvailable) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-slate-400" />
              <h4 className="text-sm font-semibold text-slate-900">Clinical Synopsis</h4>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>{patient.name.split(' ')[0]}</strong> has <strong>{histories.length}</strong> episode{histories.length !== 1 ? 's' : ''} on the network.
              {latestH && (
                <> Most recent: <strong>{latestH.condition}</strong> ({latestH.status.toLowerCase()}, started {latestH.timelineStart}).</>
              )}
              {effectiveTreatments.length > 0 && (
                <> Patterns suggest a strong response to{' '}
                  {effectiveTreatments.slice(0, 2).map((t, i) => (
                    <React.Fragment key={t}>{i > 0 && ' and '}<strong>{t}</strong></React.Fragment>
                  ))}.
                </>
              )}
            </p>
            {effectiveTreatments.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Historical Efficacy</p>
                <div className="flex flex-wrap gap-1.5">
                  {effectiveTreatments.map(t => (
                    <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-700">
                      <CheckCircle className="w-3 h-3 text-emerald-500" /> {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-semibold text-slate-900">Clinical Flags</h4>
            </div>
            {flags.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No flags recorded</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {flags.map(flag => (
                  <li key={flag} className="flex items-center gap-2.5 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-sm text-slate-700">{flag}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Timeline */}
      {unlocked && histories.length > 0 && <EpisodeTimeline histories={histories} />}
    </div>
  );
};

// ─── Episodes Tab ─────────────────────────────────────────────────────────────

const EpisodesTab: React.FC<{
  histories: HistoryEntry[];
  patient: Patient;
  unlockedPatients: string[];
  onUnlock: (id: string) => void;
  credits: number;
}> = ({ histories, patient, unlockedPatients, onUnlock, credits }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const unlocked = unlockedPatients.includes(patient.id);

  if (!unlocked && patient.historyAvailable) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <Lock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-600 mb-3">Unlock to view episodes</p>
          <button
            onClick={() => onUnlock(patient.id)}
            disabled={credits < 1}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
          >
            Unlock (1 Credit)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {histories.length === 0 && (
        <p className="text-slate-500 text-center py-12">No episodes on record</p>
      )}
      {histories.map(h => {
        const colors = statusColors(h.status);
        const isOpen = expanded === h.id;
        return (
          <div key={h.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : h.id)}
              className="w-full p-4 flex items-start justify-between text-left hover:bg-slate-50 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-slate-900">{h.condition}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>{h.status}</span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {h.timelineStart}{h.timelineEnd ? ` → ${h.timelineEnd}` : ' → present'}
                </p>
              </div>
              <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 mt-0.5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </button>

            {isOpen && (
              <div className="px-4 pb-4 pt-3 border-t border-slate-100 bg-slate-50 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-500" /> Effective
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {h.successfulTreatments.length ? h.successfulTreatments.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-full text-xs">{t}</span>
                    )) : <span className="text-xs text-slate-400 italic">None listed</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-400" /> Ineffective
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {h.unsuccessfulTreatments.length ? h.unsuccessfulTreatments.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-rose-100 border border-rose-200 text-rose-800 rounded-full text-xs">{t}</span>
                    )) : <span className="text-xs text-slate-400 italic">None listed</span>}
                  </div>
                </div>
                {h.contraindications.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" /> Contraindications
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {h.contraindications.map(c => (
                        <span key={c} className="px-2 py-0.5 bg-amber-100 border border-amber-200 text-amber-800 rounded-full text-xs">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-slate-400 pt-1">Source: {h.sourceClinicHash} · {h.createdAt}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Treatments Tab ───────────────────────────────────────────────────────────

const TreatmentsTab: React.FC<{ histories: HistoryEntry[] }> = ({ histories }) => {
  const tally: Record<string, { effective: number; ineffective: number }> = {};
  histories.forEach(h => {
    h.successfulTreatments.forEach(t => {
      tally[t] = tally[t] ?? { effective: 0, ineffective: 0 };
      tally[t].effective++;
    });
    h.unsuccessfulTreatments.forEach(t => {
      tally[t] = tally[t] ?? { effective: 0, ineffective: 0 };
      tally[t].ineffective++;
    });
  });

  const entries = Object.entries(tally).sort((a, b) => b[1].effective - a[1].effective);

  return (
    <div className="space-y-3">
      {entries.length === 0 && <p className="text-slate-500 text-center py-12">No treatment data available</p>}
      {entries.map(([treatment, counts]) => (
        <div key={treatment} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
          <p className="font-medium text-slate-900 text-sm">{treatment}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle className="w-3.5 h-3.5" /> {counts.effective}×
            </span>
            <span className="flex items-center gap-1 text-rose-500 font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> {counts.ineffective}×
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Documents Tab ────────────────────────────────────────────────────────────

const DocumentsTab: React.FC<{ patient: Patient }> = ({ patient }) => {
  const docs = [
    { name: 'Initial Assessment',    type: 'SOAP Report', date: '2023-01-10' },
    { name: 'Progress Note',         type: 'SOAP Report', date: '2023-04-22' },
    { name: 'Discharge Summary',     type: 'SOAP Report', date: '2023-06-15' },
  ];

  return (
    <div className="space-y-3">
      {docs.map(doc => (
        <div key={doc.name} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">{doc.name} — {doc.date}</p>
              <p className="text-xs text-slate-500">{doc.type}</p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium px-3 py-1.5 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors">
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        </div>
      ))}
    </div>
  );
};

// ─── Audit Trail Tab ──────────────────────────────────────────────────────────

const AuditTab: React.FC<{ patient: Patient }> = () => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Access & Activity Log</p>
    </div>
    <ul className="divide-y divide-slate-100">
      {MOCK_AUDIT.map((entry, i) => (
        <li key={i} className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-slate-300 rounded-full shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-800">{entry.action}</p>
              <p className="text-xs text-slate-400">{entry.actor}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-mono">{entry.time}</p>
        </li>
      ))}
    </ul>
  </div>
);

// ─── Right Sidebar Panel ──────────────────────────────────────────────────────

const RightPanel: React.FC<{
  patient: Patient;
  histories: HistoryEntry[];
  unlockedPatients: string[];
  onUnlock: (id: string) => void;
  credits: number;
}> = ({ patient, histories, unlockedPatients, onUnlock, credits }) => {
  const coverage     = MOCK_COVERAGE[patient.id]      ?? { plan: 'Unknown', used: 0, total: 0, resets: '—' };
  const insight      = MOCK_INSIGHTS[patient.id];
  const referralPath = MOCK_REFERRAL_PATH[patient.id] ?? [{ name: 'Cremorne Physio', isCurrent: true }];

  return (
    <div className="p-4 space-y-6">
      {/* Coverage */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Coverage</p>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="font-semibold text-slate-900 text-sm">{coverage.plan}</p>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Sessions used</span>
              <span className="font-bold text-slate-700">{coverage.used} / {coverage.total}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${coverage.total ? (coverage.used / coverage.total) * 100 : 0}%` }}
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Resets {coverage.resets}</p>
        </div>
      </div>

      {/* Network Insights */}
      {insight && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Zap className="w-3 h-3" /> Network Insights
          </p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-xs font-bold text-emerald-800 mb-1">{insight.headline}</p>
            <p className="text-xs text-emerald-700 leading-relaxed">{insight.detail}</p>
          </div>
        </div>
      )}

      {/* Referral Path */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Referral Path</p>
        <div className="space-y-2.5">
          {referralPath.map((stop, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${stop.isCurrent ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <div>
                <p className={`text-xs font-medium ${stop.isCurrent ? 'text-emerald-700' : 'text-slate-600'}`}>{stop.name}</p>
                <p className={`text-[10px] ${stop.isCurrent ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {stop.isCurrent ? 'Current' : stop.period}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Quick Actions</p>
        <div className="space-y-0.5">
          {[
            { icon: Plus,         label: 'Add clinical note' },
            { icon: Upload,       label: 'Upload imaging' },
            { icon: Share2,       label: 'Refer onward' },
            { icon: CheckCircle,  label: 'Mark episode resolved' },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left"
            >
              <Icon className="w-4 h-4 text-slate-400 shrink-0" /> {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── SOAP Modal ───────────────────────────────────────────────────────────────

const SOAPModal: React.FC<{
  history: HistoryEntry;
  patient: Patient;
  onClose: () => void;
}> = ({ history, patient, onClose }) => {
  const report = [
    'SOAP REPORT\n===========',
    `\nPatient: ${patient.name} (${patient.id})\nDOB: ${patient.dob}\nGenerated: ${new Date().toLocaleDateString()}`,
    `\nSUBJECTIVE\n----------\nCondition: ${history.condition}\nStatus: ${history.status}\nTimeline: ${history.timelineStart}${history.timelineEnd ? ` → ${history.timelineEnd}` : ' (ongoing)'}`,
    `\nOBJECTIVE\n---------\nEffective treatments:\n${history.successfulTreatments.join(', ') || 'None listed'}\n\nIneffective treatments:\n${history.unsuccessfulTreatments.join(', ') || 'None listed'}`,
    history.contraindications.length ? `\nContraindications:\n${history.contraindications.join(', ')}` : '',
    `\nASSESSMENT\n----------\nTreatment outcome: ${history.status}`,
    `\n---\nSource: ${history.sourceClinicHash} · ${history.createdAt}`,
  ].join('');

  const handleDownload = () => {
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOAP_${patient.id}_${history.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" /> SOAP Report
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 bg-slate-50 p-4 rounded-lg">{report}</pre>
        </div>
        <div className="p-5 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm transition-colors">Close</button>
          <button onClick={handleDownload} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm transition-colors flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Export ──────────────────────────────────────────────────────────────

type ChartTab = 'summary' | 'episodes' | 'treatments' | 'documents' | 'audit';

export const PatientSearch: React.FC<PatientSearchProps> = ({
  patients, histories, unlockedPatients, credits, onUnlock,
}) => {
  const [searchTerm,      setSearchTerm]      = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab,       setActiveTab]       = useState<ChartTab>('summary');
  const [viewingSOAP,     setViewingSOAP]     = useState<HistoryEntry | null>(null);
  // mobileView: drives single-pane navigation on screens < md
  const [mobileView,      setMobileView]      = useState<'list' | 'detail'>('list');
  // infoOpen: drives the right-panel slide-over below xl breakpoint
  const [infoOpen,        setInfoOpen]        = useState(false);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const patientHistories = selectedPatient
    ? histories.filter(h => h.patientId === selectedPatient.id)
    : [];

  const handleSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveTab('summary');
    setMobileView('detail');
    setInfoOpen(false);
  };

  const tabDefs: { id: ChartTab; label: string; count?: number }[] = [
    { id: 'summary',    label: 'Summary' },
    { id: 'episodes',   label: 'Episodes',  count: patientHistories.length },
    { id: 'treatments', label: 'Treatments' },
    { id: 'documents',  label: 'Documents', count: 3 },
    { id: 'audit',      label: 'Audit Trail' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-4">
        <h2 className="text-2xl font-brand font-extrabold text-slate-900 tracking-tight">Patient Intake</h2>
        <p className="text-sm text-slate-500">Longitudinal clinical chart — synced across the network</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex relative h-[calc(100vh-220px)] min-h-[560px]">

      {/* ── LEFT: Patient List ────────────────────────────────────────────── */}
      <div className={`w-full md:w-56 lg:w-60 shrink-0 border-r border-slate-200 bg-white flex-col ${mobileView === 'list' ? 'flex' : 'hidden md:flex'}`}>
        <div className="px-3 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Patients · {filtered.length}
          </span>
          <Filter className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="p-2 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filtered.map(patient => {
            const ph       = histories.filter(h => h.patientId === patient.id);
            const latestH  = ph[ph.length - 1];
            const unlocked = unlockedPatients.includes(patient.id);
            const isActive = selectedPatient?.id === patient.id;
            return (
              <button
                key={patient.id}
                onClick={() => handleSelect(patient)}
                className={`w-full p-3 text-left transition-colors ${
                  isActive ? 'bg-emerald-50 border-l-2 border-l-emerald-500' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {patient.historyAvailable && (
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${unlocked ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      )}
                      <p className="text-xs font-semibold text-slate-900 truncate">{patient.name}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{patient.id}</p>
                    {latestH && (
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{latestH.condition}</p>
                    )}
                  </div>
                  {patient.historyAvailable ? (
                    unlocked
                      ? <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded shrink-0">ACTIVE</span>
                      : <Lock className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CENTER: Clinical Chart ────────────────────────────────────────── */}
      {!selectedPatient ? (
        <div className="flex-1 hidden md:flex items-center justify-center bg-slate-50">
          <div className="text-center px-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Select a Patient</h3>
            <p className="text-sm text-slate-500">Choose from the list to view their clinical chart</p>
          </div>
        </div>
      ) : (
        <div className={`flex-1 flex-col overflow-hidden min-w-0 ${mobileView === 'detail' ? 'flex' : 'hidden md:flex'}`}>
          {/* Breadcrumb + actions */}
          <div className="px-3 sm:px-5 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {/* Back to list — mobile only */}
              <button
                onClick={() => setMobileView('list')}
                className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 shrink-0"
                aria-label="Back to patient list"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center text-xs text-slate-500 gap-1.5 min-w-0">
                <span className="hidden sm:inline">Patient Intake</span>
                <ChevronRight className="w-3 h-3 hidden sm:inline shrink-0" />
                <span className="text-slate-700 font-medium truncate">{selectedPatient.name}</span>
                <ChevronRight className="w-3 h-3 hidden md:inline shrink-0" />
                <span className="font-mono hidden md:inline truncate">{selectedPatient.id}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Network synced · 12 clinics
              </div>
              <button
                title="Refer"
                className="flex items-center gap-1.5 text-xs px-2 sm:px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Share2 className="w-3 h-3" /><span className="hidden sm:inline">Refer</span>
              </button>
              <button
                onClick={() => patientHistories[0] && setViewingSOAP(patientHistories[0])}
                className="flex items-center gap-1.5 text-xs px-2 sm:px-2.5 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <FileText className="w-3 h-3" /><span className="hidden sm:inline">Generate SOAP</span><span className="sm:hidden">SOAP</span>
              </button>
              {/* Info panel toggle — visible below xl */}
              <button
                onClick={() => setInfoOpen(true)}
                className="xl:hidden flex items-center justify-center p-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                aria-label="Show patient details"
                title="Coverage, insights & referral path"
              >
                <PanelRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Patient header */}
          <div className="px-3 sm:px-5 pt-4 pb-0 bg-white border-b border-slate-200 shrink-0">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                {initials(selectedPatient.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">{selectedPatient.name}</h2>
                  <span className="text-[11px] px-2 py-0.5 border border-slate-300 rounded-full text-slate-600 shrink-0">
                    Active patient
                  </span>
                  {unlockedPatients.includes(selectedPatient.id) && (
                    <span className="text-[11px] px-2 py-0.5 border border-emerald-300 rounded-full text-emerald-600 flex items-center gap-1 shrink-0">
                      <Unlock className="w-2.5 h-2.5" /> Network access unlocked
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>DOB {selectedPatient.dob} · {calcAge(selectedPatient.dob)}y</span>
                  <span className="hidden sm:inline">Last visit {selectedPatient.lastVisit}</span>
                  <span className="hidden md:inline">Home clinic <span className="font-medium text-slate-700">Cremorne Physio</span></span>
                </div>
              </div>
            </div>

            {/* Chart tabs */}
            <div className="flex overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
              {tabDefs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      activeTab === tab.id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-50">
            {activeTab === 'summary' && (
              <SummaryTab patient={selectedPatient} histories={patientHistories} unlockedPatients={unlockedPatients} onUnlock={onUnlock} credits={credits} />
            )}
            {activeTab === 'episodes' && (
              <EpisodesTab histories={patientHistories} patient={selectedPatient} unlockedPatients={unlockedPatients} onUnlock={onUnlock} credits={credits} />
            )}
            {activeTab === 'treatments' && (
              <TreatmentsTab histories={patientHistories} />
            )}
            {activeTab === 'documents' && (
              <DocumentsTab patient={selectedPatient} />
            )}
            {activeTab === 'audit' && (
              <AuditTab patient={selectedPatient} />
            )}
          </div>
        </div>
      )}

      {/* ── RIGHT: Sidebar Panel — always visible at xl+ ──────────────────── */}
      {selectedPatient && (
        <div className="hidden xl:flex w-64 shrink-0 border-l border-slate-200 bg-white overflow-y-auto">
          <RightPanel
            patient={selectedPatient}
            histories={patientHistories}
            unlockedPatients={unlockedPatients}
            onUnlock={onUnlock}
            credits={credits}
          />
        </div>
      )}

      {/* ── RIGHT: Slide-over for screens below xl ────────────────────────── */}
      {selectedPatient && infoOpen && (
        <>
          <div
            onClick={() => setInfoOpen(false)}
            className="xl:hidden absolute inset-0 bg-black/30 z-10"
            aria-hidden="true"
          />
          <div className="xl:hidden absolute inset-y-0 right-0 w-full sm:w-80 bg-white border-l border-slate-200 z-20 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Patient Details</span>
              <button
                onClick={() => setInfoOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200"
                aria-label="Close details panel"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <RightPanel
                patient={selectedPatient}
                histories={patientHistories}
                unlockedPatients={unlockedPatients}
                onUnlock={onUnlock}
                credits={credits}
              />
            </div>
          </div>
        </>
      )}

      {/* SOAP Modal */}
      {viewingSOAP && selectedPatient && (
        <SOAPModal
          history={viewingSOAP}
          patient={selectedPatient}
          onClose={() => setViewingSOAP(null)}
        />
      )}
      </div>
    </div>
  );
};
