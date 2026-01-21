import React from 'react';
import { Share2, Copy, Check } from 'lucide-react';

export const Referral: React.FC = () => {
  const [copied, setCopied] = React.useState(false);
  const code = "KIN-882-AB";

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 pt-12">
      <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
        <Share2 className="w-10 h-10 text-indigo-600" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Grow the Network, Earn Credits</h2>
        <p className="text-slate-500 mt-4 max-w-lg mx-auto">
          Refer a fellow clinic. When they contribute their first patient history, you both earn <span className="font-bold text-slate-900">5 Kinetic Points</span>.
        </p>
      </div>

      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm inline-flex items-center max-w-md w-full">
        <div className="flex-1 px-4 py-2 font-mono text-lg font-bold text-slate-700 tracking-wider">
          {code}
        </div>
        <button
          onClick={handleCopy}
          className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center ${
            copied ? 'bg-green-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? 'Copied' : 'Copy Code'}
        </button>
      </div>

      <div className="pt-8 border-t border-slate-200">
         <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4">How it works</h4>
         <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-bold text-slate-900 mb-1">1. Share</div>
              <p className="text-slate-500">Send your unique code to a partner clinic.</p>
            </div>
            <div>
              <div className="font-bold text-slate-900 mb-1">2. Contribute</div>
              <p className="text-slate-500">They join and contribute one history.</p>
            </div>
            <div>
              <div className="font-bold text-slate-900 mb-1">3. Reward</div>
              <p className="text-slate-500">Credits are instantly deposited to both accounts.</p>
            </div>
         </div>
      </div>
    </div>
  );
};