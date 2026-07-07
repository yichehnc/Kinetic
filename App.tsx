import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PatientSearch } from './components/PatientSearch';
import { ContributionForm } from './components/ContributionForm';
import { Referral } from './components/Referral';
import { Community } from './components/Community';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { OnboardingTour } from './components/OnboardingTour';
import { MOCK_PATIENTS, MOCK_HISTORY } from './constants';
import { Patient, HistoryEntry } from './types';
import { CheckCircle, Shield } from 'lucide-react';

const AUDIT_EVENTS = [
  { time: '2026-05-15 09:14', event: 'Contribution submitted', detail: 'PID: 3482 91024 1' },
  { time: '2026-05-15 09:14', event: 'Credit earned', detail: '+1 credit' },
  { time: '2026-05-14 16:32', event: 'Patient history unlocked', detail: 'PID: 7291 83047 2 · −1 credit' },
  { time: '2026-05-14 11:05', event: 'Network opt-in confirmed', detail: 'Clinic KIN-ORG-882192' },
  { time: '2026-05-13 14:22', event: 'Trial credits awarded', detail: '+5 credits (one-time)' },
];

const AuditLogModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4">
    <div className="bg-surface-card border border-line rounded-lg shadow-[0_8px_24px_rgba(0,0,0,.12)] max-w-lg w-full p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[13.5px] font-semibold text-ink">Audit log</h3>
        <button onClick={onClose} className="text-ink-5 hover:text-ink text-lg leading-none transition-colors duration-150">✕</button>
      </div>
      <div className="space-y-3 text-xs">
        {AUDIT_EVENTS.map((entry, i) => (
          <div key={i} className="flex items-start gap-3 pb-3 border-b border-line-soft last:border-0">
            <span className="font-mono text-[11px] text-ink-5 shrink-0 pt-0.5">{entry.time}</span>
            <div>
              <p className="font-medium text-ink-2">{entry.event}</p>
              <p className="text-ink-4">{entry.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-ink-5 mt-4">Showing last 5 events · All times AEST</p>
    </div>
  </div>
);

// Simple Alert Component for notifications
const Notification = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-ink text-white text-[13px] rounded-lg px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,.12)] motion-safe:animate-toast-in">
    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
    <p>{message}</p>
    <button onClick={onClose} className="ml-3 text-zinc-400 hover:text-white transition-colors duration-150">✕</button>
  </div>
);

const App: React.FC = () => {
  // App State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [credits, setCredits] = useState(0); // Start with 0
  const [unlockedPatients, setUnlockedPatients] = useState<string[]>(['3482 91024 1']);
  const [contributionCount, setContributionCount] = useState(12);
  const [lockedAttempts, setLockedAttempts] = useState(0);
  const [localHistory, setLocalHistory] = useState<HistoryEntry[]>(MOCK_HISTORY);
  const [localPatients, setLocalPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Track if initial credits were awarded (only once ever)
  const [hasReceivedInitialCredits, setHasReceivedInitialCredits] = useState(false);
  const [isOptedIn, setIsOptedIn] = useState(false); // Default to false - user must opt in
  const [autoRefill, setAutoRefill] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showTour, setShowTour] = useState(() => !localStorage.getItem('kinetic_onboarding_done'));

  // Load initial credits flag and opt-in status from storage on mount
  useEffect(() => {
    const hasReceived = localStorage.getItem('kinetic_initial_credits_awarded');
    const optInStatus = localStorage.getItem('kinetic_opted_in');
    const savedCredits = localStorage.getItem('kinetic_credits');
    
    if (hasReceived === 'true') {
      setHasReceivedInitialCredits(true);
    }
    
    if (localStorage.getItem('kinetic_auto_refill') === 'true') setAutoRefill(true);

    // Set opt-in status
    if (optInStatus === 'true') {
      setIsOptedIn(true);
      // If opted in and has received credits before, restore them
      if (savedCredits && hasReceived === 'true') {
        setCredits(parseInt(savedCredits, 10));
      }
    } else {
      // FIX: First-time users should opt in and get 5 credits
      if (!hasReceived && !optInStatus) {
        // This is a brand new user - they need to opt in
        setIsOptedIn(false);
        setCredits(0);
      }
    }
  }, []);

  // Save credits to localStorage whenever they change
  useEffect(() => {
    if (credits > 0 || hasReceivedInitialCredits) {
      localStorage.setItem('kinetic_credits', credits.toString());
    }
  }, [credits, hasReceivedInitialCredits]);

  // Clear notification when changing tabs to avoid stale messages
  useEffect(() => {
    setNotification(null);
  }, [activeTab]);

  // Actions
  const handleUnlockPatient = (patientId: string) => {
    if (credits > 0) {
      setCredits(prev => prev - 1);
      setUnlockedPatients(prev => [...prev, patientId]);
      setNotification(`Unlocked history. Balance: ${credits - 1}`);
      setTimeout(() => setNotification(null), 3000);
    } else if (autoRefill) {
      setCredits(prev => prev + 4); // +5 refill − 1 unlock
      setUnlockedPatients(prev => [...prev, patientId]);
      setNotification('Auto-refill: +5 credits purchased. History unlocked.');
      setTimeout(() => setNotification(null), 3000);
    } else {
      setLockedAttempts(prev => prev + 1);
      setNotification('Not enough credits — contribute to unlock this history.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleAutoRefillToggle = () => {
    const next = !autoRefill;
    setAutoRefill(next);
    localStorage.setItem('kinetic_auto_refill', next.toString());
    setNotification(next ? 'Auto-refill enabled — credits will top up as needed.' : 'Auto-refill disabled.');
    setTimeout(() => setNotification(null), 3000);
  };

  // Auto-unlock contributed patient history
  const handleContribution = (data: any) => {
    setCredits(prev => prev + 1);
    setContributionCount(prev => prev + 1);
    
    // Optimistically add to local data so we can see it
    const newHistory: HistoryEntry = {
      id: `H-${Math.random().toString(36).substr(2, 9)}`,
      patientId: data.patientId,
      condition: data.condition,
      timelineStart: data.start,
      timelineEnd: data.end,
      status: data.status,
      successfulTreatments: data.successful,
      unsuccessfulTreatments: data.unsuccessful,
      contraindications: data.contraindications,
      createdAt: new Date().toISOString(),
      sourceClinicHash: 'CREMORNE_PHYSIO'
    };
    
    setLocalHistory(prev => [...prev, newHistory]);
    
    // FIX: Auto-unlock the contributed patient's history
    if (!unlockedPatients.includes(data.patientId)) {
      setUnlockedPatients(prev => [...prev, data.patientId]);
    }
    
    // Check if patient exists, if not add them
    const existingPatientIndex = localPatients.findIndex(p => p.id === data.patientId);
    
    if (existingPatientIndex >= 0) {
      // Update existing patient
      const updatedPatients = [...localPatients];
      updatedPatients[existingPatientIndex] = {
        ...updatedPatients[existingPatientIndex],
        name: data.patientName || updatedPatients[existingPatientIndex].name,
        dob: data.dob || updatedPatients[existingPatientIndex].dob,
        historyAvailable: true
      };
      setLocalPatients(updatedPatients);
    } else {
      // Add new patient
      const newPatient: Patient = {
        id: data.patientId,
        name: data.patientName || `Patient ${data.patientId}`,
        dob: data.dob || 'Unknown',
        lastVisit: new Date().toISOString().split('T')[0],
        historyAvailable: true
      };
      setLocalPatients(prev => [...prev, newPatient]);
    }

    setNotification('Contribution verified. +1 Credit earned. History auto-unlocked.');
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // FIX: Network opt-in handler - 5 trial credits only once
  const handleOptIn = () => {
    setIsOptedIn(true);
    localStorage.setItem('kinetic_opted_in', 'true');
    
    // FIX: Always award 5 credits on first-ever opt-in
    if (!hasReceivedInitialCredits) {
      setCredits(5); // Set to 5 instead of adding
      setHasReceivedInitialCredits(true);
      localStorage.setItem('kinetic_initial_credits_awarded', 'true');
      localStorage.setItem('kinetic_credits', '5');
      setNotification('Welcome! +5 trial credits awarded (one-time bonus).');
    } else {
      // Restore previous credits if they had any
      const savedCredits = localStorage.getItem('kinetic_credits');
      if (savedCredits) {
        setCredits(parseInt(savedCredits, 10));
      }
      setNotification('Opted back in to network. Your credits have been restored.');
    }
    setTimeout(() => setNotification(null), 3000);
  };

  // Network opt-out handler - removes all credits
  const handleOptOut = () => {
    setIsOptedIn(false);
    setCredits(0); // Remove all credits when opting out
    localStorage.setItem('kinetic_opted_in', 'false');
    localStorage.setItem('kinetic_credits', '0');
    setNotification('Opted out of network. All credits removed. Your data will not be shared.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleTourComplete = () => {
    localStorage.setItem('kinetic_onboarding_done', 'true');
    setShowTour(false);
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      credits={credits}
      contributionCount={contributionCount}
      isOptedIn={isOptedIn}
    >
      {activeTab === 'dashboard' && (
        <Dashboard
          credits={credits}
          contributionCount={contributionCount}
          unlockedCount={unlockedPatients.length}
          lockedAttempts={lockedAttempts}
          onNavigate={setActiveTab}
          isOptedIn={isOptedIn}
          onOptIn={handleOptIn}
          onOptOut={handleOptOut}
        />
      )}
      
      {activeTab === 'intake' && (
        <PatientSearch
          patients={localPatients}
          histories={localHistory}
          unlockedPatients={unlockedPatients}
          credits={credits}
          onUnlock={handleUnlockPatient}
          onNavigateContribute={() => setActiveTab('contribute')}
          isOptedIn={isOptedIn}
        />
      )}

      {activeTab === 'contribute' && (
        <ContributionForm 
          onSubmit={handleContribution} 
          onReturn={() => setActiveTab('intake')}
        />
      )}

      {activeTab === 'community' && (
        <Community />
      )}

      {activeTab === 'referrals' && (
        <Referral />
      )}

      {activeTab === 'privacy' && (
        <PrivacyPolicy onBack={() => setActiveTab('dashboard')} />
      )}

      {activeTab === 'terms' && (
        <TermsOfService onBack={() => setActiveTab('dashboard')} />
      )}

      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto bg-surface-card p-6 rounded-lg border border-line">
           <h2 className="text-[13.5px] font-semibold text-ink mb-6">Settings</h2>
           <div className="space-y-6">
              {/* Network Opt-in/Opt-out Toggle */}
              <div className="flex items-center justify-between pb-6 border-b border-line-soft">
                <div>
                  <h3 className="text-[13px] font-semibold text-ink">Network opt-in</h3>
                  <p className="text-xs text-ink-4">Allow other clinics to request your data (anonymized)</p>
                  {!isOptedIn && !hasReceivedInitialCredits && (
                    <p className="text-xs text-positive-text mt-1 font-medium">✨ Get 5 free trial credits when you opt in!</p>
                  )}
                  {!isOptedIn && hasReceivedInitialCredits && (
                    <p className="text-xs text-amber-600 mt-1">⚠️ Opting out removed your credits</p>
                  )}
                </div>
                <button
                  onClick={isOptedIn ? handleOptOut : handleOptIn}
                  className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full ${
                    isOptedIn ? 'bg-accent' : 'bg-line'
                  }`}
                >
                   <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md transition-transform ${
                     isOptedIn ? 'transform translate-x-6' : ''
                   }`}></span>
                </button>
              </div>
              
              <div className="flex items-center justify-between pb-6 border-b border-line-soft">
                <div>
                  <h3 className="text-[13px] font-semibold text-ink">Credit auto-refill</h3>
                  <p className="text-xs text-ink-4">Purchase 5 credits automatically when your balance hits zero</p>
                  {autoRefill && (
                    <p className="text-xs text-positive-text mt-1 font-medium">Active — top-up triggers on next unlock attempt</p>
                  )}
                </div>
                <button
                  onClick={handleAutoRefillToggle}
                  aria-label={autoRefill ? 'Disable auto-refill' : 'Enable auto-refill'}
                  className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full ${
                    autoRefill ? 'bg-accent' : 'bg-line'
                  }`}
                >
                  <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md transition-transform ${
                    autoRefill ? 'transform translate-x-6' : ''
                  }`}></span>
                </button>
              </div>

              {/* Data Security & Privacy Section */}
              <div className="pt-6 border-t border-line">
                <h3 className="text-[13px] font-semibold text-ink mb-4 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-accent" strokeWidth={1.8} />
                  Data security & privacy
                </h3>
                
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-line-soft gap-2">
                    <div>
                      <h4 className="text-[13px] font-semibold text-ink">Data Encryption</h4>
                      <p className="text-xs text-ink-4">All patient data encrypted at rest and in transit</p>
                    </div>
                    <div className="px-2 py-0.5 bg-positive-tint text-positive-deep rounded text-[11px] font-semibold self-start sm:self-auto">
                      Enabled
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-line-soft gap-2">
                    <div>
                      <h4 className="text-[13px] font-semibold text-ink">Anonymization</h4>
                      <p className="text-xs text-ink-4">Patient identifiers are hashed before network sharing</p>
                    </div>
                    <div className="px-2 py-0.5 bg-positive-tint text-positive-deep rounded text-[11px] font-semibold self-start sm:self-auto">
                      Active
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-line-soft gap-2">
                    <div>
                      <h4 className="text-[13px] font-semibold text-ink">Audit Logging</h4>
                      <p className="text-xs text-ink-4">Track all data access and contributions</p>
                    </div>
                    <button
                      onClick={() => setShowAuditLog(true)}
                      className="text-xs text-accent hover:text-accent-hover font-medium self-start sm:self-auto transition-colors duration-150"
                    >
                      View logs
                    </button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-[13px] font-semibold text-ink">Data Retention</h4>
                      <p className="text-xs text-ink-4">Contributed data retained for 24 months</p>
                    </div>
                    <span className="text-xs text-ink-3 font-medium self-start sm:self-auto">24 months</span>
                  </div>
                </div>
              </div>
           </div>
           
           <div className="mt-8 p-4 bg-surface-sidebar border border-line-soft rounded-lg text-[11px] text-ink-4 font-mono">
             Clinic ID: KIN-ORG-882192<br/>
             Version: v0.4.3 (Beta)
           </div>

           <div className="mt-4 text-right">
             <button
               onClick={() => {
                 ['kinetic_onboarding_done','kinetic_opted_in','kinetic_credits','kinetic_contribution_draft','kinetic_initial_credits_awarded','kinetic_auto_refill'].forEach(k => localStorage.removeItem(k));
                 window.location.reload();
               }}
               className="text-[11.5px] text-ink-5 hover:text-red-600 transition-colors duration-150"
             >
               Reset demo
             </button>
           </div>
        </div>
      )}

      {showAuditLog && <AuditLogModal onClose={() => setShowAuditLog(false)} />}

      {notification && (
        <Notification message={notification} onClose={() => setNotification(null)} />
      )}

      {showTour && <OnboardingTour onComplete={handleTourComplete} />}
    </Layout>
  );
};

export default App;