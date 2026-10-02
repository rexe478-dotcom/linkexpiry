import React, { useState } from 'react';
import { Check, Copy, CheckCheck, Clock, Plus } from 'lucide-react';
import { formatViewedTime, copyToClipboard } from '../utils';

interface RevealedMessageCardProps {
  message: string;
  viewedAt: string;
  onCreateNew: () => void;
}

export const RevealedMessageCard: React.FC<RevealedMessageCardProps> = ({
  message,
  viewedAt,
  onCreateNew,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(message);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const viewedText = formatViewedTime(viewedAt);

  return (
    <div className="w-full max-w-[480px] bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs">
      {/* Top Success Badge */}
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
          <Check className="w-6 h-6 stroke-[2.5]" />
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
          Message revealed
        </h2>
        <p className="text-sm text-[#64748B] mt-1.5">
          This message has been viewed and can no longer be accessed.
        </p>
      </div>

      {/* Message Content Container */}
      <div className="mb-4 relative group">
        <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-left">
          <div className="flex items-start justify-between gap-2">
            <p className="font-mono text-sm sm:text-base text-[#111827] whitespace-pre-wrap break-words font-medium select-all">
              {message}
            </p>
            <button
              type="button"
              onClick={handleCopy}
              title="Copy secret message"
              aria-label="Copy secret message"
              className="p-1.5 text-[#64748B] hover:text-[#111827] hover:bg-slate-200/60 rounded-md transition-colors shrink-0 cursor-pointer"
            >
              {copied ? (
                <CheckCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Viewed Timestamp */}
      <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-6 px-1">
        <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
        <span>{viewedText}</span>
      </div>

      {/* Action to create a new link */}
      <button
        type="button"
        onClick={onCreateNew}
        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-[#111827] bg-white hover:bg-[#F8FAFC] active:bg-slate-100 border border-[#E2E8F0] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#111827] focus:ring-offset-2 cursor-pointer"
      >
        <Plus className="w-4 h-4 text-[#64748B]" />
        <span>Create a new link</span>
      </button>
    </div>
  );
};
