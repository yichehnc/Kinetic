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
    <div className="max-w-xl mx-auto pt-4 sm:pt-8">
      <div className="bg-surface-card border border-line rounded-lg px-5 py-8 sm:px-8 sm:py-10 text-center">
        <div className="w-10 h-10 bg-accent-tint rounded-lg flex items-center justify-center mx-auto mb-5">
          <Share2 className="w-5 h-5 text-accent" strokeWidth={1.8} />
        </div>

        <h2 className="text-[13.5px] font-semibold text-ink mb-2">Grow the network, earn credits</h2>
        <p className="text-xs text-ink-4 max-w-sm mx-auto leading-[1.5] mb-6">
          Refer a fellow clinic. When they contribute their first patient history, you both earn{' '}
          <span className="font-semibold text-ink-2">5 Kinetic Points</span>.
        </p>

        <div className="bg-surface-sidebar border border-line rounded-lg p-1.5 inline-flex items-center max-w-sm w-full">
          <div className="flex-1 px-3 py-1.5 font-mono text-[13px] font-semibold text-ink-2 tracking-wider text-left">
            {code}
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center text-[12.5px] font-medium rounded-md px-3 py-[6px] transition-colors duration-150 ${
              copied
                ? 'bg-positive-tint text-positive-deep'
                : 'bg-accent hover:bg-accent-hover text-white'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
            {copied ? 'Copied' : 'Copy code'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-line-soft text-left">
          <h4 className="text-[11px] font-[550] text-ink-4 mb-4">How it works</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-xs font-semibold text-ink mb-1">1. Share</div>
              <p className="text-[11.5px] text-ink-4 leading-[1.45]">Send your unique code to a partner clinic.</p>
            </div>
            <div>
              <div className="text-xs font-semibold text-ink mb-1">2. Contribute</div>
              <p className="text-[11.5px] text-ink-4 leading-[1.45]">They join and contribute one history.</p>
            </div>
            <div>
              <div className="text-xs font-semibold text-ink mb-1">3. Reward</div>
              <p className="text-[11.5px] text-ink-4 leading-[1.45]">Credits are instantly deposited to both accounts.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
