import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, FileText, Check, Save, Activity, CheckCircle, Upload, Download, Copy, Calendar, User, Lock, CalendarClock, AlertTriangle } from 'lucide-react';
import { Patient, HistoryEntry } from '../types';
import { DEMO_PDF_BASE64 } from '../constants';
import { ClinicalSnapshotCard } from './ClinicalSnapshotCard';
import { PatientCard, HistoryEntryCard } from './ui/cards';

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
    setTimeout(() => {
      onUploadReport(selectedPatient.id, "soap_report_final.pdf");
      setIsUploading(false);
    }, 1500);
  };

  const handleDownloadReport = () => {
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
    const text = `Patient History: ${selectedPatient?.name}...`; // Simplified for brevity
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSoap = () => {
    if (!selectedPatient) return;
    setIsSavingSoap(true);
    onSaveSoap(selectedPatient.id, soap);
    setTimeout(() => {
      setIsSavingSoap(false);
      setLastSavedSoap(new Date());
    }, 500);
  };

  // SEARCH VIEW (Grid of Cards)
  if (!selectedPatient) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Patient Directory</h2>
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-kinetic-500 focus:border-kinetic-500 outline-none"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map(patient => {
            const isPtUnlocked = unlockedPatients.includes(patient.id);
            return (
              <PatientCard
                key={patient.id}
                id={patient.id}
                name={patient.name}
                dob={patient.dob}
                lastVisit={patient.lastVisit}
                historyAvailable={patient.historyAvailable}
                snapshotAvailable={patient.historyAvailable} // Assuming mock matches
                isUnlocked={isPtUnlocked}
                onViewHistory={() => setSelectedPatient(patient)}
                onViewSnapshot={() => setSelectedPatient(patient)}
              />
            );
          })}
          {filteredPatients.length === 0 && (
             <div className="col-span-full text-center py-12 text-slate-400">
               No patients found matching "{searchTerm}"
             </div>
          )}
        </div>
      </div>
    );
  }

  // DETAIL VIEW
  return (
    <div className="h-full flex flex-col space-y-6">
      <button 
        onClick={() => setSelectedPatient(null)}
        className="self-start flex items-center text-slate-500 hover:text-slate-900 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Directory
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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

        <div className="p-6 space-y-8">
           {/* SOAP Section */}
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
                   <textarea className="w-full p-3 border border-slate-300 rounded-lg text-sm h-24 resize-none outline-none focus:ring-2 focus:ring-kinetic-500" placeholder="Subjective..." value={soap.s} onChange={e => setSoap({...soap, s: e.target.value})} />
                   <textarea className="w-full p-3 border border-slate-300 rounded-lg text-sm h-24 resize-none outline-none focus:ring-2 focus:ring-kinetic-500" placeholder="Objective..." value={soap.o} onChange={e => setSoap({...soap, o: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <textarea className="w-full p-3 border border-slate-300 rounded-lg text-sm h-24 resize-none outline-none focus:ring-2 focus:ring-kinetic-500" placeholder="Assessment..." value={soap.a} onChange={e => setSoap({...soap, a: e.target.value})} />
                   <textarea className="w-full p-3 border border-slate-300 rounded-lg text-sm h-24 resize-none outline-none focus:ring-2 focus:ring-kinetic-500" placeholder="Plan..." value={soap.p} onChange={e => setSoap({...soap, p: e.target.value})} />
                </div>
             </div>
          </div>

          {/* Network History */}
          <div className="border-t border-slate-200 pt-8">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                   <Activity className="w-5 h-5 mr-2 text-slate-500" />
                   Network History
                </h3>
                {isUnlocked && (
                  <button onClick={handleCopyHistory} className="text-xs font-medium px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex items-center">
                    {copied ? <Check className="w-3 h-3 mr-1.5"/> : <Copy className="w-3 h-3 mr-1.5"/>} Copy
                  </button>
                )}
             </div>

             {!selectedPatient.historyAvailable ? (
               <div className="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-slate-500">
                 No external history available.
               </div>
             ) : (
               <div className="space-y-6">
                 <ClinicalSnapshotCard
                    patientId={selectedPatient.id}
                    isUnlocked={isUnlocked}
                    credits={credits}
                    onUnlock={handleUnlock}
                    historyEntry={patientHistory}
                 />
                 
                 {isUnlocked && patientHistory && (
                    <>
                      <HistoryEntryCard 
                        condition={patientHistory.condition}
                        timelineStart={patientHistory.timelineStart}
                        timelineEnd={patientHistory.timelineEnd}
                        status={patientHistory.status}
                        successfulTreatments={patientHistory.successfulTreatments.join(', ')}
                        unsuccessfulTreatments={patientHistory.unsuccessfulTreatments.join(', ')}
                        sourceClinic={patientHistory.sourceClinicHash}
                        isExpanded={true}
                        onToggle={() => {}} // Optional toggle if we wanted it collapsible
                      />

                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                         <div className="flex items-center">
                            <FileText className="w-8 h-8 text-slate-400 mr-3" />
                            <div>
                               <p className="text-sm font-bold text-slate-900">Original SOAP Report</p>
                               <p className="text-xs text-slate-500">{patientHistory.reportFile || 'No file attached'}</p>
                            </div>
                         </div>
                         <div className="flex items-center space-x-2">
                           {patientHistory.reportFile ? (
                              <button onClick={handleDownloadReport} className="flex items-center px-3 py-1.5 bg-white border border-slate-200 rounded text-sm font-medium shadow-sm hover:bg-slate-50">
                                <Download className="w-4 h-4 mr-2" /> PDF
                              </button>
                           ) : (
                              <button onClick={handleFileUpload} disabled={isUploading} className="flex items-center px-3 py-1.5 bg-white border border-slate-200 rounded text-sm font-medium hover:bg-slate-50">
                                {isUploading ? 'Uploading...' : 'Upload'} <Upload className="w-4 h-4 ml-2" />
                              </button>
                           )}
                         </div>
                      </div>
                    </>
                 )}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};