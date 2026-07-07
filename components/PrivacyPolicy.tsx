import React from 'react';
import { Shield, Lock, Eye, UserCheck, FileText, AlertCircle } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="text-xs text-ink-3 hover:text-ink mb-5 inline-flex items-center gap-1 py-1.5 px-1 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      >
        ← Back
      </button>

      <div className="bg-surface-card rounded-lg border border-line p-8 md:p-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-accent-tint rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-ink">Privacy policy</h1>
            <p className="text-xs text-ink-4">Last updated: 12 May 2026 · Version 1.2</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-accent-tint2 border border-accent-line2 rounded-lg text-xs text-accent-deep leading-[1.5]">
          <p className="font-semibold mb-1">Plain-English summary</p>
          <p>We hash patient identifiers before any data leaves your clinic. Contributed records are anonymised and aggregated; nothing personally identifying is ever shared with the network. You own your data and can opt out at any time.</p>
        </div>

        <section className="mt-8 space-y-8 text-[12.5px] text-ink-2 leading-[1.6]">
          <div>
            <h2 className="text-[13.5px] font-semibold text-ink mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-ink-4" strokeWidth={1.8} />
              1. Who we are
            </h2>
            <p>Kinetic Network Pty Ltd ("Kinetic", "we", "us") operates a clinical continuity platform for Australian allied health providers. We are bound by the <em>Privacy Act 1988</em> (Cth) and the Australian Privacy Principles (APPs), and we handle health information in accordance with APP 11 (security of personal information).</p>
          </div>

          <div>
            <h2 className="text-[13.5px] font-semibold text-ink mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-ink-4" strokeWidth={1.8} />
              2. What we collect
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Clinic data:</strong> Practice name, ABN, contact email, billing details, clinician identifiers.</li>
              <li><strong>Contributed clinical snapshots:</strong> De-identified treatment episodes — conditions, interventions, outcomes, contraindications — with patient identifiers hashed client-side before transmission.</li>
              <li><strong>Usage data:</strong> Login events, feature interactions, audit-trail records of who unlocked which records, when.</li>
            </ul>
            <p className="mt-3">We do <strong>not</strong> collect or store patient names, Medicare numbers, dates of birth, or contact details on our servers. These remain within your clinic's own systems.</p>
          </div>

          <div>
            <h2 className="text-[13.5px] font-semibold text-ink mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-ink-4" strokeWidth={1.8} />
              3. How we protect it (APP 11)
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All data encrypted in transit (TLS 1.3) and at rest (AES-256).</li>
              <li>Patient identifiers are SHA-256 hashed with a per-clinic salt before leaving your browser.</li>
              <li>Role-based access controls; principle of least privilege internally.</li>
              <li>Annual third-party penetration testing and SOC 2 Type II controls (in progress).</li>
              <li>Australian-resident data hosting (AWS ap-southeast-2 Sydney).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-[13.5px] font-semibold text-ink mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-ink-4" strokeWidth={1.8} />
              4. Your rights
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access and correct any data we hold about your clinic (Settings → Account).</li>
              <li>Opt out of network contributions at any time without losing access to your own records.</li>
              <li>Request deletion of your contributed data (subject to 30-day audit-log retention for compliance).</li>
              <li>Lodge a complaint with the Office of the Australian Information Commissioner (OAIC).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-[13.5px] font-semibold text-ink mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-ink-4" strokeWidth={1.8} />
              5. Data breaches
            </h2>
            <p>In the event of an eligible data breach, Kinetic will notify affected clinics and the OAIC within 72 hours, in accordance with the Notifiable Data Breaches scheme.</p>
          </div>

          <div>
            <h2 className="text-[13.5px] font-semibold text-ink mb-3">6. Contact</h2>
            <p>Privacy Officer · <a className="text-accent-text underline" href="mailto:privacy@kinetic.network">privacy@kinetic.network</a></p>
          </div>
        </section>

        <p className="mt-10 text-[11px] text-ink-5 italic">This document is provided for demonstration purposes as part of an MVP pitch. It is not a substitute for binding legal terms; production deployment requires review by a qualified Australian privacy lawyer.</p>
      </div>
    </div>
  );
};
