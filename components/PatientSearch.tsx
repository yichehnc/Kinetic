import React, { useState } from 'react';
import { Search, Lock, Unlock, AlertTriangle, FileText, Calendar, CheckCircle, Activity, User, Upload, Download, Eye } from 'lucide-react';
import { Patient, HistoryEntry } from '../types';

interface PatientSearchProps {
  patients: Patient[];
  histories: HistoryEntry[];
  unlockedPatients: string[];
  credits: number;
  onUnlock: (patientId: string) => void;
}

export const PatientSearch: React.FC<PatientSearchProps> = ({ 
  patients, 
  histories, 
  unlockedPatients, 
  credits, 
  onUnlock 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Feature State for SOAP Report
  const [reportFile, setReportFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Reset local report state when patient changes
  React.useEffect(() => {
    setReportFile(null);
    setIsUploading(false);
  }, [selectedPatient]);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const patientHistory = selectedPatient 
    ? histories.find(h => h.patientId === selectedPatient.id) 
    : null;

  const isUnlocked = selectedPatient ? unlockedPatients.includes(selectedPatient.id) : false;

  const handleUnlock = () => {
    if (selectedPatient && credits > 0) {
      onUnlock(selectedPatient.id);
    }
  };

  const handleFileUpload = () => {
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      setReportFile("soap_report_final.pdf");
      setIsUploading(false);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Search Column */}
      <div className="lg:col-span-1 flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Find Patient</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-kinetic-500 focus:border-kinetic-500 outline-none"
              placeholder="Search name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredPatients.map(patient => (
            <div
              key={patient.id}
              onClick={() => setSelectedPatient(patient)}
              className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                selectedPatient?.id === patient.id
                  ? 'bg-kinetic-50 border-kinetic-200'
                  : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">{patient.name}</h4>
                  <p className="text-xs text-slate-500">ID: {patient.id} • DOB: {patient.dob}</p>
                </div>
                {patient.historyAvailable && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                    History
                  </span>
                )}
              </div>
            </div>
          ))}
          {filteredPatients.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">No patients found.</div>
          )}
        </div>
      </div>

      {/* Detail Column */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 h-full overflow-hidden flex flex-col">
        {!selectedPatient ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <User className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a patient to view details</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedPatient.name}</h2>
                <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                  <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> DOB: {selectedPatient.dob}</span>
                  <span className="flex items-center"><Activity className="w-4 h-4 mr-1" /> Last Visit: {selectedPatient.lastVisit}</span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                selectedPatient.historyAvailable 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {selectedPatient.historyAvailable ? (
                  <><CheckCircle className="w-4 h-4 mr-1.5" /> History Available</>
                ) : (
                  'No Prior History'
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 relative">
              {!selectedPatient.historyAvailable ? (
                 <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                   <p className="text-slate-500">No external history found for this patient.</p>
                 </div>
              ) : isUnlocked ? (
                /* Unlocked View */
                patientHistory ? (
                  <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Primary Condition</label>
                        <p className="text-lg font-semibold text-slate-900">{patientHistory.condition}</p>
                        <div className="mt-2 flex space-x-2">
                           <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                             patientHistory.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                           }`}>{patientHistory.status}</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Timeline</label>
                        <p className="text-sm text-slate-800">{patientHistory.timelineStart} — {patientHistory.timelineEnd || 'Present'}</p>
                        <label className="text-xs font-bold text-slate-400 uppercase mt-4 mb-1 block">Source</label>
                        <p className="text-xs text-slate-500 font-mono">Anonymized Clinic ({patientHistory.sourceClinicHash.substring(0,8)})</p>
                      </div>
                    </div>

                    <div>
                       <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2 mb-4">Treatment Efficacy</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <span className="text-xs font-semibold text-emerald-600 block mb-2">Effective Interventions</span>
                            <div className="flex flex-wrap gap-2">
                              {patientHistory.successfulTreatments.map(t => (
                                <span key={t} className="px-3 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-md text-sm shadow-sm">
                                  {t}
                                </span>
                              ))}
                            </div>
                         </div>
                         <div>
                            <span className="text-xs font-semibold text-rose-600 block mb-2">Ineffective Interventions</span>
                            <div className="flex flex-wrap gap-2">
                              {patientHistory.unsuccessfulTreatments.map(t => (
                                <span key={t} className="px-3 py-1 bg-white border border-rose-200 text-rose-700 rounded-md text-sm shadow-sm">
                                  {t}
                                </span>
                              ))}
                            </div>
                         </div>
                       </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2 mb-4">Safety & Contraindications</h3>
                      <div className="bg-rose-50 border border-rose-100 rounded-lg p-4">
                        <div className="flex flex-wrap gap-2">
                          {patientHistory.contraindications.map(c => (
                            <span key={c} className="flex items-center px-3 py-1 bg-white text-rose-700 border border-rose-200 rounded-md text-sm font-medium">
                              <AlertTriangle className="w-3 h-3 mr-1.5" />
                              {c}
                            </span>
                          ))}
                          {patientHistory.contraindications.length === 0 && <span className="text-sm text-rose-400 italic">None recorded</span>}
                        </div>
                      </div>
                    </div>
                    
                    {/* Clinical Reports Section */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2 mb-4">Clinical Documents</h3>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="w-8 h-8 text-slate-400 mr-3" />
                          <div>
                            <p className="text-sm font-bold text-slate-900">SOAP Report</p>
                            <p className="text-xs text-slate-500">{reportFile ? 'Available for download' : 'No report attached'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {reportFile ? (
                             <>
                                <button className="flex items-center px-3 py-1.5 bg-white border border-slate-200 rounded text-sm font-medium text-slate-700 hover:bg-slate-50">
                                  <Eye className="w-4 h-4 mr-2" /> View
                                </button>
                                <button className="flex items-center px-3 py-1.5 bg-kinetic-600 border border-transparent rounded text-sm font-medium text-white hover:bg-kinetic-700 shadow-sm">
                                  <Download className="w-4 h-4 mr-2" /> Download PDF
                                </button>
                             </>
                          ) : (
                             <button 
                               onClick={handleFileUpload}
                               disabled={isUploading}
                               className="flex items-center px-3 py-1.5 bg-white border border-slate-200 rounded text-sm font-medium text-slate-700 hover:bg-slate-50"
                             >
                               {isUploading ? 'Uploading...' : 'Upload SOAP Report'}
                               {!isUploading && <Upload className="w-4 h-4 ml-2 text-slate-400" />}
                             </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 text-right">
                      <p className="text-xs text-slate-400">
                        Access ID: {Math.random().toString(36).substring(7).toUpperCase()} • Viewed {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : <div className="text-red-500">Error loading history data.</div>
              ) : (
                /* Locked View */
                <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-8 z-10">
                   <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full text-center">
                      <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                        <Lock className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Structured History Available</h3>
                      <p className="text-slate-500 mb-8">
                        This patient has verified clinical history from the Kinetic network. Unlock to view outcomes, contraindications, and timelines.
                      </p>
                      
                      <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 mb-6 bg-slate-50 py-2 rounded-lg border border-slate-100">
                        <span>Cost:</span>
                        <span className="font-bold text-slate-900">1 Credit</span>
                        <span className="text-slate-300">|</span>
                        <span>Your Balance:</span>
                        <span className={`font-bold ${credits > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{credits}</span>
                      </div>

                      <button
                        onClick={handleUnlock}
                        disabled={credits <= 0}
                        className={`w-full flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 ${
                          credits > 0 
                            ? 'bg-kinetic-600 hover:bg-kinetic-700 shadow-lg shadow-kinetic-200' 
                            : 'bg-slate-300 cursor-not-allowed'
                        }`}
                      >
                        {credits > 0 ? (
                          <>
                            <Unlock className="w-5 h-5 mr-2" />
                            Unlock History
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5 mr-2" />
                            Insufficient Credits
                          </>
                        )}
                      </button>
                      
                      {credits <= 0 && (
                        <p className="mt-4 text-xs text-rose-500 font-medium">
                          Contribute a patient history to earn more credits.
                        </p>
                      )}
                   </div>
                   
                   {/* Blurred Preview Background */}
                   <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30 filter blur-sm pointer-events-none p-6 space-y-4">
                      <div className="h-32 bg-slate-300 rounded-lg w-full"></div>
                      <div className="h-16 bg-slate-300 rounded-lg w-2/3"></div>
                      <div className="h-48 bg-slate-300 rounded-lg w-full"></div>
                   </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};