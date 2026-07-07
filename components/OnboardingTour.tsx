import React, { useState } from 'react';
import { Award, Upload, Unlock, ArrowRight, X } from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
}

const STEPS = [
  {
    icon: <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-brand font-bold text-xl">K</span>
          </div>,
    label: 'Welcome',
    title: "Patient history shouldn't start from scratch",
    body: 'Patients move between physio clinics, but their treatment history rarely follows. Kinetic fixes this with a credit-based exchange.',
    cta: 'How it works',
  },
  {
    icon: <div className="w-12 h-12 bg-accent-tint rounded-lg flex items-center justify-center">
            <Upload className="w-5 h-5 text-accent" strokeWidth={1.8} />
          </div>,
    label: 'Contribute',
    title: 'Contribute history, earn credits',
    body: 'Submit anonymised treatment snapshots for patients you have seen. Each contribution earns 1 credit. No names or identifiers ever leave your clinic.',
    cta: 'Next',
  },
  {
    icon: <div className="w-12 h-12 bg-accent-tint rounded-lg flex items-center justify-center">
            <Unlock className="w-5 h-5 text-accent" strokeWidth={1.8} />
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
        className="absolute inset-0 bg-ink/50"
        onClick={onComplete}
        aria-hidden="true"
      />

      {/* Card — fixed height so size doesn't shift between steps */}
      <div className="relative bg-surface-card border border-line rounded-lg shadow-[0_8px_24px_rgba(0,0,0,.12)] w-full max-w-md p-7 flex flex-col gap-5" style={{ minHeight: '400px' }}>

        {/* Skip */}
        <button
          onClick={onComplete}
          aria-label="Skip tour"
          className="absolute top-4 right-4 text-ink-5 hover:text-ink transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-2" role="tablist" aria-label="Tour progress">
          {STEPS.map((s, i) => (
            <div
              key={i}
              role="tab"
              aria-selected={i === step}
              aria-label={`Step ${i + 1}: ${s.label}`}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-accent' : i < step ? 'w-4 bg-accent-soft' : 'w-4 bg-line-soft'
              }`}
            />
          ))}
        </div>

        {/* Icon + text — flex-1 so they fill available space consistently */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="motion-safe:animate-page-in">
            {current.icon}
          </div>

          <div className="text-center space-y-2">
            <p className="text-[11px] font-[550] text-accent-text">{current.label}</p>
            <h2 className="text-[15px] font-semibold text-ink leading-snug">{current.title}</h2>
            <p className="text-xs text-ink-4 leading-[1.5]">{current.body}</p>
          </div>

          {isLast && (
            <div className="w-full flex items-center gap-3 bg-positive-tint border border-positive/20 rounded-lg px-4 py-3 mt-1">
              <Award className="w-4 h-4 text-positive-text flex-shrink-0" strokeWidth={1.8} />
              <p className="text-xs text-positive-deep">Opt in to get <strong className="font-semibold">5 free trial credits</strong> — unlock 5 patients straight away.</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          {step > 0 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="text-xs text-ink-4 hover:text-ink transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              Back
            </button>
          ) : (
            <span />
          )}

          <button
            onClick={isLast ? onComplete : () => setStep(s => s + 1)}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-[12.5px] font-medium px-4 py-2 rounded-md transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            {current.cta}
            {!isLast && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
