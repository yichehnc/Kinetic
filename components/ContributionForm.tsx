import React, { useState, useEffect, useMemo, Component, type ErrorInfo, type ReactNode } from 'react';
import { Check, Plus, X, ArrowRight, Loader2, FileText, ArrowLeft, Tag, Upload, Wand2 } from 'lucide-react';
import { Status } from '../types';
import { TREATMENTS_LIST, CONTRAINDICATIONS_LIST } from '../constants';
import { InfoCard } from './ui/cards';
import { Tooltip } from './ui/tooltip';
import {
  validateStep1,
  validateStep2,
  isStepValid,
  buildCompositeCondition,
  parseDraft,
  type FieldError,
} from '../lib/contributionValidation';

interface ContributionFormProps {
  onSubmit: (data: any) => void;
  onReturn?: () => void;
}

// Local ErrorBoundary — prevents a render error in the form from blanking the page.
type EBProps = { onReturn?: () => void; children: ReactNode };
type EBState = { hasError: boolean; message: string };

class ContributionErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }
  static getDerivedStateFromError(err: Error): EBState {
    return { hasError: true, message: err.message || 'Unexpected error' };
  }
  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error('ContributionForm crashed', err, info);
  }
  reset = () => this.setState({ hasError: false, message: '' });
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="max-w-2xl mx-auto mt-12 px-4">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-rose-600 text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Something broke on this page</h2>
          <p className="text-slate-600 mb-2">The Contribute form ran into an unexpected error. Your last saved draft is still safe.</p>
          <p className="text-xs text-slate-400 mb-6 font-mono">{this.state.message}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.reset}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
            >
              Reload the form
            </button>
            {this.props.onReturn && (
              <button
                onClick={this.props.onReturn}
                className="px-5 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Back to dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

const STORAGE_KEY = 'kinetic_contribution_draft_v2';

const BODY_REGIONS = ['Cervical Spine', 'Thoracic Spine', 'Lumbar Spine', 'Shoulder', 'Elbow', 'Wrist/Hand', 'Hip', 'Knee', 'Ankle/Foot'];
const COMPLAINT_TYPES = ['Pain', 'Stiffness', 'Instability', 'Weakness', 'Post-Operative', 'Mobility Deficit'];
const REHAB_STAGES = ['Acute', 'Sub-Acute', 'Chronic', 'Return to Sport', 'Maintenance'];

// Validation copy & functions live in lib/contributionValidation.ts

// AI Import CTA — demo-only. Triggers a fake "parsing" state, then prefills the
// parent form with believable mock data so the recruiter sees the AI value prop end-to-end.
interface AIImportCTAProps {
  onPrefill: () => void;
  onReset: () => void;
}

const AIImportCTA: React.FC<AIImportCTAProps> = ({ onPrefill, onReset }) => {
  const [state, setState] = useState<'idle' | 'parsing' | 'done'>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [fileError, setFileError] = useState<string | null>(null);

  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
  ];
  const MAX_SIZE_MB = 25;

  const handleFile = (file: File | null) => {
    if (!file) return;
    setFileError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Unsupported file type. Please upload a PDF, DOCX, or image.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File is too large (max ${MAX_SIZE_MB} MB).`);
      return;
    }

    setFileName(file.name);
    setState('parsing');
    // Demo only — fake the AI extraction delay, then prefill the form.
    setTimeout(() => {
      setState('done');
      onPrefill();
    }, 1800);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0] ?? null);
  };

  const reset = () => {
    setState('idle');
    setFileName(null);
    if (inputRef.current) inputRef.current.value = '';
    onReset();
  };

  return (
    <div
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
      className="relative rounded-2xl border-2 border-dashed border-violet-300 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-5 md:p-6 transition-colors hover:border-violet-400"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="bg-white p-2 rounded-lg shadow-sm border border-violet-100 shrink-0">
            <Wand2 className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">Import from medical report</h4>
              <Tooltip
                content="Powered by Kinetic AI — extracts structured fields from referrals and reports"
                side="bottom"
                className="hidden sm:inline-block"
              >
                <span
                  tabIndex={0}
                  aria-label="Powered by Kinetic AI"
                  className="text-[10px] font-bold uppercase tracking-wide bg-violet-600 text-white px-2 py-0.5 rounded-full sm:cursor-help outline-none sm:focus:ring-2 sm:focus:ring-violet-400 sm:focus:ring-offset-1"
                >
                  AI
                </span>
              </Tooltip>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-md">
              Upload a PDF, DOCX, or scanned referral. Kinetic AI extracts patient details, body region, and treatment history — you review and submit.
            </p>
          </div>
        </div>

        <div className="shrink-0">
          {state === 'idle' && (
            <>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-violet-700 transition-colors shadow-sm shadow-violet-200"
              >
                <Upload className="w-4 h-4" />
                Upload report
              </button>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                className="hidden"
                onChange={e => handleFile(e.target.files?.[0] ?? null)}
              />
            </>
          )}

          {state === 'parsing' && (
            <div className="inline-flex items-center gap-2 bg-white border border-violet-200 px-4 py-2.5 rounded-lg text-sm font-medium text-violet-700">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Extracting from {fileName}…</span>
            </div>
          )}

          {state === 'done' && (
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-lg text-sm font-semibold text-emerald-700">
                <Check className="w-4 h-4" />
                <span>Fields prefilled — review below</span>
              </div>
              <button
                type="button"
                onClick={reset}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Undo
              </button>
            </div>
          )}
        </div>
      </div>

      {fileError && (
        <p className="mt-3 text-xs text-rose-600 flex items-start gap-1">
          <X className="w-3 h-3 mt-0.5 shrink-0" />
          <span>{fileError}</span>
        </p>
      )}
      <p className="text-[11px] text-slate-400 mt-3">
        Or drag a file onto this card. Supports PDF, DOC, DOCX, and image scans up to {MAX_SIZE_MB} MB.
      </p>
    </div>
  );
};

const ContributionFormInner: React.FC<ContributionFormProps> = ({ onSubmit, onReturn }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draftRecovered, setDraftRecovered] = useState(false);
  const [draftCorrupt, setDraftCorrupt] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [stepDirection, setStepDirection] = useState<'forward' | 'backward'>('forward');
  const [animKey, setAnimKey] = useState(0);

  /** Scroll to top, honoring prefers-reduced-motion. */
  const scrollToTop = () => {
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  };

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
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [aiPrefilled, setAiPrefilled] = useState(false);

  // Mock AI extraction payload — believable values for the demo walkthrough.
  // Patient is intentionally NOT in MOCK_PATIENTS so it looks like a fresh extract.
  const AI_DEMO_PREFILL = {
    patientId: '6748 21503 1',
    patientName: 'Daniel Reyes',
    dob: '1989-07-22',
    start: '2026-04-12',
    bodyRegion: 'Lumbar Spine',
    complaintType: 'Pain',
    rehabStage: 'Sub-Acute',
    status: Status.ONGOING,
    successful: ['Manual Therapy', 'Exercise Rehab'],
    unsuccessful: ['Ultrasound'],
    contraindications: [] as string[],
  };

  const handleAIPrefill = () => {
    setFormData(prev => ({ ...prev, ...AI_DEMO_PREFILL }));
    // Mark every required field as touched so any subsequent edit shows errors immediately
    setTouched({
      patientId: true,
      patientName: true,
      dob: true,
      bodyRegion: true,
      complaintType: true,
      rehabStage: true,
    });
    setAiPrefilled(true);
    setError(null);
  };

  const handleAIReset = () => {
    setFormData(initialFormState);
    setTouched({});
    setAiPrefilled(false);
  };

  // Load draft on mount — handle blocked localStorage and corrupt JSON gracefully
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = parseDraft(savedData);
        if (parsed) {
          // Sanitize untrusted fields. status must be a known Status enum value;
          // anything else falls back to ONGOING.
          const validStatuses = Object.values(Status) as string[];
          const safeStatus =
            parsed.status && validStatuses.includes(parsed.status)
              ? (parsed.status as Status)
              : Status.ONGOING;
          setFormData(prev => ({
            ...prev,
            ...parsed,
            status: safeStatus,
            successful: Array.isArray(parsed.successful) ? parsed.successful : [],
            unsuccessful: Array.isArray(parsed.unsuccessful) ? parsed.unsuccessful : [],
            contraindications: Array.isArray(parsed.contraindications) ? parsed.contraindications : [],
          }));
          // KIN-207: mark all required fields touched so subsequent edits show
          // inline errors immediately instead of waiting for blur.
          setTouched({
            patientId: true,
            patientName: true,
            dob: true,
            bodyRegion: true,
            complaintType: true,
            rehabStage: true,
          });
          setLastSaved(new Date());
          setDraftRecovered(true);
        } else {
          // parseDraft returned null — corrupt or invalid shape
          console.error("Draft was corrupt, starting fresh");
          setDraftCorrupt(true);
          try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
        }
      }
    } catch (storageErr) {
      // localStorage blocked (private browsing, disabled cookies, etc.)
      console.warn("localStorage unavailable, drafts will not persist", storageErr);
      setStorageBlocked(true);
    }
    setIsLoaded(true);
  }, []);

  // Auto-save draft — tolerate quota / disabled storage
  useEffect(() => {
    if (!isLoaded) return;
    if (step === 3) return; // Don't save on success screen
    if (storageBlocked) return; // Don't keep retrying if storage is unavailable

    setIsSaving(true);
    const handler = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        setLastSaved(new Date());
      } catch (e) {
        // QuotaExceededError or storage disabled mid-session
        console.warn("Could not save draft", e);
        setStorageBlocked(true);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(handler);
  }, [formData, isLoaded, step, storageBlocked]);

  const handleInputChange = (field: string, value: any) => {
    setError(null);
    setTouched(prev => ({ ...prev, [field]: true }));
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

  // Per-field validation — pure functions in lib/contributionValidation.ts
  const step1Errors: FieldError[] = useMemo(
    () => validateStep1(formData),
    [formData.patientId, formData.patientName, formData.dob]
  );

  const step2Errors: FieldError[] = useMemo(
    () => validateStep2(formData),
    [formData.bodyRegion, formData.complaintType, formData.rehabStage]
  );

  const isStep1Valid = isStepValid(step1Errors);
  const isStep2Valid = isStepValid(step2Errors);
  const currentStepValid = step === 1 ? isStep1Valid : isStep2Valid;

  const errorFor = (field: string): string | null => {
    const list = step === 1 ? step1Errors : step2Errors;
    const entry = list.find(e => e.field === field);
    if (!entry) return null;
    if (showAllErrors || touched[field]) return entry.message;
    return null;
  };

  const fieldRing = (field: string) =>
    errorFor(field)
      ? 'border-rose-400 focus:ring-rose-400'
      : 'border-slate-300 focus:ring-emerald-500';

  const handleNextStep = () => {
    if (!currentStepValid) {
      setShowAllErrors(true);
      setError("A couple of fields still need your attention before we can continue.");
      scrollToTop();
      return;
    }

    setError(null);
    setShowAllErrors(false);
    setStepDirection('forward');
    setAnimKey(k => k + 1);
    setStep(prev => prev + 1);
    scrollToTop();
  };

  const handleBack = () => {
    setStepDirection('backward');
    setAnimKey(k => k + 1);
    setStep(prev => prev - 1);
    setError(null);
    setShowAllErrors(false);
    scrollToTop();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!isStep1Valid || !isStep2Valid) {
      setShowAllErrors(true);
      setError("A couple of fields still need your attention before submitting.");
      setStep(!isStep1Valid ? 1 : 2);
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // onSubmit may throw — let it bubble into our catch
      onSubmit({
        ...formData,
        condition: buildCompositeCondition(formData)
      });

      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      setStepDirection('forward');
      setAnimKey(k => k + 1);
      setStep(3);
    } catch (err: any) {
      const message =
        err?.message ||
        (typeof err === 'string' ? err : null) ||
        "Something went wrong on our end. Your work is safe — please try submitting again.";
      setSubmitError(message);
      scrollToTop();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setTouched({});
    setShowAllErrors(false);
    localStorage.removeItem(STORAGE_KEY);
    setStepDirection('backward');
    setAnimKey(k => k + 1);
    setStep(1);
    setError(null);
  };

  // Inline error helper component
  const FieldHelp: React.FC<{ field: string }> = ({ field }) => {
    const msg = errorFor(field);
    if (!msg) return null;
    return (
      <p className="mt-1.5 text-xs text-rose-600 flex items-start gap-1">
        <X className="w-3 h-3 mt-0.5 shrink-0" />
        <span>{msg}</span>
      </p>
    );
  };

  // Success Screen
  if (step === 3) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center px-4">
        <div className="bg-emerald-50 rounded-3xl p-8 md:p-12 border border-emerald-100 shadow-sm motion-safe:animate-fade-in-up relative overflow-hidden">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-emerald-50 motion-safe:animate-[scaleIn_0.4s_ease-out]">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Contribution verified</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Your structured snapshot is now part of the Kinetic Network. Other clinicians treating this patient will see continuity-of-care data. Never your name or notes.
          </p>

          <div
            className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-xl border border-emerald-200 shadow-sm mb-8 motion-safe:animate-[creditPop_0.6s_ease-out_0.2s_both]"
          >
            <span className="text-sm font-medium text-slate-500">Reward earned:</span>
            <span className="text-lg font-bold text-emerald-600">+1 Credit</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Contribute another
            </button>
            {onReturn && (
              <button
                onClick={onReturn}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 transition-all"
              >
                <FileText className="w-4 h-4 mr-2" />
                Return to intake
              </button>
            )}
          </div>
        </div>

        {/* Local keyframes for the success animations */}
        <style>{`
          @keyframes scaleIn { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
          @keyframes creditPop {
            0% { transform: translateY(8px) scale(0.95); opacity: 0; }
            60% { transform: translateY(-2px) scale(1.04); opacity: 1; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  const transitionClass =
    stepDirection === 'forward'
      ? 'motion-safe:animate-[stepInRight_0.28s_ease-out]'
      : 'motion-safe:animate-[stepInLeft_0.28s_ease-out]';

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
            <h2 className="text-2xl font-bold text-slate-900">Contribute history</h2>
            <p className="text-slate-500 mt-1">Earn 1 Credit by sharing a structured clinical outcome.</p>
          </div>

          <div className="flex items-center space-x-3 text-sm">
             {isSaving && <span className="text-slate-400 flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Saving draft…</span>}
             {!isSaving && lastSaved && <span className="text-slate-400 flex items-center"><Check className="w-3 h-3 mr-1"/> Draft saved</span>}
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="mb-8 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div className={`flex items-center transition-colors ${step >= 1 ? 'text-emerald-600' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 transition-colors ${step >= 1 ? 'bg-emerald-100' : 'bg-slate-100'}`}>1</div>
          <span className="hidden sm:inline font-medium">Patient info</span>
        </div>
        <div className={`h-0.5 w-12 transition-colors ${step >= 2 ? 'bg-emerald-300' : 'bg-slate-200'}`}></div>
        <div className={`flex items-center transition-colors ${step >= 2 ? 'text-emerald-600' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 transition-colors ${step >= 2 ? 'bg-emerald-100' : 'bg-slate-100'}`}>2</div>
          <span className="hidden sm:inline font-medium">Snapshot data</span>
        </div>
      </div>

      {/* Submit failure — most prominent, with a retry CTA */}
      {submitError && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-4 flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5 text-rose-600 font-bold text-lg leading-none">!</div>
          <div className="flex-1">
            <h4 className="font-semibold text-rose-900 mb-1 text-sm">Couldn't submit your contribution</h4>
            <p className="text-sm text-rose-900 opacity-80 mb-3">{submitError}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Try again
              </button>
              <button
                type="button"
                onClick={() => setSubmitError(null)}
                className="text-xs font-medium text-rose-700 hover:text-rose-900 px-3 py-1.5"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draft recovery notice — friendly, dismissible */}
      {draftRecovered && (
        <InfoCard
          type="info"
          title="Draft restored"
          message="We found a saved draft from your last session and brought it back. Pick up where you left off."
          onDismiss={() => setDraftRecovered(false)}
        />
      )}

      {/* Corrupt draft notice */}
      {draftCorrupt && (
        <InfoCard
          type="warning"
          title="Couldn't restore your draft"
          message="Your saved draft was unreadable, so we cleared it. You can start fresh — sorry about that."
          onDismiss={() => setDraftCorrupt(false)}
        />
      )}

      {/* Storage unavailable notice */}
      {storageBlocked && (
        <InfoCard
          type="warning"
          title="Drafts won't be saved"
          message="Browser storage is blocked or full. Your form will work, but progress won't persist if you reload — submit before closing the tab."
          onDismiss={() => setStorageBlocked(false)}
        />
      )}

      {error && (
        <InfoCard
          type="error"
          title="Almost there"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Form Steps */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">

        {/* Step 1: Demographics */}
        {step === 1 && (
          <div key={animKey} className={`p-6 md:p-8 space-y-6 ${transitionClass}`}>
            <div className="flex items-center mb-4">
              <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Patient identification</h3>
                <p className="text-sm text-slate-500">Basic demographic information required for record linkage.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Patient ID (Medicare No.) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-colors ${fieldRing('patientId')}`}
                  placeholder="e.g. 1234 56789 1"
                  value={formData.patientId}
                  onChange={e => handleInputChange('patientId', e.target.value)}
                  onBlur={() => setTouched(p => ({ ...p, patientId: true }))}
                  aria-invalid={!!errorFor('patientId')}
                />
                <FieldHelp field="patientId" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-colors ${fieldRing('patientName')}`}
                  placeholder="e.g. Jane Doe"
                  value={formData.patientName}
                  onChange={e => handleInputChange('patientName', e.target.value)}
                  onBlur={() => setTouched(p => ({ ...p, patientName: true }))}
                  aria-invalid={!!errorFor('patientName')}
                />
                <FieldHelp field="patientName" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Date of birth <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-colors ${fieldRing('dob')}`}
                  value={formData.dob}
                  onChange={e => handleInputChange('dob', e.target.value)}
                  onBlur={() => setTouched(p => ({ ...p, dob: true }))}
                  aria-invalid={!!errorFor('dob')}
                />
                <FieldHelp field="dob" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Treatment start date <span className="text-slate-400 font-normal">(optional)</span></label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                  value={formData.start}
                  onChange={e => handleInputChange('start', e.target.value)}
                />
              </div>
            </div>

            {/* AI Import CTA — below the manual fields */}
            <AIImportCTA onPrefill={handleAIPrefill} onReset={handleAIReset} />

            {aiPrefilled && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                <div className="flex-1">
                  <strong className="font-semibold">AI prefilled the form.</strong>{' '}
                  Review the extracted values above and on the next step, edit anything that looks off, then submit.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Keywords */}
        {step === 2 && (
          <div key={animKey} className={`p-6 md:p-8 space-y-8 ${transitionClass}`}>
            <div className="flex items-center mb-4">
              <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                <Tag className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Clinical classification</h3>
                <p className="text-sm text-slate-500">Pick the structured keywords that describe this case.</p>
              </div>
            </div>

            {/* Keyword Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Body region <span className="text-red-500">*</span></label>
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
                <FieldHelp field="bodyRegion" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Complaint type <span className="text-red-500">*</span></label>
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
                <FieldHelp field="complaintType" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Rehab stage <span className="text-red-500">*</span></label>
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
                <FieldHelp field="rehabStage" />
              </div>
            </div>

            {/* Treatments & Outcome */}
            <div className="pt-6 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center">
                     <Check className="w-4 h-4 text-emerald-500 mr-2" />
                     Effective interventions
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
                     Ineffective interventions
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
               <label className="block text-sm font-semibold text-slate-700 mb-3">Current status</label>
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

        {/* Action Bar */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 rounded-b-xl flex justify-between items-center sticky bottom-0 z-10">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="text-slate-600 font-medium hover:text-slate-900 px-4 py-2 transition-colors"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 2 ? (
            <div className="flex flex-col items-end gap-1.5">
              <Tooltip
                content="Fill in the required fields to continue"
                disabled={currentStepValid}
                side="top"
                className="hidden sm:inline-block"
              >
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!currentStepValid}
                  aria-disabled={!currentStepValid}
                  className={`px-5 sm:px-6 py-2.5 rounded-lg font-semibold flex items-center transition-all shadow-lg text-sm sm:text-base ${
                    currentStepValid
                      ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  Next step <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </Tooltip>
              {!currentStepValid && (
                <p className="sm:hidden text-[11px] text-slate-500 text-right max-w-[200px]">
                  Fill in the required fields to continue
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-end gap-1.5">
              <Tooltip
                content="Fill in the required fields to submit"
                disabled={isStep1Valid && isStep2Valid}
                side="top"
                className="hidden sm:inline-block"
              >
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isStep2Valid || !isStep1Valid}
                  aria-disabled={isSubmitting || !isStep2Valid || !isStep1Valid}
                  className={`flex items-center space-x-2 px-6 sm:px-8 py-2.5 rounded-lg font-semibold text-white transition-all shadow-lg text-sm sm:text-base ${
                    isSubmitting
                      ? 'bg-emerald-400 cursor-wait'
                      : (!isStep2Valid || !isStep1Valid)
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                       <Loader2 className="w-5 h-5 animate-spin" />
                       <span>Verifying…</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Submit contribution</span>
                    </>
                  )}
                </button>
              </Tooltip>
              {(!isStep1Valid || !isStep2Valid) && !isSubmitting && (
                <p className="sm:hidden text-[11px] text-slate-500 text-right max-w-[200px]">
                  Fill in the required fields to submit
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Step transition keyframes */}
      <style>{`
        @keyframes stepInRight {
          0% { transform: translateX(16px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes stepInLeft {
          0% { transform: translateX(-16px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// Public export — wraps the form in an ErrorBoundary so render crashes don't blank the page.
export const ContributionForm: React.FC<ContributionFormProps> = (props) => (
  <ContributionErrorBoundary onReturn={props.onReturn}>
    <ContributionFormInner {...props} />
  </ContributionErrorBoundary>
);
