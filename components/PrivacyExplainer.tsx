import React from 'react';
import { Shield, X, Check, Eye, FileText, Users } from 'lucide-react';

interface PrivacyExplainerProps {
  open: boolean;
  onClose: () => void;
}

const Row: React.FC<{ icon: React.ReactNode; title: string; body: string }> = ({ icon, title, body }) => (
  <div className="flex items-start gap-4 py-4 border-b border-slate-100 last:border-b-0">
    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-sm font-brand font-bold text-slate-900 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{body}</p>
    </div>
  </div>
);

export const PrivacyExplainer: React.FC<PrivacyExplainerProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-brand font-extrabold text-slate-900 tracking-tight">How Privacy Works</h3>
              <p className="text-[11px] text-slate-500">Designed around APP 11 (Australian Privacy Act)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4">
          <Row
            icon={<FileText className="w-5 h-5 text-emerald-600" />}
            title="Snapshot-only, never SOAP"
            body="Contributions are structured: condition, body region, rehab stage, treatment categories, contraindications. No subjective notes, no clinician reasoning, no outcomes prose."
          />
          <Row
            icon={<Users className="w-5 h-5 text-emerald-600" />}
            title="Clinic-level, not clinician-level"
            body="Records are attributed to the clinic, not the individual physio. Removes the fear of being judged by peers — the core blocker to sharing today."
          />
          <Row
            icon={<Check className="w-5 h-5 text-emerald-600" />}
            title="Anonymised before sharing"
            body="Patient identifiers are hashed before any data leaves your clinic. The receiving clinic sees a continuity record, not a person."
          />
          <Row
            icon={<Eye className="w-5 h-5 text-emerald-600" />}
            title="Every access is audit-logged"
            body="APP 11 compliance: every read, unlock, and contribution is recorded with timestamp, clinic ID, and patient hash. Visible in the Audit Trail tab on every patient."
          />
        </div>

        <div className="px-6 py-4 bg-slate-50 rounded-b-2xl border-t border-slate-100">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-700">Why this matters:</span> the system is intentionally narrow. By
            constraining what gets shared, sharing becomes a safe, rational act — not a clinical exposure.
          </p>
        </div>
      </div>
    </div>
  );
};
