import React, { useState } from 'react';
import { Check, Copy, CheckCheck, Clock, Plus } from 'lucide-react';
import type { CreateMessageResponse } from '../types';
import { formatExpiryText, copyToClipboard } from '../utils';

interface CreatedSuccessCardProps {
  data: CreateMessageResponse;
  onCreateAnother: () => void;
}

export const CreatedSuccessCard: React.FC<CreatedSuccessCardProps> = ({
  data,
  onCreateAnother,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(data.url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const expiryDetails = formatExpiryText(data.expires_at);

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
          Your secure link is ready
        </h2>
        <p className="text-sm text-[#64748B] mt-1.5">
          The message can be viewed once and expires in{' '}
          {expiryDetails.split(' ')[0] || '1 hour'}.
        </p>
      </div>

      {/* URL Display Field */}
      <div className="mb-5">
        <div className="relative flex items-center">
          <input
            type="text"
            readOnly
            value={data.url}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            className="w-full pl-3.5 pr-11 py-2.5 text-sm font-mono text-[#111827] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] select-all cursor-text"
          />
          <button
            type="button"
            onClick={handleCopy}
            title="Copy link to clipboard"
            aria-label="Copy link to clipboard"
            className="absolute right-1.5 p-1.5 text-[#64748B] hover:text-[#111827] hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
          >
            {copied ? (
              <CheckCheck className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={handleCopy}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-white bg-[#111827] hover:bg-[#1E293B] active:bg-[#0F172A] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#111827] focus:ring-offset-2 cursor-pointer shadow-xs"
        >
          {copied ? (
            <>
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Link copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy link</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onCreateAnother}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-sm font-medium text-[#111827] bg-white hover:bg-[#F8FAFC] active:bg-slate-100 border border-[#E2E8F0] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#111827] focus:ring-offset-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#64748B]" />
          <span>Create another</span>
        </button>
      </div>

      {/* Footer Info Box */}
      <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-2.5 text-xs text-[#64748B]">
        <Clock className="w-4 h-4 shrink-0 text-[#94A3B8]" />
        <span>
          Expires in <strong className="font-medium text-[#334155]">{expiryDetails}</strong>
        </span>
      </div>
    </div>
  );
};
