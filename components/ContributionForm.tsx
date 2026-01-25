import React, { useState, useEffect } from 'react';
import { Check, Info, Plus, X, ArrowRight, RefreshCcw, AlertCircle, Loader2, Save, FileText, ArrowLeft } from 'lucide-react';
import { Status } from '../types';

interface ContributionFormProps {
  onSubmit: (data: any) => void;
  onReturn?: () => void;
}

const STORAGE_KEY = 'kinetic_contribution_draft';

export const ContributionForm: React.FC<ContributionFormProps> = ({ onSubmit, onReturn }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Comprehensive form state based on progress note structure
  const initialFormState = {
    // Patient Demographics
    patientId: '',
    patientName: '',
    dob: '',
    
    // Subjective / History of Present Condition
    primaryComplaint: '',
    injuryDescription: '',
    mechanismOfInjury: '',
    symptomProgression: '',
    patientSelfReport: '',
    activityLevel: '',
    disabilityStatus: '',
    socialHistory: '',
    treatmentGoals: '',
    priorTreatmentResponse: '',
    
    // Objective Findings
    posturalObservations: '',
    rangeOfMotion: '',
    strengthTesting: '',
    functionalTests: '',
    specificMeasurements: '',
    vitalSigns: '',
    physicalExamFindings: '',
    investigationResults: '',
    
    // Assessment
    clinicalOpinion: '',
    progressChanges: '',
    factorsAffectingProgress: '',
    referralsNeeded: '',
    treatmentResponse: '',
    patientEducation: '',
    equipmentRequired: '',
    
    // Plan - Charges & Exercises
    interventions: '',
    treatmentFrequency: '',
    exercisesPerformed: '',
    patientEducationProvided: '',
    
    // Timeline
    start: '',
    end: '',
    status: Status.ONGOING
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
        setLastSaved(new Date());
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Auto-save draft (debounced)
  useEffect(() => {
    if (!isLoaded) return;
    if (step === 4) return; // Don't save when on success screen

    setIsSaving(true);
    const handler = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      setLastSaved(new Date());
      setIsSaving(false);
    }, 1000);

    return () => clearTimeout(handler);
  }, [formData, isLoaded, step]);

  const handleInputChange = (field: string, value: any) => {
    setError(null);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Updated validation for required fields
  const validateStep1 = () => {
    if (!formData.patientId.trim()) return "Patient ID is required.";
    if (!formData.patientName.trim()) return "Patient Name is required.";
    if (!formData.dob) return "Date of Birth is required.";
    return null;
  };

  const validateStep2 = () => {
    if (!formData.primaryComplaint.trim()) return "Primary Complaint is required.";
    if (!formData.injuryDescription.trim()) return "Detailed injury description is required.";
    return null;
  };

  const validateStep3 = () => {
    if (!formData.clinicalOpinion.trim()) return "Clinical assessment/opinion is required.";
    return null;
  };

  const handleNextStep = () => {
    let validationError = null;
    
    if (step === 1) {
      validationError = validateStep1();
    } else if (step === 2) {
      validationError = validateStep2();
    } else if (step === 3) {
      validationError = validateStep3();
    }
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);
    setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all steps
    const errors = [validateStep1(), validateStep2(), validateStep3()].filter(Boolean);
    if (errors.length > 0) {
      setError(errors[0]!);
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          const isError = Math.random() > 0.98; 
          if (isError) {
            reject(new Error("Network connection timed out. Please try again."));
          } else {
            resolve(true);
          }
        }, 1500);
      });

      // Submit to parent
      onSubmit(formData);
      
      // Clear draft
      localStorage.removeItem(STORAGE_KEY);
      
      // Navigate to success screen
      setStep(4);
      
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    localStorage.removeItem(STORAGE_KEY);
    setStep(1);
    setLastSaved(null);
    setError(null);
  };

  // SUCCESS SCREEN (Step 4)
  if (step === 4) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center px-4">
        <div className="bg-emerald-50 rounded-3xl p-8 md:p-12 border border-emerald-100 shadow-sm">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Contribution Verified</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Thank you for improving the network. Your progress note has been structured and anonymized.
          </p>
          
          <div className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-xl border border-emerald-200 shadow-sm mb-8">
            <span className="text-sm font-medium text-slate-500">Reward Earned:</span>
            <span className="text-lg font-bold text-emerald-600">+1 Kinetic Point</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleReset}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Contribute Another
            </button>
            {onReturn && (
              <button 
                onClick={onReturn}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 transition-all"
              >
                <FileText className="w-4 h-4 mr-2" />
                Return to Intake
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // FORM SCREENS
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-0">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={onReturn}
          className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors border border-slate-300"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Back to Patient Search</span>
        </button>
      </div>

      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Contribute Progress Note</h2>
          <p className="text-slate-500 mt-2">
            Structured SOAP documentation - Earn 1 Kinetic Point
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
           {isSaving ? (
              <div className="flex items-center text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                Saving...
              </div>
           ) : lastSaved ? (
              <div className="flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                <Save className="w-3 h-3 mr-1.5 text-slate-400" />
                Draft saved
              </div>
           ) : null}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 bg-slate-100 flex">
          <div className={`h-full bg-emerald-500 transition-all duration-500 ${
            step === 1 ? 'w-1/4' : step === 2 ? 'w-1/2' : step === 3 ? 'w-3/4' : 'w-full'
          }`}></div>
        </div>

        {error && (
          <div className="bg-rose-50 border-b border-rose-100 p-4 flex items-center text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="font-medium">{error}</span>
            <button 
              type="button" 
              onClick={() => setError(null)}
              className="ml-auto text-rose-500 hover:text-rose-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-6 md:p-8 space-y-8">
          {/* STEP 1: Patient Demographics */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 flex items-start">
                <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Patient Demographics</strong> - Start by entering basic patient information.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Patient ID <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. P-10293"
                    value={formData.patientId}
                    onChange={e => handleInputChange('patientId', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Patient Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. John Doe"
                    value={formData.patientName}
                    onChange={e => handleInputChange('patientName', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.dob}
                    onChange={e => handleInputChange('dob', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Treatment Start Date <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.start}
                    onChange={e => handleInputChange('start', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Treatment End Date (Optional)
                  </label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.end}
                    onChange={e => handleInputChange('end', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Treatment Status
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.status}
                    onChange={e => handleInputChange('status', e.target.value as Status)}
                  >
                    <option value={Status.ONGOING}>Ongoing</option>
                    <option value={Status.RESOLVED}>Resolved</option>
                    <option value={Status.MANAGED}>Managed</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Subjective & Objective */}
          {step === 2 && (
            <div className="space-y-8">
              {/* SUBJECTIVE SECTION */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center pb-2 border-b-2 border-blue-200">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                    <span className="text-sm font-bold text-blue-600">S</span>
                  </div>
                  Subjective - History of Present Condition
                </h3>
                <p className="text-xs text-slate-500 mb-4 italic">
                  Use full sentences and paragraph format. Do not use bullet points.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Treatment Plan & Interventions
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm"
                      rows={4}
                      placeholder="- Manual therapy to lumbar spine&#10;- Therapeutic exercises: core strengthening&#10;- Frequency: 2x/week for 4 weeks"
                      value={formData.interventions}
                      onChange={e => handleInputChange('interventions', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Exercises Performed
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm"
                      rows={3}
                      placeholder="- Pelvic tilts: 3 sets x 10 reps&#10;- Bird dog: 3 sets x 8 reps each side&#10;- Dead bug: 3 sets x 10 reps"
                      value={formData.exercisesPerformed}
                      onChange={e => handleInputChange('exercisesPerformed', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Patient Education/Counseling Provided
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm"
                      rows={3}
                      placeholder="- Proper lifting mechanics&#10;- Postural awareness during sitting&#10;- Home exercise program compliance"
                      value={formData.patientEducationProvided}
                      onChange={e => handleInputChange('patientEducationProvided', e.target.value)}
                    />
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-sm text-emerald-900 italic">
                      "Patient will continue to benefit from skilled physical therapy to address aforementioned impairments and limitations to return to their activities of choice."
                    </p>
                  </div>
                </div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Primary Complaint <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. Chronic lower back pain"
                      value={formData.primaryComplaint}
                      onChange={e => handleInputChange('primaryComplaint', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Detailed Description of Injury/Problem <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      rows={3}
                      placeholder="Provide a detailed narrative description of the primary injury, problem, or complaint..."
                      value={formData.injuryDescription}
                      onChange={e => handleInputChange('injuryDescription', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Mechanism of Injury (if applicable)
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      rows={2}
                      placeholder="Describe how the injury occurred or how the complaint began..."
                      value={formData.mechanismOfInjury}
                      onChange={e => handleInputChange('mechanismOfInjury', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Symptom Progression
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      rows={2}
                      placeholder="Describe the progression of the complaint and nature of symptoms..."
                      value={formData.symptomProgression}
                      onChange={e => handleInputChange('symptomProgression', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Patient Self-Report
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      rows={3}
                      placeholder="Detailed narrative of the patient's self-report of their current status, symptoms, reason for visit..."
                      value={formData.patientSelfReport}
                      onChange={e => handleInputChange('patientSelfReport', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Activity Level & Social History
                      </label>
                      <textarea
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        rows={2}
                        placeholder="Patient's activity level, disability status, social history..."
                        value={formData.activityLevel}
                        onChange={e => handleInputChange('activityLevel', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Goals & Prior Treatment Response
                      </label>
                      <textarea
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        rows={2}
                        placeholder="Patient goals and response to prior treatment interventions..."
                        value={formData.treatmentGoals}
                        onChange={e => handleInputChange('treatmentGoals', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* OBJECTIVE SECTION */}
              <div className="pt-6 border-t-2 border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center pb-2 border-b-2 border-purple-200">
                  <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center mr-3">
                    <span className="text-sm font-bold text-purple-600">O</span>
                  </div>
                  Objective Findings
                </h3>
                <p className="text-xs text-slate-500 mb-4 italic">
                  Organize by category. Prioritize numerical measurements. Never repeat measures.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Postural Observations
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      rows={2}
                      placeholder="Static postural observations with specific details..."
                      value={formData.posturalObservations}
                      onChange={e => handleInputChange('posturalObservations', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Range of Motion (Numerical)
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      rows={2}
                      placeholder="e.g. Lumbar flexion: 45°, Extension: 15°, Left lateral flexion: 20°..."
                      value={formData.rangeOfMotion}
                      onChange={e => handleInputChange('rangeOfMotion', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Strength Testing
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      rows={2}
                      placeholder="e.g. Hip flexors: 4/5, Quadriceps: 5/5..."
                      value={formData.strengthTesting}
                      onChange={e => handleInputChange('strengthTesting', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Functional Tests & Measurements
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      rows={2}
                      placeholder="Specific tests and assessment findings by therapist..."
                      value={formData.functionalTests}
                      onChange={e => handleInputChange('functionalTests', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Vital Signs (if mentioned)
                      </label>
                      <textarea
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        rows={2}
                        placeholder="BP, HR, etc. (only if explicitly mentioned)"
                        value={formData.vitalSigns}
                        onChange={e => handleInputChange('vitalSigns', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Investigation Results
                      </label>
                      <textarea
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        rows={2}
                        placeholder="Imaging, lab results, etc..."
                        value={formData.investigationResults}
                        onChange={e => handleInputChange('investigationResults', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Assessment & Plan */}
          {step === 3 && (
            <div className="space-y-8">
              {/* ASSESSMENT SECTION */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center pb-2 border-b-2 border-amber-200">
                  <div className="w-8 h-8 bg-amber-100 rounded flex items-center justify-center mr-3">
                    <span className="text-sm font-bold text-amber-600">A</span>
                  </div>
                  Assessment
                </h3>
                <p className="text-xs text-slate-500 mb-4 italic">
                  Use full sentences and paragraph format. No bullet points.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Clinical Opinion <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      rows={3}
                      placeholder="Therapist's professional opinion based on subjective and objective findings..."
                      value={formData.clinicalOpinion}
                      onChange={e => handleInputChange('clinicalOpinion', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Progress & Changes in Measures
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      rows={2}
                      placeholder="Progress or changes in objective or subjective measures..."
                      value={formData.progressChanges}
                      onChange={e => handleInputChange('progressChanges', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Factors Affecting Progress
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      rows={2}
                      placeholder="Factors affecting progress and any need for modification in the plan..."
                      value={formData.factorsAffectingProgress}
                      onChange={e => handleInputChange('factorsAffectingProgress', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Treatment Response & Education
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      rows={2}
                      placeholder="Response to treatment, exercises, and education strategies..."
                      value={formData.treatmentResponse}
                      onChange={e => handleInputChange('treatmentResponse', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* PLAN SECTION */}
              <div className="pt-6 border-t-2 border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center pb-2 border-b-2 border-emerald-200">
                  <div className="w-8 h-8 bg-emerald-100 rounded flex items-center justify-center mr-3">
                    <span className="text-sm font-bold text-emerald-600">P</span>
                  </div>
                  Plan - Charges & Exercises
                </h3>
                <p className="text-xs text-slate-500 mb-4 italic">
                  Use bullet points for exercises and interventions.
                </p>

                <div className="space-y-4">
                  <div>