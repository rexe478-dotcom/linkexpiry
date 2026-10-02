import React from 'react';
import { Lock, Eye, Clock, Loader2 } from 'lucide-react';
import { formatExpiryText } from '../utils';

interface ViewMessageCardProps {
  expiresAt?: string;
  onReveal: () => Promise<void>;
  isRevealing: boolean;
}

export const ViewMessageCard: React.FC<ViewMessageCardProps> = ({
  expiresAt,
  onReveal,
  isRevealing,
}) => {
  const expiryText = formatExpiryText(expiresAt);

  return (
    <div className="w-full max-w-[480px] bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs">
      {/* Top Lock Badge */}
      <div className="flex justify-center mb-5">
        <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-[#475569]">
          <Lock className="w-5 h-5 stroke-[2.2]" />
        </div>
      </div>

      <div className="text-center mb-7">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
          You have a private message
        </h2>
        <p className="text-sm text-[#64748B] mt-1.5">
          This message can only be viewed once.
        </p>
      </div>

      {/* Reveal Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={onReveal}
          disabled={isRevealing}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium text-white bg-[#111827] hover:bg-[#1E293B] active:bg-[#0F172A] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#111827] focus:ring-offset-2 disabled:opacity-60 cursor-pointer shadow-xs"
        >
          {isRevealing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Decrypting message...</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>Reveal message</span>
            </>
          )}
        </button>
      </div>

      {/* Expiration Note */}
      {expiresAt && (
        <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-2.5 text-xs text-[#64748B]">
          <Clock className="w-4 h-4 shrink-0 text-[#94A3B8]" />
          <span>
            Expires in <strong className="font-medium text-[#334155]">{expiryText}</strong>
          </span>
        </div>
      )}
    </div>
  );
};
