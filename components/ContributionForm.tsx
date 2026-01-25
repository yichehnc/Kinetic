import React, { useState, useEffect } from 'react';
import { Check, Info, Plus, X, ArrowRight, RefreshCcw, AlertCircle, Loader2, Save, FileText, ArrowLeft, Tag, Activity, Calendar } from 'lucide-react';
import { Status } from '../types';
import { TREATMENTS_LIST, CONTRAINDICATIONS_LIST } from '../constants';
import { InfoCard } from './ui/cards';

interface ContributionFormProps {
  onSubmit: (data: any) => void;
  onReturn?: () => void;
}

const STORAGE_KEY = 'kinetic_contribution_draft_v2';

const BODY_REGIONS = ['Cervical Spine', 'Thoracic Spine', 'Lumbar Spine', 'Shoulder', 'Elbow', 'Wrist/Hand', 'Hip', 'Knee', 'Ankle/Foot'];
const COMPLAINT_TYPES = ['Pain', 'Stiffness', 'Instability', 'Weakness', 'Post-Operative', 'Mobility Deficit'];
const REHAB_STAGES = ['Acute', 'Sub-Acute', 'Chronic', 'Return to Sport', 'Maintenance'];

export const ContributionForm: React.FC<ContributionFormProps> = ({ onSubmit, onReturn }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const initialFormState = {
    // Step 1: Patient Info
    patientId: '',
    patientName: '',
    dob: '',
    start: '',
    end: '',
    
    // Step 2: Keywords & Structure
    bodyRegion: '',
    complaintType: '',
    rehabStage: '',
    status: Status.ONGOING,
    successful: [] as string[],
    unsuccessful: [] as string[],
    contraindications: [] as string[],

    // Step 3: Optional SOAP (Simplified)
    objectiveFindings: '',
    assessment: '',
    plan: ''
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

  // Auto-save draft
  useEffect(() => {
    if (!isLoaded) return;
    if (step === 4) return; // Don't save on success screen

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

  const toggleArraySelection = (field: 'successful' | 'unsuccessful' | 'contraindications', value: string) => {
    setError(null);
    setFormData(prev => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  // Validation Logic
  const validateStep1 = () => {
    if (!formData.patientId.trim()) return "Patient ID is required.";
    if (!formData.patientName.trim()) return "Patient Name is required.";
    if (!formData.dob) return "Date of Birth is required.";
    return null;
  };

  const validateStep2 = () => {
    if (!formData.bodyRegion) return "Please select a Body Region.";
    if (!formData.complaintType) return "Please select a Complaint Type.";
    if (!formData.rehabStage) return "Please select a Rehab Stage.";
    return null;
  };

  const handleNextStep = () => {
    let validationError = null;
    if (step === 1) validationError = validateStep1();
    if (step === 2) validationError = validateStep2();
    
    if (validationError) {
      setError(validationError);
      window.scrollTo(0, 0);
      return;
    }
    
    setError(null);
    setStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    setError(null);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final check
    const err1 = validateStep1();
    const err2 = validateStep2();

    if (err1 || err2) {
      setError(err1 || err2);
      setStep(err1 ? 1 : 2);
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Construct the composite condition string for the legacy type definition
      const compositeCondition = `${formData.bodyRegion} - ${formData.complaintType}`;
      
      onSubmit({
        ...formData,
        condition: compositeCondition
      });
      
      localStorage.removeItem(STORAGE_KEY);
      setStep(4);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    localStorage.removeItem(STORAGE_KEY);
    setStep(1);
    setError(null);
  };

  // Success Screen
  if (step === 4) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center px-4">
        <div className="bg-emerald-50 rounded-3xl p-8 md:p-12 border border-emerald-100 shadow-sm animate-fade-in-up">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Contribution Verified</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Your structured clinical data has been successfully added to the Kinetic Network.
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

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24">
      {/* Header & Nav */}
      <div className="mb-6">
        <button
          onClick={onReturn}
          className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors border border-slate-300 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Contribute History</h2>
            <p className="text-slate-500 mt-1">Earn points by sharing structured clinical outcomes.</p>
          </div>
          
          <div className="flex items-center space-x-3 text-sm">
             {isSaving && <span className="text-slate-400 flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Saving draft...</span>}
             {!isSaving && lastSaved && <span className="text-slate-400 flex items-center"><Check className="w-3 h-3 mr-1"/> Saved</span>}
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="mb-8 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div className={`flex items-center ${step >= 1 ? 'text-emerald-600' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${step >= 1 ? 'bg-emerald-100' : 'bg-slate-100'}`}>1</div>
          <span className="hidden sm:inline font-medium">Patient Info</span>
        </div>
        <div className="h-0.5 w-12 bg-slate-200"></div>
        <div className={`flex items-center ${step >= 2 ? 'text-emerald-600' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${step >= 2 ? 'bg-emerald-100' : 'bg-slate-100'}`}>2</div>
          <span className="hidden sm:inline font-medium">Key Data</span>
        </div>
        <div className="h-0.5 w-12 bg-slate-200"></div>
        <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${step >= 3 ? 'bg-blue-100' : 'bg-slate-100'}`}>3</div>
          <span className="hidden sm:inline font-medium">Notes (Optional)</span>
        </div>
      </div>

      {error && (
        <InfoCard 
          type="error" 
          title="Validation Error" 
          message={error} 
          onDismiss={() => setError(null)} 
        />
      )}

      {/* Form Steps */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Step 1: Demographics */}
        {step === 1 && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center mb-4">
              <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Patient Identification</h3>
                <p className="text-sm text-slate-500">Basic demographic information required for record linkage.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Patient ID <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. PT-8821"
                  value={formData.patientId}
                  onChange={e => handleInputChange('patientId', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Jane Doe"
                  value={formData.patientName}
                  onChange={e => handleInputChange('patientName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Date of Birth <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.dob}
                  onChange={e => handleInputChange('dob', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Treatment Start Date</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.start}
                  onChange={e => handleInputChange('start', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Keywords */}
        {step === 2 && (
          <div className="p-6 md:p-8 space-y-8">
            <div className="flex items-center mb-4">
              <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                <Tag className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Clinical Classification</h3>
                <p className="text-sm text-slate-500">Select structured keywords to categorize the case.</p>
              </div>
            </div>

            {/* Keyword Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Body Region <span className="text-red-500">*</span></label>
                <div className="space-y-2">
                  {BODY_REGIONS.map(region => (
                    <button
                      key={region}
                      type="button"
                      onClick={() => handleInputChange('bodyRegion', region)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm border transition-all ${
                        formData.bodyRegion === region 
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-medium shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Complaint Type <span className="text-red-500">*</span></label>
                <div className="space-y-2">
                  {COMPLAINT_TYPES.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleInputChange('complaintType', type)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm border transition-all ${
                        formData.complaintType === type 
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-medium shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Rehab Stage <span className="text-red-500">*</span></label>
                <div className="space-y-2">
                  {REHAB_STAGES.map(stage => (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => handleInputChange('rehabStage', stage)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm border transition-all ${
                        formData.rehabStage === stage 
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-medium shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Treatments & Outcome */}
            <div className="pt-6 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center">
                     <Check className="w-4 h-4 text-emerald-500 mr-2" />
                     Effective Interventions
                   </label>
                   <div className="flex flex-wrap gap-2">
                     {TREATMENTS_LIST.map(t => (
                       <button
                         key={t}
                         type="button"
                         onClick={() => toggleArraySelection('successful', t)}
                         className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                           formData.successful.includes(t)
                             ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                             : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                         }`}
                       >
                         {t}
                       </button>
                     ))}
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center">
                     <X className="w-4 h-4 text-rose-500 mr-2" />
                     Ineffective Interventions
                   </label>
                   <div className="flex flex-wrap gap-2">
                     {TREATMENTS_LIST.map(t => (
                       <button
                         key={t}
                         type="button"
                         onClick={() => toggleArraySelection('unsuccessful', t)}
                         className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                           formData.unsuccessful.includes(t)
                             ? 'bg-rose-100 border-rose-500 text-rose-800'
                             : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                         }`}
                       >
                         {t}
                       </button>
                     ))}
                   </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
               <label className="block text-sm font-semibold text-slate-700 mb-3">Current Status</label>
               <div className="flex space-x-4">
                  {Object.values(Status).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleInputChange('status', s)}
                      className={`flex-1 py-2 px-4 rounded-lg border text-sm font-semibold transition-all ${
                        formData.status === s
                          ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        )}

        {/* Step 3: Optional Notes */}
        {step === 3 && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center mb-2">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">SOAP Notes <span className="text-slate-400 font-normal ml-2">(Optional)</span></h3>
                <p className="text-sm text-slate-500">Provide detailed findings if available. You can skip this step.</p>
              </div>
            </div>

            <InfoCard 
              type="info" 
              title="Optional Step" 
              message="You can submit the form now if you don't have detailed notes to add." 
            />

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Objective Findings</label>
                <textarea
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[120px]"
                  placeholder="ROM, strength, special tests, functional assessments..."
                  value={formData.objectiveFindings}
                  onChange={e => handleInputChange('objectiveFindings', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Assessment / Analysis</label>
                <textarea
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[100px]"
                  placeholder="Clinical impression, diagnosis, prognosis..."
                  value={formData.assessment}
                  onChange={e => handleInputChange('assessment', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Plan of Care</label>
                <textarea
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[100px]"
                  placeholder="Treatment frequency, interventions, home program..."
                  value={formData.plan}
                  onChange={e => handleInputChange('plan', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center sticky bottom-0 z-10">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="text-slate-600 font-medium hover:text-slate-900 px-4 py-2"
            >
              Back
            </button>
          ) : (
            <div></div> // Spacer
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center shadow-lg shadow-slate-200"
            >
              Next Step <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex items-center space-x-2 px-8 py-2.5 rounded-lg font-semibold text-white transition-all shadow-lg ${
                isSubmitting 
                  ? 'bg-emerald-400 cursor-wait' 
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              }`}
            >
              {isSubmitting ? (
                <>
                   <Loader2 className="w-5 h-5 animate-spin" />
                   <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Submit Contribution</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};