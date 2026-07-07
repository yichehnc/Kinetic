import React from 'react';
import { Shield, X, Check, Eye, FileText, Users } from 'lucide-react';

interface PrivacyExplainerProps {
  open: boolean;
  onClose: () => void;
}

const Row: React.FC<{ icon: React.ReactNode; title: string; body: string }> = ({ icon, title, body }) => (
  <div className="flex items-start gap-4 py-4 border-b border-line-soft last:border-b-0">
    <div className="w-9 h-9 rounded-lg bg-accent-tint flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-[13px] font-semibold text-ink mb-1">{title}</h4>
      <p className="text-xs text-ink-4 leading-[1.5]">{body}</p>
    </div>
  </div>
);

export const PrivacyExplainer: React.FC<PrivacyExplainerProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50"
      onClick={onClose}
    >
      <div
        className="bg-surface-card border border-line rounded-lg shadow-[0_8px_24px_rgba(0,0,0,.12)] max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface-card border-b border-line-soft px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="text-[13.5px] font-semibold text-ink">How privacy works</h3>
              <p className="text-[11px] text-ink-4">Designed around APP 11 (Australian Privacy Act)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-5 hover:text-ink transition-colors duration-150"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4">
          <Row
            icon={<FileText className="w-4 h-4 text-accent" strokeWidth={1.8} />}
            title="Snapshot-only, never SOAP"
            body="Contributions are structured: condition, body region, rehab stage, treatment categories, contraindications. No subjective notes, no clinician reasoning, no outcomes prose."
          />
          <Row
            icon={<Users className="w-4 h-4 text-accent" strokeWidth={1.8} />}
            title="Clinic-level, not clinician-level"
            body="Records are attributed to the clinic, not the individual physio. Removes the fear of being judged by peers — the core blocker to sharing today."
          />
          <Row
            icon={<Check className="w-4 h-4 text-accent" strokeWidth={1.8} />}
            title="Anonymised before sharing"
            body="Patient identifiers are hashed before any data leaves your clinic. The receiving clinic sees a continuity record, not a person."
          />
          <Row
            icon={<Eye className="w-4 h-4 text-accent" strokeWidth={1.8} />}
            title="Every access is audit-logged"
            body="APP 11 compliance: every read, unlock, and contribution is recorded with timestamp, clinic ID, and patient hash. Visible in the Audit Trail tab on every patient."
          />
        </div>

        <div className="px-6 py-4 bg-surface-sidebar rounded-b-lg border-t border-line-soft">
          <p className="text-[11px] text-ink-4 leading-[1.5]">
            <span className="font-semibold text-ink-2">Why this matters:</span> the system is intentionally narrow. By
            constraining what gets shared, sharing becomes a safe, rational act — not a clinical exposure.
          </p>
        </div>
      </div>
    </div>
  );
};
