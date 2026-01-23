import React, { useState } from 'react';
import { Lock, Unlock, Clock, X, Award, Database, CalendarClock, AlertTriangle } from 'lucide-react';
import { Patient, HistoryEntry } from '../types';
import { MOCK_SCHEDULE } from '../constants';
import { StatCard, Card, CardHeader, CardBody } from './ui/cards';

interface DashboardProps {
  credits: number;
  contributionCount: number;
  unlockedPatients: string[];
  patients: Patient[];
  histories: HistoryEntry[];
  onNavigate: (tab: string) => void;
  onUnlock: (patientId: string) => void;
  isOptedIn: boolean;
  pointsExpiry: Date | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  credits, 
  contributionCount,
  unlockedPatients, 
  patients, 
  histories,
  onUnlock,
  isOptedIn,
  pointsExpiry
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const getPatient = (id: string) => patients.find(p => p.id === id);
  const getHistory = (id: string) => histories.find(h => h.patientId === id);

  const handleOpenHistory = (patientId: string) => {
    setSelectedPatientId(patientId);
  };

  const handleUnlockAndOpen = (patientId: string) => {
    onUnlock(patientId);
    if (isOptedIn && credits > 0 && (!pointsExpiry || new Date() <= pointsExpiry)) {
      setSelectedPatientId(patientId);
    }
  };

  const closeModal = () => setSelectedPatientId(null);

  const selectedPatient = selectedPatientId ? getPatient(selectedPatientId) : null;
  const selectedHistory = selectedPatientId ? getHistory(selectedPatientId) : null;
  const isSelectedUnlocked = selectedPatientId ? unlockedPatients.includes(selectedPatientId) : false;
  const isExpired = pointsExpiry && new Date() > pointsExpiry;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
         <h2 className="text-2xl font-bold text-slate-900">Today's Schedule</h2>
         <p className="text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Available Points"
          value={credits}
          subtitle={isExpired ? "Expired" : "Ready to use"}
          icon={<Award className="w-6 h-6" />}
          iconColor={isExpired ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}
          trend={{ value: "+2 this week", isPositive: true }}
        />
        <StatCard
          title="Contributions"
          value={contributionCount}
          subtitle="Histories shared"
          icon={<Database className="w-6 h-6" />}
          iconColor="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Unlocked Records"
          value={unlockedPatients.length}
          subtitle="Total access granted"
          icon={<Unlock className="w-6 h-6" />}
          iconColor="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Schedule List */}
      <Card>
        <CardHeader className="border-b border-slate-100 bg-slate-50 py-4">
          <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-2">Time</div>
            <div className="col-span-4">Patient</div>
            <div className="col-span-3">Reason</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-slate-100">
            {MOCK_SCHEDULE.map((apt) => {
              const patient = getPatient(apt.patientId);
              const isUnlocked = unlockedPatients.includes(apt.patientId);
              const hasHistory = patient?.historyAvailable;

              return (
                <div key={apt.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors">
                  <div className="col-span-2 flex items-center text-slate-700 font-medium">
                    <Clock className="w-4 h-4 mr-2 text-slate-400" />
                    {apt.time}
                  </div>
                  <div className="col-span-4">
                    <div className="font-semibold text-slate-900">{patient?.name || 'Unknown'}</div>
                    <div className="text-xs text-slate-500 flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        apt.status === 'Arrived' ? 'bg-emerald-500' :
                        apt.status === 'Completed' ? 'bg-slate-300' : 'bg-blue-500'
                      }`}></span>
                      {apt.status}
                    </div>
                  </div>
                  <div className="col-span-3 text-sm text-slate-600">
                    {apt.reason}
                  </div>
                  <div className="col-span-3 flex justify-end">
                    {!hasHistory ? (
                      <span className="text-xs text-slate-400 italic py-2">No history</span>
                    ) : isUnlocked ? (
                      <button 
                        onClick={() => handleOpenHistory(apt.patientId)}
                        className="flex items-center text-sm font-medium text-kinetic-600 bg-kinetic-50 px-3 py-1.5 rounded-lg hover:bg-kinetic-100 transition-colors"
                      >
                        <Unlock className="w-3 h-3 mr-2" />
                        View History
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUnlockAndOpen(apt.patientId)}
                        disabled={credits <= 0 || isExpired || !isOptedIn}
                        className={`flex items-center text-sm font-medium px-3 py-1.5 rounded-lg border transition-all ${
                          credits > 0 && !isExpired && isOptedIn
                            ? 'bg-white border-slate-200 text-slate-700 hover:border-kinetic-500 hover:text-kinetic-600 shadow-sm' 
                            : 'bg-slate-100 border-transparent text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isExpired ? <CalendarClock className="w-3 h-3 mr-2" /> : <Lock className="w-3 h-3 mr-2" />}
                        {isExpired ? 'Expired' : !isOptedIn ? 'Locked' : 'Unlock (-1 Pt)'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* History Modal */}
      {selectedPatientId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                 <h3 className="text-xl font-bold text-slate-900">{selectedPatient?.name}</h3>
                 <p className="text-sm text-slate-500">History Record</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-slate-200 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isSelectedUnlocked && selectedHistory ? (
                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <label className="text-xs font-bold text-slate-400 uppercase">Condition</label>
                        <div className="text-lg font-semibold text-slate-900">{selectedHistory.condition}</div>
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-white border border-slate-200 mt-1">
                          {selectedHistory.status}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg">
                         <label className="text-xs font-bold text-slate-400 uppercase">Timeline</label>
                         <div className="text-sm text-slate-900 mt-1">{selectedHistory.timelineStart} — {selectedHistory.timelineEnd || 'Present'}</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase mb-3">Interventions</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs font-semibold text-emerald-600 block mb-1">Effective</span>
                          <div className="flex flex-wrap gap-2">
                            {selectedHistory.successfulTreatments.map(t => (
                              <span key={t} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-100">{t}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-rose-600 block mb-1">Ineffective</span>
                          <div className="flex flex-wrap gap-2">
                            {selectedHistory.unsuccessfulTreatments.map(t => (
                              <span key={t} className="px-2 py-1 bg-rose-50 text-rose-700 text-xs rounded border border-rose-100">{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                     <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase mb-3">Contraindications</h4>
                      <div className="flex flex-wrap gap-2">
                         {selectedHistory.contraindications.map(c => (
                            <span key={c} className="flex items-center px-2 py-1 bg-rose-50 text-rose-700 text-xs rounded border border-rose-100 font-medium">
                              <AlertTriangle className="w-3 h-3 mr-1" /> {c}
                            </span>
                         ))}
                      </div>
                    </div>
                 </div>
              ) : (
                <div className="text-center py-12">
                   <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Lock className="w-8 h-8 text-slate-400" />
                   </div>
                   <h3 className="text-lg font-bold text-slate-900">History Locked</h3>
                   <p className="text-slate-500 mb-6 max-w-xs mx-auto">
                     Unlock this patient's history to view clinical outcomes and contraindications.
                   </p>
                   {isExpired ? (
                       <div className="inline-flex items-center px-4 py-2 bg-rose-500/20 text-rose-300 rounded-lg text-sm border border-rose-500/50">
                         <CalendarClock className="w-4 h-4 mr-2" />
                         Points Expired
                       </div>
                   ) : !isOptedIn ? (
                       <div className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm border border-slate-200">
                         Opt-In Required
                       </div>
                   ) : (
                       <button 
                         onClick={() => onUnlock(selectedPatientId!)}
                         disabled={credits <= 0}
                         className={`px-6 py-2 rounded-lg font-semibold text-white transition-all ${
                            credits > 0 ? 'bg-kinetic-600 hover:bg-kinetic-700' : 'bg-slate-300 cursor-not-allowed'
                         }`}
                       >
                         Unlock for 1 Point
                       </button>
                   )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};