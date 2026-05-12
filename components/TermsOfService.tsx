import React from 'react';
import { Scale, FileText, AlertTriangle, Users, CreditCard, Ban } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="text-sm text-slate-600 hover:text-slate-900 mb-6 inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded"
      >
        ← Back
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
            <Scale className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h1 className="text-3xl font-brand font-extrabold text-slate-900">Terms of Service</h1>
            <p className="text-sm text-slate-500">Last updated: 12 May 2026 · Version 1.1</p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700">
          <p className="font-semibold mb-1">Plain-English summary</p>
          <p>You agree to use Kinetic only for legitimate clinical care. You're responsible for the accuracy of the data you contribute. We provide the platform; we don't practice medicine. Credits are non-transferable and have no cash value.</p>
        </div>

        <section className="mt-10 space-y-8 text-slate-700 leading-relaxed">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-500" />
              1. Acceptance of terms
            </h2>
            <p>By accessing Kinetic Network ("the Service"), you agree to be bound by these Terms. If you are entering into this agreement on behalf of a clinic, you represent that you have authority to bind that clinic.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-500" />
              2. Eligibility
            </h2>
            <p>The Service is intended for registered Australian allied health practitioners and their clinics. You must hold current AHPRA registration (or equivalent for non-AHPRA-regulated professions) to contribute or unlock clinical records.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-slate-500" />
              3. Credits
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Credits are a unit of account used to unlock contributed records.</li>
              <li>Credits are non-transferable between clinics and have no cash redemption value.</li>
              <li>Earned credits expire 24 months after issuance.</li>
              <li>Opting out of the network forfeits all unspent credits.</li>
              <li>We reserve the right to revoke credits earned through fraudulent or duplicate contributions.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-slate-500" />
              4. Your responsibilities
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ensure all contributed clinical data is accurate, complete, and reflects genuine treatment episodes.</li>
              <li>Obtain appropriate patient consent under your jurisdiction's health-records legislation before contributing.</li>
              <li>Keep clinic credentials secure; you are responsible for activity under your account.</li>
              <li>Use unlocked records only for the clinical care of the patient in question.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Ban className="w-5 h-5 text-slate-500" />
              5. Prohibited use
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Re-identifying anonymised records or attempting to reverse the hashing process.</li>
              <li>Selling, sublicensing, or redistributing data obtained through the Service.</li>
              <li>Using the Service for insurance underwriting, marketing, or any non-clinical purpose.</li>
              <li>Scraping, automated querying, or stress-testing without prior written consent.</li>
            </ul>
            <p className="mt-3">Breach may result in immediate suspension, forfeiture of credits, and referral to AHPRA and/or the OAIC.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Disclaimers</h2>
            <p>Kinetic is a continuity-of-care tool, not a clinical decision-support system. We do not practice medicine and accept no liability for clinical decisions made on the basis of records retrieved through the Service. The Service is provided "as is" without warranty of fitness for any particular purpose.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Termination</h2>
            <p>Either party may terminate this agreement on 30 days' written notice. We may suspend access immediately in the event of suspected breach. Sections 3 (credits), 4 (responsibilities), 5 (prohibited use), and 6 (disclaimers) survive termination.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Governing law</h2>
            <p>These Terms are governed by the laws of New South Wales, Australia. Disputes shall be resolved in the courts of New South Wales.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Contact</h2>
            <p>Legal · <a className="text-emerald-700 underline" href="mailto:legal@kinetic.network">legal@kinetic.network</a></p>
          </div>
        </section>

        <p className="mt-12 text-xs text-slate-400 italic">This document is provided for demonstration purposes as part of an MVP pitch. It is not a substitute for binding legal terms; production deployment requires review by a qualified Australian commercial lawyer.</p>
      </div>
    </div>
  );
};
