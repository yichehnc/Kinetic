import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PatientSearch } from './components/PatientSearch';
import { ContributionForm } from './components/ContributionForm';
import { Referral } from './components/Referral';
import { MOCK_PATIENTS, MOCK_HISTORY } from './constants';
import { Patient, HistoryEntry, Status } from './types';
import { CheckCircle, Shield, PlayCircle, AlertTriangle, CalendarClock } from 'lucide-react';

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
  const [credits, setCredits] = useState(0); // Start with 0 until opt-in
  const [pointsExpiry, setPointsExpiry] = useState<Date | null>(null);
  const [unlockedPatients, setUnlockedPatients] = useState<string[]>([]);
  const [contributionCount, setContributionCount] = useState(12);
  const [localHistory, setLocalHistory] = useState<HistoryEntry[]>(MOCK_HISTORY);
  const [localPatients, setLocalPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Persistent SOAP Drafts
  const [soapDrafts, setSoapDrafts] = useState<Record<string, { s: string; o: string; a: string; p: string }>>({});
  
  // Phase 1 Logic
  const [optedIn, setOptedIn] = useState(false);
  const isEligible = true; // Hardcoded for demo: "Riversdale Physio" is inner-city/high-turnover

  // Clear notification when changing tabs to avoid stale messages
  useEffect(() => {
    setNotification(null);
  }, [activeTab]);

  // Actions
  const handleUnlockPatient = (patientId: string) => {
    if (!optedIn) {
      setNotification('Must Opt-In to network to unlock history.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (unlockedPatients.includes(patientId)) {
      // Already unlocked, do nothing or notify
      return;
    }

    if (pointsExpiry && new Date() > pointsExpiry) {
      setNotification('Points have expired. Contribute to earn fresh points.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (credits > 0) {
      setCredits(prev => prev - 1);
      setUnlockedPatients(prev => [...prev, patientId]);
      setNotification(`Unlocked history. Balance: ${credits - 1}`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleUploadReport = (patientId: string, fileName: string) => {
    // Find history entry for this patient
    const historyIndex = localHistory.findIndex(h => h.patientId === patientId);
    
    if (historyIndex >= 0) {
      const updatedHistory = [...localHistory];
      updatedHistory[historyIndex] = {
        ...updatedHistory[historyIndex],
        reportFile: fileName
      };
      setLocalHistory(updatedHistory);
      setNotification('SOAP Report uploaded successfully.');
      setTimeout(() => setNotification(null), 3000);
    } else {
      setNotification('Error: No history found for this patient.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleOptIn = () => {
    setOptedIn(true);
    setCredits(prev => prev + 5);
    // Set mock expiry date (30 days from now)
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    setPointsExpiry(expiry);
    
    setNotification('Network Opt-In Successful. 5 Points Granted.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOptOut = () => {
    setOptedIn(false);
    // Logic: Freezing access? For now, we'll just set state to false
    // which effectively disables unlock capabilities in the UI checks.
    setNotification('You have opted out of the Kinetic Network.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleContribution = (data: any) => {
    if (!optedIn) {
      setNotification('Please Opt-In to contribute.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setCredits(prev => prev + 1);
    setContributionCount(prev => prev + 1);
    
    // Extend expiry if contributing? Let's say yes for demo
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 30);
    setPointsExpiry(newExpiry);

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
    
    // Check if patient exists, if not add them
    const existingPatientIndex = localPatients.findIndex(p => p.id === data.patientId);
    
    if (existingPatientIndex >= 0) {
      // Update existing patient
      const updatedPatients = [...localPatients];
      updatedPatients[existingPatientIndex] = {
        ...updatedPatients[existingPatientIndex],
        historyAvailable: true
      };
      setLocalPatients(updatedPatients);
    } else {
      // Add new patient
      const newPatient: Patient = {
        id: data.patientId,
        name: `Patient ${data.patientId}`, // Placeholder name
        dob: 'Unknown',
        lastVisit: new Date().toISOString().split('T')[0],
        historyAvailable: true
      };
      setLocalPatients(prev => [...prev, newPatient]);
    }

    setNotification('Contribution verified. +1 Point earned.');
    setTimeout(() => {
      setNotification(null); 
    }, 2000);
  };

  const handleSaveSoapDraft = (patientId: string, data: { s: string; o: string; a: string; p: string }) => {
    setSoapDrafts(prev => ({
      ...prev,
      [patientId]: data
    }));
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} credits={credits}>
      {activeTab === 'dashboard' && (
        <Dashboard 
          credits={credits} 
          unlockedPatients={unlockedPatients}
          patients={localPatients}
          histories={localHistory}
          onNavigate={setActiveTab}
          onUnlock={handleUnlockPatient}
          isOptedIn={optedIn}
          pointsExpiry={pointsExpiry}
        />
      )}
      
      {activeTab === 'intake' && (
        <PatientSearch 
          patients={localPatients}
          histories={localHistory}
          unlockedPatients={unlockedPatients}
          credits={credits}
          onUnlock={handleUnlockPatient}
          onUploadReport={handleUploadReport}
          soapDrafts={soapDrafts}
          onSaveSoap={handleSaveSoapDraft}
          isOptedIn={optedIn}
          pointsExpiry={pointsExpiry}
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
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-fade-in">
           <h2 className="text-2xl font-bold mb-6 text-slate-900">Settings</h2>
           
           <div className="space-y-8">
              {/* Phase 1 Opt-In Section */}
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center">
                      <Shield className={`w-5 h-5 mr-2 ${optedIn ? 'text-emerald-500' : 'text-slate-400'}`} />
                      Kinetic Network Status
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-sm">
                      Participate in the shared history network. Contributing data earns points for future access.
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    optedIn ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {optedIn ? 'Active Member' : 'Not Enrolled'}
                  </div>
                </div>

                {!optedIn && isEligible && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="flex items-center space-x-2 text-indigo-600 font-semibold mb-2">
                      <PlayCircle className="w-4 h-4" />
                      <span>Phase 1 Pilot Eligibility Confirmed</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">
                      Your clinic (Riversdale Physio) meets the criteria for the Phase 1 Pilot. Join today to receive 5 trial points immediately.
                    </p>
                    <button 
                      onClick={handleOptIn}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center"
                    >
                      Join Network & Claim 5 Points
                    </button>
                  </div>
                )}

                {optedIn && (
                   <div className="mt-6 pt-6 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-2 text-slate-700 font-medium">
                            <CalendarClock className="w-4 h-4 text-slate-400" />
                            <span>Points Expiry: {pointsExpiry ? pointsExpiry.toLocaleDateString() : 'N/A'}</span>
                         </div>
                         <button 
                           onClick={handleOptOut}
                           className="text-sm text-red-500 hover:text-red-700 font-medium underline"
                         >
                           Opt Out of Network
                         </button>
                      </div>
                   </div>
                )}
              </div>

              {/* Other Settings */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div>
                  <h3 className="font-semibold text-slate-900">Auto-Refill Points</h3>
                  <p className="text-sm text-slate-500">Purchase points if contribution isn't possible</p>
                </div>
                 <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-slate-200 cursor-not-allowed">
                   <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md"></span>
                </div>
              </div>

              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div>
                  <h3 className="font-semibold text-slate-900">Data Retention</h3>
                  <p className="text-sm text-slate-500">Automatically archive contributions after 7 years</p>
                </div>
                 <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-emerald-500 cursor-pointer">
                   <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md transform translate-x-6"></span>
                </div>
              </div>
           </div>

           <div className="mt-8 p-4 bg-slate-50 rounded-lg text-xs text-slate-500 font-mono">
             Clinic ID: KIN-ORG-882192<br/>
             Version: v0.4.4 (Beta)
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