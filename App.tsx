import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PatientSearch } from './components/PatientSearch';
import { ContributionForm } from './components/ContributionForm';
import { Referral } from './components/Referral';
import { MOCK_PATIENTS, MOCK_HISTORY } from './constants';
import { Patient, HistoryEntry, Status } from './types';
import { CheckCircle, Shield } from 'lucide-react';

// Simple Alert Component for notifications
const Notification = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center animate-bounce-in z-50">
    <CheckCircle className="w-6 h-6 text-emerald-400 mr-3" />
    <div>
      <h4 className="font-bold text-sm">Success</h4>
      <p className="text-sm text-slate-300">{message}</p>
    </div>
    <button onClick={onClose} className="ml-6 text-slate-400 hover:text-white">✕</button>
  </div>
);

const App: React.FC = () => {
  // App State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [credits, setCredits] = useState(0); // Start with 0, give 5 on first opt-in
  const [unlockedPatients, setUnlockedPatients] = useState<string[]>([]);
  const [contributionCount, setContributionCount] = useState(12);
  const [localHistory, setLocalHistory] = useState<HistoryEntry[]>(MOCK_HISTORY);
  const [localPatients, setLocalPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [notification, setNotification] = useState<string | null>(null);
  
  // BUG FIX #4: Track if initial credits were awarded (only once ever)
  const [hasReceivedInitialCredits, setHasReceivedInitialCredits] = useState(false);
  const [isOptedIn, setIsOptedIn] = useState(true); // Network opt-in status

  // Load initial credits flag and opt-in status from storage
  useEffect(() => {
    const hasReceived = localStorage.getItem('kinetic_initial_credits_awarded');
    const optInStatus = localStorage.getItem('kinetic_opted_in');
    
    if (hasReceived === 'true') {
      setHasReceivedInitialCredits(true);
    }
    
    if (optInStatus !== null) {
      setIsOptedIn(optInStatus === 'true');
    }
    
    // If they've received credits before and are opted in, restore their credits
    if (hasReceived === 'true' && optInStatus === 'true') {
      const savedCredits = localStorage.getItem('kinetic_credits');
      if (savedCredits) {
        setCredits(parseInt(savedCredits, 10));
      }
    }
  }, []);

  // Save credits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('kinetic_credits', credits.toString());
  }, [credits]);

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
    }
  };

  // BUG FIX #1: Auto-unlock contributed patient history
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
      sourceClinicHash: 'RIVERSDALE_PHYSIO'
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

  // BUG FIX #4: Network opt-in handler - 5 trial credits only once
  const handleOptIn = () => {
    setIsOptedIn(true);
    localStorage.setItem('kinetic_opted_in', 'true');
    
    // Only award 5 credits on first-ever opt-in
    if (!hasReceivedInitialCredits) {
      setCredits(prev => prev + 5);
      setHasReceivedInitialCredits(true);
      localStorage.setItem('kinetic_initial_credits_awarded', 'true');
      setNotification('Opted in! +5 welcome credits awarded (one-time bonus).');
    } else {
      setNotification('Opted back in to network. Your credits have been restored.');
    }
    setTimeout(() => setNotification(null), 3000);
  };

  // Network opt-out handler - removes all credits
  const handleOptOut = () => {
    setIsOptedIn(false);
    setCredits(0); // Remove all credits when opting out
    localStorage.setItem('kinetic_opted_in', 'false');
    setNotification('Opted out of network. All credits removed. Your data will not be shared.');
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} credits={credits}>
      {activeTab === 'dashboard' && (
        <Dashboard 
          credits={credits} 
          contributionCount={contributionCount} 
          unlockedCount={unlockedPatients.length}
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
        />
      )}

      {activeTab === 'contribute' && (
        <ContributionForm 
          onSubmit={handleContribution} 
          onReturn={() => setActiveTab('intake')}
        />
      )}

      {activeTab === 'referrals' && (
        <Referral />
      )}

      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
           <h2 className="text-2xl font-bold mb-6">Settings</h2>
           <div className="space-y-6">
              {/* Network Opt-in/Opt-out Toggle */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div>
                  <h3 className="font-semibold text-slate-900">Network Opt-in</h3>
                  <p className="text-sm text-slate-500">Allow other clinics to request your data (anonymized)</p>
                  {!isOptedIn && (
                    <p className="text-xs text-amber-600 mt-1">⚠️ Opting out removes all credits</p>
                  )}
                </div>
                <button
                  onClick={isOptedIn ? handleOptOut : handleOptIn}
                  className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full ${
                    isOptedIn ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                >
                   <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md transition-transform ${
                     isOptedIn ? 'transform translate-x-6' : ''
                   }`}></span>
                </button>
              </div>
              
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div>
                  <h3 className="font-semibold text-slate-900">Credit Auto-Refill</h3>
                  <p className="text-sm text-slate-500">Purchase credits if contribution isn't possible</p>
                </div>
                 <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-slate-200">
                   <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md"></span>
                </div>
              </div>

              {/* BUG FIX #3: Data Security & Privacy Section */}
              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Data Security & Privacy
                </h3>
                
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                    <div>
                      <h4 className="font-semibold text-slate-900">Data Encryption</h4>
                      <p className="text-sm text-slate-500">All patient data encrypted at rest and in transit</p>
                    </div>
                    <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold self-start sm:self-auto">
                      ENABLED
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                    <div>
                      <h4 className="font-semibold text-slate-900">Anonymization</h4>
                      <p className="text-sm text-slate-500">Patient identifiers are hashed before network sharing</p>
                    </div>
                    <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold self-start sm:self-auto">
                      ACTIVE
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                    <div>
                      <h4 className="font-semibold text-slate-900">Audit Logging</h4>
                      <p className="text-sm text-slate-500">Track all data access and contributions</p>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium self-start sm:self-auto">
                      View Logs
                    </button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-slate-900">Data Retention</h4>
                      <p className="text-sm text-slate-500">Contributed data retained for 24 months</p>
                    </div>
                    <span className="text-sm text-slate-600 font-medium self-start sm:self-auto">24 months</span>
                  </div>
                </div>
              </div>
           </div>
           
           <div className="mt-8 p-4 bg-slate-50 rounded-lg text-xs text-slate-500 font-mono">
             Clinic ID: KIN-ORG-882192<br/>
             Version: v0.4.3 (Beta)
           </div>
        </div>
      )}

      {notification && (
        <Notification message={notification} onClose={() => setNotification(null)} />
      )}
    </Layout>
  );
};

export default App;