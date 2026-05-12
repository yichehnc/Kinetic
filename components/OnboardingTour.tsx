import React, { useState } from 'react';
import { Award, Upload, Unlock, ArrowRight, X } from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
}

const STEPS = [
  {
    icon: <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
            <span className="text-white font-brand font-bold text-3xl">K</span>
          </div>,
    label: 'Welcome',
    title: "Patient history shouldn't start from scratch",
    body: 'Patients move between physio clinics, but their treatment history rarely follows. Kinetic fixes this with a credit-based exchange.',
    cta: 'How it works',
  },
  {
    icon: <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <Upload className="w-8 h-8 text-emerald-600" />
          </div>,
    label: 'Contribute',
    title: 'Contribute history, earn credits',
    body: 'Submit anonymised treatment snapshots for patients you have seen. Each contribution earns 1 credit. No names or identifiers ever leave your clinic.',
    cta: 'Next',
  },
  {
    icon: <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Unlock className="w-8 h-8 text-blue-600" />
          </div>,
    label: 'Unlock',
    title: 'Spend credits to unlock prior care',
    body: 'When a new patient arrives, spend 1 credit to see their full care history across every contributing clinic.',
    cta: 'Get started',
  },
] as const;

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Kinetic Network"
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onComplete}
        aria-hidden="true"
      />

      {/* Card — fixed height so size doesn't shift between steps */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 flex flex-col gap-5" style={{ minHeight: '420px' }}>

        {/* Skip */}
        <button
          onClick={onComplete}
          aria-label="Skip tour"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-2" role="tablist" aria-label="Tour progress">
          {STEPS.map((s, i) => (
            <div
              key={i}
              role="tab"
              aria-selected={i === step}
              aria-label={`Step ${i + 1}: ${s.label}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-emerald-500' : i < step ? 'w-4 bg-emerald-200' : 'w-4 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Icon + text — flex-1 so they fill available space consistently */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="motion-safe:animate-fade-in-up">
            {current.icon}
          </div>

          <div className="text-center space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">{current.label}</p>
            <h2 className="text-xl font-brand font-extrabold text-slate-900 leading-snug">{current.title}</h2>
            <p className="text-sm text-slate-500 leading-relaxed">{current.body}</p>
          </div>

          {isLast && (
            <div className="w-full flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mt-1">
              <Award className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-sm text-emerald-800 font-medium">Opt in to get <strong>5 free trial credits</strong> — unlock 5 patients straight away.</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          {step > 0 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded"
            >
              Back
            </button>
          ) : (
            <span />
          )}

          <button
            onClick={isLast ? onComplete : () => setStep(s => s + 1)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            {current.cta}
            {!isLast && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
