import React, { useState } from 'react';
import { Search, Lock, Unlock, Clock, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Download, Upload, Eye, FileText, Activity, User } from 'lucide-react';
import { Patient, HistoryEntry } from '../types';

interface PatientSearchProps {
  patients: Patient[];
  histories: HistoryEntry[];
  unlockedPatients: string[];
  credits: number;
  onUnlock: (patientId: string) => void;
  isOptedIn?: boolean;
}

export const PatientSearch: React.FC<PatientSearchProps> = ({
  patients,
  histories,
  unlockedPatients,
  credits,
  onUnlock,
  isOptedIn
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<'patient' | 'condition'>('patient');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [clinicianNotes, setClinicianNotes] = useState<{ [key: string]: string }>({});

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPatientHistories = (patientId: string) => {
    return histories.filter(h => h.patientId === patientId);
  };

  const isUnlocked = (patientId: string) => {
    return unlockedPatients.includes(patientId);
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setExpandedHistory(null);
  };

  const toggleHistoryExpansion = (historyId: string) => {
    setExpandedHistory(expandedHistory === historyId ? null : historyId);
  };

  const handleNoteChange = (historyId: string, note: string) => {
    setClinicianNotes(prev => ({
      ...prev,
      [historyId]: note
    }));
  };

  // Generate SOAP report for a history entry
  const generateSOAPReport = (history: HistoryEntry) => {
    const note = clinicianNotes[history.id] || '';
    
    const soapReport = `
SOAP REPORT
===========

Patient ID: ${selectedPatient?.id}
Patient Name: ${selectedPatient?.name}
Date of Birth: ${selectedPatient?.dob}
Report Generated: ${new Date().toLocaleDateString()}

SUBJECTIVE
----------
Condition: ${history.condition}
Status: ${history.status}
Timeline: ${history.timelineStart} ${history.timelineEnd ? `to ${history.timelineEnd}` : '(ongoing)'}

OBJECTIVE
---------
Successful Treatments:
${history.successfulTreatments?.length ? history.successfulTreatments.join(', ') : 'None listed'}

Unsuccessful Treatments:
${history.unsuccessfulTreatments?.length ? history.unsuccessfulTreatments.join(', ') : 'None listed'}

${history.contraindications?.length ? `Contraindications:\n${history.contraindications.join(', ')}\n` : ''}

ASSESSMENT
----------
Treatment outcome: ${history.status}

PLAN
----
${note ? `Clinician Notes:\n${note}\n` : 'No additional notes.'}

---
Source: ${history.sourceClinicHash}
Created: ${new Date(history.createdAt).toLocaleDateString()}
    `.trim();
    
    return soapReport;
  };

  // Download SOAP report
  const handleDownloadSOAP = (history: HistoryEntry) => {
    const report = generateSOAPReport(history);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOAP_${selectedPatient?.id}_${history.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // View SOAP report in modal
  const [viewingSOAP, setViewingSOAP] = useState<HistoryEntry | null>(null);

  // Upload file handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, historyId: string) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setClinicianNotes(prev => ({
          ...prev,
          [historyId]: prev[historyId] ? `${prev[historyId]}\n\n[Uploaded: ${file.name}]\n${content}` : content
        }));
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Patient Intake</h2>
          <p className="text-slate-500">Search for patient history across the network</p>
        </div>
        {isOptedIn && (
          <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-xs">
              CP
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Current Clinic</p>
              <p className="text-sm font-bold text-slate-900">Cremorne Physio</p>
            </div>
          </div>
        )}
      </div>

      {/* Search Mode Toggle */}
      <div className="mb-4 inline-flex bg-slate-100 p-1 rounded-lg">
        <button
          onClick={() => { setSearchMode('patient'); setSearchTerm(''); }}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
            searchMode === 'patient' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <User className="w-4 h-4 mr-2" /> By Patient
        </button>
        <button
          onClick={() => { setSearchMode('condition'); setSearchTerm(''); setSelectedPatient(null); }}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
            searchMode === 'condition' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Activity className="w-4 h-4 mr-2" /> By Condition
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder={searchMode === 'patient'
              ? 'Search by patient name or Patient ID (Medicare)...'
              : 'Search by condition, body region, or rehab stage (e.g. "knee", "chronic", "ACL")...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      {searchMode === 'condition' && (
        <ConditionResults
          searchTerm={searchTerm}
          patients={patients}
          histories={histories}
          unlockedPatients={unlockedPatients}
          onSelectPatient={(p) => { setSelectedPatient(p); setSearchTerm(''); setSearchMode('patient'); }}
        />
      )}

      {searchMode === 'patient' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-900">
                Patients (47)
              </h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {filteredPatients.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <p>No patients found</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredPatients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => handleSelectPatient(patient)}
                      className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                        selectedPatient?.id === patient.id ? 'bg-emerald-50 border-l-4 border-emerald-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 truncate">{patient.name}</h4>
                          <p className="text-sm text-slate-500 font-mono">{patient.id}</p>
                          <p className="text-xs text-slate-400 mt-1">DOB: {patient.dob}</p>
                        </div>
                        {patient.historyAvailable && (
                          <div className="flex-shrink-0 ml-2">
                            {isUnlocked(patient.id) ? (
                              <div className="w-2 h-2 bg-emerald-500 rounded-full" title="Unlocked"></div>
                            ) : (
                              <Lock className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Patient Details */}
        <div className="lg:col-span-2">
          {!selectedPatient ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Select a Patient</h3>
              <p className="text-slate-500">Choose a patient from the list to view their details</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Patient Info Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedPatient.name}</h3>
                    <p className="text-sm text-slate-500 font-mono mt-1">Patient ID (Medicare): {selectedPatient.id}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      Active
                    </span>
                    {selectedPatient.historyAvailable && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                        History Available
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Date of Birth:</span>
                    <p className="font-medium text-slate-900">{selectedPatient.dob}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Last Visit:</span>
                    <p className="font-medium text-slate-900">{selectedPatient.lastVisit}</p>
                  </div>
                </div>
              </div>

              {/* Treatment History */}
              {selectedPatient.historyAvailable && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Treatment History</h3>
                    {!isUnlocked(selectedPatient.id) && (
                      <button
                        onClick={() => onUnlock(selectedPatient.id)}
                        disabled={credits < 1}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                          credits >= 1
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Unlock className="w-4 h-4" />
                        <span>Unlock (1 Credit)</span>
                      </button>
                    )}
                  </div>

                  {!isUnlocked(selectedPatient.id) ? (
                    <div className="p-8 text-center">
                      <Lock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h4 className="font-semibold text-slate-900 mb-2">History Locked</h4>
                      <p className="text-sm text-slate-500 mb-4">
                        Unlock this patient's treatment history for 1 Kinetic Credit
                      </p>
                      {credits < 1 && (
                        <p className="text-sm text-red-600">
                          Insufficient credits. Contribute data to earn more credits.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 space-y-3 max-h-[600px] overflow-y-auto">
                      {getPatientHistories(selectedPatient.id).length === 0 ? (
                        <p className="text-slate-500 text-center py-8">No history entries found</p>
                      ) : (
                        getPatientHistories(selectedPatient.id).map((history) => (
                          <div
                            key={history.id}
                            className="border border-slate-200 rounded-lg overflow-hidden"
                          >
                            {/* History Header */}
                            <button
                              onClick={() => toggleHistoryExpansion(history.id)}
                              className="w-full p-4 bg-white hover:bg-slate-50 transition-colors flex items-start justify-between"
                            >
                              <div className="flex-1 text-left">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-slate-900">{history.condition}</h4>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    history.status === 'Resolved'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : history.status === 'Ongoing'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    {history.status}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm text-slate-500">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {history.timelineStart} {history.timelineEnd && `→ ${history.timelineEnd}`}
                                </div>
                              </div>
                              {expandedHistory === history.id ? (
                                <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                              )}
                            </button>

                            {/* Expanded Details */}
                            {expandedHistory === history.id && (
                              <div className="px-4 pb-4 bg-slate-50 border-t border-slate-200 space-y-4">
                                <div>
                                  <div className="flex items-center mb-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                                    <h5 className="text-sm font-semibold text-slate-700">Successful Treatments</h5>
                                  </div>
                                  <div className="pl-6 flex flex-wrap gap-2">
                                    {history.successfulTreatments?.length ? (
                                      history.successfulTreatments.map(t => (
                                        <span key={t} className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-medium">
                                          {t}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-sm text-slate-400 italic">None listed</span>
                                    )}
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex items-center mb-2">
                                    <AlertCircle className="w-4 h-4 text-rose-500 mr-2" />
                                    <h5 className="text-sm font-semibold text-slate-700">Unsuccessful Treatments</h5>
                                  </div>
                                  <div className="pl-6 flex flex-wrap gap-2">
                                    {history.unsuccessfulTreatments?.length ? (
                                      history.unsuccessfulTreatments.map(t => (
                                        <span key={t} className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-200 rounded-full text-xs font-medium">
                                          {t}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-sm text-slate-400 italic">None listed</span>
                                    )}
                                  </div>
                                </div>

                                {history.contraindications?.length > 0 && (
                                  <div>
                                    <div className="flex items-center mb-2">
                                      <AlertCircle className="w-4 h-4 text-amber-500 mr-2" />
                                      <h5 className="text-sm font-semibold text-slate-700">Contraindications</h5>
                                    </div>
                                    <div className="pl-6 flex flex-wrap gap-2">
                                      {history.contraindications.map(c => (
                                        <span key={c} className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-xs font-medium">
                                          {c}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Clinician Notes Field */}
                                <div className="pt-3 border-t border-slate-200">
                                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Clinician Notes (Optional)
                                  </label>
                                  <textarea
                                    value={clinicianNotes[history.id] || ''}
                                    onChange={(e) => handleNoteChange(history.id, e.target.value)}
                                    placeholder="Add your clinical observations, follow-up plans, or additional context..."
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                                    rows={3}
                                  />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200">
                                  <button
                                    onClick={() => setViewingSOAP(history)}
                                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View SOAP Report
                                  </button>
                                  <button
                                    onClick={() => handleDownloadSOAP(history)}
                                    className="flex items-center px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download SOAP
                                  </button>
                                  <label className="flex items-center px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium cursor-pointer">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Notes
                                    <input
                                      type="file"
                                      accept=".txt,.doc,.docx"
                                      onChange={(e) => handleFileUpload(e, history.id)}
                                      className="hidden"
                                    />
                                  </label>
                                </div>

                                <div className="text-xs text-slate-500">
                                  Source: {history.sourceClinicHash}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {!selectedPatient.historyAvailable && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-slate-400" />
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">No History Available</h4>
                  <p className="text-sm text-slate-500">
                    This patient has no treatment history in the network
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      )}

      {/* SOAP Report Modal */}
      {viewingSOAP && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                SOAP Report
              </h3>
              <button
                onClick={() => setViewingSOAP(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 bg-slate-50 p-4 rounded-lg">
                {generateSOAPReport(viewingSOAP)}
              </pre>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setViewingSOAP(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownloadSOAP(viewingSOAP);
                  setViewingSOAP(null);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CONDITION RESULTS — Network-wide search across all histories by keyword
// ============================================================================
interface ConditionResultsProps {
  searchTerm: string;
  patients: Patient[];
  histories: HistoryEntry[];
  unlockedPatients: string[];
  onSelectPatient: (p: Patient) => void;
}

const ConditionResults: React.FC<ConditionResultsProps> = ({
  searchTerm, patients, histories, unlockedPatients, onSelectPatient
}) => {
  const term = searchTerm.trim().toLowerCase();

  const matches = histories.filter(h => {
    if (!term) return true;
    const haystack = [
      h.condition,
      h.status,
      ...(h.successfulTreatments || []),
      ...(h.unsuccessfulTreatments || []),
      ...(h.contraindications || [])
    ].join(' ').toLowerCase();
    return haystack.includes(term);
  });

  const patientById = (id: string) => patients.find(p => p.id === id);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">
          Network Cases <span className="text-slate-400 font-normal">({matches.length})</span>
        </h3>
        {!term && (
          <span className="text-xs text-slate-500">Showing all — type to filter</span>
        )}
      </div>

      {matches.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-medium">No matching cases</p>
          <p className="text-sm mt-1">Try a broader term like "knee", "chronic", or a treatment name.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
          {matches.map(h => {
            const patient = patientById(h.patientId);
            const unlocked = unlockedPatients.includes(h.patientId);
            return (
              <li key={h.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">{h.condition}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        h.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700'
                        : h.status === 'Ongoing' ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                      }`}>{h.status}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500 mb-2">
                      <Clock className="w-3 h-3 mr-1" />
                      {h.timelineStart}{h.timelineEnd ? ` → ${h.timelineEnd}` : ''}
                      <span className="mx-2">•</span>
                      <span className="font-mono">{h.sourceClinicHash}</span>
                    </div>
                    {h.successfulTreatments?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {h.successfulTreatments.slice(0, 4).map(t => (
                          <span key={t} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-xs">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {patient && (
                    <button
                      onClick={() => onSelectPatient(patient)}
                      className="flex-shrink-0 self-start flex items-center px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
                    >
                      {unlocked ? <Eye className="w-3 h-3 mr-1.5" /> : <Lock className="w-3 h-3 mr-1.5" />}
                      Open patient
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};