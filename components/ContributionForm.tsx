import React, { useState, useEffect } from 'react';
import { Check, Plus, ArrowRight, RefreshCcw, Loader2, Save, FileText, Info, X } from 'lucide-react';
import { Status } from '../types';
import { TREATMENTS_LIST, CONTRAINDICATIONS_LIST } from '../constants';
import { InfoCard } from './ui/cards';

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
  
  const initialFormState = {
    patientId: '',
    condition: '',
    status: Status.ONGOING,
    start: '',
    end: '',
    successful: [] as string[],
    unsuccessful: [] as string[],
    contraindications: [] as string[]
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
    if (step === 3) return; // Don't save when on success screen

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

  const toggleSelection = (field: 'successful' | 'unsuccessful' | 'contraindications', value: string) => {
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

  const validateStep1 = () => {
    if (!formData.patientId.trim()) return "Patient ID is required.";
    if (!formData.condition.trim()) return "Primary Condition is required.";
    if (!formData.start) return "Treatment Start Date is required.";
    return null;
  };

  const handleNextStep = () => {
    const validationError = validateStep1();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateStep1();
    if (validationError) {
      setStep(1);
      setError(validationError);
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

      // Submit to parent (this will trigger the parent's notification)
      onSubmit(formData);
      
      // Clear draft
      localStorage.removeItem(STORAGE_KEY);
      
      // Navigate to success screen (step 3)
      setStep(3);
      
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

  // SUCCESS SCREEN (Step 3)
  if (step === 3) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <div className="bg-emerald-50 rounded-3xl p-12 border border-emerald-100 shadow-sm animate-fade-in">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Contribution Verified</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Thank you for improving the network. Your data has been structured and anonymized.
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

  // FORM SCREENS (Step 1 & 2)
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Contribute Patient History</h2>
          <p className="text-slate-500 mt-2">
            Earn 1 Kinetic Point by sharing structured outcome data.
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
        <div className="h-2 bg-slate-100 flex">
          <div className={`h-full bg-emerald-500 transition-all duration-500 ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
        </div>

        {error && (
          <div className="p-4">
             <InfoCard type="error" title="Validation Error" message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        <div className="p-8 space-y-8">
          {step === 1 && (
            <div className="space-y-6">
              <InfoCard 
                type="info" 
                title="Strictly Structured Data Only" 
                message="To ensure privacy and utility, free-text notes are disabled." 
              />

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Patient ID / Reference</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. P-10293"
                    value={formData.patientId}
                    onChange={e => handleInputChange('patientId', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Primary Condition</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. Achilles Tendinopathy"
                    value={formData.condition}
                    onChange={e => handleInputChange('condition', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Outcome Status</label>
                <div className="flex space-x-4">
                  {Object.values(Status).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleInputChange('status', s)}
                      className={`flex-1 py-3 px-4 rounded-lg border text-sm font-semibold transition-all ${
                        formData.status === s
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Treatment Start</label>
                  <input 
                    type="date" 
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.start}
                    onChange={e => handleInputChange('start', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Treatment End (Optional)</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.end}
                    onChange={e => handleInputChange('end', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                  <Check className="w-4 h-4 text-emerald-500 mr-2" />
                  What Worked? (Successful Interventions)
                </label>
                <div className="flex flex-wrap gap-2">
                  {TREATMENTS_LIST.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleSelection('successful', t)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
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
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                  <X className="w-4 h-4 text-rose-500 mr-2" />
                  What Didn't Work? (Unsuccessful Interventions)
                </label>
                <div className="flex flex-wrap gap-2">
                  {TREATMENTS_LIST.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleSelection('unsuccessful', t)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
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

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <label className="block text-sm font-bold text-amber-800 mb-2 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Safety & Contraindications
                </label>
                <p className="text-xs text-amber-700 mb-3">
                   Select any specific red flags or treatments that should be avoided.
                </p>
                <div className="flex flex-wrap gap-2">
                  {CONTRAINDICATIONS_LIST.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleSelection('contraindications', c)}
                      className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide border transition-colors ${
                        formData.contraindications.includes(c)
                          ? 'bg-amber-600 border-amber-700 text-white shadow-sm'
                          : 'bg-white border-amber-200 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-slate-600 font-medium hover:text-slate-900"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}

          {step === 1 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="bg-slate-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center"
            >
              Next Step <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-semibold text-white transition-all ${
                isSubmitting 
                  ? 'bg-emerald-400 cursor-wait' 
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg'
              }`}
            >
              {isSubmitting ? (
                <>
                   <RefreshCcw className="w-5 h-5 animate-spin" />
                   <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Submit & Earn Points</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};