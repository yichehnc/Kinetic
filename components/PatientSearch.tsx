import React, { useState, useEffect } from 'react';
import { Search, Lock, Unlock, AlertTriangle, FileText, Calendar, CheckCircle, Activity, User, Upload, Download, Eye, Copy, Check, Save, CalendarClock } from 'lucide-react';
import { Patient, HistoryEntry } from '../types';
import { DEMO_PDF_BASE64 } from '../constants';

interface PatientSearchProps {
  patients: Patient[];
  histories: HistoryEntry[];
  unlockedPatients: string[];
  credits: number;
  onUnlock: (patientId: string) => void;
  onUploadReport: (patientId: string, fileName: string) => void;
  soapDrafts: Record<string, { s: string; o: string; a: string; p: string }>;
  onSaveSoap: (patientId: string, data: { s: string; o: string; a: string; p: string }) => void;
  isOptedIn: boolean;
  pointsExpiry: Date | null;
}

export const PatientSearch: React.FC<PatientSearchProps> = ({ 
  patients, 
  histories, 
  unlockedPatients, 
  credits, 
  onUnlock,
  onUploadReport,
  soapDrafts,
  onSaveSoap,
  isOptedIn,
  pointsExpiry
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Local state for UI feedback
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  // SOAP Form State
  const [soap, setSoap] = useState({ s: '', o: '', a: '', p: '' });
  const [isSavingSoap, setIsSavingSoap] = useState(false);
  const [lastSavedSoap, setLastSavedSoap] = useState<Date | null>(null);

  // Reset states or load draft when patient changes
  useEffect(() => {
    setIsUploading(false);
    setCopied(false);
    if (selectedPatient) {
      const draft = soapDrafts[selectedPatient.id] || { s: '', o: '', a: '', p: '' };
      setSoap(draft);
    } else {
      setSoap({ s: '', o: '', a: '', p: '' });
    }
    setLastSavedSoap(null);
  }, [selectedPatient, soapDrafts]);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const patientHistory = selectedPatient 
    ? histories.find(h => h.patientId === selectedPatient.id) 
    : null;

  const isUnlocked = selectedPatient ? unlockedPatients.includes(selectedPatient.id) : false;
  const isExpired = pointsExpiry && new Date() > pointsExpiry;

  const handleUnlock = () => {
    if (selectedPatient && credits > 0 && !isExpired && isOptedIn) {
      onUnlock(selectedPatient.id);
    }
  };

  const handleFileUpload = () => {
    if (!selectedPatient) return;
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      onUploadReport(selectedPatient.id, "soap_report_final.pdf");
      setIsUploading(false);
    }, 1500);
  };

  const handleDownloadReport = () => {
    // Convert Base64 to Blob
    const byteCharacters = atob(DEMO_PDF_BASE64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', patientHistory?.reportFile || 'soap_report.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleCopyHistory = () => {
    if (!patientHistory) return;
    const text = `
Patient History: ${selectedPatient?.name} (ID: ${selectedPatient?.id})
Condition: ${patientHistory.condition}
Status: ${patientHistory.status}
Timeline: ${patientHistory.timelineStart} - ${patientHistory.timelineEnd || 'Present'}

Effective Interventions:
${patientHistory.successfulTreatments.join(', ') || 'None listed'}

Ineffective Interventions:
${patientHistory.unsuccessfulTreatments.join(', ') || 'None listed'}

Contraindications:
${patientHistory.contraindications.join(', ') || 'None listed'}

Source: Kinetic Network (${patientHistory.sourceClinicHash.substring(0,8)})
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSoap = () => {
    if (!selectedPatient) return;
    setIsSavingSoap(true);
    // Call parent handler to save draft
    onSaveSoap(selectedPatient.id, soap);
    setTimeout(() => {
      setIsSavingSoap(false);
      setLastSavedSoap(new Date());
    }, 500);
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

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* SOAP Report Section (Interactive) */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 relative">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center">
                       <FileText className="w-5 h-5 mr-2 text-slate-500" />
                       Clinical Note (SOAP)
                    </h3>
                    <button 
                      onClick={handleSaveSoap}
                      className="text-sm font-medium text-kinetic-600 hover:text-kinetic-700 flex items-center"
                    >
                      {isSavingSoap ? 'Saving...' : lastSavedSoap ? 'Saved' : 'Save Draft'}
                      {!isSavingSoap && lastSavedSoap && <Check className="w-4 h-4 ml-1" />}
                    </button>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subjective</label>
                          <textarea 
                             className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-kinetic-500 outline-none h-24 resize-none"
                             placeholder="Patient reports..."
                             value={soap.s}
                             onChange={e => setSoap({...soap, s: e.target.value})}
                          ></textarea>
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Objective</label>
                          <textarea 
                             className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-kinetic-500 outline-none h-24 resize-none"
                             placeholder="ROM, Strength, etc..."
                             value={soap.o}
                             onChange={e => setSoap({...soap, o: e.target.value})}
                          ></textarea>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assessment</label>
                          <textarea 
                             className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-kinetic-500 outline-none h-24 resize-none"
                             placeholder="Diagnosis/Impression..."
                             value={soap.a}
                             onChange={e => setSoap({...soap, a: e.target.value})}
                          ></textarea>
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Plan</label>
                          <textarea 
                             className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-kinetic-500 outline-none h-24 resize-none"
                             placeholder="Treatment plan..."
                             value={soap.p}
                             onChange={e => setSoap({...soap, p: e.target.value})}
                          ></textarea>
                       </div>
                    </div>
                 </div>
              </div>

              {/* External History Section */}
              <div className="border-t border-slate-200 pt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                   <Activity className="w-5 h-5 mr-2 text-slate-500" />
                   Network History
                </h3>

                {!selectedPatient.historyAvailable ? (
                   <div className="p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
                     No external history records found in Kinetic network.
                   </div>
                ) : isUnlocked ? (
                  /* Unlocked View */
                  patientHistory ? (
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Condition</label>
                          <p className="text-lg font-semibold text-slate-900">{patientHistory.condition}</p>
                          <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-bold uppercase ${
                             patientHistory.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                           }`}>{patientHistory.status}</span>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Timeline</label>
                          <p className="text-sm text-slate-800">{patientHistory.timelineStart} — {patientHistory.timelineEnd || 'Present'}</p>
                          <label className="text-xs font-bold text-slate-400 uppercase mt-4 mb-1 block">Source</label>
                          <p className="text-xs text-slate-500 font-mono">Clinic ({patientHistory.sourceClinicHash.substring(0,8)})</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                         <div>
                            <span className="text-xs font-semibold text-emerald-600 block mb-2">Effective</span>
                            <div className="flex flex-wrap gap-2">
                              {patientHistory.successfulTreatments.map(t => (
                                <span key={t} className="px-3 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-md text-sm shadow-sm">{t}</span>
                              ))}
                            </div>
                         </div>
                         <div>
                            <span className="text-xs font-semibold text-rose-600 block mb-2">Ineffective</span>
                            <div className="flex flex-wrap gap-2">
                              {patientHistory.unsuccessfulTreatments.map(t => (
                                <span key={t} className="px-3 py-1 bg-white border border-rose-200 text-rose-700 rounded-md text-sm shadow-sm">{t}</span>
                              ))}
                            </div>
                         </div>
                      </div>

                      <div className="mb-6">
                        <span className="text-xs font-semibold text-rose-600 block mb-2">Contraindications</span>
                        <div className="flex flex-wrap gap-2">
                          {patientHistory.contraindications.map(c => (
                            <span key={c} className="flex items-center px-3 py-1 bg-white text-rose-700 border border-rose-200 rounded-md text-sm font-medium">
                              <AlertTriangle className="w-3 h-3 mr-1.5" /> {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Documents */}
                      <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <FileText className="w-8 h-8 text-slate-400 mr-3" />
                          <div>
                            <p className="text-sm font-bold text-slate-900">SOAP Report</p>
                            <p className="text-xs text-slate-500">
                              {patientHistory.reportFile ? `Available: ${patientHistory.reportFile}` : 'No report attached'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {patientHistory.reportFile ? (
                             <button 
                               onClick={handleDownloadReport}
                               className="flex items-center px-3 py-1.5 bg-kinetic-600 border border-transparent rounded text-sm font-medium text-white hover:bg-kinetic-700 shadow-sm"
                             >
                               <Download className="w-4 h-4 mr-2" /> Download PDF
                             </button>
                          ) : (
                             <button 
                               onClick={handleFileUpload}
                               disabled={isUploading}
                               className="flex items-center px-3 py-1.5 bg-white border border-slate-200 rounded text-sm font-medium text-slate-700 hover:bg-slate-50"
                             >
                               {isUploading ? 'Uploading...' : 'Upload SOAP'}
                               {!isUploading && <Upload className="w-4 h-4 ml-2 text-slate-400" />}
                             </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button 
                          onClick={handleCopyHistory}
                          className={`flex items-center text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                            copied ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                           {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                           {copied ? 'Copied to Clipboard' : 'Copy History Text'}
                        </button>
                      </div>
                    </div>
                  ) : <div className="text-red-500">Error data</div>
                ) : (
                  /* Locked View */
                  <div className="bg-slate-900 rounded-xl p-8 text-center text-white relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                     <Lock className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                     <h3 className="text-xl font-bold mb-2">History Available</h3>
                     <p className="text-slate-400 mb-6 max-w-sm mx-auto">
                       Unlock verified clinical outcomes, treatment responses, and contraindications.
                     </p>
                     
                     <div className="flex items-center justify-center space-x-4 mb-6">
                        <div className="text-sm">
                           <span className="text-slate-400 mr-2">Cost:</span>
                           <span className="font-bold">1 Point</span>
                        </div>
                        <div className="w-px h-4 bg-slate-700"></div>
                        <div className="text-sm">
                           <span className="text-slate-400 mr-2">Balance:</span>
                           <span className={`font-bold ${credits > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{credits}</span>
                        </div>
                     </div>
                     
                     {isExpired ? (
                       <div className="inline-flex items-center px-4 py-2 bg-rose-500/20 text-rose-300 rounded-lg text-sm border border-rose-500/50">
                         <CalendarClock className="w-4 h-4 mr-2" />
                         Points Expired
                       </div>
                     ) : !isOptedIn ? (
                       <div className="inline-flex items-center px-4 py-2 bg-slate-800 text-slate-400 rounded-lg text-sm border border-slate-700">
                         Opt-In Required
                       </div>
                     ) : (
                       <button
                          onClick={handleUnlock}
                          disabled={credits <= 0}
                          className={`px-8 py-3 rounded-xl font-bold transition-all ${
                            credits > 0 
                              ? 'bg-kinetic-600 hover:bg-kinetic-500 shadow-lg shadow-kinetic-900/50' 
                              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {credits > 0 ? 'Unlock History' : 'Insufficient Points'}
                        </button>
                     )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};