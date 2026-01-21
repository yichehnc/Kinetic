import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PatientSearch } from './components/PatientSearch';
import { ContributionForm } from './components/ContributionForm';
import { Referral } from './components/Referral';
import { MOCK_PATIENTS, MOCK_HISTORY } from './constants';
import { Patient, HistoryEntry, Status } from './types';
import { CheckCircle } from 'lucide-react';

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
  const [credits, setCredits] = useState(2); // Start with trial credits
  const [unlockedPatients, setUnlockedPatients] = useState<string[]>([]);
  const [contributionCount, setContributionCount] = useState(12);
  const [localHistory, setLocalHistory] = useState<HistoryEntry[]>(MOCK_HISTORY);
  const [localPatients, setLocalPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [notification, setNotification] = useState<string | null>(null);

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
    
    // Check if patient exists, if not add them
    // CRITICAL FIX: Ensure the patient is marked as having history available
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

    setNotification('Contribution verified. +1 Credit earned.');
    setTimeout(() => {
      // Note: We don't clear notification here immediately if the user navigates away, 
      // but the useEffect above handles clearing it on navigation.
      // This timeout is just for auto-dismissal on the same screen.
      setNotification(null); 
    }, 2000);
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} credits={credits}>
      {activeTab === 'dashboard' && (
        <Dashboard 
          credits={credits} 
          contributionCount={contributionCount} 
          unlockedCount={unlockedPatients.length}
          onNavigate={setActiveTab}
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
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
           <h2 className="text-2xl font-bold mb-6">Settings</h2>
           <div className="space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div>
                  <h3 className="font-semibold text-slate-900">Network Opt-in</h3>
                  <p className="text-sm text-slate-500">Allow other clinics to request your data (anonymized)</p>
                </div>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-emerald-500">
                   <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md transform translate-x-6"></span>
                </div>
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